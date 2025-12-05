import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';
import { Checkpoint } from '@/types';

export type StatusPillProps = {
  status: Checkpoint['code'];
  label?: string;
  variant?: 'solid' | 'outlined'; // New design uses solid, keep outlined as option
};

export const StatusPill: React.FC<StatusPillProps> = ({ 
  status, 
  label,
  variant = 'solid' 
}) => {
  const theme = useTheme();

  const getStatusColor = () => {
    switch (status) {
      case 'IN_TRANSIT':
        return tokens.colors.statusInTransit;
      case 'OUT_FOR_DELIVERY':
        return tokens.colors.statusOutForDelivery;
      case 'DELIVERED':
        return tokens.colors.statusDelivered;
      case 'EXCEPTION':
        return tokens.colors.statusException;
      case 'CREATED':
        return tokens.colors.statusCreated;
      default:
        return tokens.colors.statusInTransit;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'IN_TRANSIT':
        return 'In Transit';
      case 'OUT_FOR_DELIVERY':
        return 'Out for Delivery';
      case 'DELIVERED':
        return 'Delivered';
      case 'EXCEPTION':
        return 'Exception';
      case 'CREATED':
        return 'Created';
      default:
        return 'In Transit';
    }
  };

  const pillColor = getStatusColor();
  const displayLabel = label ?? getStatusLabel();

  // Solid variant (new design)
  if (variant === 'solid') {
    return (
      <View
        style={[
          styles.containerSolid,
          {
            backgroundColor: pillColor,
          },
        ]}
      >
        <Text style={styles.labelSolid}>{displayLabel}</Text>
      </View>
    );
  }

  // Outlined variant (original design - kept for backwards compatibility)
  return (
    <View
      style={[
        styles.containerOutlined,
        {
          backgroundColor: `${pillColor}1A`,
          borderColor: pillColor,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: pillColor }]} />
      <Text style={[styles.labelOutlined, { color: pillColor }]}>{displayLabel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Solid variant (new design)
  containerSolid: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: tokens.radii.badge,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xxs + 2,
  },
  labelSolid: {
    color: tokens.colors.surface,
    ...tokens.typography.badge,
  },
  
  // Outlined variant (original design)
  containerOutlined: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: tokens.radii.pill,
    borderWidth: 1,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xxs,
    gap: tokens.spacing.xxs + 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  labelOutlined: {
    ...tokens.typography.captionMedium,
  },
});