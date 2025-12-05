import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { Shipment } from '@/types';
import { statusLabels } from '@/theme/status';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export const formatRelativeTime = (iso: string): string => {
  if (!iso) {
    return '';
  }

  return dayjs(iso).fromNow();
};

export const formatAbsoluteTime = (iso: string): string => {
  if (!iso) {
    return '';
  }

  return dayjs(iso).format('MMM D, YYYY • h:mm A');
};

export const formatShipmentStatus = (status: Shipment['status']): string =>
  statusLabels[status];

export const formatShipmentTitle = (shipment: Shipment): string => {
  const lastFour = shipment.trackingNo.slice(-4);
  return `${shipment.carrier} •··· ${lastFour}`;
};

export const formatShipmentSubtitle = (shipment: Shipment): string => {
  const latestCheckpoint = shipment.checkpoints[shipment.checkpoints.length - 1];
  if (!latestCheckpoint) {
    return '';
  }

  const relative = formatRelativeTime(latestCheckpoint.timeIso);
  return `${latestCheckpoint.location ?? 'Unknown location'} • ${relative}`;
};

export const shortTrackingNumber = (trackingNo: string): string => {
  if (trackingNo.length <= 8) {
    return trackingNo;
  }

  const prefix = trackingNo.slice(0, 4);
  const suffix = trackingNo.slice(-4);
  return `${prefix}····${suffix}`;
};
