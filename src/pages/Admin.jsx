import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Layers, Calendar, Package } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdminCards from "@/components/admin/AdminCards";
import AdminSeries from "@/components/admin/AdminSeries";
import AdminEvents from "@/components/admin/AdminEvents";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState("cards");

  useEffect(() => {
    (async () => {
      try { const u = await base44.auth.me(); setUser(u); }
      catch { setUser(null); }
      finally { setChecked(true); }
    })();
  }, []);

  if (!checked) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" /></div>;

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <ShieldAlert className="w-16 h-16 text-accent mx-auto" />
        <h1 className="mt-4 font-heading text-3xl text-white text-stroke-black-sm">Accès réservé</h1>
        <p className="text-white/70 font-body mt-2">Cet espace est réservé au propriétaire de la boutique.</p>
        <Link to="/" className="btn-gold mt-6 inline-block px-5 py-2">Retour à la boutique</Link>
      </div>
    );
  }

  const tabs = [
    { v: "cards", l: "Cartes", icon: Layers },
    { v: "series", l: "Séries", icon: Package },
    { v: "events", l: "Événements", icon: Calendar },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="w-8 h-8 text-accent" />
        <h1 className="font-heading text-3xl text-white text-stroke-black-sm">ESPACE ADMIN</h1>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.v}
            onClick={() => setTab(t.v)}
            className={`px-4 py-2 font-impact uppercase text-sm border-2 border-black flex items-center gap-2 ${tab === t.v ? "bg-gold text-black" : "bg-card text-white"}`}
          >
            <t.icon className="w-4 h-4" /> {t.l}
          </button>
        ))}
      </div>

      {tab === "cards" && <AdminCards />}
      {tab === "series" && <AdminSeries />}
      {tab === "events" && <AdminEvents />}
    </div>
  );
}