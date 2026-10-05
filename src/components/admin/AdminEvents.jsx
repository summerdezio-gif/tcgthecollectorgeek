import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { TYPES_EVENT } from "@/lib/constants";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const EMPTY = { titre: "", type: TYPES_EVENT[0], date: "", horaires: "", lieu: "", description: "", capacite: "" };

export default function AdminEvents() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const { toast } = useToast();

  const load = async () => {
    try {
      const res = await base44.entities.Event.filter({}, { sort: "date", limit: 100 });
      setList(res.items || []);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.titre || !form.date || !form.lieu) { toast({ title: "Titre, date et lieu requis", variant: "destructive" }); return; }
    const payload = { ...form, capacite: Number(form.capacite) || 0 };
    try {
      if (editing === "new") await base44.entities.Event.create(payload);
      else await base44.entities.Event.update(editing, payload);
      toast({ title: "Événement enregistré" });
      setEditing(null); setForm(EMPTY);
      load();
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const del = async (e) => {
    if (!confirm(`Supprimer "${e.titre}" ?`)) return;
    try { await base44.entities.Event.delete(e.id); toast({ title: "Événement supprimé" }); load(); }
    catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-impact uppercase text-white tracking-wide">Événements ({list.length})</h3>
        <button onClick={() => { setEditing("new"); setForm(EMPTY); }} className="btn-gold px-4 py-2 flex items-center gap-2"><Plus className="w-4 h-4" /> Ajouter</button>
      </div>

      {editing && (
        <div className="bg-[#FFF7E8] text-black border-[3px] border-black p-4 mb-5" style={{ boxShadow: "5px 5px 0 0 #81008F" }}>
          <div className="flex justify-between mb-3">
            <span className="font-impact uppercase text-primary">{editing === "new" ? "Nouvel événement" : "Modifier"}</span>
            <button onClick={() => setEditing(null)} className="p-1.5 bg-black text-white border-2 border-black"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2"><label className="block text-xs font-impact uppercase mb-1">Titre</label><input value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} className="inp" /></div>
            <div><label className="block text-xs font-impact uppercase mb-1">Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="inp">{TYPES_EVENT.map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label className="block text-xs font-impact uppercase mb-1">Date</label><input type="date" value={form.date ? form.date.slice(0, 10) : ""} onChange={e => setForm({ ...form, date: e.target.value })} className="inp" /></div>
            <div><label className="block text-xs font-impact uppercase mb-1">Horaires</label><input value={form.horaires} onChange={e => setForm({ ...form, horaires: e.target.value })} placeholder="10h - 18h" className="inp" /></div>
            <div><label className="block text-xs font-impact uppercase mb-1">Lieu</label><input value={form.lieu} onChange={e => setForm({ ...form, lieu: e.target.value })} className="inp" /></div>
            <div><label className="block text-xs font-impact uppercase mb-1">Capacité max</label><input type="number" value={form.capacite} onChange={e => setForm({ ...form, capacite: e.target.value })} className="inp" /></div>
            <div className="sm:col-span-2"><label className="block text-xs font-impact uppercase mb-1">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="inp" /></div>
          </div>
          <button onClick={save} className="btn-gold mt-4 px-5 py-2">Enregistrer</button>
        </div>
      )}

      <div className="space-y-2">
        {list.map(e => (
          <div key={e.id} className="bg-card border-2 border-black p-3 flex items-center gap-3">
            <div className="w-14 text-center bg-primary border border-black py-1">
              <div className="font-impact text-gold text-xs">{new Date(e.date).toLocaleDateString("fr-FR", { month: "short" })}</div>
              <div className="font-heading text-white text-lg leading-none">{new Date(e.date).getDate()}</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-impact uppercase text-white text-sm truncate">{e.titre}</p>
              <p className="text-white/50 text-xs font-body">{e.type} · {e.lieu} · {(e.inscrits || []).length} inscrits</p>
            </div>
            <button onClick={() => { setEditing(e.id); setForm({ ...EMPTY, ...e, date: e.date ? e.date.slice(0, 10) : "", capacite: e.capacite ?? "" }); }} className="p-1.5 bg-gold text-black border border-black"><Pencil className="w-3.5 h-3.5" /></button>
            <button onClick={() => del(e)} className="p-1.5 bg-accent text-white border border-black"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}