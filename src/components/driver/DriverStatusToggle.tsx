import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';

type DriverStatusToggleProps = {
  isOnline: boolean;
  onToggle: (value: boolean) => void;
  compact?: boolean;
};

export const DriverStatusToggle: React.FC<DriverStatusToggleProps> = ({
  isOnline,
  onToggle,
  compact = false,
}) => {
  const theme = useTheme();

  if (compact) {
    return (
      <Switch
        value={isOnline}
        onValueChange={onToggle}
        trackColor={{
          false: theme.semantic.border,
          true: tokens.colors.success,
        }}
        thumbColor="#fff"
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isOnline ? tokens.colors.success : theme.semantic.textMuted },
          ]}
        />
        <Text style={[styles.label, { color: theme.semantic.text }]}>
          {isOnline ? 'Online' : 'Offline'}
        </Text>
      </View>
      <Switch
        value={isOnline}
        onValueChange={onToggle}
        trackColor={{
          false: theme.semantic.border,
          true: tokens.colors.success,
        }}
        thumbColor="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
