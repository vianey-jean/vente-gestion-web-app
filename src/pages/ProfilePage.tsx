
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PersonalInfoForm from '@/components/profile/PersonalInfoForm';
import PasswordForm from '@/components/profile/PasswordForm';
import PreferencesForm from '@/components/profile/PreferencesForm';
import CookiePreferencesForm from '@/components/profile/CookiePreferencesForm';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { UpdateProfileData } from '@/services/api';
import axios from 'axios';

type Genre = "homme" | "femme" | "autre" | "";

const ProfilePage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const [profileData, setProfileData] = useState<UpdateProfileData & { id?: string; genre?: Genre }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        id: user.id,
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        genre: (user.genre || '') as Genre,
        adresse: user.adresse || '',
        ville: user.ville || '',
        codePostal: user.codePostal || '',
        pays: user.pays || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenreChange = (value: string) => {
    setProfileData(prev => {
      // Ensure we're setting a valid genre value
      const validatedGenre = value === "homme" || value === "femme" || value === "autre" ? value : "";
      return { ...prev, genre: validatedGenre as Genre };
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserProfile({
        ...profileData,
        genre: profileData.genre === "" ? undefined : profileData.genre
      });
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>
        
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="personal">Informations personnelles</TabsTrigger>
            <TabsTrigger value="password">Mot de passe</TabsTrigger>
            <TabsTrigger value="preferences">Préférences</TabsTrigger>
            <TabsTrigger value="cookies">Cookies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal">
            <PersonalInfoForm 
              profileData={profileData}
              loading={loading}
              handleProfileChange={handleProfileChange}
              handleGenreChange={handleGenreChange}
              handleProfileSubmit={handleProfileSubmit}
            />
          </TabsContent>
          
          <TabsContent value="password">
            <PasswordForm />
          </TabsContent>
          
          <TabsContent value="preferences">
            <PreferencesForm />
          </TabsContent>
          
          <TabsContent value="cookies">
            <CookiePreferencesForm />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProfilePage;
