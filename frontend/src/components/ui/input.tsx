// ...existing code...
import Input from '@mui/joy/Input';
import type { InputProps } from '@mui/joy/Input';

export const JoyInput: React.FC<InputProps> = (props) => {
  return <Input {...props} />;
};

export { Input };
export type { InputProps };
