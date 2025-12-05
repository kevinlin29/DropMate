import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Package, MapPin, Clock, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';
import type { DeliveryItem } from '@/types/backend';

type DeliveryCardProps = {
  delivery: DeliveryItem;
  onPress: () => void;
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'assigned':
      return { label: 'Assigned', color: tokens.colors.primary };
    case 'in_transit':
      return { label: 'In Transit', color: tokens.colors.warning };
    case 'delivered':
      return { label: 'Delivered', color: tokens.colors.success };
    default:
      return { label: status, color: tokens.colors.textMuted };
  }
};

export const DeliveryCard: React.FC<DeliveryCardProps> = ({ delivery, onPress }) => {
  const theme = useTheme();
  const statusConfig = getStatusConfig(delivery.status);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.semantic.surface,
          opacity: pressed ? 0.95 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.trackingContainer}>
          <Package color={tokens.colors.primary} size={18} />
          <Text style={[styles.trackingNumber, { color: theme.semantic.text }]}>
            {delivery.tracking_number}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <View style={styles.addressSection}>
        <View style={styles.addressRow}>
          <View style={[styles.addressDot, { backgroundColor: tokens.colors.primary }]} />
          <View style={styles.addressContent}>
            <Text style={[styles.addressLabel, { color: theme.semantic.textMuted }]}>
              Pickup
            </Text>
            <Text style={[styles.addressText, { color: theme.semantic.text }]} numberOfLines={1}>
              {delivery.pickup_address}
            </Text>
          </View>
        </View>
        <View style={[styles.addressLine, { backgroundColor: theme.semantic.border }]} />
        <View style={styles.addressRow}>
          <View style={[styles.addressDot, { backgroundColor: tokens.colors.success }]} />
          <View style={styles.addressContent}>
            <Text style={[styles.addressLabel, { color: theme.semantic.textMuted }]}>
              Delivery
            </Text>
            <Text style={[styles.addressText, { color: theme.semantic.text }]} numberOfLines={1}>
              {delivery.delivery_address}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.semantic.border }]}>
        <View style={styles.footerInfo}>
          {delivery.customer_name && (
            <Text style={[styles.customerName, { color: theme.semantic.textMuted }]}>
              {delivery.customer_name}
            </Text>
          )}
        </View>
        <ChevronRight color={theme.semantic.textMuted} size={20} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    ...tokens.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  trackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackingNumber: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addressSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  addressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  addressLine: {
    width: 2,
    height: 16,
    marginLeft: 4,
    marginVertical: 4,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  footerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 13,
  },
});
