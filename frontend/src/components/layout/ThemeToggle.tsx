import * as React from 'react';
import { useColorScheme } from '@mui/joy/styles';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import { MdDarkMode, MdLightMode, MdSettingsBrightness } from 'react-icons/md';

export default function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <Select
      value={mode}
      onChange={(_, newMode) => setMode(newMode)}
      sx={{ width: 'max-content', minWidth: 120 }}
      startDecorator={
        mode === 'dark' ? (
          <MdDarkMode />
        ) : mode === 'light' ? (
          <MdLightMode />
        ) : (
          <MdSettingsBrightness />
        )
      }
    >
      <Option value='system'>System</Option>
      <Option value='light'>Light</Option>
      <Option value='dark'>Dark</Option>
    </Select>
  );
}
