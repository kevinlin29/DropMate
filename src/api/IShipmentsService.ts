import { Shipment } from '@/types';

export type ListShipmentsOptions = {
  query?: string;
  status?: Shipment['status'];
};

export type CreateShipmentInput = {
  trackingNo: string;
  carrier: Shipment['carrier'];
  nickname?: string;
};

export type ShipmentRoute = {
  coordinates: Array<{ lat: number; lng: number }>;
  etaIso?: string;
};

export interface IShipmentsService {
  list(options?: ListShipmentsOptions): Promise<Shipment[]>;
  get(id: string): Promise<Shipment | undefined>;
  create(input: CreateShipmentInput): Promise<Shipment>;
  delete(id: string): Promise<void>;
  getRoute(id: string): Promise<ShipmentRoute>;
}
