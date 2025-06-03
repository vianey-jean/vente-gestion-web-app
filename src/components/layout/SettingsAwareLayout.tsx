
import React from 'react';
import { useSettings } from '@/hooks/useSettings';
import Layout from './Layout';
import MaintenancePage from '@/components/maintenance/MaintenancePage';
import DynamicSEO from '@/components/seo/DynamicSEO';
import { Skeleton } from '@/components/ui/skeleton';

interface SettingsAwareLayoutProps {
  children: React.ReactNode;
  hidePrompts?: boolean;
}

const SettingsAwareLayout: React.FC<SettingsAwareLayoutProps> = ({ children, hidePrompts = false }) => {
  const { generalSettings, isLoading } = useSettings();

  // Afficher un loader pendant le chargement des paramètres
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="container mx-auto px-4 py-10">
          <div className="space-y-8 max-w-5xl mx-auto">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-52 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si le mode maintenance est activé, afficher seulement la page de maintenance
  if (generalSettings?.maintenanceMode) {
    return (
      <>
        <DynamicSEO />
        <MaintenancePage />
      </>
    );
  }

  // Affichage normal du site avec les paramètres appliqués
  return (
    <>
      <DynamicSEO />
      <Layout hidePrompts={hidePrompts}>
        {children}
      </Layout>
    </>
  );
};

export default SettingsAwareLayout;
