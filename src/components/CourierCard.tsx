import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Checkpoint } from '@/types';
import { useTheme } from '@/theme/ThemeProvider';
import { StatusPill } from './StatusPill';
import { formatRelativeTime } from '@/utils/format';

export type CourierCardProps = {
  status: Checkpoint['code'];
  etaIso?: string;
  location?: string;
  updatedIso?: string;
  onPress?: () => void;
};

export const CourierCard: React.FC<CourierCardProps> = ({
  status,
  etaIso,
  location,
  updatedIso,
  onPress,
}) => {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'summary'}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.semantic.surface,
          borderColor: theme.semantic.border,
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: theme.semantic.text }]}>Courier status</Text>
        <StatusPill status={status} />
      </View>
      {etaIso ? (
        <Text style={[styles.primary, { color: theme.semantic.text }]}>{`Arriving ${formatRelativeTime(
          etaIso,
        )}`}</Text>
      ) : null}
      {location ? (
        <Text style={[styles.secondary, { color: theme.semantic.textMuted }]}>Near {location}</Text>
      ) : null}
      {updatedIso ? (
        <Text style={[styles.tertiary, { color: theme.semantic.textMuted }]}>Updated {formatRelativeTime(updatedIso)}</Text>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
  },
  primary: {
    fontSize: 16,
    fontWeight: '500',
  },
  secondary: {
    fontSize: 14,
  },
  tertiary: {
    fontSize: 13,
  },
});
