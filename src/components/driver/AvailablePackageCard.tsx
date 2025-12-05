import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Package, MapPin, User, DollarSign } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';
import type { AvailablePackage } from '@/types/backend';

type AvailablePackageCardProps = {
  package: AvailablePackage;
  onClaim: () => void;
  isClaiming: boolean;
};

export const AvailablePackageCard: React.FC<AvailablePackageCardProps> = ({
  package: pkg,
  onClaim,
  isClaiming,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.semantic.surface }]}>
      <View style={styles.header}>
        <View style={styles.trackingContainer}>
          <Package color={tokens.colors.primary} size={18} />
          <Text style={[styles.trackingNumber, { color: theme.semantic.text }]}>
            {pkg.tracking_number}
          </Text>
        </View>
        {pkg.total_amount && (
          <View style={styles.amountContainer}>
            <DollarSign color={tokens.colors.success} size={14} />
            <Text style={[styles.amount, { color: tokens.colors.success }]}>
              {pkg.total_amount}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.addressSection}>
        <View style={styles.addressRow}>
          <View style={[styles.addressDot, { backgroundColor: tokens.colors.primary }]} />
          <View style={styles.addressContent}>
            <Text style={[styles.addressLabel, { color: theme.semantic.textMuted }]}>
              Pickup
            </Text>
            <Text style={[styles.addressText, { color: theme.semantic.text }]} numberOfLines={1}>
              {pkg.pickup_address}
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
              {pkg.delivery_address}
            </Text>
          </View>
        </View>
      </View>

      {/* Customer Info */}
      {pkg.customer_name && (
        <View style={[styles.customerRow, { borderTopColor: theme.semantic.border }]}>
          <User color={theme.semantic.textMuted} size={14} />
          <Text style={[styles.customerText, { color: theme.semantic.textMuted }]}>
            {pkg.customer_name}
          </Text>
        </View>
      )}

      {/* Claim Button */}
      <Pressable
        style={({ pressed }) => [
          styles.claimButton,
          {
            backgroundColor: tokens.colors.primary,
            opacity: pressed || isClaiming ? 0.8 : 1,
          },
        ]}
        onPress={onClaim}
        disabled={isClaiming}
      >
        {isClaiming ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.claimButtonText}>Claim Package</Text>
        )}
      </Pressable>
    </View>
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
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  amount: {
    fontSize: 15,
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
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  customerText: {
    fontSize: 13,
  },
  claimButton: {
    margin: 16,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
