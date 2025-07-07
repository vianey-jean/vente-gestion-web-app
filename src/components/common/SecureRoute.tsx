
import React from 'react';

interface SecureRouteProps {
  children: React.ReactNode;
}

const SecureRoute: React.FC<SecureRouteProps> = ({ children }) => {
  // Pour l'instant, on retourne directement les enfants
  // Cette logique peut être étendue plus tard pour ajouter de la sécurité
  return <>{children}</>;
};

export default SecureRoute;
