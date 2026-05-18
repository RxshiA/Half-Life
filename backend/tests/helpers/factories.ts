import { Shipment, ShipmentStatus, PackageType, ServiceLevel } from '@prisma/client';
import prisma from '../../src/lib/prisma';
import { generateTrackingNumber } from '../../src/lib/tracking';

interface CreateShipmentOptions {
  userId: string;
  status?: ShipmentStatus;
  trackingNumber?: string;
  senderName?: string;
}

export async function createTestShipment(options: CreateShipmentOptions): Promise<Shipment> {
  return prisma.shipment.create({
    data: {
      trackingNumber: options.trackingNumber ?? generateTrackingNumber(),
      userId: options.userId,
      senderName: options.senderName ?? 'Test Sender',
      senderAddress: '1 Sender St, Sydney NSW 2000',
      recipientName: 'Test Recipient',
      recipientAddress: '2 Recipient Rd, Melbourne VIC 3000',
      recipientPhone: '+61400000099',
      weightKg: 1.5,
      dimensionsCm: '30x20x10',
      packageType: PackageType.PARCEL,
      serviceLevel: ServiceLevel.STANDARD,
      status: options.status ?? ShipmentStatus.PENDING,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });
}
