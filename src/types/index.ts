
/**
 * DÉFINITIONS DES TYPES TYPESCRIPT
 * 
 * Ce fichier centralise tous les types et interfaces utilisés dans l'application :
 * - Types utilisateur et authentification
 * - Types de données métier (produits, ventes, prêts)
 * - Types de dépenses et finances
 * - Interfaces pour les formulaires
 * 
 * ORGANISATION:
 * - Types utilisateur (User, authentification)
 * - Types produits et ventes (Product, Sale)
 * - Types prêts (PretFamille, PretProduit)
 * - Types dépenses (DepenseFixe, DepenseDuMois)
 * - Types de formulaires et credentials
 */

// ============================================
// TYPES UTILISATEUR ET AUTHENTIFICATION
// ============================================

/**
 * Interface utilisateur principal
 * Contient toutes les informations d'un utilisateur connecté
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  address?: string;
  phone?: string;
}

/**
 * Données de connexion utilisateur
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Données d'inscription utilisateur
 */
export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  phone: string;
}

/**
 * Données complètes d'inscription avec validation
 */
export interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  phone: string;
  acceptTerms: boolean;
}

/**
 * Demande de réinitialisation de mot de passe
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Données de réinitialisation de mot de passe
 */
export interface PasswordResetData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

// ============================================
// TYPES PRODUITS ET VENTES
// ============================================

/**
 * Interface produit en stock
 * Représente un article dans l'inventaire
 */
export interface Product {
  id: string;
  description: string;
  purchasePrice: number;
  quantity: number;
  sellingPrice?: number;
  profit?: number;
}

/**
 * Interface vente réalisée
 * Enregistre une transaction de vente avec informations client
 */
export interface Sale {
  id: string;
  productId: string;
  description: string;
  date: string;
  quantitySold: number;
  purchasePrice: number;
  sellingPrice: number;
  profit: number;
  // Informations client pour facturation
  clientName?: string;
  clientAddress?: string;
  clientPhone?: string;
}

// ============================================
// TYPES PRÊTS ET CRÉANCES
// ============================================

/**
 * Interface prêt famille
 * Gestion des prêts accordés aux familles/particuliers
 */
export interface PretFamille {
  id: string;
  nom: string;
  pretTotal: number;
  soldeRestant: number;
  dernierRemboursement: number;
  dateRemboursement: string;
}

/**
 * Interface prêt produit
 * Gestion des ventes à crédit avec avances
 */
export interface PretProduit {
  id: string;
  description: string;
  nom?: string;
  date: string; // Date de prêt
  datePaiement?: string; // Date de paiement prévue
  phone?: string; // Numéro de téléphone client
  prixVente: number;
  avanceRecue: number;
  reste: number;
  estPaye: boolean;
  productId?: string;
}

// ============================================
// TYPES DÉPENSES ET FINANCES
// ============================================

/**
 * Interface dépenses fixes mensuelles
 * Charges récurrentes de l'entreprise
 */
export interface DepenseFixe {
  free: number;
  internetZeop: number;
  assuranceVoiture: number;
  autreDepense: number;
  assuranceVie: number;
  total: number;
}

/**
 * Interface dépense du mois
 * Enregistrement des dépenses variables mensuelles
 */
export interface DepenseDuMois {
  id: string;
  description: string;
  categorie: string;
  date: string;
  debit: string;
  credit: string;
  solde: number;
}
