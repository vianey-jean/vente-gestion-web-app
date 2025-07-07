
import React from 'react';

interface MaintenanceCheckerProps {
  children: React.ReactNode;
}

const MaintenanceChecker: React.FC<MaintenanceCheckerProps> = ({ children }) => {
  // Pour l'instant, on retourne directement les enfants
  // Cette logique peut être étendue plus tard pour vérifier le statut de maintenance
  return <>{children}</>;
};

export default MaintenanceChecker;
