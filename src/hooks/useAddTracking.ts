import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateShipmentInput } from '@/api/IShipmentsService';
import { getShipmentsService } from '@/api/serviceFactory';
import { shipmentKeys } from '@/api/queryKeys';

const service = getShipmentsService();

export const useAddTracking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateShipmentInput) => service.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
    },
  });
};
