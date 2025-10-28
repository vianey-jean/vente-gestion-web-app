import React from 'react';
import PretFamilles from '@/components/dashboard/PretFamilles';
import { PretFamilleProvider } from '@/contexts/PretFamilleContext';

const PretFamillesPage: React.FC = () => {
  return (
    <PretFamilleProvider>
      <PretFamilles />
    </PretFamilleProvider>
  );
};

export default PretFamillesPage;
