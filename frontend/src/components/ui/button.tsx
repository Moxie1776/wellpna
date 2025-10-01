// ...existing code...
import type { ButtonProps } from '@mui/joy/Button';
import Button from '@mui/joy/Button';

export const JoyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};

export { Button };
export type { ButtonProps };

// Joy UI Button variants: 'solid', 'outlined', 'soft', 'plain'
