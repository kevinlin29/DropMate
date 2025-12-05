import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';

const illustration = require('@/../assets/images/empty-state.png');

export type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onActionPress,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Image source={illustration} style={styles.image} resizeMode="contain" />
      <Text style={[styles.title, { color: theme.semantic.text || tokens.colors.textPrimary }]}>
        {title}
      </Text>
      <Text style={[styles.description, { color: theme.semantic.textMuted || tokens.colors.textSecondary }]}>
        {description}
      </Text>
      {actionLabel && onActionPress ? (
        <TouchableOpacity
          accessibilityRole="button"
          style={[
            styles.button, 
            { backgroundColor: theme.semantic.accent || tokens.colors.textPrimary }
          ]}
          onPress={onActionPress}
        >
          <Text style={styles.buttonLabel}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.xl,
    gap: tokens.spacing.md,
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: tokens.spacing.xs,
  },
  title: {
    ...tokens.typography.h3,
    textAlign: 'center',
  },
  description: {
    ...tokens.typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radii.pill,
    ...tokens.shadows.sm,
  },
  buttonLabel: {
    color: tokens.colors.surface,
    ...tokens.typography.button,
  },
});