import '@mui/material/styles'
import '@mui/material/Button'
import '@mui/material/IconButton'
import '@mui/material/Alert'

declare module '@mui/material/styles' {
  interface Palette {
    neutral: {
      50: string
      100: string
      200: string
      300: string
      400: string
      500: string
      600: string
      700: string
      800: string
      900: string
      main: string
      light: string
      dark: string
      contrastText: string
    }
  }

  interface PaletteOptions {
    neutral?: {
      50?: string
      100?: string
      200?: string
      300?: string
      400?: string
      500?: string
      600?: string
      700?: string
      800?: string
      900?: string
      main?: string
      light?: string
      dark?: string
      contrastText?: string
    }
  }

  interface PaletteColor {
    neutral: string
  }

  interface SimplePaletteColorOptions {
    neutral?: string
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    neutral: true
  }
}

declare module '@mui/material/IconButton' {
  interface IconButtonPropsColorOverrides {
    neutral: true
  }
}

declare module '@mui/material/Alert' {
  interface AlertPropsColorOverrides {
    neutral: true
  }
}
