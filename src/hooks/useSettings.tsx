
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsAPI } from '@/services/settingsAPI';
import { Settings, GeneralSettings, NotificationSettings } from '@/types/settings';

interface SettingsContextType {
  settings: Settings | null;
  generalSettings: GeneralSettings | null;
  notificationSettings: NotificationSettings | null;
  isLoading: boolean;
  refetchSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const { data: settings, isLoading, refetch } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      try {
        const response = await settingsAPI.getSettings();
        return response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        return null;
      }
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

  return (
    <SettingsContext.Provider
      value={{
        settings,
        generalSettings: settings?.general || null,
        notificationSettings: settings?.notifications || null,
        isLoading,
        refetchSettings: refetch,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
