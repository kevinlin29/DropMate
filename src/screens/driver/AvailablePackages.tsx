import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Package, MapPin, User, Phone, DollarSign } from 'lucide-react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';
import { RootStackParamList } from '@/navigation/types';
import { useAvailablePackagesQuery, useClaimPackageMutation } from '@/hooks/useDriverDeliveries';
import { AvailablePackage } from '@/types/backend';

type Props = NativeStackScreenProps<RootStackParamList, 'AvailablePackages'>;

export const AvailablePackagesScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { data: packages, isLoading, refetch } = useAvailablePackagesQuery();
  const claimMutation = useClaimPackageMutation();

  const handleClaimPackage = useCallback(
    (pkg: AvailablePackage) => {
      Alert.alert(
        'Claim Package',
        `Do you want to claim package ${pkg.tracking_number}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Claim',
            onPress: () => {
              claimMutation.mutate(pkg.id, {
                onSuccess: () => {
                  Alert.alert('Success', 'Package claimed successfully!');
                },
                onError: () => {
                  Alert.alert('Error', 'Failed to claim package. Please try again.');
                },
              });
            },
          },
        ]
      );
    },
    [claimMutation]
  );

  const renderPackageCard = ({ item }: { item: AvailablePackage }) => (
    <View style={[styles.packageCard, { backgroundColor: theme.semantic.surface }]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.trackingRow}>
          <Package color={theme.semantic.text} size={18} />
          <Text style={[styles.trackingNumber, { color: theme.semantic.text }]}>
            {item.tracking_number}
          </Text>
        </View>
        <View style={[styles.amountBadge, { backgroundColor: tokens.colors.success + '20' }]}>
          <DollarSign color={tokens.colors.success} size={14} />
          <Text style={[styles.amountText, { color: tokens.colors.success }]}>
            {item.total_amount}
          </Text>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <User color={theme.semantic.textMuted} size={16} />
          <Text style={[styles.infoText, { color: theme.semantic.text }]}>{item.customer_name}</Text>
        </View>
        {item.customer_phone && (
          <View style={styles.infoRow}>
            <Phone color={theme.semantic.textMuted} size={16} />
            <Text style={[styles.infoText, { color: theme.semantic.textMuted }]}>
              {item.customer_phone}
            </Text>
          </View>
        )}
      </View>

      {/* Addresses */}
      <View style={styles.addressSection}>
        <View style={styles.addressBlock}>
          <View style={styles.addressHeader}>
            <View style={[styles.addressDot, { backgroundColor: tokens.colors.success }]} />
            <Text style={[styles.addressLabel, { color: theme.semantic.textMuted }]}>Pickup</Text>
          </View>
          <Text
            style={[styles.addressText, { color: theme.semantic.text }]}
            numberOfLines={2}
          >
            {item.pickup_address}
          </Text>
        </View>

        <View style={styles.addressBlock}>
          <View style={styles.addressHeader}>
            <View style={[styles.addressDot, { backgroundColor: tokens.colors.error }]} />
            <Text style={[styles.addressLabel, { color: theme.semantic.textMuted }]}>Delivery</Text>
          </View>
          <Text
            style={[styles.addressText, { color: theme.semantic.text }]}
            numberOfLines={2}
          >
            {item.delivery_address}
          </Text>
        </View>
      </View>

      {/* Claim Button */}
      <Pressable
        style={[
          styles.claimButton,
          { backgroundColor: tokens.colors.packageOrange },
          claimMutation.isPending && { opacity: 0.7 },
        ]}
        onPress={() => handleClaimPackage(item)}
        disabled={claimMutation.isPending}
      >
        {claimMutation.isPending && claimMutation.variables === item.id ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.claimButtonText}>Claim Package</Text>
        )}
      </Pressable>

      {/* Created Date */}
      <Text style={[styles.createdText, { color: theme.semantic.textMuted }]}>
        Posted {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: tokens.colors.primaryBeige }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color={theme.semantic.text} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.semantic.text }]}>Available Packages</Text>
        <View style={styles.backButton} />
      </View>

      {/* Packages List */}
      <FlatList
        data={packages}
        renderItem={renderPackageCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={[styles.emptyState, { backgroundColor: theme.semantic.surface }]}>
            <Package color={theme.semantic.textMuted} size={48} />
            <Text style={[styles.emptyTitle, { color: theme.semantic.text }]}>
              No packages available
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.semantic.textMuted }]}>
              Check back later for new delivery opportunities
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  packageCard: {
    padding: 16,
    borderRadius: 16,
    gap: 12,
    ...tokens.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  amountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
  },
  infoSection: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
  addressSection: {
    gap: 12,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
  },
  addressBlock: {
    gap: 4,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 14,
    marginLeft: 14,
    lineHeight: 20,
  },
  claimButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createdText: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyState: {
    padding: 48,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    ...tokens.shadows.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
