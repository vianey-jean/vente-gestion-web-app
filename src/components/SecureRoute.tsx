
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRealRoute, isValidSecureId, getEntityType } from '@/services/secureIds';
import NotFound from '@/pages/NotFound';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

interface SecureRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const SecureRoute: React.FC<SecureRouteProps> = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.substring(1); // Enlever le / initial
  const [isValidPath, setIsValidPath] = useState<boolean | null>(null);
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    // Check if user has required role if allowedRoles is provided
    if (allowedRoles && allowedRoles.length > 0) {
      if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
        toast.error("Vous n'avez pas les permissions nécessaires");
        navigate('/', { replace: true });
        return;
      }
    }
    
    // Vérifier si c'est une route sécurisée connue
    const realPath = getRealRoute(path);
    const isValidId = isValidSecureId(path);
    
    console.log('Secure Route Check:', { path, realPath, isValid: isValidId });
    
    if (!realPath && !isValidId) {
      console.log('Route invalide détectée:', path);
      toast.error("Ce lien n'est plus valide");
      navigate('/not-found', { replace: true });
      setIsValidPath(false);
    } else {
      setIsValidPath(true);
    }
  }, [path, navigate, allowedRoles, isAuthenticated, user]);

  // Afficher un chargement pendant la vérification
  if (isValidPath === null) {
    return <div className="flex items-center justify-center min-h-screen">Vérification de l'accès...</div>;
  }
  
  // Si la route est invalide, ne rien afficher (la redirection est en cours)
  if (isValidPath === false) {
    return null;
  }
  
  // Si la route est sécurisée, afficher le contenu enfant
  return <>{children}</>;
};

export default SecureRoute;
