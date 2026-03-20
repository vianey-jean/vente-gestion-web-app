import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';

interface ModuleConfig {
  key: string;
  label: string;
  description: string;
}

const MODULES: ModuleConfig[] = [
  { key: 'ventes', label: 'Ventes', description: 'Module de gestion des ventes' },
  { key: 'clients', label: 'Clients', description: 'Module de gestion des clients' },
  { key: 'produits', label: 'Produits', description: 'Inventaire et gestion des produits' },
  { key: 'commandes', label: 'Commandes', description: 'Suivi des commandes' },
  { key: 'comptabilite', label: 'Comptabilité', description: 'Module comptable' },
  { key: 'pointage', label: 'Pointage', description: 'Pointage des travailleurs' },
  { key: 'rdv', label: 'Rendez-vous', description: 'Gestion des rendez-vous' },
  { key: 'taches', label: 'Tâches', description: 'Gestion des tâches' },
  { key: 'notes', label: 'Notes', description: 'Notes et kanban' },
  { key: 'tendances', label: 'Tendances', description: 'Analyses et tendances' },
];

const ModuleSettingsSection: React.FC = () => {
  const [modules, setModules] = useState<Record<string, boolean>>(
    Object.fromEntries(MODULES.map(m => [m.key, true]))
  );

  const handleToggle = (key: string) => {
    setModules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-2">
      {MODULES.map(mod => (
        <div key={mod.key} className="flex items-center justify-between rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-white/5 dark:to-white/[0.02] border border-border/50 p-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{mod.label}</p>
            <p className="text-xs text-muted-foreground">{mod.description}</p>
          </div>
          <Switch checked={modules[mod.key]} onCheckedChange={() => handleToggle(mod.key)} />
        </div>
      ))}
    </div>
  );
};

export default ModuleSettingsSection;
