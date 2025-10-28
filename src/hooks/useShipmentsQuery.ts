import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getShipmentsService } from '@/api/serviceFactory';
import { shipmentKeys } from '@/api/queryKeys';
import { ListShipmentsOptions } from '@/api/IShipmentsService';

const service = getShipmentsService();

export const useShipmentsListQuery = (options?: ListShipmentsOptions) => {
  const filters = useMemo(
    () => ({
      query: options?.query?.trim() ?? undefined,
      status: options?.status,
    }),
    [options?.query, options?.status],
  );

  return useQuery({
    queryKey: shipmentKeys.list({
      query: filters.query ?? 'all',
      status: filters.status ?? 'all',
    }),
    queryFn: () => service.list(filters),
  });
};

export const useShipmentQuery = (shipmentId?: string) => {
  return useQuery({
    enabled: Boolean(shipmentId),
    queryKey: shipmentId ? shipmentKeys.detail(shipmentId) : shipmentKeys.detail('unknown'),
    queryFn: () => (shipmentId ? service.get(shipmentId) : Promise.resolve(undefined)),
  });
};

export const useShipmentRouteQuery = (shipmentId?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    enabled: Boolean(shipmentId),
    queryKey: shipmentId ? shipmentKeys.route(shipmentId) : shipmentKeys.route('unknown'),
    queryFn: () => (shipmentId ? service.getRoute(shipmentId) : Promise.resolve({ coordinates: [] })),
    staleTime: 15 * 1000,
    placeholderData: () => {
      if (!shipmentId) {
        return undefined;
      }

      return queryClient.getQueryData(shipmentKeys.route(shipmentId));
    },
  });
};
