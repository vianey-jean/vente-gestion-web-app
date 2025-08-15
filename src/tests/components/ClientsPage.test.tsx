
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ClientsPage from '@/pages/ClientsPage';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';

// Create mock services directly here to avoid hoisting issues
const mockClientService = {
  getClients: vi.fn().mockResolvedValue([]),
  addClient: vi.fn().mockResolvedValue({}),
  updateClient: vi.fn().mockResolvedValue({}),
  deleteClient: vi.fn().mockResolvedValue(true)
};

const mockApiService = {
  salesService: {
    getSales: vi.fn().mockResolvedValue([]),
    addSale: vi.fn().mockResolvedValue({}),
    updateSale: vi.fn().mockResolvedValue({}),
    deleteSale: vi.fn().mockResolvedValue(true)
  },
  productService: {
    getProducts: vi.fn().mockResolvedValue([]),
    addProduct: vi.fn().mockResolvedValue({}),
    updateProduct: vi.fn().mockResolvedValue({}),
    deleteProduct: vi.fn().mockResolvedValue(true)
  },
  clientService: mockClientService,
  authService: {
    login: vi.fn().mockResolvedValue({ token: 'test-token', user: { id: '1', email: 'test@example.com' } }),
    logout: vi.fn(),
    getCurrentUser: vi.fn().mockReturnValue(null),
    register: vi.fn().mockResolvedValue({}),
    resetPassword: vi.fn().mockResolvedValue({}),
    verifyToken: vi.fn().mockReturnValue(true)
  }
};

// Mock des services avec les mocks créés directement ici
vi.mock('@/service/api', () => mockApiService);

// Mock du hook useClientSync
vi.mock('@/hooks/useClientSync', () => ({
  useClientSync: vi.fn(() => ({
    clients: [],
    isLoading: false,
    searchClients: vi.fn(() => []),
    refetch: vi.fn()
  }))
}));

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
    clients: [],
    isLoading: false,
    addClient: vi.fn(),
    updateClient: vi.fn(),
    deleteClient: mockClientService.deleteClient
  }))
}));

// Mock des composants complexes
vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>
}));

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

describe('ClientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche la page des clients', () => {
    renderWithProviders(<ClientsPage />);
    expect(screen.getByText(/gestion des clients/i)).toBeInTheDocument();
  });

  it('affiche le message quand il n\'y a pas de clients', () => {
    renderWithProviders(<ClientsPage />);
    expect(screen.getByText(/aucun client trouvé/i)).toBeInTheDocument();
  });
});
