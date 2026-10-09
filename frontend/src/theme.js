// ──────────────────────────────────────────────
// Custom Chakra UI Theme — Dark Cyber-Academic Aesthetic
// ──────────────────────────────────────────────

import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#f0e6ff',
      100: '#d1b3ff',
      200: '#b280ff',
      300: '#934dff',
      400: '#741aff',
      500: '#5a00e6',
      600: '#4600b3',
      700: '#320080',
      800: '#1e004d',
      900: '#0a001a',
    },
    accent: {
      cyan: '#00f2fe',
      purple: '#9d4edd',
      pink: '#ff4d6d',
      emerald: '#10b981',
      amber: '#f59e0b',
    },
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    emerald: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    dark: {
      bg: '#0f172a',
      card: '#1e293b',
      border: '#334155',
      hover: '#475569',
      input: '#1e293b',
    },
  },
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
  },
  styles: {
    global: {
      body: {
        bg: '#0f172a',
        color: '#f8fafc',
        minH: '100vh',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'purple',
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'dark.card',
          borderColor: 'dark.border',
          borderWidth: '1px',
          borderRadius: 'xl',
          boxShadow: 'lg',
        },
      },
    },
  },
});

export default theme;
