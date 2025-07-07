
import React from 'react';

interface RealtimeWrapperProps {
  children: React.ReactNode;
}

const RealtimeWrapper: React.FC<RealtimeWrapperProps> = ({ children }) => {
  // Pour l'instant, c'est juste un wrapper simple
  // La fonctionnalité temps réel peut être ajoutée plus tard
  return <>{children}</>;
};

export default RealtimeWrapper;
