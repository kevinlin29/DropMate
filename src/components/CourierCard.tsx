import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Checkpoint } from '@/types';
import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';

export type CourierCardProps = {
  trackingNumber: string;
  status: Checkpoint['code'];
  origin: string;
  destination: string;
  originDate: string;
  destinationDate: string;
  progress: number; // 0-100
  etaIso?: string;
  location?: string;
  updatedIso?: string;
  onPress?: () => void;
};

export const CourierCard: React.FC<CourierCardProps> = ({
  trackingNumber,
  status,
  origin,
  destination,
  originDate,
  destinationDate,
  progress,
  onPress,
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

  const statusColor = getStatusColor();

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'summary'}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.semantic.surface || tokens.colors.surface,
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      <View style={styles.cardContent}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{getStatusLabel()}</Text>
        </View>

        {/* Tracking Number */}
        <Text style={[styles.trackingNumber, { color: theme.semantic.text || tokens.colors.textPrimary }]}>
          #{trackingNumber}
        </Text>

        {/* Progress Timeline */}
        <View style={styles.timelineContainer}>
          <View style={[styles.timeline, { backgroundColor: theme.semantic.border || tokens.colors.timelineInactive }]}>
            {/* Start Dot */}
            <View style={[styles.timelineStart, { backgroundColor: statusColor }]} />
            
            {/* Progress Bar */}
            <View
              style={[
                styles.timelineBar,
                { 
                  width: `${progress}%`, 
                  backgroundColor: statusColor 
                },
              ]}
            />
            
            {/* End Dot */}
            <View
              style={[
                styles.timelineEnd,
                {
                  backgroundColor: progress === 100 ? statusColor : (theme.semantic.surface || tokens.colors.surface),
                  borderColor: statusColor,
                },
              ]}
            />
          </View>
        </View>

        {/* Location Info */}
        <View style={styles.locationRow}>
          <View style={styles.locationItem}>
            <Text style={[styles.locationName, { color: theme.semantic.text || tokens.colors.textPrimary }]}>
              {origin}
            </Text>
            <Text style={[styles.locationDate, { color: theme.semantic.textMuted || tokens.colors.textSecondary }]}>
              {originDate}
            </Text>
          </View>
          <View style={[styles.locationItem, styles.locationItemRight]}>
            <Text style={[styles.locationName, { color: theme.semantic.text || tokens.colors.textPrimary }]}>
              {destination}
            </Text>
            <Text style={[styles.locationDate, { color: theme.semantic.textMuted || tokens.colors.textSecondary }]}>
              {destinationDate}
            </Text>
          </View>
        </View>
      </View>

      {/* 3D Package Illustration */}
      <View style={styles.packageIllustration}>
        <View style={styles.packageBox}>
          <View style={styles.packageTop} />
          <View style={styles.packageFront} />
          <View style={styles.packageSide} />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
    borderRadius: tokens.radii.card,
    overflow: 'visible',
    ...tokens.shadows.md,
  },
  cardContent: {
    padding: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xxs + 2,
    borderRadius: tokens.radii.badge,
    marginBottom: tokens.spacing.sm,
  },
  statusText: {
    color: tokens.colors.surface,
    ...tokens.typography.badge,
  },
  trackingNumber: {
    ...tokens.typography.trackingNumber,
    marginBottom: tokens.spacing.lg,
  },
  timelineContainer: {
    marginBottom: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.xxs + 2,
  },
  timeline: {
    height: 4,
    borderRadius: 2,
    position: 'relative',
    overflow: 'visible',
  },
  timelineBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 2,
  },
  timelineStart: {
    position: 'absolute',
    left: -6,
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineEnd: {
    position: 'absolute',
    right: -6,
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationItem: {
    flex: 1,
  },
  locationItemRight: {
    alignItems: 'flex-end',
  },
  locationName: {
    ...tokens.typography.smallSemibold,
    marginBottom: tokens.spacing.xxs,
  },
  locationDate: {
    ...tokens.typography.caption,
  },
  packageIllustration: {
    position: 'absolute',
    right: tokens.spacing.lg,
    bottom: tokens.spacing.lg,
    width: 100,
    height: 100,
  },
  packageBox: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  packageTop: {
    position: 'absolute',
    top: 0,
    right: 10,
    width: 50,
    height: 35,
    backgroundColor: tokens.colors.packageLight,
    borderRadius: tokens.spacing.xxs,
    transform: [{ skewY: '-20deg' }],
  },
  packageFront: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 60,
    height: 60,
    backgroundColor: tokens.colors.packageOrange,
    borderRadius: tokens.spacing.xxs,
  },
  packageSide: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 60,
    backgroundColor: tokens.colors.packageDark,
    borderRadius: tokens.spacing.xxs,
    transform: [{ skewY: '20deg' }],
  },
});