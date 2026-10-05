import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, MapPin } from "lucide-react";
import { LOGO_URL } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="relative mt-20 bg-primary border-t-4 border-black overflow-hidden">
      <div className="halftone-gold absolute inset-0 opacity-10 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src={LOGO_URL} alt="T.C.G." className="h-12 w-12 rounded-full border-2 border-black bg-gold" />
            <div>
              <div className="font-heading text-lg text-white text-stroke-black-sm">T.C.G.</div>
              <div className="font-impact text-[10px] text-gold tracking-widest uppercase">The Collector Geeks</div>
            </div>
          </div>
          <p className="text-white/80 text-sm font-body leading-relaxed">
            La boutique des passionnés de cartes Pokémon. Collection, échange, jeu et passion.
          </p>
        </div>

        <div>
          <h4 className="font-impact uppercase text-gold tracking-wide mb-3">Navigation</h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link to="/" className="hover:text-gold">Boutique</Link></li>
            <li><Link to="/planning" className="hover:text-gold">Planning</Link></li>
            <li><Link to="/a-propos" className="hover:text-gold">À propos</Link></li>
            <li><Link to="/profil" className="hover:text-gold">Profil</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-impact uppercase text-gold tracking-wide mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gold" /> Courtéline (77), France</li>
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-gold" /> contact@tcg-collectorgeeks.fr</li>
          </ul>
          <div className="flex gap-3 mt-4">
            <a href="#" aria-label="Instagram" className="p-2 rounded-full bg-gold text-black border-2 border-black hover:-rotate-6 transition-transform"><Instagram className="w-4 h-4" /></a>
            <a href="#" aria-label="Facebook" className="p-2 rounded-full bg-gold text-black border-2 border-black hover:-rotate-6 transition-transform"><Facebook className="w-4 h-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="font-impact uppercase text-gold tracking-wide mb-3">L'esprit T.C.G.</h4>
          <div className="flex flex-wrap gap-2">
            {["COLLECTION", "ÉCHANGE", "JEU", "PASSION"].map((t, i) => (
              <span
                key={t}
                className="px-3 py-1 bg-black text-gold font-impact text-xs uppercase border-2 border-gold rounded-full"
                style={{ transform: `rotate(${i % 2 === 0 ? -3 : 3}deg)` }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative border-t-2 border-black py-4 text-center">
        <p className="font-impact text-xs uppercase tracking-[0.3em] text-white/60">
          Cartes / Collection / Échange / Passion
        </p>
        <p className="text-white/40 text-xs mt-1 font-body">© {new Date().getFullYear()} T.C.G. – The Collector Geeks</p>
      </div>
    </footer>
  );
}