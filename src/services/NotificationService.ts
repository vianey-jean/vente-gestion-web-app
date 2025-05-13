
import { toast } from "sonner";

// Types d'alertes supportés
type ToastType = "success" | "error" | "info" | "warning";

// Interface pour les options de notification
interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: React.ReactNode;
  position?: "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left";
}

// Service pour gérer les notifications
class NotificationService {
  // Notification de succès
  success(message: string, options?: NotificationOptions) {
    return this._showToast("success", message, options);
  }

  // Notification d'erreur
  error(message: string, options?: NotificationOptions) {
    return this._showToast("error", message, options);
  }

  // Notification d'information
  info(message: string, options?: NotificationOptions) {
    return this._showToast("info", message, options);
  }

  // Notification d'avertissement
  warning(message: string, options?: NotificationOptions) {
    return this._showToast("warning", message, options);
  }

  // Méthode privée pour afficher une toast avec le type spécifié
  private _showToast(type: ToastType, message: string, options?: NotificationOptions) {
    const { title, description, duration = 5000, action, position = "top-right" } = options || {};

    const toastConfig = {
      description: description || message,
      duration,
      position,
      action
    };

    switch (type) {
      case "success":
        return toast.success(title || "Succès", toastConfig);
      case "error":
        return toast.error(title || "Erreur", toastConfig);
      case "info":
        return toast.info(title || "Information", toastConfig);
      case "warning":
        return toast.warning(title || "Attention", toastConfig);
    }
  }

  // Notification personnalisée avec promise
  async promise<T>(
    promiseFn: () => Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    toastOptions?: NotificationOptions
  ) {
    const { loading, success, error } = options;
    const { duration = 5000, position = "top-right" } = toastOptions || {};

    return toast.promise(promiseFn, {
      loading,
      success: (data) => typeof success === "function" ? success(data) : success,
      error: (err) => typeof error === "function" ? error(err) : error,
      duration,
      position
    });
  }

  // Méthode pour fermer une notification spécifique
  dismiss(toastId: string | number) {
    toast.dismiss(toastId);
  }

  // Méthode pour fermer toutes les notifications
  dismissAll() {
    toast.dismiss();
  }
}

// Exportation d'une instance unique du service
export const notificationService = new NotificationService();
