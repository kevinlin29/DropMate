import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driverService } from '@/api/driverService';
import { driverKeys } from '@/api/queryKeys';
import { useAppSelector } from '@/store/hooks';
import type {
  AvailablePackage,
  DeliveryItem,
  RegisterDriverInput,
  UpdateDriverProfileInput,
  AddDeliveryEventInput,
  ShipmentStatus,
} from '@/types/backend';

// ==================== Queries ====================

export const useAvailablePackagesQuery = () => {
  const authStatus = useAppSelector((state) => state.auth.status);
  const isAuthenticated = authStatus === 'authenticated';

  return useQuery({
    queryKey: driverKeys.availablePackages(),
    queryFn: async () => {
      const response = await driverService.getAvailablePackages();
      return response as { count: number; packages: AvailablePackage[] };
    },
    staleTime: 30 * 1000, // 30 seconds - packages change frequently
    enabled: isAuthenticated, // Only fetch when authenticated
  });
};

export const useDriverDeliveriesQuery = (status?: ShipmentStatus) => {
  const authStatus = useAppSelector((state) => state.auth.status);
  const isAuthenticated = authStatus === 'authenticated';

  return useQuery({
    queryKey: driverKeys.deliveries(status),
    queryFn: async () => {
      const response = await driverService.getDeliveries(status);
      return response as { driverId: number; count: number; deliveries: DeliveryItem[] };
    },
    staleTime: 30 * 1000,
    enabled: isAuthenticated, // Only fetch when authenticated
  });
};

export const useDeliveryDetailQuery = (deliveryId: number) => {
  return useQuery({
    queryKey: driverKeys.delivery(deliveryId),
    queryFn: async () => {
      // Get deliveries and find the specific one
      const response = await driverService.getDeliveries();
      const delivery = (response as { deliveries: DeliveryItem[] }).deliveries.find(
        (d) => d.id === deliveryId
      );
      if (!delivery) {
        throw new Error('Delivery not found');
      }
      return delivery;
    },
    enabled: !!deliveryId,
  });
};

// ==================== Mutations ====================

export const useDriverRegistrationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterDriverInput) => driverService.registerAsDriver(input),
    onSuccess: () => {
      // Invalidate user profile to refresh role
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};

export const useUpdateDriverProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateDriverProfileInput) => driverService.updateProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: driverKeys.profile() });
    },
  });
};

export const useClaimPackageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (packageId: number) => driverService.claimPackage(packageId),
    onSuccess: () => {
      // Invalidate both available packages and deliveries
      queryClient.invalidateQueries({ queryKey: driverKeys.availablePackages() });
      queryClient.invalidateQueries({ queryKey: driverKeys.deliveries() });
    },
    onError: (error) => {
      console.error('Failed to claim package:', error);
    },
  });
};

export const useUpdateDeliveryStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ deliveryId, status }: { deliveryId: number; status: 'in_transit' | 'delivered' }) =>
      driverService.updateDeliveryStatus(deliveryId, { status }),
    onSuccess: (_, variables) => {
      // Invalidate deliveries list and specific delivery
      queryClient.invalidateQueries({ queryKey: driverKeys.deliveries() });
      queryClient.invalidateQueries({ queryKey: driverKeys.delivery(variables.deliveryId) });
    },
  });
};

export const useAddDeliveryEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ deliveryId, event }: { deliveryId: number; event: AddDeliveryEventInput }) =>
      driverService.addDeliveryEvent(deliveryId, event),
    onSuccess: (_, variables) => {
      // Invalidate the specific delivery to refresh events
      queryClient.invalidateQueries({ queryKey: driverKeys.delivery(variables.deliveryId) });
    },
  });
};
