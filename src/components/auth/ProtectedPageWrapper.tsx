import React, { useEffect } from 'react';
import { ConfirmationCodeModal } from '@/components/auth/ConfirmationCodeModal';
import { useConfirmationCheck } from '@/hooks/useConfirmationCheck';

interface ProtectedPageWrapperProps {
  children: React.ReactNode;
  requiresConfirmation?: boolean;
}

const ProtectedPageWrapper: React.FC<ProtectedPageWrapperProps> = ({ 
  children, 
  requiresConfirmation = true 
}) => {
  const {
    showConfirmationModal,
    checkConfirmationAndExecute,
    handleConfirmationSuccess,
    handleConfirmationClose
  } = useConfirmationCheck();

  useEffect(() => {
    if (requiresConfirmation) {
      // Vérifier si la page nécessite une confirmation
      checkConfirmationAndExecute(() => {
        // La page est accessible, ne rien faire
      });
    }
  }, [requiresConfirmation, checkConfirmationAndExecute]);

  return (
    <>
      {children}
      <ConfirmationCodeModal
        isOpen={showConfirmationModal}
        onClose={handleConfirmationClose}
        onSuccess={handleConfirmationSuccess}
      />
    </>
  );
};

export default ProtectedPageWrapper;