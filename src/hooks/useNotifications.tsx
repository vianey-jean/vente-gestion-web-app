
import { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const { notificationSettings } = useSettings();
  const { toast } = useToast();

  // Fonction pour demander la permission des notifications browser
  const requestNotificationPermission = async () => {
    if (notificationSettings?.pushNotifications?.browserNotifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return Notification.permission === 'granted';
    }
    return false;
  };

  // Fonction pour envoyer une notification browser
  const sendBrowserNotification = (title: string, options?: NotificationOptions) => {
    if (notificationSettings?.pushNotifications?.browserNotifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/images/Logo/Logo.png',
        badge: '/images/favicon.ico',
        ...options
      });
    }
  };

  // Fonction pour envoyer une notification toast
  const sendToastNotification = (title: string, description?: string, variant?: 'default' | 'destructive') => {
    toast({
      title,
      description,
      variant,
    });
  };

  // Fonction pour vérifier si les heures de silence sont actives
  const isQuietHours = () => {
    if (!notificationSettings?.quietHours?.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const startTime = notificationSettings.quietHours.startTime.split(':').map(Number);
    const endTime = notificationSettings.quietHours.endTime.split(':').map(Number);
    
    const startMinutes = startTime[0] * 60 + startTime[1];
    const endMinutes = endTime[0] * 60 + endTime[1];
    
    if (startMinutes <= endMinutes) {
      return currentTime >= startMinutes && currentTime <= endMinutes;
    } else {
      return currentTime >= startMinutes || currentTime <= endMinutes;
    }
  };

  // Fonction pour envoyer une notification en respectant les paramètres
  const sendNotification = (type: string, title: string, description?: string, options?: NotificationOptions) => {
    if (isQuietHours()) return;

    // Vérifier la fréquence des notifications
    const frequency = notificationSettings?.notificationFrequency || 'immediate';
    if (frequency !== 'immediate') {
      // Pour l'instant, on implémente seulement 'immediate'
      // Les autres fréquences nécessiteraient un système de queue
    }

    // Envoyer la notification toast
    sendToastNotification(title, description);

    // Envoyer la notification browser si activée
    if (notificationSettings?.pushNotifications?.browserNotifications) {
      sendBrowserNotification(title, { body: description, ...options });
    }
  };

  useEffect(() => {
    if (notificationSettings?.pushNotifications?.browserNotifications) {
      requestNotificationPermission();
    }
  }, [notificationSettings?.pushNotifications?.browserNotifications]);

  return {
    sendNotification,
    sendBrowserNotification,
    sendToastNotification,
    requestNotificationPermission,
    isQuietHours,
    notificationSettings
  };
};
