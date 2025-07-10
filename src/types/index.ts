
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

// Types d'authentification
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender?: string;
  address?: string;
  phone?: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender?: string;
  address?: string;
  phone?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetData {
  email: string;
  newPassword: string;
}

// Interfaces pour les prêts produits avec toutes les propriétés nécessaires
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
  // Propriétés supplémentaires utilisées dans les composants
  nom?: string;
  phone?: string;
  prixVente?: number;
  avanceRecue?: number;
  reste?: number;
  datePaiement?: string;
  estPaye?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Interfaces pour les prêts familles avec toutes les propriétés nécessaires
export interface PretFamille {
  id: string;
  date: string;
  familyMemberName: string;
  amount: number;
  dueDate: string;
  returned: boolean;
  returnDate?: string;
  // Propriétés supplémentaires utilisées dans les composants
  nom?: string;
  pretTotal?: number;
  soldeRestant?: number;
  dernierRemboursement?: number;
  dateRemboursement?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface pour les dépenses du mois
export interface DepenseDuMois {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  // Propriétés supplémentaires pour la compatibilité
  debit?: number;
  credit?: number;
  solde?: number;
  categorie?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface pour les dépenses fixes
export interface DepenseFixe {
  id?: string;
  free: number;
  internetZeop: number;
  assuranceVoiture: number;
  autreDepense: number;
  assuranceVie: number;
  total?: number;
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
