import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronRight, Crown, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProductCard from "@/components/ProductCard";
import Mascotte from "@/components/Mascotte";
import { RARETES, TYPES, ETATS, LANGUES, RARETE_COLORS, LOGO_URL } from "@/lib/constants";

const SORTS = [
  { value: "-created_date", label: "Nouveautés" },
  { value: "prix", label: "Prix croissant" },
  { value: "-prix", label: "Prix décroissant" },
  { value: "annee", label: "Année" },
  { value: "nom", label: "Nom (A-Z)" },
];

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b-2 border-black/20 py-3">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between font-impact uppercase text-sm text-white">
        {title}
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {open && <div className="mt-2 space-y-1.5">{children}</div>}
    </div>
  );
};

const CheckItem = ({ checked, onClick, label, color }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 w-full text-left text-sm font-body text-white/85 hover:text-gold"
  >
    <span
      className={`w-4 h-4 border-2 border-black flex items-center justify-center shrink-0 ${checked ? "bg-gold" : "bg-white/10"}`}
    >
      {checked && <span className="text-black text-xs font-bold">✓</span>}
    </span>
    {color && <span className="w-2.5 h-2.5 border border-black" style={{ background: color }} />}
    <span className="truncate">{label}</span>
  </button>
);

export default function Boutique() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seriesList, setSeriesList] = useState([]);
  const [view, setView] = useState("grid"); // grid | series
  const [showFilters, setShowFilters] = useState(false);
  const [openGroups, setOpenGroups] = useState({});

  // Filters
  const [search, setSearch] = useState("");
  const [fSerie, setFSerie] = useState([]);
  const [fAnnee, setFAnnee] = useState([]);
  const [fRarete, setFRarete] = useState([]);
  const [fType, setFType] = useState([]);
  const [fEtat, setFEtat] = useState([]);
  const [fLangue, setFLangue] = useState([]);
  const [fGradee, setFGradee] = useState("all"); // all | graded | ungraded
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [fStock, setFStock] = useState("all"); // all | in | out
  const [sort, setSort] = useState("-created_date");

  useEffect(() => {
    (async () => {
      try {
        const s = await base44.entities.Series.filter({}, { sort: "-annee", limit: 200 });
        setSeriesList(s.items || []);
      } catch {}
    })();
  }, []);

  const years = useMemo(() => {
    const set = new Set();
    seriesList.forEach(s => set.add(s.annee));
    return [...set].sort((a, b) => b - a);
  }, [seriesList]);

  const query = useMemo(() => {
    const q = {};
    if (search.trim()) q.nom = { $regex: search.trim(), $options: "i" };
    if (fSerie.length) q.serie = { $in: fSerie };
    if (fAnnee.length) q.annee = { $in: fAnnee };
    if (fRarete.length) q.rarete = { $in: fRarete };
    if (fType.length) q.type = { $in: fType };
    if (fEtat.length) q.etat = { $in: fEtat };
    if (fLangue.length) q.langue = { $in: fLangue };
    if (fGradee === "graded") q.gradee = true;
    if (fGradee === "ungraded") q.gradee = false;
    if (fStock === "in") q.stock = { $gt: 0 };
    if (fStock === "out") q.stock = { $lte: 0 };
    const priceQ = {};
    if (prixMin) priceQ.$gte = Number(prixMin);
    if (prixMax) priceQ.$lte = Number(prixMax);
    if (Object.keys(priceQ).length) q.prix = priceQ;
    return q;
  }, [search, fSerie, fAnnee, fRarete, fType, fEtat, fLangue, fGradee, fStock, prixMin, prixMax]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const res = await base44.entities.Card.filter(query, { sort, limit: 200 });
        if (active) setCards(res.items || []);
      } catch (e) {
        if (active) setCards([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [query, sort]);

  const toggle = (setter, val) => (setter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]));

  const clearAll = () => {
    setSearch(""); setFSerie([]); setFAnnee([]); setFRarete([]); setFType([]);
    setFEtat([]); setFLangue([]); setFGradee("all"); setPrixMin(""); setPrixMax(""); setFStock("all");
  };

  const activeFilterCount =
    fSerie.length + fAnnee.length + fRarete.length + fType.length + fEtat.length + fLangue.length +
    (fGradee !== "all" ? 1 : 0) + (fStock !== "all" ? 1 : 0) + (prixMin ? 1 : 0) + (prixMax ? 1 : 0);

  // Grouping by year then serie
  const grouped = useMemo(() => {
    const map = {};
    cards.forEach(c => {
      const y = c.annee || "—";
      const s = c.serie || "Autre";
      if (!map[y]) map[y] = {};
      if (!map[y][s]) map[y][s] = [];
      map[y][s].push(c);
    });
    return Object.entries(map).sort((a, b) => b[0] - a[0]);
  }, [cards]);

  const Sidebar = (
    <div className="bg-card border-[3px] border-black p-4" style={{ boxShadow: "5px 5px 0 0 #0B0B10" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-impact uppercase text-gold tracking-wide flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" /> Filtres
        </h3>
        {activeFilterCount > 0 && (
          <button onClick={clearAll} className="text-xs font-body text-white/60 hover:text-accent underline">
            Effacer ({activeFilterCount})
          </button>
        )}
      </div>

      <FilterSection title="Série">
        <div className="max-h-40 overflow-y-auto scrollbar-hide">
          {seriesList.map(s => (
            <CheckItem key={s.id} checked={fSerie.includes(s.nom)} onClick={() => toggle(setFSerie, s.nom)} label={`${s.nom} (${s.annee})`} />
          ))}
          {seriesList.length === 0 && <p className="text-xs text-white/40">Chargement…</p>}
        </div>
      </FilterSection>

      <FilterSection title="Année">
        <div className="flex flex-wrap gap-1.5">
          {years.map(y => (
            <button
              key={y}
              onClick={() => toggle(setFAnnee, y)}
              className={`px-2 py-1 text-xs font-impact border-2 border-black ${fAnnee.includes(y) ? "bg-gold text-black" : "bg-white/10 text-white"}`}
            >
              {y}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Rareté">
        {RARETES.map(r => (
          <CheckItem key={r} checked={fRarete.includes(r)} onClick={() => toggle(setFRarete, r)} label={r} color={RARETE_COLORS[r]} />
        ))}
      </FilterSection>

      <FilterSection title="Type / Énergie">
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => toggle(setFType, t)}
              className={`px-2 py-1 text-xs font-impact border-2 border-black ${fType.includes(t) ? "bg-gold text-black" : "bg-white/10 text-white"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="État">
        {ETATS.map(e => (
          <CheckItem key={e} checked={fEtat.includes(e)} onClick={() => toggle(setFEtat, e)} label={e} />
        ))}
      </FilterSection>

      <FilterSection title="Langue">
        <div className="flex gap-2">
          {LANGUES.map(l => (
            <button
              key={l}
              onClick={() => toggle(setFLangue, l)}
              className={`px-3 py-1 text-xs font-impact border-2 border-black ${fLangue.includes(l) ? "bg-gold text-black" : "bg-white/10 text-white"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Carte gradée">
        <div className="flex gap-2">
          {[
            { v: "all", l: "Toutes" },
            { v: "graded", l: "Gradées" },
            { v: "ungraded", l: "Non gradées" },
          ].map(o => (
            <button
              key={o.v}
              onClick={() => setFGradee(o.v)}
              className={`px-2 py-1 text-xs font-impact border-2 border-black ${fGradee === o.v ? "bg-gold text-black" : "bg-white/10 text-white"}`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Prix (€)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={prixMin}
            onChange={e => setPrixMin(e.target.value)}
            placeholder="min"
            className="w-full px-2 py-1 bg-white/10 border-2 border-black text-white text-sm font-body"
          />
          <span className="text-white/50">—</span>
          <input
            type="number"
            value={prixMax}
            onChange={e => setPrixMax(e.target.value)}
            placeholder="max"
            className="w-full px-2 py-1 bg-white/10 border-2 border-black text-white text-sm font-body"
          />
        </div>
      </FilterSection>

      <FilterSection title="Disponibilité">
        <div className="flex flex-col gap-1.5">
          {[
            { v: "all", l: "Toutes" },
            { v: "in", l: "En stock" },
            { v: "out", l: "Rupture" },
          ].map(o => (
            <button
              key={o.v}
              onClick={() => setFStock(o.v)}
              className={`px-2 py-1 text-xs font-impact border-2 border-black text-left ${fStock === o.v ? "bg-gold text-black" : "bg-white/10 text-white"}`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b-4 border-black">
        <div className="halftone absolute inset-0 opacity-20 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20 text-center">
          <div className="inline-block bg-gold text-black font-impact uppercase px-3 py-1 border-2 border-black -rotate-2 mb-6 text-sm">
            <Crown className="inline w-4 h-4 mr-1" /> Collection · Échange · Passion
          </div>
          {/* Titre centré, logo flottant à côté */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6">
            <div className="flex justify-center md:justify-end">
              <img
                src={LOGO_URL}
                alt="Logo T.C.G. The Collector Geeks"
                className="h-28 w-28 md:h-40 md:w-40 object-contain rounded-full border-4 border-black bg-gold animate-float"
                style={{ boxShadow: "6px 6px 0 0 #81008F" }}
              />
            </div>
            <h1 className="font-heading text-5xl md:text-7xl text-white text-stroke-black text-shadow-violet leading-[0.95]">
              THE COLLECTOR<br/>GEEKS
            </h1>
            <div className="hidden md:block" />
          </div>
          <p className="mt-6 mx-auto text-white/80 font-body text-lg max-w-xl">
            Des cartes Pokémon classées par série et par année. Cartes gradées, raretés et dernières pièces : découvre ce qui t'attend en boutique.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="#catalogue" className="btn-gold px-6 py-3 text-lg">Voir le catalogue</a>
            <Link to="/planning" className="btn-violet px-6 py-3 text-lg">Planning</Link>
          </div>
        </div>
        <div className="torn-edge-top h-3 bg-gold" />
      </section>

      {/* CATALOGUE */}
      <section id="catalogue" className="max-w-7xl mx-auto px-4 py-10">
        {/* Search + sort bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/50" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher : nom, numéro, série…"
              className="w-full pl-11 pr-4 py-3 bg-[#FFF7E8] border-[3px] border-black text-black font-body text-base focus:outline-none focus:ring-2 focus:ring-gold"
              style={{ boxShadow: "4px 4px 0 0 #81008F" }}
            />
          </div>
          <button
            onClick={() => setShowFilters(s => !s)}
            className="md:hidden btn-violet px-4 py-3 flex items-center gap-2"
          >
            <SlidersHorizontal className="w-5 h-5" /> Filtres {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="px-4 py-3 bg-[#FFF7E8] border-[3px] border-black text-black font-body font-bold focus:outline-none"
            style={{ boxShadow: "4px 4px 0 0 #81008F" }}
          >
            {SORTS.map(s => <option key={s.value} value={s.value}>Trier : {s.label}</option>)}
          </select>
          <div className="flex border-[3px] border-black">
            <button
              onClick={() => setView("grid")}
              className={`px-4 py-3 font-impact uppercase text-sm ${view === "grid" ? "bg-gold text-black" : "bg-card text-white"}`}
            >Grille</button>
            <button
              onClick={() => setView("series")}
              className={`px-4 py-3 font-impact uppercase text-sm border-l-2 border-black ${view === "series" ? "bg-gold text-black" : "bg-card text-white"}`}
            >Par série</button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar desktop */}
          <aside className="hidden md:block w-64 shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide">
            {Sidebar}
          </aside>

          {/* Mobile filter drawer */}
          {showFilters && (
            <div className="md:hidden fixed inset-0 z-50 bg-black/70 flex" onClick={() => setShowFilters(false)}>
              <div className="w-80 max-w-[85%] h-full overflow-y-auto bg-background p-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-end mb-2">
                  <button onClick={() => setShowFilters(false)} className="p-2 bg-card border-2 border-black text-white"><X className="w-5 h-5" /></button>
                </div>
                {Sidebar}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-card border-[3px] border-black animate-pulse" />
                ))}
              </div>
            ) : cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Mascotte size={160} />
                <h3 className="mt-6 font-heading text-2xl text-white text-stroke-black-sm">Aucune carte trouvée</h3>
                <p className="text-white/60 font-body mt-2">Essaie d'élargir tes filtres, dresseur !</p>
                {activeFilterCount > 0 && (
                  <button onClick={clearAll} className="btn-gold mt-5 px-5 py-2">Effacer les filtres</button>
                )}
              </div>
            ) : view === "grid" ? (
              <>
                <p className="text-white/60 font-body text-sm mb-4">{cards.length} carte{cards.length > 1 ? "s" : ""} trouvée{cards.length > 1 ? "s" : ""}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                  {cards.map(c => <ProductCard key={c.id} card={c} />)}
                </div>
              </>
            ) : (
              <div className="space-y-6">
                {grouped.map(([year, series]) => (
                  <div key={year} className="border-[3px] border-black bg-card/50" style={{ boxShadow: "5px 5px 0 0 #0B0B10" }}>
                    <div className="bg-primary px-4 py-2 border-b-2 border-black flex items-center gap-2">
                      <Zap className="w-5 h-5 text-gold" />
                      <h3 className="font-impact uppercase text-gold tracking-wide text-lg">{year}</h3>
                    </div>
                    {Object.entries(series).map(([serieName, serieCards]) => {
                      const key = `${year}-${serieName}`;
                      const open = openGroups[key] !== false;
                      return (
                        <div key={key} className="border-b-2 border-black/30 last:border-0">
                          <button
                            onClick={() => setOpenGroups(p => ({ ...p, [key]: !(p[key] !== false) }))}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5"
                          >
                            <span className="font-impact uppercase text-white tracking-wide">{serieName}</span>
                            <span className="flex items-center gap-2 text-white/60 text-sm font-body">
                              {serieCards.length} carte{serieCards.length > 1 ? "s" : ""}
                              {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </span>
                          </button>
                          {open && (
                            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                              {serieCards.map(c => <ProductCard key={c.id} card={c} />)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}