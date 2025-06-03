
import { API } from './apiConfig';
import { Settings, GeneralSettings, NotificationSettings } from '@/types/settings';

export const settingsAPI = {
  getSettings: () => API.get<Settings>('/settings'),
  updateGeneralSettings: (settings: Partial<GeneralSettings>) => 
    API.put<GeneralSettings>('/settings/general', settings),
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => 
    API.put<NotificationSettings>('/settings/notifications', settings),
  resetToDefaults: () => API.post('/settings/reset'),
};
