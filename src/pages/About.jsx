import React from "react";
import { MapPin, Mail, Phone, Clock, Instagram, Facebook, Crown, Zap, Heart, Gamepad2 } from "lucide-react";
import Mascotte from "@/components/Mascotte";
import { LOGO_URL } from "@/lib/constants";

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative border-b-4 border-black overflow-hidden">
        <div className="halftone absolute inset-0 opacity-20 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 py-14 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-block bg-gold text-black font-impact uppercase px-3 py-1 border-2 border-black -rotate-2 mb-4 text-sm">
              <Crown className="inline w-4 h-4 mr-1" /> Notre histoire
            </div>
            <h1 className="font-heading text-5xl md:text-6xl text-white text-stroke-black text-shadow-violet leading-[0.95]">
              LA BOUTIQUE<br/>DES GEEKS<br/>COLLECTIONNEURS
            </h1>
            <p className="mt-5 text-white/80 font-body text-lg max-w-md">
              T.C.G. – The Collector Geeks, c'est avant tout une passion. Celle de collectionner, d'échanger, de jouer et de partager l'amour des cartes Pokémon.
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <Mascotte size={240} />
          </div>
        </div>
        <div className="torn-edge-top h-3 bg-gold" />
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid md:grid-cols-4 gap-5">
          {[
            { icon: Crown, title: "Collection", text: "Des milliers de cartes triées, gradées et prêtes à rejoindre ton binder.", color: "#FFD000" },
            { icon: Heart, title: "Échange", text: "Bourses d'échanges régulières pour faire vivre la communauté.", color: "#E900D8" },
            { icon: Gamepad2, title: "Jeu", text: "Tournois Pokémon, One Piece, Lorcana, Magic… place aux dresseurs !", color: "#81008F" },
            { icon: Zap, title: "Passion", text: "Une équipe de passionnés qui connaît chaque carte par cœur.", color: "#FFD000" },
          ].map((v, i) => (
            <div
              key={v.title}
              className="bg-[#FFF7E8] text-black border-[3px] border-black p-5"
              style={{ boxShadow: "5px 5px 0 0 #0B0B10", transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
            >
              <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center mb-3" style={{ background: v.color }}>
                <v.icon className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-heading text-xl">{v.title}</h3>
              <p className="text-sm font-body text-black/70 mt-1 leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="bg-primary border-y-4 border-black py-14 overflow-hidden relative">
        <div className="halftone-gold absolute inset-0 opacity-10 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <Zap className="w-10 h-10 text-gold mx-auto mb-4" />
          <p className="font-heading text-2xl md:text-3xl text-white leading-snug text-stroke-black-sm">
            « Les cartes ne sont pas juste du carton… elles racontent des histoires. »
          </p>
          <p className="mt-4 font-impact uppercase tracking-[0.3em] text-gold text-sm">Collectionner, c'est partager</p>
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="font-heading text-3xl md:text-4xl text-white text-stroke-black-sm text-center mb-8">Nous trouver</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-[#FFF7E8] text-black border-[3px] border-black p-6" style={{ boxShadow: "6px 6px 0 0 #81008F" }}>
            <h3 className="font-impact uppercase text-primary tracking-wide mb-4">Coordonnées</h3>
            <ul className="space-y-3 font-body">
              <li className="flex items-start gap-3"><MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" /> <span>Courtéline (77), France</span></li>
              <li className="flex items-start gap-3"><Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" /> <span>contact@tcg-collectorgeeks.fr</span></li>
              <li className="flex items-start gap-3"><Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" /> <span>Sur demande via la boutique</span></li>
              <li className="flex items-start gap-3"><Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" /> <span>Mercredi & samedi : 10h – 18h</span></li>
            </ul>
            <div className="flex gap-3 mt-5">
              <a href="#" aria-label="Instagram" className="p-3 rounded-full bg-primary text-white border-2 border-black hover:-rotate-6 transition-transform"><Instagram className="w-5 h-5" /></a>
              <a href="#" aria-label="Facebook" className="p-3 rounded-full bg-primary text-white border-2 border-black hover:-rotate-6 transition-transform"><Facebook className="w-5 h-5" /></a>
            </div>
          </div>
          <div className="bg-card border-[3px] border-black p-6 flex flex-col items-center justify-center" style={{ boxShadow: "6px 6px 0 0 #0B0B10" }}>
            <img src={LOGO_URL} alt="T.C.G." className="h-32 w-32 rounded-full border-2 border-black bg-gold mb-4" />
            <p className="font-impact uppercase text-gold tracking-wide text-center">T.C.G. – The Collector Geeks</p>
            <p className="text-white/60 font-body text-sm text-center mt-1">Cartes / Collection / Échange / Passion</p>
          </div>
        </div>
      </section>
    </div>
  );
}