import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Store, Heart, Zap, Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProductCard from "@/components/ProductCard";
import { RARETE_COLORS, TYPE_COLORS, stockBadge, formatPrix } from "@/lib/constants";
import { Image } from "@/components/ui/image";

export default function CardDetail() {
  const { id } = useParams();
  const [card, setCard] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const c = await base44.entities.Card.get(id);
        if (!active) return;
        setCard(c);
        try {
          const res = await base44.entities.Card.filter(
            { serie: c.serie, id: { $ne: id } },
            { sort: "-created_date", limit: 8 }
          );
          if (active) setSimilar(res.items || []);
        } catch {}
      } catch {
        if (active) setCard(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  const stock = card ? stockBadge(card.stock) : null;
  const out = card ? (card.stock || 0) <= 0 : true;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="font-heading text-3xl text-white">Carte introuvable</h2>
        <Link to="/" className="btn-gold mt-6 inline-block px-5 py-2">Retour à la boutique</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-gold font-body text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour à la boutique
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative bg-gradient-to-br from-[#1a0a1f] to-[#0B0B10] border-[3px] border-black p-6 flex items-center justify-center min-h-[400px]" style={{ boxShadow: "6px 6px 0 0 #81008F" }}>
          <div className="halftone absolute inset-0 opacity-20" />
          {card.gradee && (
            <div className="absolute top-4 left-4 z-10 bg-black text-gold font-impact text-sm px-3 py-1 border-2 border-gold uppercase">
              <Crown className="inline w-4 h-4 mr-1" /> PSA {card.note_psa}
            </div>
          )}
          {card.image ? (
            <Image src={card.image} alt={card.nom} fittingType="fit" className="relative max-h-[420px] w-auto object-contain" />
          ) : (
            <div className="text-white/30 font-impact uppercase">Pas d'image</div>
          )}
        </div>

        {/* Info */}
        <div className="bg-[#FFF7E8] text-black border-[3px] border-black p-6" style={{ boxShadow: "6px 6px 0 0 #0B0B10" }}>
          <div className="flex flex-wrap gap-2 mb-3">
            {card.rarete && (
              <span className="text-xs font-impact uppercase px-2 py-1 border-2 border-black text-white" style={{ background: RARETE_COLORS[card.rarete] }}>{card.rarete}</span>
            )}
            {card.type && (
              <span className="text-xs font-impact uppercase px-2 py-1 border-2 border-black text-black" style={{ background: TYPE_COLORS[card.type] }}>{card.type}</span>
            )}
            <span className="text-xs font-impact uppercase px-2 py-1 border-2 border-black bg-white">{card.etat}</span>
            <span className="text-xs font-impact uppercase px-2 py-1 border-2 border-black bg-white">{card.langue}</span>
          </div>

          <h1 className="font-heading text-3xl md:text-4xl leading-tight">{card.nom}</h1>
          <p className="font-impact uppercase text-black/60 tracking-wide mt-1">{card.serie} · #{card.numero} · {card.annee}</p>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm font-body">
            <Spec label="Série" value={card.serie} />
            <Spec label="Année" value={card.annee} />
            <Spec label="Numéro" value={card.numero} />
            <Spec label="Rareté" value={card.rarete} />
            <Spec label="Type" value={card.type} />
            <Spec label="État" value={card.etat} />
            <Spec label="Langue" value={card.langue} />
            <Spec label="Gradée" value={card.gradee ? `Oui (PSA ${card.note_psa})` : "Non"} />
          </div>

          {card.description && (
            <p className="mt-4 text-sm font-body text-black/75 leading-relaxed border-t-2 border-black/20 pt-3">{card.description}</p>
          )}

          {/* Stock */}
          <div className="mt-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border border-black" style={{ background: stock.color }} />
            <span className="font-impact uppercase text-sm" style={{ color: stock.color }}>{stock.label}</span>
            <span className="text-black/50 text-sm font-body">· {card.stock} en stock</span>
          </div>

          {/* Prix + disponibilité en boutique */}
          <div className="mt-5 border-t-2 border-black pt-4">
            <div className="flex items-end justify-between gap-3 mb-3">
              <div>
                <span className="font-impact text-xs uppercase tracking-wide text-black/50">Prix en boutique</span>
                <div className="font-heading text-4xl text-black">{formatPrix(card.prix)}</div>
              </div>
              <button
                onClick={() => setFav(f => !f)}
                className={`p-3 border-2 border-black ${fav ? "bg-accent text-white" : "bg-white text-black"}`}
                aria-label="Favori"
              >
                <Heart className={`w-5 h-5 ${fav ? "fill-current" : ""}`} />
              </button>
            </div>
            <Link to="/a-propos" className="btn-gold w-full py-3 text-lg flex items-center justify-center gap-2">
              <Store className="w-5 h-5" />
              {out ? "Nous contacter pour un réassort" : "Disponible en boutique"}
            </Link>
            <p className="mt-3 text-xs font-body text-black/60 text-center">
              Pas de vente en ligne : cette carte se retrouve directement à la boutique.
            </p>
          </div>
        </div>
      </div>

      {/* Similar */}
      {similar.length > 0 && (
        <div className="mt-14">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-6 h-6 text-gold" />
            <h2 className="font-heading text-2xl text-white text-stroke-black-sm">Cartes similaires</h2>
            <span className="font-impact uppercase text-white/50 text-sm">— {card.serie}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {similar.map(c => <ProductCard key={c.id} card={c} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div className="border-l-4 border-primary pl-2">
      <div className="font-impact uppercase text-[10px] text-black/50 tracking-wide">{label}</div>
      <div className="font-body font-bold text-black">{value || "—"}</div>
    </div>
  );
}