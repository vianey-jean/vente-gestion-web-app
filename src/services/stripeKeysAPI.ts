/**
 * API pour la gestion sécurisée des clés Stripe
 */

import { apiClient } from './core/apiClient';

export interface StripeKeysStatus {
  hasSecretKey: boolean;
}

export const stripeKeysAPI = {
  /**
   * Sauvegarde la clé secrète Stripe (sera cryptée côté serveur)
   */
  saveSecretKey: async (secretKey: string): Promise<void> => {
    await apiClient.post('/stripe-keys/secret', { secretKey });
  },

  /**
   * Vérifie si une clé secrète est configurée
   */
  getStatus: async (): Promise<StripeKeysStatus> => {
    const response = await apiClient.get('/stripe-keys/status');
    return response.data;
  }
};
