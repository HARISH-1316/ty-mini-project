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
        bg: 'dark.bg',
        color: 'slate.100',
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
