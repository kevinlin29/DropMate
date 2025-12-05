import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';
import type { LucideIcon } from 'lucide-react-native';

type DriverStatsCardProps = {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color: string;
};

export const DriverStatsCard: React.FC<DriverStatsCardProps> = ({
  icon: Icon,
  label,
  value,
  color,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.semantic.surface }]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Icon color={color} size={20} />
      </View>
      <Text style={[styles.value, { color: theme.semantic.text }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.semantic.textMuted }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    ...tokens.shadows.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});
