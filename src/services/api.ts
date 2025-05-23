import axios from 'axios';

const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://ton-backend.com";

const axiosInstance = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to handle API errors
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  if (axios.isAxiosError(error)) {
    console.error('Axios Error Details:', error.response?.data || error.message);
  }
};

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product interface
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  images?: string[];
  category: string;
  stock?: number;
  promotion?: number;
  promotionEnd?: string;
  featured?: boolean;
  brand?: string;
  sku?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Category interface
export interface Category {
  id: string;
  name: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order interface
export interface Order {
  id: string;
  userId: string;
  products: OrderProduct[];
  total: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// OrderProduct interface
export interface OrderProduct {
  productId: string;
  quantity: number;
}

// Review interface
export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

// CodePromo interface
export interface CodePromo {
  id: string;
  code: string;
  pourcentage: number;
  quantite: number;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

// API functions
export const usersAPI = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/api/users');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/api/users/${id}`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  create: async (userData: User) => {
    try {
      const response = await axiosInstance.post('/api/users', userData);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  update: async (id: string, userData: User) => {
    try {
      const response = await axiosInstance.put(`/api/users/${id}`, userData);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/api/users/${id}`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

// Implement the Products API functions
export const productsAPI = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/api/products');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/api/products/${id}`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  create: async (productData: Product) => {
    try {
      const response = await axiosInstance.post('/api/products', productData);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  update: async (id: string, productData: Product) => {
    try {
      const response = await axiosInstance.put(`/api/products/${id}`, productData);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/api/products/${id}`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

// Implement the Categories API functions
export const categoriesAPI = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/api/categories');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/api/categories/${id}`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  create: async (categoryData: Category) => {
    try {
      const response = await axiosInstance.post('/api/categories', categoryData);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  update: async (id: string, categoryData: Category) => {
    try {
      const response = await axiosInstance.put(`/api/categories/${id}`, categoryData);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/api/categories/${id}`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

// Implement the Orders API functions
export const ordersAPI = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/api/orders');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/api/orders/${id}`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  create: async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await axiosInstance.post('/api/orders', orderData);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  update: async (id: string, orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      const response = await axiosInstance.put(`/api/orders/${id}`, orderData);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/api/orders/${id}`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

// Implement the Reviews API functions
export const reviewsAPI = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/api/reviews');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/api/reviews/${id}`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  create: async (reviewData: Review) => {
    try {
      const response = await axiosInstance.post('/api/reviews', reviewData);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  update: async (id: string, reviewData: Review) => {
    try {
      const response = await axiosInstance.put(`/api/reviews/${id}`, reviewData);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/api/reviews/${id}`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

// Implement the CodePromos API functions
export const codePromosAPI = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/api/code-promos');
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/api/code-promos/${id}`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  create: async (promoData: { pourcentage: number; quantite: number; productId: string }) => {
    try {
      const response = await axiosInstance.post('/api/code-promos', promoData);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  update: async (id: string, newQuantity: number) => {
    try {
      const response = await axiosInstance.put(`/api/code-promos/${id}`, { quantite: newQuantity });
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  delete: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/api/code-promos/${id}`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  searchProducts: async (searchTerm: string) => {
    try {
      const response = await axiosInstance.get(`/api/products/search?term=${encodeURIComponent(searchTerm)}`);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};
