import React from 'react';
import { Pressable, PressableProps, StyleSheet, Text, View } from 'react-native';

import { Shipment } from '@/types';
import { formatShipmentSubtitle, formatShipmentTitle } from '@/utils/format';
import { StatusPill } from './StatusPill';
import { Timeline } from './Timeline';
import { useTheme } from '@/theme/ThemeProvider';

export type ShipmentCardProps = PressableProps & {
  shipment: Shipment;
  compactTimeline?: boolean;
  footer?: React.ReactNode;
};

const ShipmentCardComponent: React.FC<ShipmentCardProps> = ({
  shipment,
  compactTimeline = true,
  footer,
  style: externalStyle,
  ...pressableProps
}) => {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => {
        const resolvedExternalStyle =
          typeof externalStyle === 'function' ? externalStyle({ pressed }) : externalStyle;

        return [
          styles.container,
          {
            backgroundColor: theme.semantic.surface,
            borderColor: theme.semantic.border,
            opacity: pressed ? 0.95 : 1,
          },
          resolvedExternalStyle,
        ];
      }}
      {...pressableProps}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleColumn}>
          <Text style={[styles.title, { color: theme.semantic.text }]}>{formatShipmentTitle(shipment)}</Text>
          <Text style={[styles.subtitle, { color: theme.semantic.textMuted }]}>
            {formatShipmentSubtitle(shipment)}
          </Text>
        </View>
        <StatusPill status={shipment.status} />
      </View>
      <View style={styles.timelineWrapper}>
        <Timeline
          checkpoints={shipment.checkpoints}
          activeStatus={shipment.status}
          compact={compactTimeline}
        />
      </View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </Pressable>
  );
};

export const ShipmentCard = React.memo(ShipmentCardComponent);

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleColumn: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
  },
  timelineWrapper: {
    flex: 1,
  },
  footer: {
    marginTop: 4,
  },
});
