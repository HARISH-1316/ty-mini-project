// ──────────────────────────────────────────────
// Custom Chakra UI Theme — WCE Virtual Lab
// Light Mode: White + GeeksforGeeks Green
//   Primary: #2F8D46, Primary Hover: #26753A, Primary Soft: #E8F5E9
//   Background/Surface: #FFFFFF, Surface Secondary: #F5F7F5
//   Text: #202124 / #606860, Border: #DDE5DD, Focus: #2F8D46
// Dark Mode: Blackish-Grey + Lime Green
//   Primary: #A3E635, Primary Hover: #BEF264, Primary Soft: #303B22
//   Background: #171918, Surface: #202321, Surface Secondary: #292D2A
//   Text: #F5F7F5 / #B8C0B9, Border: #3B423C, Focus: #A3E635
// Solid colors only — Absolutely NO gradients
// ──────────────────────────────────────────────

import { extendTheme } from '@chakra-ui/react';

// GeeksforGeeks Conventional Green (Light)
const gfgGreen = {
  50: '#E8F5E9',
  100: '#C8E6C9',
  200: '#A5D6A7',
  300: '#81C784',
  400: '#4CAF50',
  500: '#2F8D46', // Primary light
  600: '#26753A', // Primary hover light
  700: '#1E5E2E',
  800: '#174723',
  900: '#0F2F17',
};

// Bright Lime Green (Dark)
const limeGreen = {
  50: '#F7FEE7',
  100: '#ECFCCB',
  200: '#D9F99D',
  300: '#BEF264',
  400: '#BEF264', // Lime hover dark
  500: '#A3E635', // Lime primary dark
  600: '#84CC16',
  700: '#65A30D',
  800: '#4D7C0F',
  900: '#303B22', // Lime soft dark
};

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: gfgGreen,
    lime: limeGreen,
    emerald: {
      50: '#E8F5E9',
      100: '#C8E6C9',
      200: '#A5D6A7',
      300: '#81C784',
      400: '#4CAF50',
      500: '#2F8D46',
      600: '#26753A',
      700: '#1E5E2E',
      800: '#174723',
      900: '#0F2F17',
    },
    // Standard high-contrast slate-gray palette
    gray: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
    // Literal white accessible constant
    pureWhite: '#FFFFFF',
  },
  semanticTokens: {
    colors: {
      // ── Core Palette Tokens ──
      'bg.primary': { default: '#FFFFFF', _dark: '#171918' },
      'bg.secondary': { default: '#F2F6F3', _dark: '#292D2A' },
      'bg.card': { default: '#FFFFFF', _dark: '#202321' },
      'bg.surface': { default: '#FFFFFF', _dark: '#202321' },
      'bg.surfaceSecondary': { default: '#F2F6F3', _dark: '#292D2A' },

      'accent.primary': { default: '#2F8D46', _dark: '#A3E635' },
      'accent.hover': { default: '#26753A', _dark: '#BEF264' },
      'accent.soft': { default: '#E8F5E9', _dark: '#303B22' },
      'accent.contrastText': { default: '#FFFFFF', _dark: '#171918' },

      'text.primary': { default: '#0F172A', _dark: '#F8FAFC' },
      'text.secondary': { default: '#475569', _dark: '#CBD5E1' },

      'border.primary': { default: '#DDE5DD', _dark: '#3B423C' },
      'border.subtle': { default: '#E8EFE8', _dark: '#2F3530' },

      'input.bg': { default: '#FFFFFF', _dark: '#202321' },
      'input.border': { default: '#CBD5E1', _dark: '#3B423C' },
      'focus.ring': { default: '#2F8D46', _dark: '#A3E635' },
      'disabled.bg': { default: '#F1F5F9', _dark: '#292D2A' },
      'disabled.text': { default: '#64748B', _dark: '#94A3B8' },

      // Legacy token compatibility mapped to new palette
      'dark.bg': { default: '#F2F6F3', _dark: '#171918' },
      'dark.card': { default: '#FFFFFF', _dark: '#202321' },
      'dark.border': { default: '#DDE5DD', _dark: '#3B423C' },
      'dark.hover': { default: '#EAF1EC', _dark: '#292D2A' },
      'dark.input': { default: '#FFFFFF', _dark: '#202321' },

      // Slate scale mapped to Blackish-Grey (dark) and White / Neutral (light)
      'slate.950': { default: '#FFFFFF', _dark: '#141615' },
      'slate.900': { default: '#F5F7F5', _dark: '#171918' },
      'slate.850': { default: '#FFFFFF', _dark: '#1C1F1D' },
      'slate.800': { default: '#FFFFFF', _dark: '#202321' },
      'slate.700': { default: '#E8F5E9', _dark: '#292D2A' },
      'slate.600': { default: '#DDE5DD', _dark: '#3B423C' },
      'slate.500': { default: '#475569', _dark: '#CBD5E1' },
      'slate.400': { default: '#475569', _dark: '#CBD5E1' },
      'slate.300': { default: '#334155', _dark: '#E2E8F0' },
      'slate.200': { default: '#DDE5DD', _dark: '#292D2A' },
      'slate.100': { default: '#F5F7F5', _dark: '#202321' },
      'slate.50': { default: '#FFFFFF', _dark: '#171918' },

      // Grays: In light mode text is dark; in dark mode text is light
      'gray.900': { default: '#0F172A', _dark: '#FFFFFF' },
      'gray.800': { default: '#1E293B', _dark: '#F8FAFC' },
      'gray.700': { default: '#334155', _dark: '#E2E8F0' },
      'gray.600': { default: '#475569', _dark: '#CBD5E1' },
      'gray.500': { default: '#475569', _dark: '#CBD5E1' },
      'gray.400': { default: '#475569', _dark: '#CBD5E1' },
      'gray.300': { default: '#334155', _dark: '#E2E8F0' },
      'gray.200': { default: '#DDE5DD', _dark: '#343B35' },
      'gray.100': { default: '#F2F6F3', _dark: '#292D2A' },
      'gray.50': { default: '#F8FAFC', _dark: '#202321' },

      // Brand / Purple / Cyan / Orange aliases mapped to theme
      'brand.50': { default: '#E8F5E9', _dark: '#303B22' },
      'brand.100': { default: '#E8F5E9', _dark: '#303B22' },
      'brand.200': { default: '#C8E6C9', _dark: '#3F4D2C' },
      'brand.300': { default: '#A5D6A7', _dark: '#BEF264' },
      'brand.400': { default: '#4CAF50', _dark: '#BEF264' },
      'brand.500': { default: '#2F8D46', _dark: '#A3E635' },
      'brand.600': { default: '#26753A', _dark: '#84CC16' },
      'brand.700': { default: '#1E5E2E', _dark: '#65A30D' },
      'brand.800': { default: '#174723', _dark: '#4D7C0F' },
      'brand.900': { default: '#0F2F17', _dark: '#303B22' },

      'purple.50': { default: '#E8F5E9', _dark: '#303B22' },
      'purple.100': { default: '#E8F5E9', _dark: '#303B22' },
      'purple.200': { default: '#C8E6C9', _dark: '#3F4D2C' },
      'purple.300': { default: '#2F8D46', _dark: '#BEF264' },
      'purple.400': { default: '#2F8D46', _dark: '#A3E635' },
      'purple.500': { default: '#2F8D46', _dark: '#A3E635' },
      'purple.600': { default: '#26753A', _dark: '#84CC16' },
      'purple.700': { default: '#1E5E2E', _dark: '#65A30D' },
      'purple.800': { default: '#174723', _dark: '#4D7C0F' },
      'purple.900': { default: '#0F2F17', _dark: '#303B22' },

      'cyan.300': { default: '#2F8D46', _dark: '#BEF264' },
      'cyan.400': { default: '#2F8D46', _dark: '#A3E635' },
      'cyan.500': { default: '#2F8D46', _dark: '#A3E635' },

      'green.500': { default: '#2F8D46', _dark: '#A3E635' },
      'green.600': { default: '#26753A', _dark: '#84CC16' },

      // Chakra system tokens
      'chakra-body-bg': { default: '#FFFFFF', _dark: '#171918' },
      'chakra-body-text': { default: '#0F172A', _dark: '#F8FAFC' },
      'chakra-border-color': { default: '#DDE5DD', _dark: '#3B423C' },
      'chakra-subtle-bg': { default: '#F5F7F5', _dark: '#292D2A' },
      'chakra-placeholder-color': { default: '#64748B', _dark: '#94A3B8' },
    },
  },
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? '#171918' : '#F2F6F3',
        color: props.colorMode === 'dark' ? '#F5F7F5' : '#202124',
        minH: '100vh',
        transition: 'background-color 0.2s ease, color 0.2s ease',
      },
      'select, option, optgroup': {
        bg: props.colorMode === 'dark' ? '#202321 !important' : '#FFFFFF !important',
        color: props.colorMode === 'dark' ? '#F5F7F5 !important' : '#202124 !important',
      },
      '*::placeholder': {
        color: props.colorMode === 'dark' ? '#859086' : '#859086',
      },
      '*, *::before, *::after': {
        borderColor: props.colorMode === 'dark' ? '#3B423C' : '#DDE5DD',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'lg',
        fontWeight: '600',
      },
      variants: {
        solid: (props) => {
          const isBrand =
            !props.colorScheme ||
            props.colorScheme === 'brand' ||
            props.colorScheme === 'purple' ||
            props.colorScheme === 'cyan' ||
            props.colorScheme === 'green';

          if (isBrand) {
            return {
              bg: props.colorMode === 'dark' ? '#A3E635' : '#2F8D46',
              color: props.colorMode === 'dark' ? '#171918' : '#FFFFFF',
              fontWeight: '700',
              _hover: {
                bg: props.colorMode === 'dark' ? '#BEF264' : '#26753A',
                _disabled: {
                  bg: props.colorMode === 'dark' ? '#292D2A' : '#F1EFED',
                  color: props.colorMode === 'dark' ? '#606860' : '#859086',
                },
              },
              _active: {
                bg: props.colorMode === 'dark' ? '#84CC16' : '#1E5E2E',
              },
            };
          }
          return {
            color: '#FFFFFF',
          };
        },
        outline: (props) => {
          const isBrand =
            props.colorScheme === 'brand' ||
            props.colorScheme === 'purple' ||
            props.colorScheme === 'cyan' ||
            props.colorScheme === 'green';

          if (isBrand) {
            return {
              borderColor: props.colorMode === 'dark' ? '#A3E635' : '#2F8D46',
              color: props.colorMode === 'dark' ? '#A3E635' : '#2F8D46',
              bg: 'transparent',
              _hover: {
                bg: props.colorMode === 'dark' ? '#303B22' : '#E8F5E9',
              },
            };
          }
          return {
            borderColor: props.colorMode === 'dark' ? '#3B423C' : '#DDE5DD',
            color: props.colorMode === 'dark' ? '#F5F7F5' : '#202124',
            _hover: {
              bg: props.colorMode === 'dark' ? '#292D2A' : '#F5F7F5',
            },
          };
        },
        ghost: (props) => ({
          color: props.colorMode === 'dark' ? '#F5F7F5' : '#202124',
          _hover: {
            bg: props.colorMode === 'dark' ? '#292D2A' : '#F5F7F5',
            color: props.colorMode === 'dark' ? '#A3E635' : '#2F8D46',
          },
        }),
      },
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Card: {
      baseStyle: (props) => ({
        container: {
          bg: props.colorMode === 'dark' ? '#202321' : '#FFFFFF',
          borderColor: props.colorMode === 'dark' ? '#3B423C' : '#DDE5DD',
          borderWidth: '1px',
          borderRadius: 'xl',
          boxShadow: 'sm',
          color: props.colorMode === 'dark' ? '#F5F7F5' : '#202124',
        },
      }),
    },
    Input: {
      variants: {
        outline: (props) => ({
          field: {
            bg: props.colorMode === 'dark' ? '#202321' : '#FFFFFF',
            borderColor: props.colorMode === 'dark' ? '#3B423C' : '#DDE5DD',
            color: props.colorMode === 'dark' ? '#F5F7F5' : '#202124',
            borderRadius: 'lg',
            _hover: {
              borderColor: props.colorMode === 'dark' ? '#A3E635' : '#2F8D46',
            },
            _focus: {
              borderColor: props.colorMode === 'dark' ? '#A3E635' : '#2F8D46',
              boxShadow: `0 0 0 1px ${props.colorMode === 'dark' ? '#A3E635' : '#2F8D46'}`,
            },
            _disabled: {
              bg: props.colorMode === 'dark' ? '#292D2A' : '#F1EFED',
              opacity: 0.7,
            },
          },
        }),
      },
      defaultProps: {
        variant: 'outline',
      },
    },
    Textarea: {
      variants: {
        outline: (props) => ({
          bg: props.colorMode === 'dark' ? '#202321' : '#FFFFFF',
          borderColor: props.colorMode === 'dark' ? '#3B423C' : '#DDE5DD',
          color: props.colorMode === 'dark' ? '#F5F7F5' : '#202124',
          borderRadius: 'lg',
          _hover: {
            borderColor: props.colorMode === 'dark' ? '#A3E635' : '#2F8D46',
          },
          _focus: {
            borderColor: props.colorMode === 'dark' ? '#A3E635' : '#2F8D46',
            boxShadow: `0 0 0 1px ${props.colorMode === 'dark' ? '#A3E635' : '#2F8D46'}`,
          },
          _disabled: {
            bg: props.colorMode === 'dark' ? '#292D2A' : '#F1EFED',
            opacity: 0.7,
          },
        }),
      },
      defaultProps: {
        variant: 'outline',
      },
    },
    Select: {
      variants: {
        outline: (props) => ({
          field: {
            bg: props.colorMode === 'dark' ? '#202321' : '#FFFFFF',
            borderColor: props.colorMode === 'dark' ? '#3B423C' : '#DDE5DD',
            color: props.colorMode === 'dark' ? '#F5F7F5' : '#202124',
            borderRadius: 'lg',
            _hover: {
              borderColor: props.colorMode === 'dark' ? '#A3E635' : '#2F8D46',
            },
            _focus: {
              borderColor: props.colorMode === 'dark' ? '#A3E635' : '#2F8D46',
              boxShadow: `0 0 0 1px ${props.colorMode === 'dark' ? '#A3E635' : '#2F8D46'}`,
            },
            '> option, > optgroup': {
              bg: props.colorMode === 'dark' ? '#202321' : '#FFFFFF',
              color: props.colorMode === 'dark' ? '#F5F7F5' : '#202124',
            },
          },
        }),
      },
    },
    Modal: {
      baseStyle: (props) => ({
        dialog: {
          bg: props.colorMode === 'dark' ? '#202321' : '#FFFFFF',
          borderColor: props.colorMode === 'dark' ? '#3B423C' : '#DDE5DD',
          borderWidth: '1px',
          color: props.colorMode === 'dark' ? '#F5F7F5' : '#202124',
          borderRadius: 'xl',
        },
        header: {
          borderBottomWidth: '1px',
          borderColor: props.colorMode === 'dark' ? '#3B423C' : '#DDE5DD',
          color: props.colorMode === 'dark' ? '#F5F7F5' : '#202124',
        },
        footer: {
          borderTopWidth: '1px',
          borderColor: props.colorMode === 'dark' ? '#3B423C' : '#DDE5DD',
        },
      }),
    },
    Menu: {
      baseStyle: (props) => ({
        list: {
          bg: props.colorMode === 'dark' ? '#202321' : '#FFFFFF',
          borderColor: props.colorMode === 'dark' ? '#3B423C' : '#DDE5DD',
          borderWidth: '1px',
          color: props.colorMode === 'dark' ? '#F5F7F5' : '#202124',
          boxShadow: props.colorMode === 'dark' ? 'dark-lg' : 'lg',
          borderRadius: 'xl',
        },
        item: {
          bg: props.colorMode === 'dark' ? '#202321' : '#FFFFFF',
          color: props.colorMode === 'dark' ? '#F5F7F5' : '#202124',
          _hover: {
            bg: props.colorMode === 'dark' ? '#292D2A' : '#F5F7F5',
            color: props.colorMode === 'dark' ? '#A3E635' : '#2F8D46',
          },
        },
        divider: {
          borderColor: props.colorMode === 'dark' ? '#3B423C' : '#DDE5DD',
        },
      }),
    },
    Table: {
      baseStyle: (props) => ({
        th: {
          color: props.colorMode === 'dark' ? '#B8C0B9' : '#606860',
          borderColor: props.colorMode === 'dark' ? '#3B423C' : '#DDE5DD',
        },
        td: {
          borderColor: props.colorMode === 'dark' ? '#3B423C' : '#DDE5DD',
          color: props.colorMode === 'dark' ? '#F5F7F5' : '#202124',
        },
      }),
    },
    Tabs: {
      variants: {
        line: (props) => ({
          tab: {
            color: props.colorMode === 'dark' ? '#B8C0B9' : '#606860',
            _selected: {
              color: props.colorMode === 'dark' ? '#A3E635' : '#2F8D46',
              borderColor: props.colorMode === 'dark' ? '#A3E635' : '#2F8D46',
            },
          },
        }),
      },
    },
    Divider: {
      baseStyle: (props) => ({
        borderColor: props.colorMode === 'dark' ? '#3B423C' : '#DDE5DD',
      }),
    },
    Badge: {
      variants: {
        subtle: (props) => {
          if (props.colorScheme === 'brand' || props.colorScheme === 'purple' || props.colorScheme === 'green') {
            return {
              bg: props.colorMode === 'dark' ? '#303B22' : '#E8F5E9',
              color: props.colorMode === 'dark' ? '#A3E635' : '#2F8D46',
            };
          }
          if (props.colorScheme === 'gray') {
            return {
              bg: props.colorMode === 'dark' ? '#292D2A' : '#E2E8F0',
              color: props.colorMode === 'dark' ? '#E2E8F0' : '#1E293B',
            };
          }
          return {};
        },
      },
    },
    Popover: {
      baseStyle: (props) => ({
        content: {
          bg: props.colorMode === 'dark' ? '#202321' : '#FFFFFF',
          borderColor: props.colorMode === 'dark' ? '#3B423C' : '#DDE5DD',
          borderWidth: '1px',
          color: props.colorMode === 'dark' ? '#F5F7F5' : '#202124',
          boxShadow: props.colorMode === 'dark' ? 'dark-lg' : 'lg',
          borderRadius: 'xl',
        },
        header: {
          borderBottomWidth: '1px',
          borderColor: props.colorMode === 'dark' ? '#3B423C' : '#DDE5DD',
        },
      }),
    },
    Code: {
      baseStyle: (props) => ({
        bg: props.colorMode === 'dark' ? '#292D2A' : '#F2F6F3',
        color: props.colorMode === 'dark' ? '#A3E635' : '#202124',
        borderRadius: 'md',
      }),
    },
    Tooltip: {
      baseStyle: (props) => ({
        bg: props.colorMode === 'dark' ? '#292D2A' : '#202124',
        color: props.colorMode === 'dark' ? '#F5F7F5' : '#FFFFFF',
        borderRadius: 'md',
      }),
    },
    Heading: {
      baseStyle: (props) => ({
        color: props.colorMode === 'dark' ? '#F5F7F5' : '#202124',
      }),
    },
    Text: {
      baseStyle: (props) => ({
        color: props.colorMode === 'dark' ? '#F5F7F5' : '#202124',
      }),
    },
    FormLabel: {
      baseStyle: (props) => ({
        color: props.colorMode === 'dark' ? '#E2E8F0' : '#202124',
        fontWeight: '600',
        mb: 2,
      }),
    },
    Drawer: {
      baseStyle: (props) => ({
        dialog: {
          bg: props.colorMode === 'dark' ? '#202321' : '#FFFFFF',
          color: props.colorMode === 'dark' ? '#F5F7F5' : '#202124',
        },
      }),
    },
  },
});

export default theme;
