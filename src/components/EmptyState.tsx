import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { useTheme } from '@/theme/ThemeProvider';

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
      <Text style={[styles.title, { color: theme.semantic.text }]}>{title}</Text>
      <Text style={[styles.description, { color: theme.semantic.textMuted }]}>{description}</Text>
      {actionLabel && onActionPress ? (
        <TouchableOpacity
          accessibilityRole="button"
          style={[styles.button, { backgroundColor: theme.colors.primaryTeal }]}
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
    paddingHorizontal: 24,
    gap: 16,
  },
  image: {
    width: 180,
    height: 180,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
