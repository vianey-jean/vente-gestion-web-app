import api from '@/service/api';

export interface Appointment {
  id: string;
  titre: string;
  description: string;
  date: string;
  heure: string;
  location: string;
  type: string;
  status: 'planned' | 'completed' | 'cancelled';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateAppointmentData = Omit<Appointment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
export type UpdateAppointmentData = Partial<Omit<Appointment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

export const appointmentService = {
  // Récupérer tous les rendez-vous de l'utilisateur
  getAll: async (): Promise<Appointment[]> => {
    const response = await api.get('/appointments');
    return response.data;
  },

  // Récupérer un rendez-vous par ID
  getById: async (id: string): Promise<Appointment> => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Récupérer les rendez-vous dans une plage de dates
  getByDateRange: async (startDate: string, endDate: string): Promise<Appointment[]> => {
    const response = await api.get(`/appointments/range/${startDate}/${endDate}`);
    return response.data;
  },

  // Créer un nouveau rendez-vous
  create: async (appointmentData: CreateAppointmentData): Promise<Appointment> => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  // Mettre à jour un rendez-vous
  update: async (id: string, appointmentData: UpdateAppointmentData): Promise<Appointment> => {
    const response = await api.put(`/appointments/${id}`, appointmentData);
    return response.data;
  },

  // Supprimer un rendez-vous
  delete: async (id: string): Promise<void> => {
    await api.delete(`/appointments/${id}`);
  },

  // Rechercher des rendez-vous
  search: async (query: string): Promise<Appointment[]> => {
    const response = await api.get(`/appointments/search/${encodeURIComponent(query)}`);
    return response.data;
  }
};
