import React, { createContext, useContext, useRef } from 'react';
import { Toast } from 'primereact/toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const toast = useRef(null);

  const showError = (message, summary = 'Error') => {
    toast.current?.show({ severity: 'error', summary, detail: message, life: 5000 });
  };

  const showSuccess = (message, summary = 'Éxito') => {
    toast.current?.show({ severity: 'success', summary, detail: message, life: 3000 });
  };

  return (
    <ToastContext.Provider value={{ showError, showSuccess }}>
      <Toast ref={toast} />
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
}
