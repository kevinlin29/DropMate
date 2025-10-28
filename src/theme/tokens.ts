export const colors = {
  primaryTeal: '#1497A1',
  primaryTealLight: '#17A8B3',
  primaryTealDark: '#0E7F8A',
  background: '#F6F7F9',
  surface: '#FFFFFF',
  textPrimary: '#1F2A37',
  textSecondary: '#6B7280',
  accent: '#0EA5E9',
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',
  border: '#E5E7EB',
  overlay: 'rgba(31, 42, 55, 0.1)',
};

export const gradients = {
  primary: {
    start: '#17A8B3',
    end: '#0E7F8A',
  },
};

export const spacing = {
  none: 0,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 28, lineHeight: 34, fontWeight: '600' as const },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  label: { fontSize: 15, lineHeight: 22, fontWeight: '500' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
};

export type ThemeTokens = {
  colors: typeof colors;
  gradients: typeof gradients;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
};

export const tokens: ThemeTokens = {
  colors,
  gradients,
  spacing,
  radii,
  typography,
};
