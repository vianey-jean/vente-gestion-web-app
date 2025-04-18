
import { User } from "../models/user";
import { Product } from "../models/product";
import { Sale } from "../models/sale";

// URL de base pour l'API (à remplacer par votre URL de serveur Node.js)
const API_BASE_URL = 'http://localhost:5000/api';

// Simulation des données pour le développement
const mockUsers: User[] = [
  {
    id: "user-1",
    email: "admin@example.com",
    password: "Admin123!",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    createdAt: new Date().toISOString()
  },
  {
    id: "user-2",
    email: "user@example.com",
    password: "User123!",
    firstName: "Normal",
    lastName: "User",
    role: "user",
    createdAt: new Date().toISOString()
  }
];

const mockProducts: Product[] = [
  {
    id: "product-1",
    name: "Ordinateur Portable",
    description: "Ordinateur portable haute performance",
    price: 1299.99,
    stock: 10,
    category: "Électronique",
    createdAt: new Date().toISOString()
  },
  {
    id: "product-2",
    name: "Smartphone",
    description: "Smartphone dernière génération",
    price: 899.99,
    stock: 15,
    category: "Électronique",
    createdAt: new Date().toISOString()
  },
  {
    id: "product-3",
    name: "Écran 4K",
    description: "Écran 4K pour une expérience visuelle optimale",
    price: 499.99,
    stock: 8,
    category: "Électronique",
    createdAt: new Date().toISOString()
  }
];

const mockSales: Sale[] = [
  {
    id: "sale-1",
    userId: "user-2",
    items: [
      {
        productId: "product-1",
        quantity: 1,
        unitPrice: 1299.99
      }
    ],
    totalAmount: 1299.99,
    status: "completed",
    createdAt: new Date().toISOString()
  }
];

// Service d'authentification
export const authService = {
  login: async (email: string, password: string): Promise<User | null> => {
    try {
      // Simulation d'un appel API pour le développement
      // À remplacer par un vrai appel API
      // const response = await fetch(`${API_BASE_URL}/auth/login`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      // return await response.json();
      
      // Simulation pour le développement
      await new Promise(resolve => setTimeout(resolve, 800));
      const user = mockUsers.find(u => u.email === email && u.password === password);
      return user || null;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return null;
    }
  },
  
  register: async (userData: Omit<User, 'id' | 'role' | 'createdAt'>): Promise<User | null> => {
    try {
      // Simulation d'un appel API pour le développement
      // À remplacer par un vrai appel API
      // const response = await fetch(`${API_BASE_URL}/auth/register`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(userData)
      // });
      // return await response.json();
      
      // Simulation pour le développement
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'user',
        createdAt: new Date().toISOString()
      };
      return newUser;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return null;
    }
  },
  
  authenticateByEmail: async (email: string): Promise<User | null> => {
    try {
      // Simulation d'un appel API pour le développement
      // À remplacer par un vrai appel API
      // const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      // return await response.json();
      
      // Simulation pour le développement
      await new Promise(resolve => setTimeout(resolve, 600));
      const user = mockUsers.find(u => u.email === email);
      return user || null;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error);
      return null;
    }
  },
  
  checkEmailExists: async (email: string): Promise<boolean> => {
    try {
      // Simulation d'un appel API pour le développement
      // À remplacer par un vrai appel API
      // const response = await fetch(`${API_BASE_URL}/auth/check-email`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      // const data = await response.json();
      // return data.exists;
      
      // Simulation pour le développement
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockUsers.some(u => u.email === email);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error);
      return false;
    }
  },
};

// Service des produits
export const productsService = {
  getProducts: async (): Promise<Product[]> => {
    try {
      // Simulation d'un appel API pour le développement
      // À remplacer par un vrai appel API
      // const response = await fetch(`${API_BASE_URL}/products`);
      // return await response.json();
      
      // Simulation pour le développement
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockProducts;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      return [];
    }
  },
  
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      // Simulation d'un appel API pour le développement
      // À remplacer par un vrai appel API
      // const response = await fetch(`${API_BASE_URL}/products/${id}`);
      // return await response.json();
      
      // Simulation pour le développement
      await new Promise(resolve => setTimeout(resolve, 400));
      const product = mockProducts.find(p => p.id === id);
      return product || null;
    } catch (error) {
      console.error(`Erreur lors de la récupération du produit ${id}:`, error);
      return null;
    }
  }
};

// Service des ventes
export const salesService = {
  getSales: async (): Promise<Sale[]> => {
    try {
      // Simulation d'un appel API pour le développement
      // À remplacer par un vrai appel API
      // const response = await fetch(`${API_BASE_URL}/sales`);
      // return await response.json();
      
      // Simulation pour le développement
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockSales;
    } catch (error) {
      console.error('Erreur lors de la récupération des ventes:', error);
      return [];
    }
  },
  
  createSale: async (saleData: Omit<Sale, 'id' | 'createdAt'>): Promise<Sale> => {
    try {
      // Simulation d'un appel API pour le développement
      // À remplacer par un vrai appel API
      // const response = await fetch(`${API_BASE_URL}/sales`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(saleData)
      // });
      // return await response.json();
      
      // Simulation pour le développement
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newSale: Sale = {
        id: `sale-${Date.now()}`,
        userId: saleData.userId,
        items: saleData.items,
        totalAmount: saleData.totalAmount,
        status: saleData.status,
        createdAt: new Date().toISOString()
      };
      return newSale;
    } catch (error) {
      console.error('Erreur lors de la création de la vente:', error);
      // Retourner une vente par défaut en cas d'erreur (à adapter selon vos besoins)
      return {
        id: `error-${Date.now()}`,
        userId: saleData.userId,
        items: saleData.items,
        totalAmount: saleData.totalAmount,
        status: 'cancelled',
        createdAt: new Date().toISOString()
      };
    }
  },
  
  getSalesByUserId: async (userId: string): Promise<Sale[]> => {
    try {
      // Simulation d'un appel API pour le développement
      // À remplacer par un vrai appel API
      // const response = await fetch(`${API_BASE_URL}/sales/user/${userId}`);
      // return await response.json();
      
      // Simulation pour le développement
      await new Promise(resolve => setTimeout(resolve, 600));
      return mockSales.filter(sale => sale.userId === userId);
    } catch (error) {
      console.error(`Erreur lors de la récupération des ventes pour l'utilisateur ${userId}:`, error);
      return [];
    }
  }
};

// Exemple de configurations pour une future intégration avec un serveur externe
export const apiConfig = {
  baseUrl: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  getAuthHeader: (token: string) => ({
    'Authorization': `Bearer ${token}`
  })
};
