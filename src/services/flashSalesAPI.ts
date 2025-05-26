
import { API } from './apiConfig';

export interface FlashSale {
  id: string;
  title: string;
  discount: number;
  startTime: string;
  endTime: string;
  productIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const flashSalesAPI = {
  getAll: () => API.get<FlashSale[]>('/flash-sales'),
  getActive: () => API.get<FlashSale | null>('/flash-sales/active'),
  create: (flashSale: Omit<FlashSale, 'id' | 'createdAt' | 'updatedAt'>) => 
    API.post<FlashSale>('/flash-sales', flashSale),
  update: (id: string, flashSale: Partial<Omit<FlashSale, 'id' | 'createdAt' | 'updatedAt'>>) => 
    API.put<FlashSale>(`/flash-sales/${id}`, flashSale),
  delete: (id: string) => API.delete(`/flash-sales/${id}`),
};
