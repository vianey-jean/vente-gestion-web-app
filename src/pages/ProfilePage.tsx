
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PersonalInfoForm from '@/components/profile/PersonalInfoForm';
import PasswordForm from '@/components/profile/PasswordForm';
import PreferencesForm from '@/components/profile/PreferencesForm';
import CookiePreferencesForm from '@/components/profile/CookiePreferencesForm';

const ProfilePage: React.FC = () => {
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
            <PersonalInfoForm />
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
