
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

export interface User {
  id: string;
  nom: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileData {
  nom?: string;
  email?: string;
  telephone?: string;
  adresse?: {
    rue?: string;
    ville?: string;
    codePostal?: string;
    pays?: string;
  };
}

export interface ReviewFormData {
  productId: string;
  userId: string;
  title: string;
  content: string;
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
  productRating: number;
  deliveryRating: number;
  photos?: string[];
  createdAt: string;
  updatedAt?: string;
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

// Export default API instance
export default api;
