
import usersData from '../db/users.json';
import productsData from '../db/products.json';
import salesData from '../db/sales.json';
import { User } from '../models/user';
import { Product } from '../models/product';
import { Sale } from '../models/sale';

// Simule un délai de réseau
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Service d'authentification
export const authService = {
  // Vérifier si un email existe
  checkEmailExists: async (email: string): Promise<boolean> => {
    await delay(500); // Simule un délai réseau
    return usersData.some(user => user.email.toLowerCase() === email.toLowerCase());
  },
  
  // Authentification par email
  authenticateByEmail: async (email: string): Promise<User | null> => {
    await delay(700);
    const user = usersData.find(user => user.email.toLowerCase() === email.toLowerCase());
    return user || null;
  },
  
  // Authentification complète
  login: async (email: string, password: string): Promise<User | null> => {
    await delay(1000);
    const user = usersData.find(
      user => 
        user.email.toLowerCase() === email.toLowerCase() && 
        user.password === password
    );
    return user || null;
  },
  
  // Inscription d'un nouvel utilisateur
  register: async (userData: Omit<User, 'id' | 'role' | 'createdAt'>): Promise<User> => {
    await delay(1200);
    // Dans une véritable application, nous enregistrerions l'utilisateur dans la base de données
    const newUser: User = {
      id: `${usersData.length + 1}`,
      ...userData,
      role: 'user',
      createdAt: new Date().toISOString()
    };
    return newUser;
  }
};

// Service des produits
export const productService = {
  getAll: async (): Promise<Product[]> => {
    await delay(800);
    return productsData;
  },
  
  getById: async (id: string): Promise<Product | null> => {
    await delay(500);
    const product = productsData.find(product => product.id === id);
    return product || null;
  }
};

// Service des ventes
export const saleService = {
  getAll: async (): Promise<Sale[]> => {
    await delay(800);
    return salesData;
  },
  
  getById: async (id: string): Promise<Sale | null> => {
    await delay(500);
    const sale = salesData.find(sale => sale.id === id);
    return sale || null;
  },
  
  getUserSales: async (userId: string): Promise<Sale[]> => {
    await delay(700);
    return salesData.filter(sale => sale.userId === userId);
  }
};
