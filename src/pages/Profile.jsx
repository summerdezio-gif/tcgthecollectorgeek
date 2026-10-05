import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Heart, LogOut, LogIn, UserPlus, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatPrix } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";
import { Image } from "@/components/ui/image";
import Mascotte from "@/components/Mascotte";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [favs, setFavs] = useState([]);
  const [tab, setTab] = useState("favs");
  const [fullName, setFullName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        setFullName(u.full_name || "");
      } catch {
        setUser(null);
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const f = await base44.entities.Favorite.filter({ created_by_id: user.id }, { limit: 100 });
        const favItems = f.items || [];
        const cards = await Promise.all(favItems.map(fi => base44.entities.Card.get(fi.card_id).catch(() => null)));
        setFavs(cards.filter(Boolean));
      } catch {}
    })();
  }, [user]);

  const saveProfile = async () => {
    try {
      await base44.auth.updateMe({ full_name: fullName });
      toast({ title: "Profil mis à jour" });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const logout = async () => {
    await base44.auth.logout();
    window.location.href = "/";
  };

  if (!authChecked) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Mascotte size={180} />
        <h1 className="mt-6 font-heading text-3xl text-white text-stroke-black-sm">Connecte-toi, dresseur</h1>
        <p className="text-white/70 font-body mt-2">Accède à tes cartes favorites et à tes infos.</p>
        <div className="flex gap-3 justify-center mt-6">
          <Link to="/login" className="btn-gold px-6 py-3 flex items-center gap-2"><LogIn className="w-5 h-5" /> Connexion</Link>
          <Link to="/register" className="btn-violet px-6 py-3 flex items-center gap-2"><UserPlus className="w-5 h-5" /> Inscription</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gold border-[3px] border-black flex items-center justify-center">
          <User className="w-8 h-8 text-black" />
        </div>
        <div>
          <h1 className="font-heading text-3xl text-white text-stroke-black-sm">{user.full_name || "Dresseur"}</h1>
          <p className="text-white/60 font-body text-sm">{user.email} · {user.role === "admin" && <span className="text-gold font-impact uppercase">Admin</span>}</p>
        </div>
        <button onClick={logout} className="ml-auto btn-violet px-4 py-2 flex items-center gap-2"><LogOut className="w-4 h-4" /> Déconnexion</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { v: "favs", l: "Favoris", icon: Heart },
          { v: "info", l: "Mes infos", icon: User },
        ].map(t => (
          <button
            key={t.v}
            onClick={() => setTab(t.v)}
            className={`px-4 py-2 font-impact uppercase text-sm border-2 border-black flex items-center gap-2 ${tab === t.v ? "bg-gold text-black" : "bg-card text-white"}`}
          >
            <t.icon className="w-4 h-4" /> {t.l}
          </button>
        ))}
        {user.role === "admin" && (
          <Link to="/admin" className="px-4 py-2 font-impact uppercase text-sm border-2 border-black bg-accent text-white flex items-center gap-2">
            <Zap className="w-4 h-4" /> Espace admin
          </Link>
        )}
      </div>

      {tab === "favs" && (
        <div>
          {favs.length === 0 ? (
            <div className="text-center py-16 bg-card border-[3px] border-black">
              <Heart className="w-12 h-12 text-white/30 mx-auto" />
              <p className="text-white/60 font-body mt-3">Pas encore de favoris. Clique sur le cœur d'une carte !</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {favs.map(c => (
                <Link key={c.id} to={`/carte/${c.id}`} className="bg-[#FFF7E8] border-[3px] border-black hover:-translate-y-1 transition-transform">
                  <div className="aspect-[3/4] bg-gradient-to-br from-[#1a0a1f] to-[#0B0B10] p-2">
                    {c.image && <Image src={c.image} alt={c.nom} fittingType="fit" className="w-full h-full object-contain" />}
                  </div>
                  <div className="p-2 border-t-2 border-black">
                    <p className="font-body font-bold text-sm text-black line-clamp-1">{c.nom}</p>
                    <p className="font-heading text-lg text-black">{formatPrix(c.prix)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "info" && (
        <div className="bg-[#FFF7E8] text-black border-[3px] border-black p-6 max-w-md" style={{ boxShadow: "6px 6px 0 0 #0B0B10" }}>
          <h2 className="font-impact uppercase text-primary tracking-wide mb-4">Mes informations</h2>
          <label className="block text-sm font-body font-bold mb-1">Nom complet</label>
          <input
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full px-3 py-2 border-2 border-black bg-white font-body mb-4"
          />
          <label className="block text-sm font-body font-bold mb-1">Email</label>
          <input value={user.email || ""} disabled className="w-full px-3 py-2 border-2 border-black bg-gray-100 font-body mb-4 text-black/50" />
          <button onClick={saveProfile} className="btn-gold px-5 py-2">Enregistrer</button>
        </div>
      )}
    </div>
  );
}