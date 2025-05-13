import React, { Suspense } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import NotFound from './pages/NotFound';
import PublicLayout from './layouts/PublicLayout';
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/connexion" replace />} />

          {/* Routes publiques */}
          <Route element={<PublicLayout />}>
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/inscription" element={<RegistrationPage />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
          </Route>

          {/* Routes privées */}
          <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Ajoutez ici d'autres routes nécessitant une authentification */}
          </Route>

          {/* Route "Not Found" */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

// Composant pour protéger les routes nécessitant une authentification
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return user ? (
    children
  ) : (
    <Navigate to="/connexion" replace />
  );
}

// Contexte d'authentification pour gérer l'état de l'utilisateur
const AuthContext = React.createContext<{
  user: any;
  login: (user: any) => void;
  logout: () => void;
}>({
  user: null,
  login: () => { },
  logout: () => { },
});

// Hook personnalisé pour accéder au contexte d'authentification
export const useProvideAuth = () => {
  const [user, setUser] = React.useState<any>(null);

  const login = (user: any) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return {
    user,
    login,
    logout,
  };
};

// Fournisseur d'authentification pour envelopper l'application
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export default App;
