import * as React from 'react';
import { ToastContext } from './ToastContext';
import type { ColorPaletteProp } from '@mui/joy/styles';

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return {
    success: (msg: string) =>
      context.showToast({ message: msg, color: 'success' as ColorPaletteProp }),
    info: (msg: string) =>
      context.showToast({ message: msg, color: 'info' as ColorPaletteProp }),
    warning: (msg: string) =>
      context.showToast({ message: msg, color: 'warning' as ColorPaletteProp }),
    error: (msg: string) =>
      context.showToast({ message: msg, color: 'danger' as ColorPaletteProp }),
  };
};
