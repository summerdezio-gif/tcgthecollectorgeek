// Recherche d'infos de cartes Pokémon sur TCGdex (API publique, sans clé).
// https://tcgdex.dev — utilisée dans l'admin pour pré-remplir une carte.

import { TYPES } from "@/lib/constants";

const API = "https://api.tcgdex.net/v2";

// Langues de recherche disponibles (valeur du champ "langue" → code TCGdex)
export const TCGDEX_LANGS = { FR: "fr", EN: "en" };

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TCGdex ${res.status}`);
  return res.json();
}

// Liste de cartes correspondant à un nom (et éventuellement un numéro)
export async function searchCards({ nom, numero, langue = "FR" }) {
  const lang = TCGDEX_LANGS[langue] || "fr";
  const params = new URLSearchParams();
  if (nom?.trim()) params.set("name", nom.trim());
  if (numero?.trim()) params.set("localId", numero.trim());
  const list = await getJson(`${API}/${lang}/cards?${params.toString()}`);
  return (Array.isArray(list) ? list : []).slice(0, 60).map(c => ({
    id: c.id,
    nom: c.name,
    numero: c.localId,
    setCode: String(c.id).split("-").slice(0, -1).join("-"),
    thumb: c.image ? `${c.image}/low.webp` : "",
  }));
}

const TYPE_ALIASES = {
  "électrique": "Électrik",
  grass: "Plante", fire: "Feu", water: "Eau", lightning: "Électrik", psychic: "Psy",
  fighting: "Combat", darkness: "Obscurité", metal: "Métal", fairy: "Fée",
  colorless: "Incolore", dragon: "Dragon",
};

function mapType(card) {
  const cat = (card.category || "").toLowerCase();
  if (cat.startsWith("dresseur") || cat.startsWith("trainer")) return "Dresseur";
  if (cat.startsWith("énergie") || cat.startsWith("energy")) return "Énergie";
  const raw = card.types?.[0] || "";
  if (TYPES.includes(raw)) return raw;
  return TYPE_ALIASES[raw.toLowerCase()] || "Incolore";
}

// Ramène les nombreuses raretés TCGdex sur les raretés de la boutique
function mapRarete(rarity) {
  const r = (rarity || "").toLowerCase();
  if (r.includes("promo")) return "Promo";
  if (r.includes("peu commune") || r.includes("uncommon") || r === "deux diamants") return "Peu commune";
  if (r.includes("commune") || r.includes("common") || r === "un diamant") return "Commune";
  if (/secr|hyper|sp[ée]ciale|special|chromatique|rainbow|shiny|couronne|crown|étoile|star$|noir blanc|mega attack/.test(r)) return "Secret Rare";
  if (/ultra|double|illustration|full art|\bv$|vmax|vstar|lv\.x|prime|l[ée]gende|legend|magnifique|amazing|radieux|radiant|high-tech|futuristic|rgb|pikachu|quatre diamants/.test(r)) return "Ultra Rare";
  if (r.includes("holo")) return "Holo Rare";
  if (r.includes("rare") || r === "trois diamants") return "Rare";
  return "Commune";
}

function cardmarketPrice(card) {
  const cm =
    card.pricing?.cardmarket ||
    (card.variants_detailed || []).map(v => v.pricing?.cardmarket).find(Boolean);
  const value = cm?.trend ?? cm?.avg ?? cm?.avg30;
  return typeof value === "number" && value > 0 ? Math.round(value * 100) / 100 : null;
}

// Détail complet d'une carte + de son extension, au format du formulaire admin
export async function fetchCardDetails(id, langue = "FR") {
  const lang = TCGDEX_LANGS[langue] || "fr";
  const card = await getJson(`${API}/${lang}/cards/${encodeURIComponent(id)}`);
  let set = null;
  if (card.set?.id) {
    try { set = await getJson(`${API}/${lang}/sets/${encodeURIComponent(card.set.id)}`); } catch { set = null; }
  }
  const annee = set?.releaseDate ? Number(String(set.releaseDate).slice(0, 4)) : null;
  const logo = set?.logo || card.set?.logo;
  return {
    fields: {
      nom: card.name || "",
      numero: card.localId != null ? String(card.localId) : "",
      serie: card.set?.name || "",
      ...(annee ? { annee } : {}),
      rarete: mapRarete(card.rarity),
      type: mapType(card),
      langue,
      image: card.image ? `${card.image}/high.webp` : "",
      description: card.description || card.effect || "",
    },
    serie: card.set?.name
      ? { nom: card.set.name, annee, logo: logo ? `${logo}.webp` : "" }
      : null,
    cote: cardmarketPrice(card),
    rareteOrigine: card.rarity || "",
    bloc: set?.serie?.name || "",
  };
}
