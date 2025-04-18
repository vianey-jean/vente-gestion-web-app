import { User } from "../models/user";
import { Product } from "../models/product";
import { Sale } from "../models/sale";
import Products from "../db/products.json";
import Users from "../db/users.json";
import Sales from "../db/sales.json";

// Simulate API services
export const authService = {
  login: async (email: string, password: string): Promise<User | null> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users: User[] = Users;
    const user = users.find(u => u.email === email && u.password === password);
    
    return user || null;
  },
  
  register: async (userData: Omit<User, 'id' | 'role' | 'createdAt'>): Promise<User | null> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'user' as const,
      createdAt: new Date().toISOString()
    };
    
    // In a real app, this would be saved to a database
    // For this mock, we just return the newly created user
    return newUser;
  },
  
  authenticateByEmail: async (email: string): Promise<User | null> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const users: User[] = Users;
    const user = users.find(u => u.email === email);
    
    return user || null;
  },
  
  checkEmailExists: async (email: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users: User[] = Users;
    const exists = users.some(u => u.email === email);
    
    return exists;
  },
};

export const productsService = {
  getProducts: async (): Promise<Product[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return Products;
  },
  
  getProductById: async (id: string): Promise<Product | null> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const product = Products.find(p => p.id === id);
    return product || null;
  }
};

export const salesService = {
  getSales: async (): Promise<Sale[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const sales = Sales.map(sale => ({
      ...sale,
      status: sale.status as 'pending' | 'completed' | 'cancelled'
    }));
    
    return sales;
  },
  
  createSale: async (saleData: Omit<Sale, 'id' | 'createdAt'>): Promise<Sale> => {
    // Simulate API call delay
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
  },
  
  getSalesByUserId: async (userId: string): Promise<Sale[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const userSales = Sales.filter(sale => sale.userId === userId).map(sale => ({
      ...sale,
      status: sale.status as 'pending' | 'completed' | 'cancelled'
    }));
    
    return userSales;
  }
};
