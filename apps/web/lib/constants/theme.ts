// Theme colors for the restaurant application
export const THEME_COLORS = {
  // Primary colors
  PRIMARY: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Secondary colors (warm orange)
  SECONDARY: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Main orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },

  // Accent colors (golden yellow)
  ACCENT: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308', // Main gold
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    950: '#422006',
  },

  // Neutral colors
  NEUTRAL: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Success colors
  SUCCESS: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Warning colors
  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Error colors
  ERROR: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
} as const;

// CSS custom properties for theme
export const THEME_CSS_VARS = {
  '--color-primary': THEME_COLORS.PRIMARY[500],
  '--color-primary-hover': THEME_COLORS.PRIMARY[600],
  '--color-primary-light': THEME_COLORS.PRIMARY[100],
  '--color-secondary': THEME_COLORS.SECONDARY[500],
  '--color-secondary-hover': THEME_COLORS.SECONDARY[600],
  '--color-secondary-light': THEME_COLORS.SECONDARY[100],
  '--color-accent': THEME_COLORS.ACCENT[500],
  '--color-accent-hover': THEME_COLORS.ACCENT[600],
  '--color-accent-light': THEME_COLORS.ACCENT[100],
  '--color-success': THEME_COLORS.SUCCESS[500],
  '--color-warning': THEME_COLORS.WARNING[500],
  '--color-error': THEME_COLORS.ERROR[500],
  '--color-neutral-50': THEME_COLORS.NEUTRAL[50],
  '--color-neutral-100': THEME_COLORS.NEUTRAL[100],
  '--color-neutral-200': THEME_COLORS.NEUTRAL[200],
  '--color-neutral-300': THEME_COLORS.NEUTRAL[300],
  '--color-neutral-400': THEME_COLORS.NEUTRAL[400],
  '--color-neutral-500': THEME_COLORS.NEUTRAL[500],
  '--color-neutral-600': THEME_COLORS.NEUTRAL[600],
  '--color-neutral-700': THEME_COLORS.NEUTRAL[700],
  '--color-neutral-800': THEME_COLORS.NEUTRAL[800],
  '--color-neutral-900': THEME_COLORS.NEUTRAL[900],
} as const;
