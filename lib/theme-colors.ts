export const colors = {
  dark: {
    bg: '#0d0d0f',
    bgSecondary: '#131316',
    bgTertiary: '#1c1c20',
    bgHover: '#202026',
    border: '#2a2a30',
    borderLight: '#1e1e24',
    text: '#e4e4e7',
    textSecondary: '#a1a1aa',
    textTertiary: '#71717a',
    textQuaternary: '#52525b',
    accent: '#7c3aed',
    accentHover: '#6d28d9',
  },
  light: {
    bg: '#ffffff',
    bgSecondary: '#f8f8f9',
    bgTertiary: '#f1f1f2',
    bgHover: '#e8e8ec',
    border: '#d4d4d8',
    borderLight: '#e4e4e7',
    text: '#18181b',
    textSecondary: '#3f3f46',
    textTertiary: '#52525b',
    textQuaternary: '#71717a',
    accent: '#7c3aed',
    accentHover: '#6d28d9',
  },
};

export type ColorScheme = keyof typeof colors;
