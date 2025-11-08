import { Checkpoint } from '@/types/shipment';
import { tokens } from './tokens';

type StatusColorMap = Record<Checkpoint['code'], string>;

type StatusTextMap = Record<Checkpoint['code'], string>;

export const statusColors: StatusColorMap = {
  CREATED: tokens.colors.statusCreated,
  IN_TRANSIT: tokens.colors.statusInTransit,
  OUT_FOR_DELIVERY: tokens.colors.statusOutForDelivery,
  DELIVERED: tokens.colors.statusDelivered,
  EXCEPTION: tokens.colors.statusException,
};

export const statusLabels: StatusTextMap = {
  CREATED: 'Created',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  EXCEPTION: 'Exception',
};

export const getStatusColor = (status: Checkpoint['code']): string => statusColors[status];

export const getStatusLabel = (status: Checkpoint['code']): string => statusLabels[status];