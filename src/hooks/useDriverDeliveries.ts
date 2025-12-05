import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driverService } from '@/api/driverService';
import { driverKeys } from '@/api/queryKeys';
import type { ShipmentStatus, ShipmentEventType } from '@/types/backend';

/**
 * Hook to fetch driver's deliveries
 */
export const useDriverDeliveriesQuery = (status?: ShipmentStatus) => {
  return useQuery({
    queryKey: driverKeys.deliveriesByStatus(status),
    queryFn: async () => {
      const response = await driverService.getDeliveries(status);
      return response.deliveries;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to fetch available packages to claim
 */
export const useAvailablePackagesQuery = (limit: number = 50) => {
  return useQuery({
    queryKey: driverKeys.availablePackages(),
    queryFn: async () => {
      const response = await driverService.getAvailablePackages(limit);
      return response.packages;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Hook to update delivery status
 */
export const useUpdateDeliveryStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ deliveryId, status }: { deliveryId: number; status: 'in_transit' | 'delivered' }) =>
      driverService.updateDeliveryStatus(deliveryId, { status }),
    onSuccess: () => {
      // Invalidate all delivery queries to refresh data
      queryClient.invalidateQueries({ queryKey: driverKeys.deliveries() });
    },
  });
};

/**
 * Hook to claim a package
 */
export const useClaimPackageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (packageId: number) => driverService.claimPackage(packageId),
    onSuccess: () => {
      // Invalidate both available packages and deliveries
      queryClient.invalidateQueries({ queryKey: driverKeys.availablePackages() });
      queryClient.invalidateQueries({ queryKey: driverKeys.deliveries() });
    },
  });
};

/**
 * Hook to add a delivery event
 */
export const useAddDeliveryEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      deliveryId,
      eventType,
      description,
      latitude,
      longitude,
    }: {
      deliveryId: number;
      eventType: ShipmentEventType;
      description: string;
      latitude?: number;
      longitude?: number;
    }) =>
      driverService.addDeliveryEvent(deliveryId, {
        eventType,
        description,
        latitude,
        longitude,
      }),
    onSuccess: (_, variables) => {
      // Invalidate the specific delivery detail
      queryClient.invalidateQueries({
        queryKey: driverKeys.deliveryDetail(variables.deliveryId),
      });
    },
  });
};
