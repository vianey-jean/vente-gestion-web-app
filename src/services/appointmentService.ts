
import api from './api';

export interface Appointment {
  id: string;
  titre: string;
  date: string;
  heure: string;
  duree: number;
  description: string;
  client: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export const appointmentService = {
  // Récupérer tous les rendez-vous
  getAppointments: async (): Promise<Appointment[]> => {
    try {
      const response = await api.get('/appointments');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
      throw error;
    }
  },

  // Récupérer les rendez-vous par semaine
  getAppointmentsByWeek: async (startDate: string, endDate: string): Promise<Appointment[]> => {
    try {
      const response = await api.get(`/appointments/week?start=${startDate}&end=${endDate}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous de la semaine:', error);
      throw error;
    }
  },

  // Créer un nouveau rendez-vous
  createAppointment: async (appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      throw error;
    }
  },

  // Mettre à jour un rendez-vous
  updateAppointment: async (id: string, appointmentData: Partial<Appointment>): Promise<Appointment> => {
    try {
      const response = await api.put(`/appointments/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rendez-vous:', error);
      throw error;
    }
  },

  // Supprimer un rendez-vous
  deleteAppointment: async (id: string): Promise<void> => {
    try {
      await api.delete(`/appointments/${id}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du rendez-vous:', error);
      throw error;
    }
  },

  // Rechercher des rendez-vous
  searchAppointments: async (query: string): Promise<Appointment[]> => {
    try {
      const response = await api.get(`/appointments/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche de rendez-vous:', error);
      throw error;
    }
  }
};
