import axios, { AxiosResponse } from 'axios';
import { PretProduit } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const pretProduitService = {
  async getAll(): Promise<PretProduit[]> {
    const response: AxiosResponse<PretProduit[]> = await api.get('/api/pretproduits');
    return response.data;
  },

  async getById(id: string): Promise<PretProduit> {
    const response: AxiosResponse<PretProduit> = await api.get(`/api/pretproduits/${id}`);
    return response.data;
  },

  async create(pretProduit: Omit<PretProduit, 'id'>): Promise<PretProduit> {
    const response: AxiosResponse<PretProduit> = await api.post('/api/pretproduits', pretProduit);
    return response.data;
  },

  async update(id: string, pretProduit: Partial<PretProduit>): Promise<PretProduit> {
    const response: AxiosResponse<PretProduit> = await api.put(`/api/pretproduits/${id}`, pretProduit);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/pretproduits/${id}`);
  },

  async searchByClient(client: string): Promise<PretProduit[]> {
    const response: AxiosResponse<PretProduit[]> = await api.get(`/api/pretproduits/search/client?q=${encodeURIComponent(client)}`);
    return response.data;
  },
};
