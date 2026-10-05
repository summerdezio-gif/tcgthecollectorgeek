import React from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { RARETE_COLORS, TYPE_COLORS, stockBadge, formatPrix } from "@/lib/constants";
import { Image } from "@/components/ui/image";

export default function ProductCard({ card }) {
  const stock = stockBadge(card.stock);

  return (
    <Link
      to={`/carte/${card.id}`}
      className="group relative block bg-[#FFF7E8] border-[3px] border-black transition-all duration-150 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#81008F]"
      style={{ boxShadow: "5px 5px 0 0 #0B0B10" }}
    >
      {/* Price sticker */}
      <div
        className="absolute -top-3 -right-3 z-20 bg-gold text-black font-heading px-3 py-1 border-2 border-black rotate-6"
        style={{ boxShadow: "2px 2px 0 0 #0B0B10" }}
      >
        {formatPrix(card.prix)}
      </div>

      {/* Graded badge */}
      {card.gradee && (
        <div className="absolute top-2 left-2 z-20 bg-black text-gold font-impact text-[10px] px-2 py-1 border-2 border-gold uppercase tracking-wide">
          PSA {card.note_psa}
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-[#1a0a1f] to-[#0B0B10] overflow-hidden">
        <div className="halftone absolute inset-0 opacity-20" />
        {card.image ? (
          <Image
            src={card.image}
            alt={card.nom}
            fittingType="fit"
            className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-1"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30 font-impact text-xs uppercase">
            Pas d'image
          </div>
        )}
        {/* Stock badge */}
        <div
          className="absolute bottom-2 left-2 z-10 font-impact text-[10px] uppercase tracking-wide px-2 py-1 border border-black"
          style={{ color: stock.color, background: stock.bg }}
        >
          {stock.label}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 border-t-2 border-black">
        <h3 className="font-heading text-black text-base leading-tight line-clamp-2 min-h-[2.5rem]">
          {card.nom}
        </h3>
        <div className="flex items-center gap-1 mt-1 text-[11px] text-black/60 font-body">
          <span className="font-impact uppercase">{card.serie}</span>
          {card.numero && <span>· #{card.numero}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-1 mt-2">
          {card.rarete && (
            <span
              className="text-[10px] font-impact uppercase px-1.5 py-0.5 border border-black text-white"
              style={{ background: RARETE_COLORS[card.rarete] || "#000" }}
            >
              {card.rarete}
            </span>
          )}
          {card.type && (
            <span
              className="text-[10px] font-impact uppercase px-1.5 py-0.5 border border-black text-black"
              style={{ background: TYPE_COLORS[card.type] || "#fff" }}
            >
              {card.type}
            </span>
          )}
          <span className="text-[10px] font-impact uppercase px-1.5 py-0.5 border border-black bg-white text-black">
            {card.etat}
          </span>
          <span className="text-[10px] font-impact uppercase px-1.5 py-0.5 border border-black bg-white text-black">
            {card.langue}
          </span>
        </div>

        <span className="mt-3 w-full py-2 font-impact uppercase text-sm border-2 border-black flex items-center justify-center gap-1 bg-gold text-black transition-all group-hover:-translate-y-0.5 group-hover:shadow-[3px_3px_0_0_#81008F]">
          <Eye className="w-4 h-4" />
          Voir la carte
        </span>
      </div>
    </Link>
  );
}