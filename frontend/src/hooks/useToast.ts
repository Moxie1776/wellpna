import { toast as sonnerToast } from 'sonner';

export interface ToastMessage {
  message: string;
  color: 'success' | 'info' | 'warning' | 'error';
}

export const useToast = () => {
  const showToast = (toastMessage: ToastMessage) => {
    const { message, color } = toastMessage;

    switch (color) {
      case 'success':
        sonnerToast.success(message);
        break;
      case 'info':
        sonnerToast.info(message);
        break;
      case 'warning':
        sonnerToast.warning(message);
        break;
      case 'error':
        sonnerToast.error(message);
        break;
      default:
        sonnerToast(message);
    }
  };

  return { showToast };
};
