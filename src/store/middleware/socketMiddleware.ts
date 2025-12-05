import { Middleware } from '@reduxjs/toolkit';
import { notificationService, ShipmentStatusUpdate, ShipmentLocationUpdate } from '@/api/notificationClient';
import { QueryClient } from '@tanstack/react-query';
import { shipmentKeys } from '@/api/queryKeys';

// Action types for WebSocket control
export const SOCKET_CONNECT = 'socket/connect';
export const SOCKET_DISCONNECT = 'socket/disconnect';
export const SOCKET_CONNECTED = 'socket/connected';
export const SOCKET_DISCONNECTED = 'socket/disconnected';
export const SOCKET_SHIPMENT_STATUS_UPDATE = 'socket/shipmentStatusUpdate';
export const SOCKET_SHIPMENT_LOCATION_UPDATE = 'socket/shipmentLocationUpdate';
export const SOCKET_DRIVER_LOCATION_UPDATE = 'socket/driverLocationUpdate';

// Action creators
export const connectSocket = () => ({ type: SOCKET_CONNECT });
export const disconnectSocket = () => ({ type: SOCKET_DISCONNECT });
export const socketConnected = (socketId: string) => ({ type: SOCKET_CONNECTED, payload: socketId });
export const socketDisconnected = () => ({ type: SOCKET_DISCONNECTED });
export const shipmentStatusUpdate = (data: ShipmentStatusUpdate) => ({
  type: SOCKET_SHIPMENT_STATUS_UPDATE,
  payload: data,
});
export const shipmentLocationUpdate = (data: ShipmentLocationUpdate) => ({
  type: SOCKET_SHIPMENT_LOCATION_UPDATE,
  payload: data,
});
export const driverLocationUpdate = (data: any) => ({
  type: SOCKET_DRIVER_LOCATION_UPDATE,
  payload: data,
});

// Create socket middleware factory that accepts QueryClient
export const createSocketMiddleware = (queryClient: QueryClient): Middleware => {
  let isConnected = false;

  return (store) => (next) => (action: any) => {
    switch (action.type) {
      case SOCKET_CONNECT: {
        if (isConnected) {
          console.log('🔌 [SOCKET MIDDLEWARE] Already connected, skipping...');
          return next(action);
        }

        console.log('🔌 [SOCKET MIDDLEWARE] Connecting WebSocket...');

        notificationService.connect({
          onConnected: (data) => {
            console.log('✅ [SOCKET MIDDLEWARE] WebSocket connected:', data.socketId);
            isConnected = true;
            store.dispatch(socketConnected(data.socketId));
          },

          onShipmentStatusUpdate: (data: ShipmentStatusUpdate) => {
            console.log('📦 [SOCKET MIDDLEWARE] Shipment status update:', data);

            // Dispatch Redux action
            store.dispatch(shipmentStatusUpdate(data));

            // Invalidate React Query cache
            console.log('🔄 [SOCKET MIDDLEWARE] Invalidating React Query cache...');
            queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
            queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(String(data.shipmentId)) });
            queryClient.invalidateQueries({ queryKey: shipmentKeys.route(String(data.shipmentId)) });
          },

          onShipmentLocationUpdate: (data: ShipmentLocationUpdate) => {
            console.log('📍 [SOCKET MIDDLEWARE] Shipment location update:', data.shipmentId);

            // Dispatch Redux action
            store.dispatch(shipmentLocationUpdate(data));

            // Invalidate React Query cache
            queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(String(data.shipmentId)) });
            queryClient.invalidateQueries({ queryKey: shipmentKeys.route(String(data.shipmentId)) });
          },

          onDriverLocationUpdate: (data) => {
            console.log('🚗 [SOCKET MIDDLEWARE] Driver location update:', data.driverId);

            // Dispatch Redux action
            store.dispatch(driverLocationUpdate(data));

            // Invalidate React Query cache for driver
            queryClient.invalidateQueries({ queryKey: ['driver', data.driverId] });
          },

          onDisconnect: () => {
            console.log('🔌 [SOCKET MIDDLEWARE] WebSocket disconnected');
            isConnected = false;
            store.dispatch(socketDisconnected());
          },

          onError: (error) => {
            console.error('🔴 [SOCKET MIDDLEWARE] WebSocket error:', error);
          },
        });
        break;
      }

      case SOCKET_DISCONNECT: {
        if (!isConnected) {
          console.log('🔌 [SOCKET MIDDLEWARE] Already disconnected, skipping...');
          return next(action);
        }

        console.log('🔌 [SOCKET MIDDLEWARE] Disconnecting WebSocket...');
        notificationService.disconnect();
        isConnected = false;
        store.dispatch(socketDisconnected());
        break;
      }
    }

    return next(action);
  };
};
