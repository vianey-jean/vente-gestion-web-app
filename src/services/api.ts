import axios from 'axios';

const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL;

axios.defaults.baseURL = AUTH_BASE_URL;
axios.defaults.withCredentials = true;

// Intercepteur pour inclure le token CSRF dans les requêtes
axios.interceptors.request.use(config => {
  const csrfToken = localStorage.getItem('csrfToken');
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Définition des types
export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  telephone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  image: string;
  promotion: number | null;
  promotionEnd: string | null;
  stock: number;
  isSold: boolean;
  dateAjout?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
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

export interface Cart {
  userId: string;
  items: CartItem[];
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Favorite {
  userId: string;
  items: Product[];
}

export interface ContactMessage {
  id?: string;
  nom: string;
  email: string;
  telephone: string;
  message: string;
  createdAt?: string;
}

// Définition des API
export const authAPI = {
  login: (credentials: any) => axios.post('/api/auth/login', credentials),
  register: (userData: any) => axios.post('/api/auth/register', userData),
  logout: () => axios.post('/api/auth/logout'),
  getCsrfToken: () => axios.get('/api/auth/csrf-token'),
  getUser: () => axios.get('/api/auth/user'),
  updateUser: (userData: any) => axios.put('/api/auth/user', userData),
  updatePassword: (passwords: any) => axios.put('/api/auth/password', passwords),
  deleteAccount: () => axios.delete('/api/auth/user'),
};

export const usersAPI = {
  getAll: () => axios.get('/api/users'),
  getById: (id: string) => axios.get(`/api/users/${id}`),
  update: (id: string, data: any) => axios.put(`/api/users/${id}`, data),
  delete: (id: string) => axios.delete(`/api/users/${id}`),
  getPreferences: () => axios.get('/api/users/preferences'),
  updatePreferences: (data: any) => axios.post('/api/users/preferences', data),
};

export const productsAPI = {
  getAll: () => axios.get('/api/products'),
  getById: (id: string) => axios.get(`/api/products/${id}`),
  getByCategory: (categoryName: string) => axios.get(`/api/products/category/${categoryName}`),
  search: (q: string) => axios.get(`/api/products/search?q=${q}`),
  create: (productData: any, config: any) => axios.post('/api/products', productData, config),
  update: (id: string, productData: any, config: any) => axios.put(`/api/products/${id}`, productData, config),
  delete: (id: string) => axios.delete(`/api/products/${id}`),
  getMostFavorited: () => axios.get('/api/products/stats/most-favorited'),
  getNewArrivals: () => axios.get('/api/products/stats/new-arrivals'),
  getPromotions: () => axios.get('/api/products/stats/promotions'),
};

export const reviewsAPI = {
  get: (productId: string) => axios.get(`/api/reviews/${productId}`),
  create: (reviewData: any) => axios.post('/api/reviews', reviewData),
  update: (id: string, reviewData: any) => axios.put(`/api/reviews/${id}`, reviewData),
  delete: (id: string) => axios.delete(`/api/reviews/${id}`),
};

export const ordersAPI = {
  getAll: () => axios.get('/api/orders'),
  getUserOrders: () => axios.get('/api/orders/user'),
  getById: (id: string) => axios.get(`/api/orders/${id}`),
  create: (orderData: any) => axios.post('/api/orders', orderData),
  updateStatus: (id: string, status: string) => axios.put(`/api/orders/${id}/status`, { status }),
};

export const panierAPI = {
  get: (userId: string) => axios.get(`/api/panier/${userId}`),
  addItem: (userId: string, productId: string, quantity: number) => axios.post(`/api/panier/${userId}/add`, { productId, quantity }),
  removeItem: (userId: string, productId: string) => axios.post(`/api/panier/${userId}/remove`, { productId }),
  updateItem: (userId: string, productId: string, quantity: number) => axios.post(`/api/panier/${userId}/update`, { productId, quantity }),
  clear: (userId: string) => axios.post(`/api/panier/${userId}/clear`),
};

export const favoritesAPI = {
  get: (userId: string) => axios.get(`/api/favorites/${userId}`),
  addItem: (userId: string, productId: string) => axios.post(`/api/favorites/${userId}/add`, { productId }),
  removeItem: (userId: string, productId: string) => axios.post(`/api/favorites/${userId}/remove`, { productId }),
};

export const contactAPI = {
  create: (messageData: ContactMessage) => axios.post('/api/contacts', messageData),
  getAll: () => axios.get('/api/contacts'),
  getById: (id: string) => axios.get(`/api/contacts/${id}`),
  delete: (id: string) => axios.delete(`/api/contacts/${id}`),
};

export const adminChatAPI = {
  getConversations: () => axios.get('/api/admin-chat/conversations'),
  getConversation: (userId: string) => axios.get(`/api/admin-chat/conversations/${userId}`),
  sendMessage: (userId: string, message: string) => axios.post(`/api/admin-chat/conversations/${userId}/send`, { message }),
  markAsRead: (userId: string) => axios.post(`/api/admin-chat/conversations/${userId}/read`),
};

export const clientChatAPI = {
  sendMessage: (message: string) => axios.post('/api/client-chat/send', { message }),
  getMessages: () => axios.get('/api/client-chat/messages'),
  startCall: () => axios.post('/api/client-chat/call/start'),
  endCall: () => axios.post('/api/client-chat/call/end'),
  getCallStatus: () => axios.get('/api/client-chat/call/status'),
};

// API pour les codes promo
export const promoCodesAPI = {
  getAll: () => axios.get('/api/promo-codes'),
  verify: (code: string, productId: string) => axios.post('/api/promo-codes/verify', { code, productId }),
  create: (data: any) => axios.post('/api/promo-codes', data),
  update: (id: string, quantity: number) => axios.put(`/api/promo-codes/${id}`, { quantity }),
  delete: (id: string) => axios.delete(`/api/promo-codes/${id}`),
  use: (code: string, productId: string) => axios.post('/api/promo-codes/use', { code, productId })
};
