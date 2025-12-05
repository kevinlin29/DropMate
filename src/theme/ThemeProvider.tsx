import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { tokens, ThemeTokens } from './tokens';

export type ThemeMode = 'light' | 'dark';

export type Theme = ThemeTokens & {
  mode: ThemeMode;
  semantic: {
    background: string;
    surface: string;
    surfaceElevated: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderLight: string;
    overlay: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    pressed: string;
  };
};

const buildTheme = (mode: ThemeMode): Theme => {
  if (mode === 'dark') {
    return {
      ...tokens,
      mode,
      semantic: {
        background: '#0F172A',
        surface: '#1E293B',
        surfaceElevated: '#334155',
        text: '#F8FAFC',
        textSecondary: '#CBD5E1',
        textMuted: '#94A3B8',
        border: '#334155',
        borderLight: '#1E293B',
        overlay: 'rgba(15, 23, 42, 0.6)',
        accent: '#38BDF8',
        success: '#4ADE80',
        warning: '#FBBF24',
        error: '#F87171',
        pressed: 'rgba(255, 255, 255, 0.1)',
      },
    };
  }

  return {
    ...tokens,
    mode,
    semantic: {
      background: tokens.colors.background,
      surface: tokens.colors.surface,
      surfaceElevated: tokens.colors.surfaceElevated,
      text: tokens.colors.textPrimary,
      textSecondary: tokens.colors.textSecondary,
      textMuted: tokens.colors.textTertiary,
      border: tokens.colors.border,
      borderLight: tokens.colors.borderLight,
      overlay: tokens.colors.overlay,
      accent: tokens.colors.accent,
      success: tokens.colors.success,
      warning: tokens.colors.warning,
      error: tokens.colors.error,
      pressed: tokens.colors.pressed,
    },
  };
};

const ThemeContext = createContext<Theme>(buildTheme('light'));

export type ThemeProviderProps = {
  children: React.ReactNode;
  mode?: ThemeMode;
  overrideSystem?: boolean;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  mode,
  overrideSystem = false,
}) => {
  const systemColorScheme = useColorScheme();
  const resolvedMode: ThemeMode = useMemo(() => {
    if (overrideSystem && mode) {
      return mode;
    }

    if (mode) {
      return mode;
    }

    return (systemColorScheme ?? 'light') as ThemeMode;
  }, [mode, overrideSystem, systemColorScheme]);

  const value = useMemo(() => buildTheme(resolvedMode), [resolvedMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): Theme => {
  return useContext(ThemeContext);
};