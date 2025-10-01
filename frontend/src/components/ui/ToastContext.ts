import type { ColorPaletteProp } from '@mui/joy/styles';
import * as React from 'react';

export interface ToastOptions {
  message: string;
  color?: ColorPaletteProp;
}

export const ToastContext = React.createContext<
  | {
      showToast: (options: ToastOptions) => void;
    }
  | undefined
>(undefined);
