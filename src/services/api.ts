
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
  promotion?: number;
  promotionEnd?: string;
  dateAjout?: string;
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
  adresse?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  telephone?: string;
}

export interface UpdateProfileData {
  nom?: string;
  prenom?: string;
  email?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  telephone?: string;
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

export interface Cart {
  id: string;
  userId: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  productRating: number;
  deliveryRating: number;
  comment: string;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewFormData {
  productRating: number;
  deliveryRating: number;
  comment: string;
  photos?: File[];
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  isAdmin: boolean;
}

export interface CodePromo {
  id: string;
  code: string;
  productId: string;
  pourcentage: number;
  dateExpiration: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Définition des services API
export const productsAPI = {
  getAll: async () => await authApi.get('/products'),
  getOne: async (id: string) => await authApi.get(`/products/${id}`),
  getById: async (id: string) => await authApi.get(`/products/${id}`),
  getByCategory: async (categoryId: string) => await authApi.get(`/products/category/${categoryId}`),
  getMostFavorited: async () => await authApi.get('/products/most-favorited'),
  search: async (query: string) => await authApi.get(`/products/search?q=${query}`),
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
  verifyToken: async () => await authApi.get('/auth/verify'),
  forgotPassword: async (email: string) => await authApi.post('/auth/forgot-password', { email }),
  resetPassword: async (token: string, password: string) => await authApi.post('/auth/reset-password', { token, password }),
  updateProfile: async (data: UpdateProfileData) => await authApi.put('/auth/profile', data),
  updatePassword: async (currentPassword: string, newPassword: string) => await authApi.put('/auth/password', { currentPassword, newPassword }),
  verifyPassword: async (password: string) => await authApi.post('/auth/verify-password', { password }),
};

export const panierAPI = {
  getCart: async () => await authApi.get('/panier'),
  addToCart: async (productId: string, quantity: number) => await authApi.post('/panier', { productId, quantity }),
  updateQuantity: async (productId: string, quantity: number) => await authApi.put('/panier', { productId, quantity }),
  removeFromCart: async (productId: string) => await authApi.delete(`/panier/${productId}`),
  clearCart: async () => await authApi.delete('/panier'),
};

export const favoritesAPI = {
  getFavorites: async () => await authApi.get('/favorites'),
  addToFavorites: async (productId: string) => await authApi.post('/favorites', { productId }),
  removeFromFavorites: async (productId: string) => await authApi.delete(`/favorites/${productId}`),
};

export const reviewsAPI = {
  getProductReviews: async (productId: string) => await authApi.get(`/reviews/product/${productId}`),
  getUserReviews: async () => await authApi.get('/reviews/user'),
  createReview: async (productId: string, reviewData: ReviewFormData) => {
    const formData = new FormData();
    formData.append('productRating', reviewData.productRating.toString());
    formData.append('deliveryRating', reviewData.deliveryRating.toString());
    formData.append('comment', reviewData.comment);
    
    if (reviewData.photos) {
      reviewData.photos.forEach((photo, index) => {
        formData.append(`photos`, photo);
      });
    }
    
    return await authApi.post(`/reviews/product/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateReview: async (reviewId: string, reviewData: ReviewFormData) => await authApi.put(`/reviews/${reviewId}`, reviewData),
  deleteReview: async (reviewId: string) => await authApi.delete(`/reviews/${reviewId}`),
};

export const clientChatAPI = {
  getMessages: async () => await authApi.get('/client-chat'),
  sendMessage: async (message: string) => await authApi.post('/client-chat', { message }),
  markAsRead: async () => await authApi.put('/client-chat/read'),
};

export const codePromosAPI = {
  getAll: async () => await authApi.get('/code-promos'),
  getByCode: async (code: string) => await authApi.get(`/code-promos/code/${code}`),
  validateCode: async (code: string, productId: string) => await authApi.post('/code-promos/validate', { code, productId }),
  create: async (codePromo: CodePromo) => await authApi.post('/code-promos', codePromo),
  update: async (id: string, codePromo: CodePromo) => await authApi.put(`/code-promos/${id}`, codePromo),
  remove: async (id: string) => await authApi.delete(`/code-promos/${id}`),
};

// Default export for compatibility
const api = {
  productsAPI,
  categoriesAPI,
  usersAPI,
  ordersAPI,
  authAPI,
  panierAPI,
  favoritesAPI,
  reviewsAPI,
  clientChatAPI,
  codePromosAPI,
};

export default api;
