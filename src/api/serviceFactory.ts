import { USE_HTTP } from './env';
import { IShipmentsService } from './IShipmentsService';
import { getLocalShipmentsService } from './LocalShipmentsService';
import { getHttpShipmentsService } from './HttpShipmentsService';

let serviceInstance: IShipmentsService | undefined;

export const getShipmentsService = (): IShipmentsService => {
  if (!serviceInstance) {
    serviceInstance = USE_HTTP ? getHttpShipmentsService() : getLocalShipmentsService();
  }

  return serviceInstance;
};
