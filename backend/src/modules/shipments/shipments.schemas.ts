import { z } from 'zod';

const SHIPMENT_STATUSES = [
  'PENDING',
  'PICKED_UP',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'FAILED',
] as const;

const PACKAGE_TYPES = ['DOCUMENT', 'PARCEL', 'FRAGILE', 'HEAVY'] as const;
const SERVICE_LEVELS = ['STANDARD', 'EXPRESS', 'OVERNIGHT'] as const;

export const createShipmentSchema = z.object({
  recipientName: z.string().min(2, 'Recipient name is required').max(100),
  recipientAddress: z.string().min(5, 'Recipient address is required').max(300),
  recipientPhone: z.string().min(7, 'Recipient phone is required').max(20),
  weightKg: z.coerce.number().positive('Weight must be positive').max(1000),
  dimensionsCm: z
    .string()
    .regex(/^\d+x\d+x\d+$/, 'Dimensions must be in format LxWxH (e.g. 30x20x10)'),
  packageType: z.enum(PACKAGE_TYPES, { error: 'Invalid package type' }),
  serviceLevel: z.enum(SERVICE_LEVELS, { error: 'Invalid service level' }),
  declaredValue: z.coerce.number().nonnegative().optional(),
  notes: z.string().max(500).optional(),
  estimatedDelivery: z.string().datetime().optional(),
});

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;

export const listShipmentsSchema = z.object({
  status: z.enum(SHIPMENT_STATUSES).optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListShipmentsQuery = z.infer<typeof listShipmentsSchema>;

export const updateStatusSchema = z.object({
  status: z.enum(SHIPMENT_STATUSES, { error: 'Invalid status' }),
  location: z.string().max(200).optional(),
  note: z.string().max(500).optional(),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

export const trackingNumberSchema = z.object({
  trackingNumber: z
    .string()
    .regex(/^CS-[A-Z0-9]{8}$/, 'Invalid tracking number format'),
});

export type TrackingNumberParams = z.infer<typeof trackingNumberSchema>;
