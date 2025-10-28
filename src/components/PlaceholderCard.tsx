import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type IconComponent = React.ComponentType<{ size?: number; color?: string }>;

export type PlaceholderCardProps = {
  title: string;
  description: string;
  Icon?: IconComponent;
};

export const PlaceholderCard: React.FC<PlaceholderCardProps> = ({ title, description, Icon }) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.semantic.surface,
          borderColor: theme.semantic.border,
        },
      ]}
    >
      {Icon ? <Icon size={32} color={theme.colors.primaryTeal} /> : null}
      <Text style={[styles.title, { color: theme.semantic.text }]}>{title}</Text>
      <Text style={[styles.description, { color: theme.semantic.textMuted }]}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
  },
});
