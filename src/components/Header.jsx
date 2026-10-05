import React from "react";
import { Link, useLocation } from "react-router-dom";
import { User, Calendar, Store, Menu, X } from "lucide-react";
import { LOGO_URL } from "@/lib/constants";

export default function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const tabs = [
    { label: "Boutique", path: "/", icon: Store },
    { label: "Planning", path: "/planning", icon: Calendar },
    { label: "À propos", path: "/a-propos", icon: null },
  ];

  const isActive = (p) => (p === "/" ? location.pathname === "/" : location.pathname.startsWith(p));

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b-4 border-black">
      <div className="halftone absolute inset-0 opacity-20 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <img
            src={LOGO_URL}
            alt="T.C.G. The Collector Geeks"
            className="h-11 w-11 object-contain rounded-full border-2 border-black bg-[#FFD000] transition-transform group-hover:rotate-[-6deg] group-hover:scale-105"
          />
          <div className="hidden sm:block leading-none">
            <div className="font-heading text-xl text-white text-stroke-black-sm text-shadow-violet">T.C.G.</div>
            <div className="font-impact text-[10px] text-gold tracking-widest uppercase">The Collector Geeks</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {tabs.map((t) => (
            <Link
              key={t.path}
              to={t.path}
              className={`px-4 py-2 font-impact uppercase tracking-wide text-sm transition-all ${
                isActive(t.path)
                  ? "text-black bg-gold border-2 border-black -rotate-1"
                  : "text-white hover:text-gold hover:-rotate-1"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/profil"
            className={`p-2 rounded-full border-2 border-black transition-colors ${
              isActive("/profil") ? "bg-gold text-black" : "bg-card text-white hover:bg-accent"
            }`}
            aria-label="Profil"
          >
            <User className="w-5 h-5" />
          </Link>
          <button
            className="md:hidden p-2 rounded-full bg-card border-2 border-black text-white"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t-2 border-black bg-background px-4 py-3 flex flex-col gap-2">
          {tabs.map((t) => (
            <Link
              key={t.path}
              to={t.path}
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-2 font-impact uppercase tracking-wide ${
                isActive(t.path) ? "text-black bg-gold border-2 border-black" : "text-white border-2 border-transparent"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}