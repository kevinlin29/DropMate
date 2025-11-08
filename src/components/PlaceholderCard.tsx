import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';

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
          backgroundColor: theme.semantic.surface || tokens.colors.surface,
          borderColor: theme.semantic.border || tokens.colors.border,
        },
      ]}
    >
      {Icon ? (
        <View style={styles.iconContainer}>
          <Icon 
            size={32} 
            color={theme.semantic.accent || tokens.colors.textPrimary} 
          />
        </View>
      ) : null}
      <Text style={[styles.title, { color: theme.semantic.text || tokens.colors.textPrimary }]}>
        {title}
      </Text>
      <Text style={[styles.description, { color: theme.semantic.textMuted || tokens.colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: tokens.radii.card,
    padding: tokens.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
  },
  iconContainer: {
    marginBottom: tokens.spacing.xxs,
  },
  title: {
    ...tokens.typography.h3,
    textAlign: 'center',
  },
  description: {
    ...tokens.typography.small,
    textAlign: 'center',
    lineHeight: 20,
  },
});