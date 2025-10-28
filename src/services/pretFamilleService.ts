import axios, { AxiosResponse } from 'axios';
import { PretFamille } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const pretFamilleService = {
  async getAll(): Promise<PretFamille[]> {
    const response: AxiosResponse<PretFamille[]> = await api.get('/api/pretfamilles');
    return response.data;
  },

  async getById(id: string): Promise<PretFamille> {
    const response: AxiosResponse<PretFamille> = await api.get(`/api/pretfamilles/${id}`);
    return response.data;
  },

  async create(pretFamille: Omit<PretFamille, 'id'>): Promise<PretFamille> {
    const response: AxiosResponse<PretFamille> = await api.post('/api/pretfamilles', pretFamille);
    return response.data;
  },

  async update(id: string, pretFamille: Partial<PretFamille>): Promise<PretFamille> {
    const response: AxiosResponse<PretFamille> = await api.put(`/api/pretfamilles/${id}`, pretFamille);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/pretfamilles/${id}`);
  },

  async searchByName(name: string): Promise<PretFamille[]> {
    const response: AxiosResponse<PretFamille[]> = await api.get(`/api/pretfamilles/search/nom?q=${encodeURIComponent(name)}`);
    return response.data;
  },
};
