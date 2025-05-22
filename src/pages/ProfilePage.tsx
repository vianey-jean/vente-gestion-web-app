
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import PersonalInfoForm from '@/components/profile/PersonalInfoForm';
import PasswordForm from '@/components/profile/PasswordForm';
import PreferencesForm from '@/components/profile/PreferencesForm';
import { useAuth } from '@/contexts/AuthContext';
import { UpdateProfileData } from '@/services/api';
import { toast } from '@/components/ui/sonner';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  type Genre = "homme" | "femme" | "autre" | undefined;
  
  const [profileData, setProfileData] = useState<UpdateProfileData & { id?: string, genre?: Genre }>({
    id: user?.id,
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    adresse: user?.adresse || '',
    ville: user?.ville || '',
    codePostal: user?.codePostal || '',
    pays: user?.pays || '',
    telephone: user?.telephone || '',
    genre: (user?.genre as Genre) || undefined
  });

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        id: user.id,
        nom: user.nom || '',
        prenom: user.prenom || '',
        adresse: user.adresse || '',
        ville: user.ville || '',
        codePostal: user.codePostal || '',
        pays: user.pays || '',
        telephone: user.telephone || '',
        genre: (user.genre as Genre) || undefined
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenreChange = (value: Genre) => {
    if (value === undefined || value === "homme" || value === "femme" || value === "autre") {
      setProfileData(prev => ({ ...prev, genre: value }));
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Remove id from data before sending to API
      const { id, ...dataToUpdate } = profileData;
      
      // Only include the genre field if it's actually set to a valid value
      const dataToSend: UpdateProfileData = {
        ...dataToUpdate,
        genre: dataToUpdate.genre as "homme" | "femme" | "autre" | undefined
      };
      
      await updateProfile(dataToSend);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Mon Compte</h1>
        
        <Card className="mx-auto max-w-3xl">
          <CardContent className="p-6">
            <Tabs defaultValue="info">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Mes Informations</TabsTrigger>
                <TabsTrigger value="security">Sécurité</TabsTrigger>
                <TabsTrigger value="preferences">Préférences</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="mt-6">
                <PersonalInfoForm 
                  profileData={profileData}
                  loading={loading}
                  handleProfileChange={handleProfileChange}
                  handleGenreChange={handleGenreChange}
                  handleProfileSubmit={handleProfileSubmit}
                />
              </TabsContent>
              
              <TabsContent value="security" className="mt-6">
                <PasswordForm />
              </TabsContent>
              
              <TabsContent value="preferences" className="mt-6">
                <PreferencesForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfilePage;
