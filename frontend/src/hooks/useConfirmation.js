import { useState, useCallback } from 'react';

const useConfirmation = () => {
  const [confirmationState, setConfirmationState] = useState({
    isOpen: false,
    type: 'delete', // 'delete' ou 'edit'
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    onConfirm: null,
    isLoading: false
  });

  const showConfirmation = useCallback(({
    type = 'delete',
    title = '',
    message = '',
    confirmText = '',
    cancelText = '',
    onConfirm
  }) => {
    setConfirmationState({
      isOpen: true,
      type,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm,
      isLoading: false
    });
  }, []);

  const hideConfirmation = useCallback(() => {
    setConfirmationState(prev => ({
      ...prev,
      isOpen: false,
      isLoading: false
    }));
  }, []);

  const setLoading = useCallback((isLoading) => {
    setConfirmationState(prev => ({
      ...prev,
      isLoading
    }));
  }, []);

  const handleConfirm = useCallback(async () => {
    if (confirmationState.onConfirm) {
      setLoading(true);
      try {
        await confirmationState.onConfirm();
        hideConfirmation();
      } catch (error) {
        console.error('Error in confirmation action:', error);
        setLoading(false);
        // Não fechar o modal em caso de erro, para que o usuário possa tentar novamente
      }
    }
  }, [confirmationState.onConfirm, setLoading, hideConfirmation]);

  return {
    confirmationState,
    showConfirmation,
    hideConfirmation,
    handleConfirm,
    setLoading
  };
};

export default useConfirmation;
