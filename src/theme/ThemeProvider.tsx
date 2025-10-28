import React, { createContext, useContext, useMemo } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';
import { tokens, ThemeTokens } from './tokens';

export type ThemeMode = 'light' | 'dark';

export type Theme = ThemeTokens & {
  mode: ThemeMode;
  semantic: {
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    overlay: string;
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
        text: '#F8FAFC',
        textMuted: '#94A3B8',
        border: '#1E293B',
        overlay: 'rgba(15, 23, 42, 0.6)',
      },
    };
  }

  return {
    ...tokens,
    mode,
    semantic: {
      background: tokens.colors.background,
      surface: tokens.colors.surface,
      text: tokens.colors.textPrimary,
      textMuted: tokens.colors.textSecondary,
      border: tokens.colors.border,
      overlay: tokens.colors.overlay,
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
