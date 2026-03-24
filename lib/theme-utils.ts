import { ColorScheme } from './theme-colors';

export function getColors(theme: 'dark' | 'light') {
  return {
    // Background
    bg: theme === 'dark' ? '#0d0d0f' : '#ffffff',
    bgSecondary: theme === 'dark' ? '#131316' : '#f8f8f9',
    bgTertiary: theme === 'dark' ? '#1c1c20' : '#f1f1f2',
    bgHover: theme === 'dark' ? '#202026' : '#e8e8ec',

    // Borders
    border: theme === 'dark' ? '#2a2a30' : '#d4d4d8',
    borderLight: theme === 'dark' ? '#1e1e24' : '#e4e4e7',

    // Text
    text: theme === 'dark' ? '#e4e4e7' : '#18181b',
    textSecondary: theme === 'dark' ? '#a1a1aa' : '#3f3f46',
    textTertiary: theme === 'dark' ? '#71717a' : '#52525b',
    textQuaternary: theme === 'dark' ? '#52525b' : '#71717a',

    // Accent
    accent: '#7c3aed',
    accentHover: '#6d28d9',
    accentBg: theme === 'dark' ? '#7c3aed15' : '#7c3aed08',

    // Special
    success: '#10b981',
    successBg: theme === 'dark' ? '#10b98115' : '#10b98108',
    danger: '#ef4444',
    dangerBg: theme === 'dark' ? '#ef444415' : '#ef444408',
    warning: '#f59e0b',
    warningBg: theme === 'dark' ? '#f59e0b15' : '#f59e0b08',
  };
}

export type Colors = ReturnType<typeof getColors>;
