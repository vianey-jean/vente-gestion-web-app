
import axios, { AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { 
  Product, 
  Sale, 
  User, 
  LoginCredentials, 
  RegisterCredentials, 
  PretProduit, 
  PretFamille, 
  DepenseDuMois, 
  DepenseFixe, 
  Benefice, 
  PasswordResetRequest, 
  PasswordResetData 
} from '@/types';

// Configuration axios avec retry
axiosRetry(axios, { 
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 500;
  }
});

const API_BASE_URL = 'http://localhost:3001/api';

// Export axios instance as api
export const api = axios;

// Intercepteur pour ajouter le token aux requêtes
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Service
export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response: AxiosResponse<{ user: User; token: string }> = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    return response.data;
  },

  async register(data: RegisterCredentials): Promise<{ user: User; token: string }> {
    const response: AxiosResponse<{ user: User; token: string }> = await axios.post(`${API_BASE_URL}/auth/register`, data);
    return response.data;
  },

  async checkEmail(email: string): Promise<{ exists: boolean }> {
    const response: AxiosResponse<{ exists: boolean }> = await axios.post(`${API_BASE_URL}/auth/check-email`, { email });
    return response.data;
  },

  async resetPasswordRequest(data: PasswordResetRequest): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await axios.post(`${API_BASE_URL}/auth/reset-password-request`, data);
    return response.data;
  },

  async resetPassword(data: PasswordResetData): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await axios.post(`${API_BASE_URL}/auth/reset-password`, data);
    return response.data;
  }
};

// User Service
export const userService = {
  async getUserData(): Promise<User> {
    const response: AxiosResponse<User> = await axios.get(`${API_BASE_URL}/auth/me`);
    return response.data;
  }
};

// Product Service
export const productService = {
  async getProducts(): Promise<Product[]> {
    const response: AxiosResponse<Product[]> = await axios.get(`${API_BASE_URL}/products`);
    return response.data;
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const response: AxiosResponse<Product> = await axios.post(`${API_BASE_URL}/products`, product);
    return response.data;
  },

  async updateProduct(product: Product): Promise<Product> {
    const response: AxiosResponse<Product> = await axios.put(`${API_BASE_URL}/products/${product.id}`, product);
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/products/${id}`);
  }
};

// Sale Service
export const saleService = {
  async getSales(month?: number, year?: number): Promise<Sale[]> {
    let url = `${API_BASE_URL}/sales`;
    if (month && year) {
      url += `?month=${month}&year=${year}`;
    }
    const response: AxiosResponse<Sale[]> = await axios.get(url);
    return response.data;
  },

  async addSale(sale: Omit<Sale, 'id'>): Promise<Sale> {
    const response: AxiosResponse<Sale> = await axios.post(`${API_BASE_URL}/sales`, sale);
    return response.data;
  },

  async updateSale(sale: Sale): Promise<Sale> {
    const response: AxiosResponse<Sale> = await axios.put(`${API_BASE_URL}/sales/${sale.id}`, sale);
    return response.data;
  },

  async deleteSale(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/sales/${id}`);
  }
};

// Prêt Produits Service
export const pretProduitService = {
  async getPretProduits(): Promise<PretProduit[]> {
    const response: AxiosResponse<PretProduit[]> = await axios.get(`${API_BASE_URL}/pretproduits`);
    return response.data;
  },

  async addPretProduit(pret: Omit<PretProduit, 'id'>): Promise<PretProduit> {
    const response: AxiosResponse<PretProduit> = await axios.post(`${API_BASE_URL}/pretproduits`, pret);
    return response.data;
  },

  async updatePretProduit(pret: PretProduit): Promise<PretProduit> {
    const response: AxiosResponse<PretProduit> = await axios.put(`${API_BASE_URL}/pretproduits/${pret.id}`, pret);
    return response.data;
  },

  async deletePretProduit(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/pretproduits/${id}`);
  }
};

// Prêt Familles Service
export const pretFamilleService = {
  async getPretFamilles(): Promise<PretFamille[]> {
    const response: AxiosResponse<PretFamille[]> = await axios.get(`${API_BASE_URL}/pretfamilles`);
    return response.data;
  },

  async addPretFamille(pret: Omit<PretFamille, 'id'>): Promise<PretFamille> {
    const response: AxiosResponse<PretFamille> = await axios.post(`${API_BASE_URL}/pretfamilles`, pret);
    return response.data;
  },

  async updatePretFamille(id: string, pret: Partial<PretFamille>): Promise<PretFamille> {
    const response: AxiosResponse<PretFamille> = await axios.put(`${API_BASE_URL}/pretfamilles/${id}`, pret);
    return response.data;
  },

  async deletePretFamille(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/pretfamilles/${id}`);
  },

  async searchByName(query: string): Promise<PretFamille[]> {
    const response: AxiosResponse<PretFamille[]> = await axios.get(`${API_BASE_URL}/pretfamilles/search/nom?q=${query}`);
    return response.data;
  }
};

// Dépenses Service
export const depenseService = {
  async getMouvements(): Promise<DepenseDuMois[]> {
    const response: AxiosResponse<DepenseDuMois[]> = await axios.get(`${API_BASE_URL}/depenses`);
    return response.data;
  },

  async addMouvement(mouvement: Omit<DepenseDuMois, 'id'>): Promise<DepenseDuMois> {
    const response: AxiosResponse<DepenseDuMois> = await axios.post(`${API_BASE_URL}/depenses`, mouvement);
    return response.data;
  },

  async updateMouvement(id: string, mouvement: Partial<DepenseDuMois>): Promise<DepenseDuMois> {
    const response: AxiosResponse<DepenseDuMois> = await axios.put(`${API_BASE_URL}/depenses/${id}`, mouvement);
    return response.data;
  },

  async deleteMouvement(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/depenses/${id}`);
  },

  async getDepensesFixe(): Promise<DepenseFixe> {
    const response: AxiosResponse<DepenseFixe> = await axios.get(`${API_BASE_URL}/depenses/fixe`);
    return response.data;
  },

  async updateDepensesFixe(depenses: DepenseFixe): Promise<DepenseFixe> {
    const response: AxiosResponse<DepenseFixe> = await axios.put(`${API_BASE_URL}/depenses/fixe`, depenses);
    return response.data;
  },

  async resetMouvements(): Promise<void> {
    await axios.delete(`${API_BASE_URL}/depenses/reset`);
  }
};

// Bénéfices Service
export const beneficeService = {
  async getBenefices(): Promise<Benefice[]> {
    const response: AxiosResponse<Benefice[]> = await axios.get(`${API_BASE_URL}/benefices`);
    return response.data;
  }
};

// Export salesService as an alias for saleService for backward compatibility
export const salesService = saleService;
