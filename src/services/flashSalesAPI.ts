
import { API } from './apiConfig';

export interface FlashSale {
  id: string;
  title: string;
  discount: number;
  productIds: string[];
  startTime: string;
  endTime: string;
  isActive: boolean;
  totalItems: number;
  itemsSold: number;
  createdAt: string;
}

export const flashSalesAPI = {
  getActive: () => API.get<FlashSale | null>('/flash-sales/active'),
  getAll: () => API.get<FlashSale[]>('/flash-sales'),
  create: (flashSale: {
    title: string;
    discount: number;
    productIds: string[];
    durationHours: number;
  }) => API.post<FlashSale>('/flash-sales', flashSale),
  deactivate: (id: string) => API.put<FlashSale>(`/flash-sales/${id}/deactivate`, {}),
  delete: (id: string) => API.delete(`/flash-sales/${id}`),
};
