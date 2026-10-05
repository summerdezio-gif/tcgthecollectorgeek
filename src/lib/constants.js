// Constantes partagées du catalogue T.C.G.

export const RARETES = ["Commune", "Peu commune", "Rare", "Holo Rare", "Ultra Rare", "Secret Rare", "Promo", "Trainer Promo"];
export const TYPES = ["Plante", "Feu", "Eau", "Électrik", "Psy", "Combat", "Obscurité", "Métal", "Fée", "Incolore", "Dragon", "Dresseur", "Énergie"];
export const ETATS = ["Mint", "Near Mint", "Excellent", "Bon", "Joué"];
export const LANGUES = ["FR", "EN", "JP"];
export const TYPES_EVENT = ["Bourse d'échanges", "Tournoi", "Sortie de booster", "Atelier", "Rencontre"];

// Couleur de badge selon la rareté
export const RARETE_COLORS = {
  "Commune": "#6b7280",
  "Peu commune": "#3b82f6",
  "Rare": "#81008F",
  "Holo Rare": "#E900D8",
  "Ultra Rare": "#FFD000",
  "Secret Rare": "#f97316",
  "Promo": "#ec4899",
  "Trainer Promo": "#22c55e"
};

// Couleur de badge selon le type
export const TYPE_COLORS = {
  "Plante": "#22c55e",
  "Feu": "#ef4444",
  "Eau": "#3b82f6",
  "Électrik": "#facc15",
  "Psy": "#a855f7",
  "Combat": "#b45309",
  "Obscurité": "#1f2937",
  "Métal": "#94a3b8",
  "Fée": "#f9a8d4",
  "Incolore": "#d1d5db",
  "Dragon": "#7c3aed",
  "Dresseur": "#FFD000",
  "Énergie": "#E900D8"
};

export function formatPrix(p) {
  if (p == null || isNaN(p)) return "—";
  return Number(p).toFixed(2) + " €";
}

export function stockBadge(stock) {
  if (stock <= 0) return { label: "RUPTURE", color: "#ef4444", bg: "rgba(239,68,68,0.15)" };
  if (stock <= 2) return { label: "DERNIÈRES PIÈCES", color: "#FFD000", bg: "rgba(255,208,0,0.15)" };
  return { label: "EN STOCK", color: "#22c55e", bg: "rgba(34,197,94,0.15)" };
}

export const MASCOTTE_URL = "https://media.base44.com/images/public/user_69ec5bd27d0683e94db3a971/aecff2059_2LOGORESEAUX.png";
export const LOGO_URL = "https://media.base44.com/images/public/user_69ec5bd27d0683e94db3a971/abc777f05_1LOGO.png";