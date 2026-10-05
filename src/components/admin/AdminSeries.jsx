import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";

const EMPTY = { nom: "", annee: new Date().getFullYear(), logo: "" };

export default function AdminSeries({ onChanged }) {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    try {
      const res = await base44.entities.Series.filter({}, { sort: "-annee", limit: 200 });
      setList(res.items || []);
      onChanged?.(res.items || []);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const uploadLogo = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setForm(f => ({ ...f, logo: file_url }));
      toast({ title: "Logo uploadé" });
    } catch { toast({ title: "Upload échoué", variant: "destructive" }); }
    finally { setUploading(false); }
  };

  const save = async () => {
    if (!form.nom) { toast({ title: "Nom requis", variant: "destructive" }); return; }
    const payload = { ...form, annee: Number(form.annee) || new Date().getFullYear() };
    try {
      if (editing === "new") await base44.entities.Series.create(payload);
      else await base44.entities.Series.update(editing, payload);
      toast({ title: "Série enregistrée" });
      setEditing(null); setForm(EMPTY);
      load();
    } catch (e) { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const del = async (s) => {
    if (!confirm(`Supprimer la série "${s.nom}" ?`)) return;
    try { await base44.entities.Series.delete(s.id); toast({ title: "Série supprimée" }); load(); }
    catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-impact uppercase text-white tracking-wide">Séries ({list.length})</h3>
        <button onClick={() => { setEditing("new"); setForm(EMPTY); }} className="btn-gold px-4 py-2 flex items-center gap-2"><Plus className="w-4 h-4" /> Ajouter</button>
      </div>

      {editing && (
        <div className="bg-[#FFF7E8] text-black border-[3px] border-black p-4 mb-5" style={{ boxShadow: "5px 5px 0 0 #81008F" }}>
          <div className="flex justify-between mb-3">
            <span className="font-impact uppercase text-primary">{editing === "new" ? "Nouvelle série" : "Modifier"}</span>
            <button onClick={() => setEditing(null)} className="p-1.5 bg-black text-white border-2 border-black"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div><label className="block text-xs font-impact uppercase mb-1">Nom</label><input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} className="inp" /></div>
            <div><label className="block text-xs font-impact uppercase mb-1">Année</label><input type="number" value={form.annee} onChange={e => setForm({ ...form, annee: e.target.value })} className="inp" /></div>
            <div>
              <label className="block text-xs font-impact uppercase mb-1">Logo</label>
              <label className="btn-violet px-3 py-2 flex items-center gap-2 cursor-pointer w-fit">
                <Upload className="w-4 h-4" /> {uploading ? "…" : "Téléverser"}
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadLogo(e.target.files[0])} />
              </label>
            </div>
          </div>
          {form.logo && <img src={form.logo} alt="logo" className="h-16 mt-2 border-2 border-black" />}
          <button onClick={save} className="btn-gold mt-4 px-5 py-2">Enregistrer</button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map(s => (
          <div key={s.id} className="bg-card border-2 border-black p-3 flex items-center gap-3">
            {s.logo ? <img src={s.logo} alt={s.nom} className="w-10 h-10 object-contain" /> : <div className="w-10 h-10 bg-primary border border-black" />}
            <div className="flex-1 min-w-0">
              <p className="font-impact uppercase text-white text-sm truncate">{s.nom}</p>
              <p className="text-white/50 text-xs font-body">{s.annee}</p>
            </div>
            <button onClick={() => { setEditing(s.id); setForm({ ...EMPTY, ...s }); }} className="p-1.5 bg-gold text-black border border-black"><Pencil className="w-3.5 h-3.5" /></button>
            <button onClick={() => del(s)} className="p-1.5 bg-accent text-white border border-black"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}