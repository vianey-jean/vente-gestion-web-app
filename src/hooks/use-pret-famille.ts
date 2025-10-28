import { useState, useCallback } from 'react';
import { PretFamille, PaiementDetail } from '@/types';
import { pretFamilleService } from '@/services/pretFamilleService';
import { useToast } from '@/hooks/use-toast';

export const usePretFamille = () => {
  const [prets, setPrets] = useState<PretFamille[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPrets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await pretFamilleService.getAll();
      const pretsWithRemboursements = data.map(pret => ({
        ...pret,
        remboursements: pret.remboursements || []
      }));
      setPrets(pretsWithRemboursements);
    } catch (error) {
      console.error('Erreur lors du chargement des prêts', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les prêts familles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addRemboursement = useCallback(async (
    pretId: string,
    montant: number
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const pret = prets.find(p => p.id === pretId);
      if (!pret) throw new Error('Prêt non trouvé');

      const dateAujourdhui = new Date().toISOString().split('T')[0];
      const nouveauRemboursement: PaiementDetail = {
        date: dateAujourdhui,
        montant: montant
      };

      const rembourssementsActuels = pret.remboursements || [];
      const updatedPret: PretFamille = {
        ...pret,
        soldeRestant: pret.soldeRestant - montant,
        dernierRemboursement: montant,
        dateRemboursement: dateAujourdhui,
        remboursements: [...rembourssementsActuels, nouveauRemboursement]
      };

      await pretFamilleService.update(pretId, updatedPret);
      await fetchPrets();
      
      toast({
        title: 'Succès',
        description: 'Remboursement enregistré',
        variant: 'default',
        className: 'notification-success'
      });
      
      return true;
    } catch (error) {
      console.error('Erreur remboursement', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le remboursement',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [prets, fetchPrets, toast]);

  const updateRemboursement = useCallback(async (
    pretId: string,
    remboursementIndex: number,
    nouveauMontant: number
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const pret = prets.find(p => p.id === pretId);
      if (!pret) throw new Error('Prêt non trouvé');

      const remboursements = [...(pret.remboursements || [])];
      const ancienMontant = remboursements[remboursementIndex].montant;
      const difference = nouveauMontant - ancienMontant;

      remboursements[remboursementIndex] = {
        ...remboursements[remboursementIndex],
        montant: nouveauMontant
      };

      const updatedPret: PretFamille = {
        ...pret,
        soldeRestant: pret.soldeRestant - difference,
        remboursements: remboursements
      };

      await pretFamilleService.update(pretId, updatedPret);
      await fetchPrets();
      
      toast({
        title: 'Succès',
        description: 'Remboursement modifié',
        variant: 'default',
        className: 'notification-success'
      });
      
      return true;
    } catch (error) {
      console.error('Erreur modification remboursement', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le remboursement',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [prets, fetchPrets, toast]);

  const deleteRemboursement = useCallback(async (
    pretId: string,
    remboursementIndex: number
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const pret = prets.find(p => p.id === pretId);
      if (!pret) throw new Error('Prêt non trouvé');

      const remboursements = [...(pret.remboursements || [])];
      const montantSupprime = remboursements[remboursementIndex].montant;
      
      remboursements.splice(remboursementIndex, 1);

      const updatedPret: PretFamille = {
        ...pret,
        soldeRestant: pret.soldeRestant + montantSupprime,
        remboursements: remboursements
      };

      await pretFamilleService.update(pretId, updatedPret);
      await fetchPrets();
      
      toast({
        title: 'Succès',
        description: 'Remboursement supprimé',
        variant: 'default',
        className: 'notification-success'
      });
      
      return true;
    } catch (error) {
      console.error('Erreur suppression remboursement', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le remboursement',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [prets, fetchPrets, toast]);

  const createPret = useCallback(async (
    nom: string,
    pretTotal: number,
    dateDebut: Date
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const dateAujourdhui = dateDebut.toISOString().split('T')[0];
      const newPret: Omit<PretFamille, 'id'> = {
        nom: nom,
        pretTotal: pretTotal,
        soldeRestant: pretTotal,
        dernierRemboursement: 0,
        dateRemboursement: dateAujourdhui,
        remboursements: []
      };

      await pretFamilleService.create(newPret);
      await fetchPrets();
      
      toast({
        title: 'Succès',
        description: 'Demande enregistrée',
        variant: 'default',
        className: 'notification-success'
      });
      
      return true;
    } catch (error) {
      console.error('Erreur demande de prêt', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer la demande de prêt',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchPrets, toast]);

  const searchByName = useCallback(async (name: string): Promise<PretFamille[]> => {
    if (name.length < 3) return [];
    try {
      return await pretFamilleService.searchByName(name);
    } catch (error) {
      console.error('Erreur lors de la recherche', error);
      return [];
    }
  }, []);

  return {
    prets,
    loading,
    fetchPrets,
    addRemboursement,
    updateRemboursement,
    deleteRemboursement,
    createPret,
    searchByName,
  };
};
