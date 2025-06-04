
import { API } from './apiConfig';
import { Remboursement, RemboursementFormData } from '@/types/remboursement';
import notificationsService from './notificationsService';

export const remboursementsAPI = {
  getAll: async (): Promise<Remboursement[]> => {
    const response = await API.get('/remboursements');
    return response.data;
  },

  getById: async (id: string): Promise<Remboursement> => {
    const response = await API.get(`/remboursements/${id}`);
    return response.data;
  },

  create: async (formData: FormData): Promise<Remboursement> => {
    const response = await API.post('/remboursements', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Envoyer notification admin pour nouvelle demande de remboursement
    const refund = response.data;
    if (refund) {
      notificationsService.notifyRefundRequest(
        refund.orderId || 'N/A',
        refund.amount || 0
      );
    }

    return response.data;
  },

  updateStatus: async (id: string, status: string, adminComment?: string): Promise<Remboursement> => {
    const response = await API.put(`/remboursements/${id}/status`, {
      status,
      adminComment,
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await API.delete(`/remboursements/${id}`);
  },
};
