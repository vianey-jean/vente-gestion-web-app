import React, { useState } from 'react';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Indisponibilite {
  id: string;
  dateDebut: string;
  dateFin: string;
  motif: string;
}

const IndisponibiliteSection: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Indisponibilite[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ dateDebut: '', dateFin: '', motif: '' });

  const handleAdd = () => {
    if (!form.dateDebut || !form.dateFin) {
      toast({ title: 'Erreur', description: 'Veuillez remplir les dates', variant: 'destructive' });
      return;
    }
    const newItem: Indisponibilite = {
      id: Date.now().toString(),
      ...form,
    };
    setItems(prev => [...prev, newItem]);
    setForm({ dateDebut: '', dateFin: '', motif: '' });
    setAdding(false);
    toast({ title: '✅ Indisponibilité ajoutée', className: 'bg-green-600 text-white border-green-600' });
  };

  const handleRemove = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-foreground">Indisponibilités / Congés</span>
        </div>
        <Button
          size="sm"
          onClick={() => setAdding(!adding)}
          className="rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-300/30 text-orange-600 dark:text-orange-400 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" /> Ajouter
        </Button>
      </div>

      {adding && (
        <div className="space-y-3 mb-4 p-4 rounded-xl bg-muted/30 border border-border/50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Date début</label>
              <Input type="date" value={form.dateDebut} onChange={e => setForm(p => ({ ...p, dateDebut: e.target.value }))} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Date fin</label>
              <Input type="date" value={form.dateFin} onChange={e => setForm(p => ({ ...p, dateFin: e.target.value }))} className="rounded-xl" />
            </div>
          </div>
          <Input placeholder="Motif (optionnel)" value={form.motif} onChange={e => setForm(p => ({ ...p, motif: e.target.value }))} className="rounded-xl" />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setAdding(false)} variant="ghost" className="rounded-xl text-xs">Annuler</Button>
            <Button size="sm" onClick={handleAdd} className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs">Confirmer</Button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3">Aucune indisponibilité enregistrée</p>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-white/5 dark:to-white/[0.02] border border-border/50 p-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.dateDebut} → {item.dateFin}</p>
                {item.motif && <p className="text-xs text-muted-foreground">{item.motif}</p>}
              </div>
              <Button size="sm" variant="ghost" onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-600">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IndisponibiliteSection;
