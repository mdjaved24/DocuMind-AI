import React from 'react';
import { Toaster } from 'sonner';

export const ToastProvider = ({ children }) => {
  return (
    <>
      {children}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton
        expand={false}
        duration={4000}
      />
    </>
  );
};
