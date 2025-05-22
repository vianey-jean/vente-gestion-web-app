
import { CookiePreferences } from "@/services/api";

/**
 * Gestionnaire de cookies qui fournit des méthodes pour gérer les préférences de cookies
 */
class CookieManager {
  /**
   * Vérifie si un consentement aux cookies a été donné
   */
  static hasConsent(): boolean {
    return localStorage.getItem('cookie-consent') !== null;
  }
  
  /**
   * Obtient le type de consentement donné: 'all', 'essential', 'custom', ou null si aucun
   */
  static getConsentType(): 'all' | 'essential' | 'custom' | null {
    return localStorage.getItem('cookie-consent') as 'all' | 'essential' | 'custom' | null;
  }
  
  /**
   * Obtient les préférences de cookies actuelles
   */
  static getPreferences(): CookiePreferences {
    const defaultPreferences: CookiePreferences = {
      essential: true,
      performance: true,
      functional: true,
      marketing: false
    };
    
    try {
      const storedPrefs = localStorage.getItem('cookie-preferences');
      if (storedPrefs) {
        const parsedPrefs = JSON.parse(storedPrefs);
        return {
          ...defaultPreferences,
          ...parsedPrefs
        };
      }
    } catch (error) {
      console.error("Erreur lors du chargement des préférences de cookies:", error);
    }
    
    return defaultPreferences;
  }
  
  /**
   * Vérifie si un type spécifique de cookie est autorisé
   */
  static isAllowed(type: keyof CookiePreferences): boolean {
    // Les cookies essentiels sont toujours autorisés
    if (type === 'essential') return true;
    
    // Si aucun consentement n'a été donné, rien n'est autorisé sauf les essentiels
    const consentType = this.getConsentType();
    if (!consentType) return false;
    
    // Si 'all' est le type de consentement, tout est autorisé
    if (consentType === 'all') return true;
    
    // Si 'essential', seuls les cookies essentiels sont autorisés
    if (consentType === 'essential') return type === 'essential';
    
    // Pour 'custom', vérifier les préférences spécifiques
    const preferences = this.getPreferences();
    return preferences[type] || false;
  }
  
  /**
   * Réinitialise les préférences de cookies (supprime le consentement)
   */
  static resetConsent(): void {
    localStorage.removeItem('cookie-consent');
    localStorage.removeItem('cookie-preferences');
  }
}

export default CookieManager;
