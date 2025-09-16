import type { Config } from 'tailwindcss';
import { THEME_COLORS } from './lib/constants';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: '#dc2626',
          foreground: '#ffffff',
          hover: '#b91c1c',
          light: '#fef2f2',
          dark: '#991b1b',
          ...THEME_COLORS.PRIMARY,
        },
        secondary: {
          DEFAULT: '#ea580c',
          foreground: '#ffffff',
          hover: '#c2410c',
          light: '#fff7ed',
          dark: '#9a3412',
          ...THEME_COLORS.SECONDARY,
        },
        accent: {
          DEFAULT: '#ca8a04',
          foreground: '#1f2937',
          hover: '#a16207',
          light: '#fefce8',
          dark: '#713f12',
          ...THEME_COLORS.ACCENT,
        },
        success: {
          DEFAULT: '#16a34a',
          foreground: '#ffffff',
          hover: '#15803d',
          light: '#f0fdf4',
          dark: '#166534',
          ...THEME_COLORS.SUCCESS,
        },
        warning: {
          DEFAULT: '#d97706',
          foreground: '#ffffff',
          hover: '#b45309',
          light: '#fffbeb',
          dark: '#92400e',
          ...THEME_COLORS.WARNING,
        },
        error: {
          DEFAULT: '#dc2626',
          foreground: '#ffffff',
          hover: '#b91c1c',
          light: '#fef2f2',
          dark: '#991b1b',
          ...THEME_COLORS.ERROR,
        },
        neutral: {
          DEFAULT: THEME_COLORS.NEUTRAL[500],
          foreground: '#ffffff',
          hover: THEME_COLORS.NEUTRAL[600],
          light: THEME_COLORS.NEUTRAL[100],
          ...THEME_COLORS.NEUTRAL,
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('tailwindcss-animate')],
};
export default config;
