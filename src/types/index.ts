export interface Product {
  id: string;
  description: string;
  purchasePrice: number;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Sale {
  id: string;
  date: string;
  productId: string;
  description: string;
  sellingPrice: number;
  quantitySold: number;
  purchasePrice: number;
  profit: number;
  // Nouveaux champs client
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PretProduit {
  id: string;
  date: string;
  productId: string;
  description: string;
  quantityBorrowed: number;
  borrowerName: string;
  dueDate: string;
  returned: boolean;
  returnDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PretFamille {
  id: string;
  date: string;
  familyMemberName: string;
  amount: number;
  dueDate: string;
  returned: boolean;
  returnDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepenseDuMois {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Benefice {
  id: string;
  month: number;
  year: number;
  totalBenefice: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppContextType {
  // Products
  products: Product[];
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<boolean>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;

  // Sales
  sales: Sale[];
  fetchSales: () => Promise<void>;
  addSale: (sale: Omit<Sale, 'id'>) => Promise<boolean>;
  updateSale: (sale: Sale) => Promise<boolean>;
  deleteSale: (id: string) => Promise<boolean>;

  // Prêt Produits
  pretProduits: PretProduit[];
  fetchPretProduits: () => Promise<void>;
  addPretProduit: (pret: Omit<PretProduit, 'id'>) => Promise<boolean>;
  updatePretProduit: (pret: PretProduit) => Promise<boolean>;
  deletePretProduit: (id: string) => Promise<boolean>;

  // Prêt Familles
  pretFamilles: PretFamille[];
  fetchPretFamilles: () => Promise<void>;
  addPretFamille: (pret: Omit<PretFamille, 'id'>) => Promise<boolean>;
  updatePretFamille: (pret: PretFamille) => Promise<boolean>;
  deletePretFamille: (id: string) => Promise<boolean>;

  // Dépenses du mois
  depensesDuMois: DepenseDuMois[];
  fetchDepensesDuMois: () => Promise<void>;
  addDepenseDuMois: (depense: Omit<DepenseDuMois, 'id'>) => Promise<boolean>;
  updateDepenseDuMois: (depense: DepenseDuMois) => Promise<boolean>;
  deleteDepenseDuMois: (id: string) => Promise<boolean>;

  // Bénéfices
  benefices: Benefice[];
  fetchBenefices: () => Promise<void>;

  // Current month and year
  currentMonth: number;
  currentYear: number;

  // Loading state
  isLoading: boolean;
}
