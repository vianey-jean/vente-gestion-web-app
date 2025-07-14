
import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import ModernContainer from '@/components/dashboard/forms/ModernContainer';
import ModernCard from '@/components/dashboard/forms/ModernCard';
import ModernButton from '@/components/dashboard/forms/ModernButton';
import { toast } from '@/hooks/use-toast';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar, 
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  Clock
} from 'lucide-react';
import PremiumLoading from '@/components/ui/premium-loading';

const PretFamilles: React.FC = () => {
  const { loading } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [adresse, setAdresse] = useState('');
  const [notes, setNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFamille, setSelectedFamille] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Mock data for now since the context properties don't exist
  const pretFamilles = [];

  const resetForm = () => {
    setNom('');
    setTelephone('');
    setEmail('');
    setAdresse('');
    setNotes('');
    setSelectedFamille(null);
    setIsEditing(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleEditFamille = (famille) => {
    setSelectedFamille(famille);
    setNom(famille.nom);
    setTelephone(famille.telephone);
    setEmail(famille.email);
    setAdresse(famille.adresse);
    setNotes(famille.notes);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeleteFamille = async (id) => {
    try {
      // Mock function call
      toast({
        title: "Succès",
        description: "Famille supprimée avec succès.",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de la famille.",
        className: "bg-red-500 text-white",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const familleData = {
      nom,
      telephone,
      email,
      adresse,
      notes,
    };

    try {
      if (isEditing && selectedFamille) {
        // Mock update function
        toast({
          title: "Succès",
          description: "Famille mise à jour avec succès.",
          className: "bg-green-500 text-white",
        });
      } else {
        // Mock add function
        toast({
          title: "Succès",
          description: "Famille ajoutée avec succès.",
          className: "bg-green-500 text-white",
        });
      }
      handleCloseModal();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement de la famille.",
        className: "bg-red-500 text-white",
      });
    }
  };

  // Simuler un chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <PremiumLoading 
        text="Chargement des Prêts Familles"
        size="md"
        variant="dashboard"
        showText={true}
      />
    );
  }

  return (
    <ModernContainer>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Gestion des Prêts Familles</h2>
          <p className="text-sm text-muted-foreground">
            Ajoutez, modifiez et gérez les informations des familles bénéficiant de prêts.
          </p>
        </div>
        <ModernButton onClick={handleOpenModal}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une Famille
        </ModernButton>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {pretFamilles.map((famille) => (
          <ModernCard key={famille.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span>{famille.nom}</span>
              </CardTitle>
              <CardDescription>
                <div className="flex items-center space-x-1 text-xs">
                  <Calendar className="w-3 h-3" />
                  <span>Ajouté le: {new Date(famille.createdAt).toLocaleDateString()}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <a href={`tel:${famille.telephone}`} className="text-sm hover:underline">
                    {famille.telephone}
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <a href={`mailto:${famille.email}`} className="text-sm hover:underline">
                    {famille.email}
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm">{famille.adresse}</span>
                </div>
                {famille.notes && (
                  <div className="text-sm">
                    <span className="font-semibold">Notes:</span> {famille.notes}
                  </div>
                )}
              </div>
            </CardContent>
            <div className="flex justify-end space-x-2 p-4">
              <Button variant="outline" size="sm" onClick={() => handleEditFamille(famille)}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteFamille(famille.id)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </ModernCard>
        ))}
      </div>

      {pretFamilles.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Aucune famille enregistrée pour le moment.
            <br />
            Commencez par ajouter une famille !
          </p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">{isEditing ? 'Modifier' : 'Ajouter'} une Famille</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nom">Nom</Label>
                <Input type="text" id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input type="tel" id="telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="adresse">Adresse</Label>
                <Input type="text" id="adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={handleCloseModal}>
                  Annuler
                </Button>
                <Button type="submit">{isEditing ? 'Mettre à jour' : 'Enregistrer'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ModernContainer>
  );
};

export default PretFamilles;
