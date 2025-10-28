import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { getStatusColor, getStatusLabel } from '@/theme/status';
import { Checkpoint } from '@/types';

export type StatusPillProps = {
  status: Checkpoint['code'];
  label?: string;
};

export const StatusPill: React.FC<StatusPillProps> = ({ status, label }) => {
  const theme = useTheme();
  const pillColor = getStatusColor(status);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `${pillColor}1A`,
          borderColor: pillColor,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: pillColor }]} />
      <Text style={[styles.label, { color: pillColor }]}>{label ?? getStatusLabel(status)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
});
