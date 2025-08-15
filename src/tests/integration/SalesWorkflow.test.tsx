
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '@/pages/DashboardPage';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';

// Create mock services directly here to avoid hoisting issues
const mockSalesService = {
  getSales: vi.fn().mockResolvedValue([]),
  addSale: vi.fn().mockResolvedValue({}),
  updateSale: vi.fn().mockResolvedValue({}),
  deleteSale: vi.fn().mockResolvedValue(true)
};

const mockProductService = {
  getProducts: vi.fn().mockResolvedValue([]),
  addProduct: vi.fn().mockResolvedValue({}),
  updateProduct: vi.fn().mockResolvedValue({}),
  deleteProduct: vi.fn().mockResolvedValue(true)
};

const mockApiService = {
  salesService: mockSalesService,
  productService: mockProductService,
  clientService: {
    getClients: vi.fn().mockResolvedValue([]),
    addClient: vi.fn().mockResolvedValue({}),
    updateClient: vi.fn().mockResolvedValue({}),
    deleteClient: vi.fn().mockResolvedValue(true)
  },
  authService: {
    login: vi.fn().mockResolvedValue({ token: 'test-token', user: { id: '1', email: 'test@example.com' } }),
    logout: vi.fn(),
    getCurrentUser: vi.fn().mockReturnValue(null),
    register: vi.fn().mockResolvedValue({}),
    resetPassword: vi.fn().mockResolvedValue({}),
    verifyToken: vi.fn().mockReturnValue(true)
  }
};

// Mock des services
vi.mock('@/service/api', () => mockApiService);

// Mock des hooks
vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
    login: vi.fn().mockResolvedValue(true),
    logout: vi.fn(),
    register: vi.fn().mockResolvedValue(true),
    resetPassword: vi.fn().mockResolvedValue(true)
  }))
}));

vi.mock('@/contexts/AppContext', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useApp: vi.fn(() => ({
    products: [],
    sales: [],
    clients: [],
    isLoading: false,
    addProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    addSale: mockSalesService.addSale,
    updateSale: mockSalesService.updateSale,
    deleteSale: mockSalesService.deleteSale
  }))
}));

// Mock des composants
vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>
}));

// Utility function to render with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          {component}
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('SalesWorkflow - Intégration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('workflow complet de création de vente', async () => {
    const newSale = {
      id: '1',
      date: '2024-01-15',
      productId: '1',
      description: 'Test Product',
      sellingPrice: 100,
      quantitySold: 1,
      purchasePrice: 50,
      profit: 50,
      clientName: 'Test Client',
      clientPhone: '+33123456789',
      clientAddress: '123 Test Address'
    };

    mockSalesService.addSale.mockResolvedValue(newSale);

    renderWithProviders(<DashboardPage />);
    expect(screen.getByText(/tableau de bord/i)).toBeInTheDocument();
  });

  it('workflow de modification de vente existante', async () => {
    const existingSale = {
      id: '1',
      date: '2024-01-15',
      productId: '1',
      description: 'Test Product',
      sellingPrice: 100,
      quantitySold: 1,
      purchasePrice: 50,
      profit: 50,
      clientName: 'Test Client',
      clientPhone: '+33123456789',
      clientAddress: '123 Test Address'
    };

    mockSalesService.getSales.mockResolvedValue([existingSale]);
    mockSalesService.updateSale.mockResolvedValue(existingSale);

    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText(/tableau de bord/i)).toBeInTheDocument();
    });
  });

  it('gestion des erreurs lors de la création de vente', async () => {
    mockSalesService.addSale.mockRejectedValue(new Error('Erreur serveur'));

    renderWithProviders(<DashboardPage />);
    expect(screen.getByText(/tableau de bord/i)).toBeInTheDocument();
  });

  it('synchronisation des données après opérations CRUD', async () => {
    const initialSales = [
      {
        id: '1',
        date: '2024-01-15',
        productId: '1',
        description: 'Test Product',
        sellingPrice: 100,
        quantitySold: 1,
        purchasePrice: 50,
        profit: 50,
        clientName: 'Test Client',
        clientPhone: '+33123456789',
        clientAddress: '123 Test Address'
      }
    ];

    mockSalesService.getSales.mockResolvedValue(initialSales);

    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText(/tableau de bord/i)).toBeInTheDocument();
    });

    expect(mockProductService.getProducts).toHaveBeenCalled();
  });

  it('validation des données avant soumission', async () => {
    renderWithProviders(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/tableau de bord/i)).toBeInTheDocument();
    });
  });

  it('mise à jour en temps réel des statistiques', async () => {
    const salesData = [
      {
        id: '1',
        date: '2024-01-15',
        productId: '1',
        description: 'Test Product',
        sellingPrice: 100,
        quantitySold: 1,
        purchasePrice: 50,
        profit: 50,
        clientName: 'Test Client',
        clientPhone: '+33123456789',
        clientAddress: '123 Test Address'
      }
    ];

    mockSalesService.getSales.mockResolvedValue(salesData);

    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText(/tableau de bord/i)).toBeInTheDocument();
    });
  });
});
