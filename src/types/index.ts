// Export shipment types (legacy frontend types - used by existing UI)
export * from './shipment';

// Export backend types with aliases to avoid conflicts
export type {
  // User & Auth
  UserRole,
  User,
  Customer,
  Driver,
  // Shipments - aliased to avoid conflict with legacy type
  ShipmentStatus,
  PackageStatus,
  Shipment as BackendShipment,
  ShipmentWithDriver,
  ShipmentWithLocation,
  // Orders
  Order,
  OrderWithShipments,
  // Events
  ShipmentEventType,
  ShipmentEvent,
  DriverLocationEvent,
  // API types
  UserStats,
  CreateShipmentLegacy,
  CreateShipmentEnhanced,
  CreateShipmentInput,
  CreateShipmentResponse,
  RegisterDriverInput,
  RegisterDriverResponse,
  UpdateDriverProfileInput,
  AvailablePackage,
  AvailablePackagesResponse,
  ClaimPackageResponse,
  // DeliveryItem aliased to avoid conflict
  DeliveryItem as BackendDeliveryItem,
  DriverDeliveriesResponse,
  UpdateDeliveryStatusInput,
  AddDeliveryEventInput,
  AddDeliveryEventResponse,
  ShipmentHistoryResponse,
  RecordLocationInput,
  RecordLocationResponse,
  LatestLocationResponse,
  LocationHistoryResponse,
  ShipmentLocationResponse,
  UpdateUserProfileInput,
} from './backend';
