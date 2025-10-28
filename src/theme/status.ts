import { Checkpoint } from '@/types/shipment';
import { tokens } from './tokens';

type StatusColorMap = Record<Checkpoint['code'], string>;

type StatusTextMap = Record<Checkpoint['code'], string>;

export const statusColors: StatusColorMap = {
  CREATED: tokens.colors.accent,
  IN_TRANSIT: tokens.colors.primaryTeal,
  OUT_FOR_DELIVERY: tokens.colors.warning,
  DELIVERED: tokens.colors.success,
  EXCEPTION: tokens.colors.error,
};

export const statusLabels: StatusTextMap = {
  CREATED: 'Label created',
  IN_TRANSIT: 'In transit',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  EXCEPTION: 'Exception',
};

export const getStatusColor = (status: Checkpoint['code']): string => statusColors[status];

export const getStatusLabel = (status: Checkpoint['code']): string => statusLabels[status];
