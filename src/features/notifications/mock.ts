import { QueryClient } from '@tanstack/react-query';

import { shipmentKeys } from '@/api/queryKeys';
import { getShipmentsService } from '@/api/serviceFactory';
import { Shipment } from '@/types';
import { getLocalShipmentsService } from '@/api/LocalShipmentsService';

const isShipmentArray = (data: unknown): data is Shipment[] => Array.isArray(data);

export const simulateDeliveredEvent = async (
  shipmentId: string,
  queryClient: QueryClient,
): Promise<Shipment | undefined> => {
  if (!shipmentId) {
    return undefined;
  }

  const service = getShipmentsService();
  const shipment = await service.get(shipmentId);

  if (!shipment) {
    return undefined;
  }

  let updatedShipment: Shipment = {
    ...shipment,
  };

  if (service === getLocalShipmentsService()) {
    const localUpdated = await getLocalShipmentsService().markAsDelivered(shipmentId);
    if (localUpdated) {
      updatedShipment = localUpdated;
    }
  } else {
    const now = new Date().toISOString();
    const hasDelivered = shipment.checkpoints.some((checkpoint) => checkpoint.code === 'DELIVERED');
    updatedShipment = {
      ...shipment,
      status: 'DELIVERED',
      lastUpdatedIso: now,
      checkpoints: hasDelivered
        ? shipment.checkpoints
        : [
            ...shipment.checkpoints,
            {
              code: 'DELIVERED',
              label: 'Delivered',
              timeIso: now,
              location: shipment.checkpoints[shipment.checkpoints.length - 1]?.location,
            },
          ],
    };
  }

  queryClient.setQueryData(shipmentKeys.detail(shipmentId), updatedShipment);

  queryClient
    .getQueryCache()
    .findAll({ queryKey: ['shipments'] })
    .forEach((query) => {
      const current = query.state.data;
      if (!isShipmentArray(current)) {
        return;
      }

      const next = current.map((item) => (item.id === shipmentId ? updatedShipment : item));
      queryClient.setQueryData(query.queryKey, next);
    });

  return updatedShipment;
};
