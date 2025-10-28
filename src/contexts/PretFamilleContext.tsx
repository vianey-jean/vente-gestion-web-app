import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { PretFamille } from '@/types';
import { usePretFamille } from '@/hooks/use-pret-famille';

interface PretFamilleContextType {
  prets: PretFamille[];
  loading: boolean;
  fetchPrets: () => Promise<void>;
  addRemboursement: (pretId: string, montant: number) => Promise<boolean>;
  updateRemboursement: (pretId: string, remboursementIndex: number, nouveauMontant: number) => Promise<boolean>;
  deleteRemboursement: (pretId: string, remboursementIndex: number) => Promise<boolean>;
  createPret: (nom: string, pretTotal: number, dateDebut: Date) => Promise<boolean>;
  searchByName: (name: string) => Promise<PretFamille[]>;
}

const PretFamilleContext = createContext<PretFamilleContextType | undefined>(undefined);

export const PretFamilleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pretFamilleHook = usePretFamille();

  // Synchronisation automatique au chargement
  useEffect(() => {
    pretFamilleHook.fetchPrets();
  }, []);

  // Synchronisation périodique toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      pretFamilleHook.fetchPrets();
    }, 5000);

    return () => clearInterval(interval);
  }, [pretFamilleHook]);

  return (
    <PretFamilleContext.Provider value={pretFamilleHook}>
      {children}
    </PretFamilleContext.Provider>
  );
};

export const usePretFamilleContext = () => {
  const context = useContext(PretFamilleContext);
  if (context === undefined) {
    throw new Error('usePretFamilleContext must be used within a PretFamilleProvider');
  }
  return context;
};
