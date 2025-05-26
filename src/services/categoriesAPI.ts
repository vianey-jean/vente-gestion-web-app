
import { API } from './apiConfig';

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

export const categoriesAPI = {
  getAll: () => API.get<Category[]>('/categories'),
  create: (category: { name: string }) => API.post<Category>('/categories', category),
  update: (id: string, category: { name: string }) => API.put<Category>(`/categories/${id}`, category),
  delete: (id: string) => API.delete(`/categories/${id}`),
};
