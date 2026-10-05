import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { RARETES, TYPES, ETATS, LANGUES, formatPrix, stockBadge } from "@/lib/constants";
import { searchCards, fetchCardDetails, TCGDEX_LANGS } from "@/lib/tcgdex";
import { Plus, Minus, Pencil, Trash2, X, Search, Upload, Sparkles } from "lucide-react";
import { Image } from "@/components/ui/image";

const EMPTY = { nom: "", numero: "", serie: "", annee: new Date().getFullYear(), rarete: RARETES[0], type: TYPES[0], etat: ETATS[0], langue: "FR", gradee: false, note_psa: "", prix: "", stock: 1, image: "", description: "" };

export default function AdminCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [seriesList, setSeriesList] = useState([]);
  // Recherche automatique (TCGdex)
  const [lookup, setLookup] = useState({ nom: "", numero: "", langue: "FR" });
  const [results, setResults] = useState(null);
  const [looking, setLooking] = useState(false);
  const [filling, setFilling] = useState(null);
  const [found, setFound] = useState(null); // { serie, cote, rareteOrigine, bloc }
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const q = search.trim() ? { nom: { $regex: search.trim(), $options: "i" } } : {};
      const res = await base44.entities.Card.filter(q, { sort: "-created_date", limit: 100 });
      setCards(res.items || []);
    } catch { setCards([]); }
    finally { setLoading(false); }
  };

  const loadSeries = async () => {
    try {
      const res = await base44.entities.Series.filter({}, { sort: "-annee", limit: 200 });
      setSeriesList(res.items || []);
    } catch {}
  };

  useEffect(() => { load(); }, [search]);
  useEffect(() => { loadSeries(); }, []);

  const resetLookup = () => { setLookup({ nom: "", numero: "", langue: "FR" }); setResults(null); setFound(null); };
  const close = () => { setEditing(null); setForm(EMPTY); resetLookup(); };
  const startEdit = (c) => { resetLookup(); setEditing(c.id); setForm({ ...EMPTY, ...c, note_psa: c.note_psa ?? "", prix: c.prix ?? "", stock: c.stock ?? 0 }); };
  const startNew = () => { resetLookup(); setEditing("new"); setForm(EMPTY); };

  const runLookup = async () => {
    if (!lookup.nom.trim() && !lookup.numero.trim()) { toast({ title: "Indique un nom ou un numéro", variant: "destructive" }); return; }
    setLooking(true);
    try {
      setResults(await searchCards(lookup));
    } catch {
      setResults([]);
      toast({ title: "Recherche impossible", description: "La base de cartes ne répond pas, réessaie ou remplis à la main.", variant: "destructive" });
    } finally { setLooking(false); }
  };

  const pickResult = async (r) => {
    setFilling(r.id);
    try {
      const d = await fetchCardDetails(r.id, lookup.langue);
      setForm(f => ({ ...f, ...d.fields }));
      setFound(d);
      setResults(null);
      toast({ title: "Infos récupérées", description: `${d.fields.nom} · ${d.fields.serie}` });
    } catch {
      toast({ title: "Infos introuvables pour cette carte", variant: "destructive" });
    } finally { setFilling(null); }
  };

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setForm(f => ({ ...f, image: file_url }));
      toast({ title: "Image uploadée" });
    } catch {
      toast({ title: "Upload échoué", variant: "destructive" });
    } finally { setUploading(false); }
  };

  // Crée la série si elle n'existe pas encore (avec son logo quand il vient de la recherche)
  const ensureSerie = async (nom, annee) => {
    if (seriesList.some(s => (s.nom || "").toLowerCase() === nom.toLowerCase())) return;
    const meta = found?.serie && found.serie.nom === nom ? found.serie : null;
    try {
      await base44.entities.Series.create({
        nom,
        annee: meta?.annee || annee,
        ...(meta?.logo ? { logo: meta.logo } : {}),
      });
      loadSeries();
    } catch {}
  };

  const save = async () => {
    const nom = form.nom.trim();
    const serie = form.serie.trim();
    if (!nom || !serie) { toast({ title: "Nom et série requis", variant: "destructive" }); return; }
    setSaving(true);
    const { id, created_date, updated_date, created_by, created_by_id, is_sample, ...fields } = form;
    const payload = {
      ...fields,
      nom,
      serie,
      annee: Number(form.annee) || new Date().getFullYear(),
      note_psa: form.gradee ? (form.note_psa ? Number(form.note_psa) : null) : null,
      prix: Number(form.prix) || 0,
      stock: Math.max(0, Math.round(Number(form.stock) || 0)),
    };
    if (!payload.image) delete payload.image;
    try {
      if (editing === "new") await base44.entities.Card.create(payload);
      else await base44.entities.Card.update(editing, payload);
      await ensureSerie(serie, payload.annee);
      toast({ title: editing === "new" ? "Carte mise en ligne" : "Carte modifiée" });
      close();
      load();
    } catch (e) { toast({ title: "Erreur", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  // Mise à jour rapide du stock depuis la liste
  const setStock = async (c, value) => {
    const stock = Math.max(0, Math.round(Number(value) || 0));
    if (stock === (c.stock || 0)) return;
    setCards(prev => prev.map(x => x.id === c.id ? { ...x, stock } : x));
    try {
      await base44.entities.Card.update(c.id, { stock });
    } catch {
      setCards(prev => prev.map(x => x.id === c.id ? { ...x, stock: c.stock } : x));
      toast({ title: "Stock non enregistré", variant: "destructive" });
    }
  };

  const del = async (c) => {
    if (!confirm(`Supprimer "${c.nom}" ?`)) return;
    try { await base44.entities.Card.delete(c.id); toast({ title: "Carte supprimée" }); load(); }
    catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/50" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une carte…" className="w-full pl-9 pr-3 py-2 border-2 border-black bg-white text-black font-body text-sm" />
        </div>
        <button onClick={startNew} className="btn-gold px-4 py-2 flex items-center gap-2"><Plus className="w-4 h-4" /> Ajouter</button>
      </div>

      {editing && (
        <div className="bg-[#FFF7E8] text-black border-[3px] border-black p-4 mb-5" style={{ boxShadow: "5px 5px 0 0 #81008F" }}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-impact uppercase text-primary">{editing === "new" ? "Nouvelle carte" : "Modifier la carte"}</h3>
            <button onClick={close} className="p-1.5 bg-black text-white border-2 border-black" aria-label="Fermer"><X className="w-4 h-4" /></button>
          </div>

          {/* Recherche automatique des infos */}
          <div className="bg-primary text-white border-2 border-black p-3 mb-4">
            <p className="font-impact uppercase text-gold text-sm flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" /> Retrouver les infos automatiquement
            </p>
            <form
              onSubmit={e => { e.preventDefault(); runLookup(); }}
              className="grid gap-2 sm:grid-cols-[1fr_110px_90px_auto]"
            >
              <input value={lookup.nom} onChange={e => setLookup({ ...lookup, nom: e.target.value })} placeholder="Nom de la carte (ex : Dracaufeu)" className="inp" />
              <input value={lookup.numero} onChange={e => setLookup({ ...lookup, numero: e.target.value })} placeholder="N° (option)" className="inp" />
              <select value={lookup.langue} onChange={e => setLookup({ ...lookup, langue: e.target.value })} className="inp">
                {Object.keys(TCGDEX_LANGS).map(l => <option key={l}>{l}</option>)}
              </select>
              <button type="submit" disabled={looking} className="btn-gold px-4 py-2 flex items-center justify-center gap-2 disabled:opacity-60">
                <Search className="w-4 h-4" /> {looking ? "Recherche…" : "Chercher"}
              </button>
            </form>

            {results && results.length === 0 && (
              <p className="text-sm font-body text-white/80 mt-3">Aucune carte trouvée. Vérifie l'orthographe, essaie sans numéro, ou remplis le formulaire à la main.</p>
            )}
            {results && results.length > 0 && (
              <>
                <p className="text-xs font-body text-white/70 mt-3 mb-2">{results.length} résultat{results.length > 1 ? "s" : ""} — clique sur la bonne carte :</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2 max-h-80 overflow-y-auto pr-1">
                  {results.map(r => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => pickResult(r)}
                      disabled={!!filling}
                      className={`bg-[#0B0B10] border-2 border-black hover:border-gold text-left transition-transform hover:-translate-y-0.5 ${filling === r.id ? "opacity-50" : ""}`}
                    >
                      <div className="aspect-[3/4] flex items-center justify-center">
                        {r.thumb
                          ? <img src={r.thumb} alt={r.nom} loading="lazy" className="w-full h-full object-contain" />
                          : <span className="text-[10px] font-impact uppercase text-white/40">Sans image</span>}
                      </div>
                      <div className="px-1 py-1 bg-[#FFF7E8] text-black">
                        <p className="text-[11px] font-body font-bold leading-tight truncate">{r.nom}</p>
                        <p className="text-[10px] font-impact uppercase text-black/60 truncate">{r.setCode} · #{r.numero}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
            {found && (
              <p className="text-xs font-body text-white/80 mt-3">
                Trouvé : {found.bloc ? `${found.bloc} · ` : ""}{found.fields.serie}
                {found.rareteOrigine ? ` · rareté d'origine « ${found.rareteOrigine} »` : ""}. Vérifie l'état, le prix et le stock avant d'enregistrer.
              </p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="Nom *"><input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} className="inp" /></Field>
            <Field label="Numéro"><input value={form.numero} onChange={e => setForm({ ...form, numero: e.target.value })} className="inp" /></Field>
            <Field label="Série *">
              <input list="admin-series" value={form.serie} onChange={e => setForm({ ...form, serie: e.target.value })} placeholder="Choisir ou saisir" className="inp" />
              <datalist id="admin-series">
                {seriesList.map(s => <option key={s.id} value={s.nom} />)}
              </datalist>
            </Field>
            <Field label="Année"><input type="number" value={form.annee} onChange={e => setForm({ ...form, annee: e.target.value })} className="inp" /></Field>
            <Field label="Rareté"><select value={form.rarete} onChange={e => setForm({ ...form, rarete: e.target.value })} className="inp">{RARETES.map(r => <option key={r}>{r}</option>)}</select></Field>
            <Field label="Type"><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="inp">{TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
            <Field label="État"><select value={form.etat} onChange={e => setForm({ ...form, etat: e.target.value })} className="inp">{ETATS.map(r => <option key={r}>{r}</option>)}</select></Field>
            <Field label="Langue"><select value={form.langue} onChange={e => setForm({ ...form, langue: e.target.value })} className="inp">{LANGUES.map(r => <option key={r}>{r}</option>)}</select></Field>
            <Field label="Prix (€)">
              <input type="number" min="0" step="0.01" value={form.prix} onChange={e => setForm({ ...form, prix: e.target.value })} className="inp" />
              {found?.cote != null && (
                <button type="button" onClick={() => setForm(f => ({ ...f, prix: found.cote }))} className="mt-1 text-xs font-body underline text-primary">
                  Cote Cardmarket : {formatPrix(found.cote)} — utiliser
                </button>
              )}
            </Field>
            <Field label="Stock (exemplaires en boutique)"><input type="number" min="0" step="1" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="inp" /></Field>
            <Field label="Gradée"><label className="flex items-center gap-2 mt-2 font-body"><input type="checkbox" checked={!!form.gradee} onChange={e => setForm({ ...form, gradee: e.target.checked })} /> Oui</label></Field>
            <Field label="Note PSA"><input type="number" step="0.5" value={form.note_psa} onChange={e => setForm({ ...form, note_psa: e.target.value })} className="inp" disabled={!form.gradee} /></Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Image">
                <div className="flex items-center gap-3">
                  {form.image && <img src={form.image} alt="" className="h-20 w-auto border-2 border-black bg-[#0B0B10]" />}
                  <label className="btn-violet px-3 py-2 flex items-center gap-2 cursor-pointer shrink-0">
                    <Upload className="w-4 h-4" /> {uploading ? "Upload…" : form.image ? "Remplacer" : "Téléverser"}
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadImage(e.target.files[0])} />
                  </label>
                  {form.image && <span className="text-xs font-body text-black/60 truncate flex-1 min-w-0">{form.image}</span>}
                </div>
              </Field>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Description"><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="inp" /></Field>
            </div>
          </div>
          <button onClick={save} disabled={saving} className="btn-gold mt-4 px-5 py-2 disabled:opacity-60">{saving ? "Enregistrement…" : editing === "new" ? "Mettre en ligne" : "Enregistrer"}</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" /></div>
      ) : cards.length === 0 ? (
        <p className="text-white/60 font-body text-center py-10">Aucune carte en ligne pour l'instant. Clique sur « Ajouter » pour mettre la première.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body text-white">
            <thead className="bg-primary text-gold font-impact uppercase text-xs">
              <tr>
                <th className="text-left p-2">Carte</th><th className="text-left p-2">Série</th><th className="text-left p-2">Rareté</th>
                <th className="text-left p-2">Prix</th><th className="text-left p-2">Stock</th><th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {cards.map(c => {
                const s = stockBadge(c.stock || 0);
                return (
                  <tr key={c.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-12 bg-black/30 border border-black overflow-hidden shrink-0">
                          {c.image && <Image src={c.image} alt={c.nom} fittingType="fit" className="w-full h-full object-contain" />}
                        </div>
                        <span className="font-bold">{c.nom}</span>
                      </div>
                    </td>
                    <td className="p-2">{c.serie}</td>
                    <td className="p-2">{c.rarete}</td>
                    <td className="p-2 font-bold">{formatPrix(c.prix)}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setStock(c, (c.stock || 0) - 1)} disabled={(c.stock || 0) <= 0} className="w-7 h-7 flex items-center justify-center bg-white text-black border border-black disabled:opacity-40" aria-label="Retirer un exemplaire"><Minus className="w-3 h-3" /></button>
                        <input
                          key={`${c.id}-${c.stock}`}
                          type="number"
                          min="0"
                          defaultValue={c.stock || 0}
                          onBlur={e => setStock(c, e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }}
                          className="w-14 h-7 px-1 text-center font-bold bg-[#0B0B10] border border-black"
                          style={{ color: s.color }}
                          aria-label={`Stock de ${c.nom}`}
                        />
                        <button onClick={() => setStock(c, (c.stock || 0) + 1)} className="w-7 h-7 flex items-center justify-center bg-gold text-black border border-black" aria-label="Ajouter un exemplaire"><Plus className="w-3 h-3" /></button>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => startEdit(c)} className="p-1.5 bg-gold text-black border border-black" aria-label="Modifier"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => del(c)} className="p-1.5 bg-accent text-white border border-black" aria-label="Supprimer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-impact uppercase text-black/60 mb-1">{label}</label>
      {children}
    </div>
  );
}
