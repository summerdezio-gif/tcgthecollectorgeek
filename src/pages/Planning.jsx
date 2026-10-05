import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, Users, Crown, Zap, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { TYPES_EVENT } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";

const TYPE_COLORS = {
  "Bourse d'échanges": "#81008F",
  "Tournoi": "#E900D8",
  "Sortie de booster": "#FFD000",
  "Atelier": "#22c55e",
  "Rencontre": "#3b82f6",
};

export default function Planning() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.entities.Event.filter({}, { sort: "date", limit: 100 });
        setEvents(res.items || []);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const register = async (ev) => {
    try {
      const user = await base44.auth.me().catch(() => null);
      const userId = user?.id;
      const inscrits = ev.inscrits || [];
      if (userId && inscrits.includes(userId)) {
        toast({ title: "Tu es déjà inscrit !", description: ev.titre });
        return;
      }
      const newInscrits = userId ? [...inscrits, userId] : inscrits;
      await base44.entities.Event.update(ev.id, { inscrits: newInscrits });
      setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, inscrits: newInscrits } : e));
      toast({ title: "Inscription confirmée !", description: `À très vite au ${ev.titre}.` });
    } catch {
      toast({ title: "Inscription impossible", description: "Connecte-toi pour t'inscrire.", variant: "destructive" });
    }
  };

  const filtered = filter === "all" ? events : events.filter(e => e.type === filter);

  return (
    <div>
      {/* Header */}
      <section className="relative border-b-4 border-black bg-primary overflow-hidden">
        <div className="halftone-gold absolute inset-0 opacity-15 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="inline-block bg-gold text-black font-impact uppercase px-3 py-1 border-2 border-black rotate-2 mb-4 text-sm">
            <Zap className="inline w-4 h-4 mr-1" /> Agenda des passionnés
          </div>
          <h1 className="font-heading text-5xl md:text-6xl text-white text-stroke-black text-shadow-violet">PLANNING</h1>
          <p className="mt-3 text-white/80 font-body max-w-xl">
            Bourses d'échanges, tournois, sorties de boosters et ateliers. Réserve ta place et rejoins la communauté T.C.G.
          </p>
        </div>
        <div className="torn-edge-top h-3 bg-gold" />
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 font-impact uppercase text-sm border-2 border-black ${filter === "all" ? "bg-gold text-black" : "bg-card text-white"}`}
          >Tous</button>
          {TYPES_EVENT.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 font-impact uppercase text-sm border-2 border-black ${filter === t ? "bg-gold text-black" : "bg-card text-white"}`}
            >{t}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Crown className="w-12 h-12 text-gold mx-auto" />
            <h3 className="mt-4 font-heading text-2xl text-white">Aucun événement pour l'instant</h3>
            <p className="text-white/60 font-body mt-2">Reviens bientôt, de nouvelles dates arrivent !</p>
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map(ev => {
              const count = (ev.inscrits || []).length;
              const full = ev.capacite > 0 && count >= ev.capacite;
              return (
                <div key={ev.id} className="bg-[#FFF7E8] text-black border-[3px] border-black grid md:grid-cols-[140px_1fr] overflow-hidden" style={{ boxShadow: "6px 6px 0 0 #0B0B10" }}>
                  {/* Date block */}
                  <div className="bg-primary text-white flex flex-col items-center justify-center py-5 border-r-2 border-black">
                    <span className="font-impact uppercase text-gold text-sm tracking-widest">{new Date(ev.date).toLocaleDateString("fr-FR", { month: "short" })}</span>
                    <span className="font-heading text-4xl text-white leading-none">{new Date(ev.date).getDate()}</span>
                    <span className="font-body text-xs text-white/70 mt-1">{new Date(ev.date).getFullYear()}</span>
                  </div>
                  {/* Content */}
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-impact uppercase px-2 py-1 border-2 border-black text-white" style={{ background: TYPE_COLORS[ev.type] || "#81008F" }}>{ev.type}</span>
                      {full && <span className="text-xs font-impact uppercase px-2 py-1 border-2 border-black bg-black text-gold">COMPLET</span>}
                    </div>
                    <h3 className="font-heading text-2xl leading-tight">{ev.titre}</h3>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-sm font-body text-black/70">
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" /> {ev.horaires || "—"}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> {ev.lieu}</span>
                      <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-primary" /> {count}{ev.capacite ? `/${ev.capacite}` : ""} inscrits</span>
                    </div>
                    {ev.description && <p className="mt-3 text-sm font-body text-black/75 leading-relaxed">{ev.description}</p>}
                    <button
                      onClick={() => register(ev)}
                      disabled={full}
                      className={`mt-4 px-5 py-2 font-impact uppercase text-sm border-2 border-black flex items-center gap-2 ${full ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "btn-gold"}`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {full ? "Liste d'attente" : "S'inscrire"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}