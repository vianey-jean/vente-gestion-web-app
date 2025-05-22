
import axios from 'axios';

// Base URL for API requests
const API_URL = 'http://localhost:5000/api';

// Configure axios with default headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// User types
export interface User {
  id: string;
  nom: string;
  email: string;
  role: string;
  prenom?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  genre?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileData {
  nom?: string;
  email?: string;
  telephone?: string;
  prenom?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  genre?: string;
}

// Review types
export interface ReviewFormData {
  productId: string;
  userId: string;
  title: string;
  content: string;
  comment?: string;
  productRating: number;
  deliveryRating: number;
  photos?: File[];
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  comment?: string;
  productRating: number;
  deliveryRating: number;
  photos?: string[];
  createdAt: string;
  updatedAt?: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  category: string;
  stock?: number;
  isActive?: boolean;
  isSold?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  promotion?: string | null;
  promotionEnd?: string | null;
}

// Cart types
export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
}

// Order types
export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  subtotal: number;
}

export interface ShippingAddress {
  nom: string;
  prenom?: string;
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  telephone?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt?: string;
}

// Message types
export interface Message {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
  read: boolean;
  sender: 'user' | 'admin';
}

export interface ServiceConversation {
  id: string;
  userId: string;
  userName: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
}

// Auth API methods
export const authAPI = {
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  
  register: (userData: { nom: string; email: string; password: string }) => 
    api.post('/auth/register', userData),
  
  forgotPassword: (email: string) => 
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (data: { email: string; passwordUnique: string; newPassword: string }) => 
    api.post('/auth/reset-password', data),
  
  updateProfile: (userId: string, data: UpdateProfileData) => 
    api.put(`/users/${userId}/profile`, data),
  
  updatePassword: (userId: string, currentPassword: string, newPassword: string) => 
    api.put(`/users/${userId}/password`, { currentPassword, newPassword }),
  
  verifyToken: () => 
    api.get('/auth/verify-token'),
  
  checkEmail: (email: string) => 
    api.post('/auth/check-email', { email }),
  
  verifyPassword: (userId: string, password: string) => 
    api.post(`/auth/verify-password/${userId}`, { password }),
  
  deleteAccount: () => 
    api.delete('/auth/delete-account'),
};

// Reviews API
export const reviewsAPI = {
  get: (productId: string) => 
    api.get(`/reviews/product/${productId}`),
  
  create: (reviewData: any) => 
    api.post('/reviews', reviewData),
  
  update: (id: string, reviewData: any) => 
    api.put(`/reviews/${id}`, reviewData),
  
  delete: (id: string) => 
    api.delete(`/reviews/${id}`),
  
  getProductReviews: (productId: string) => 
    api.get(`/reviews/product/${productId}`),
  
  getReviewDetail: (reviewId: string) => 
    api.get(`/reviews/${reviewId}`),
  
  addReview: (reviewData: FormData) => 
    api.post('/reviews', reviewData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

// Products API
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id: string) => api.get(`/products/${id}`),
  getByCategory: (category: string) => api.get(`/products/category/${category}`),
  create: (productData: FormData) => api.post('/products', productData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  update: (id: string, productData: any) => api.put(`/products/${id}`, productData),
  delete: (id: string) => api.delete(`/products/${id}`),
  search: (query: string) => api.get(`/products/search?q=${query}`),
  getFeatured: () => api.get('/products/featured'),
  getPromo: () => api.get('/products/promotions'),
};

// Panier (Cart) API
export const panierAPI = {
  get: (userId: string) => api.get(`/panier/${userId}`),
  addItem: (userId: string, productId: string, quantity: number = 1) => 
    api.post(`/panier/${userId}/items`, { productId, quantity }),
  updateItem: (userId: string, productId: string, quantity: number) => 
    api.put(`/panier/${userId}/items/${productId}`, { quantity }),
  removeItem: (userId: string, productId: string) => 
    api.delete(`/panier/${userId}/items/${productId}`),
  clear: (userId: string) => api.delete(`/panier/${userId}/clear`),
};

// Favorites API
export const favoritesAPI = {
  get: (userId: string) => api.get(`/favorites/${userId}`),
  addItem: (userId: string, productId: string) => 
    api.post(`/favorites/${userId}/items`, { productId }),
  removeItem: (userId: string, productId: string) => 
    api.delete(`/favorites/${userId}/items/${productId}`),
  clear: (userId: string) => api.delete(`/favorites/${userId}/clear`),
};

// Orders API
export const ordersAPI = {
  getUserOrders: () => api.get('/orders'),
  getOrder: (id: string) => api.get(`/orders/${id}`),
  create: (orderData: any) => api.post('/orders', orderData),
  updateStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }),
  getAllOrders: () => api.get('/orders/all'),  // Admin route
};

// Promo Code API
export const promoCodeAPI = {
  verify: (code: string, productIds: string[]) => 
    api.post('/promo-codes/verify', { code, productIds }),
  list: () => api.get('/promo-codes'),
  create: (promoData: any) => api.post('/promo-codes', promoData),
  update: (id: string, promoData: any) => api.put(`/promo-codes/${id}`, promoData),
  delete: (id: string) => api.delete(`/promo-codes/${id}`),
  searchProducts: (query: string) => api.get(`/products/search?q=${query}`),
};

// Chat APIs
export const clientChatAPI = {
  getMessages: (userId: string) => api.get(`/client-chat/${userId}`),
  sendMessage: (userId: string, text: string) => 
    api.post(`/client-chat/${userId}`, { text }),
  markRead: (userId: string) => api.put(`/client-chat/${userId}/read`),
};

export const adminChatAPI = {
  getConversations: () => api.get('/admin-chat/conversations'),
  getMessages: (userId: string) => api.get(`/admin-chat/${userId}`),
  sendMessage: (userId: string, text: string) => 
    api.post(`/admin-chat/${userId}`, { text }),
  markRead: (userId: string) => api.put(`/admin-chat/${userId}/read`),
};

// Export default API instance
export default api;
