import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { useShipmentsListQuery } from '@/hooks/useShipmentsQuery';
import { useTheme } from '@/theme/ThemeProvider';
import { simulateDeliveredEvent } from './mock';

export type NotificationsGateProps = {
  children?: React.ReactNode;
};

export const NotificationsGate: React.FC<NotificationsGateProps> = ({ children }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(false);
  const { data: shipments } = useShipmentsListQuery();

  const targetShipmentId = useMemo(() => shipments?.[0]?.id, [shipments]);

  const handleSimulate = async () => {
    if (!targetShipmentId) {
      return;
    }

    await simulateDeliveredEvent(targetShipmentId, queryClient);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.semantic.surface }]}> 
      <View style={styles.row}>
        <View style={styles.textColumn}>
          <Text style={[styles.title, { color: theme.semantic.text }]}>Notifications</Text>
          <Text style={[styles.subtitle, { color: theme.semantic.textMuted }]}>
            Enable push alerts for key shipment milestones.
          </Text>
        </View>
        <Switch value={enabled} onValueChange={setEnabled} />
      </View>
      {enabled ? (
        <Pressable
          accessibilityRole="button"
          onPress={handleSimulate}
          style={({ pressed }) => [
            styles.mockButton,
            {
              backgroundColor: theme.colors.accent,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          disabled={!targetShipmentId}
        >
          <Text style={styles.mockButtonLabel}>Trigger mock Delivered</Text>
        </Pressable>
      ) : null}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textColumn: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
  },
  mockButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  mockButtonLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
