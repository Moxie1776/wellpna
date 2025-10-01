import Snackbar from '@mui/joy/Snackbar';
import type { ColorPaletteProp } from '@mui/joy/styles';
import * as React from 'react';

import type { ToastOptions } from './ToastContext';
import { ToastContext } from './ToastContext';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [color, setColor] = React.useState<ColorPaletteProp>(
    'info' as ColorPaletteProp
  );

  const showToast = ({ message, color }: ToastOptions) => {
    setMessage(message);
    setColor((color ?? 'info') as ColorPaletteProp);
    setOpen(true);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={open}
        color={color}
        onClose={() => setOpen(false)}
        autoHideDuration={3000}
        variant='solid'
      >
        {message}
      </Snackbar>
    </ToastContext.Provider>
  );
};

// useToast moved to useToast.ts for Fast Refresh compatibility
