import { useState } from 'react';
import Snackbar from '@mui/joy/Snackbar';

export interface SnackbarMessage {
  message: string;
  color?: 'success' | 'info' | 'warning' | 'error';
}

export function useSnackbar() {
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarMessage | null>(null);

  const showSnackbar = (snackbarMessage: SnackbarMessage) => {
    setSnackbar(snackbarMessage);
    setOpen(true);
  };

  return {
    open,
    setOpen,
    snackbar,
    showSnackbar,
  };
}

export function SnackbarComponent({
  open,
  setOpen,
  snackbar,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  snackbar: SnackbarMessage | null;
}) {
  return (
    <Snackbar
      open={open}
      onClose={() => setOpen(false)}
      color={
        snackbar?.color === 'success'
          ? 'success'
          : snackbar?.color === 'warning'
          ? 'warning'
          : 'neutral'
      }
      variant='soft'
      autoHideDuration={3000}
    >
      {snackbar?.message}
    </Snackbar>
  );
}
