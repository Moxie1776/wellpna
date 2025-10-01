import * as React from 'react';
import type { ColorPaletteProp } from '@mui/joy/styles';

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
