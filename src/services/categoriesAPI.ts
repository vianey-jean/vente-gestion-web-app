
import { API } from './apiConfig';

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export const categoriesAPI = {
  getAll: () => API.get<Category[]>('/categories'),
  create: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => 
    API.post<Category>('/categories', category),
  update: (id: string, category: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => 
    API.put<Category>(`/categories/${id}`, category),
  delete: (id: string) => API.delete(`/categories/${id}`),
};
