import { Shipment, ShipmentEvent, ShipmentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../../lib/prisma';
import { AppError } from '../../errors/AppError';
import { generateTrackingNumber } from '../../lib/tracking';
import {
  CreateShipmentInput,
  ListShipmentsQuery,
  UpdateStatusInput,
} from './shipments.schemas';

export type PublicShipment = Omit<Shipment, 'weightKg' | 'declaredValue'> & {
  weightKg: string;
  declaredValue: string | null;
  events?: PublicShipmentEvent[];
};

export type PublicShipmentEvent = Omit<ShipmentEvent, never>;

function serializeShipment(shipment: Shipment & { events?: ShipmentEvent[] }): PublicShipment {
  const { weightKg, declaredValue, events, ...rest } = shipment;
  return {
    ...rest,
    weightKg: weightKg instanceof Decimal ? weightKg.toString() : String(weightKg),
    declaredValue:
      declaredValue instanceof Decimal
        ? declaredValue.toString()
        : declaredValue != null
          ? String(declaredValue)
          : null,
    ...(events !== undefined && { events }),
  };
}

async function generateUniqueTrackingNumber(): Promise<string> {
  for (let attempts = 0; attempts < 5; attempts++) {
    const tn = generateTrackingNumber();
    const exists = await prisma.shipment.findUnique({ where: { trackingNumber: tn } });
    if (!exists) return tn;
  }
  throw new AppError('SERVER_ERROR', 'Failed to generate unique tracking number', 500);
}

export async function createShipment(
  userId: string,
  input: CreateShipmentInput,
): Promise<PublicShipment> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found', 404);
  }

  const trackingNumber = await generateUniqueTrackingNumber();
  const senderAddress = [
    user.addressLine1,
    user.addressLine2,
    user.city,
    user.state,
    user.postalCode,
  ]
    .filter(Boolean)
    .join(', ');

  const shipment = await prisma.shipment.create({
    data: {
      trackingNumber,
      userId,
      senderName: user.fullName,
      senderAddress,
      recipientName: input.recipientName,
      recipientAddress: input.recipientAddress,
      recipientPhone: input.recipientPhone,
      weightKg: input.weightKg,
      dimensionsCm: input.dimensionsCm,
      packageType: input.packageType,
      serviceLevel: input.serviceLevel,
      declaredValue: input.declaredValue ?? null,
      notes: input.notes ?? null,
      estimatedDelivery: input.estimatedDelivery ? new Date(input.estimatedDelivery) : null,
    },
  });

  await prisma.shipmentEvent.create({
    data: {
      shipmentId: shipment.id,
      status: ShipmentStatus.PENDING,
      note: 'Shipment created',
      createdById: userId,
    },
  });

  return serializeShipment(shipment);
}

export async function listShipments(
  userId: string,
  role: 'USER' | 'ADMIN',
  query: ListShipmentsQuery,
): Promise<{ shipments: PublicShipment[]; total: number; page: number; limit: number }> {
  const { status, q, page, limit } = query;
  const skip = (page - 1) * limit;

  const where = {
    ...(role === 'USER' && { userId }),
    ...(status && { status }),
    ...(q && {
      OR: [
        { trackingNumber: { contains: q, mode: 'insensitive' as const } },
        { recipientName: { contains: q, mode: 'insensitive' as const } },
        { senderName: { contains: q, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [shipments, total] = await prisma.$transaction([
    prisma.shipment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.shipment.count({ where }),
  ]);

  return {
    shipments: shipments.map(serializeShipment),
    total,
    page,
    limit,
  };
}

export async function getShipment(
  shipmentId: string,
  userId: string,
  role: 'USER' | 'ADMIN',
): Promise<PublicShipment> {
  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: { events: { orderBy: { createdAt: 'asc' } } },
  });

  if (!shipment) {
    throw new AppError('NOT_FOUND', 'Shipment not found', 404);
  }

  if (role === 'USER' && shipment.userId !== userId) {
    throw new AppError('FORBIDDEN', 'You do not have access to this shipment', 403);
  }

  return serializeShipment(shipment);
}

export async function updateShipmentStatus(
  shipmentId: string,
  adminId: string,
  input: UpdateStatusInput,
): Promise<PublicShipment> {
  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) {
    throw new AppError('NOT_FOUND', 'Shipment not found', 404);
  }

  const [updated] = await prisma.$transaction([
    prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: input.status },
    }),
    prisma.shipmentEvent.create({
      data: {
        shipmentId,
        status: input.status as ShipmentStatus,
        location: input.location ?? null,
        note: input.note ?? null,
        createdById: adminId,
      },
    }),
  ]);

  const fresh = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: { events: { orderBy: { createdAt: 'asc' } } },
  });

  return serializeShipment(fresh ?? updated);
}

export async function trackShipment(trackingNumber: string): Promise<PublicShipment> {
  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber },
    include: { events: { orderBy: { createdAt: 'asc' } } },
  });

  if (!shipment) {
    throw new AppError('NOT_FOUND', 'No shipment found with this tracking number', 404);
  }

  return serializeShipment(shipment);
}
