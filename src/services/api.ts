import axios from 'axios';

const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
  withCredentials: true,
});

// Interceptor pour gérer les erreurs d'authentification
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Rediriger vers la page de connexion
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Définition des types pour les données
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  image?: string;
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
  isSold: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string | null;
  subtotal: number;
}

export interface ShippingAddress {
  nom: string;
  prenom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  telephone: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  originalAmount?: number;
  discount?: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  codePromoUsed?: {
    code: string;
    productId: string;
    pourcentage: number;
    discountAmount: number;
  } | null;
  status: 'confirmée' | 'en préparation' | 'en livraison' | 'livrée';
  createdAt: string;
  updatedAt: string;
}

// Définition des services API
export const productsAPI = {
  getAll: async () => await authApi.get('/products'),
  getOne: async (id: string) => await authApi.get(`/products/${id}`),
  create: async (product: Product) => await authApi.post('/products', product),
  update: async (id: string, product: Product) => await authApi.put(`/products/${id}`, product),
  remove: async (id: string) => await authApi.delete(`/products/${id}`),
};

export const categoriesAPI = {
  getAll: async () => await authApi.get('/categories'),
  getOne: async (id: string) => await authApi.get(`/categories/${id}`),
  create: async (category: Category) => await authApi.post('/categories', category),
  update: async (id: string, category: Category) => await authApi.put(`/categories/${id}`, category),
  remove: async (id: string) => await authApi.delete(`/categories/${id}`),
};

export const usersAPI = {
  getAll: async () => await authApi.get('/users'),
  getOne: async (id: string) => await authApi.get(`/users/${id}`),
  update: async (id: string, user: User) => await authApi.put(`/users/${id}`, user),
  remove: async (id: string) => await authApi.delete(`/users/${id}`),
};

export const ordersAPI = {
  getAll: async () => await authApi.get('/orders'),
  getUserOrders: async () => await authApi.get('/orders/user'),
  getOne: async (id: string) => await authApi.get(`/orders/${id}`),
  create: async (order: Order) => await authApi.post('/orders', order),
  cancelOrder: async (orderId: string, itemsToCancel: string[]) =>
    await authApi.post(`/orders/${orderId}/cancel`, { itemsToCancel }),
  updateStatus: async (orderId: string, status: string) =>
    await authApi.put(`/orders/${orderId}/status`, { status }),
};

export const authAPI = {
  login: async (credentials: any) => await authApi.post('/auth/login', credentials),
  register: async (userData: any) => await authApi.post('/auth/register', userData),
  logout: async () => await authApi.post('/auth/logout'),
  getUser: async () => await authApi.get('/auth/user'),
};
