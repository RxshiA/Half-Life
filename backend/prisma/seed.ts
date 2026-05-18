import { PrismaClient, PackageType, ServiceLevel, ShipmentStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

function generateTrackingNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(8);
  let result = 'CS-';
  for (const byte of bytes) {
    result += chars[byte % chars.length];
  }
  return result;
}

async function main() {
  console.log('🌱 Starting seed...');

  await prisma.shipmentEvent.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@courier.local',
      passwordHash: adminPassword,
      fullName: 'System Admin',
      phone: '+61400000001',
      addressLine1: '1 Admin Street',
      city: 'Sydney',
      state: 'NSW',
      postalCode: '2000',
      country: 'AU',
      role: 'ADMIN',
    },
  });

  const userPassword = await bcrypt.hash('User@1234', 12);
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@courier.local',
      passwordHash: userPassword,
      fullName: 'Demo User',
      phone: '+61400000002',
      addressLine1: '42 Demo Lane',
      city: 'Melbourne',
      state: 'VIC',
      postalCode: '3000',
      country: 'AU',
      role: 'USER',
    },
  });

  const shipmentsData = [
    {
      status: ShipmentStatus.DELIVERED,
      recipientName: 'Alice Smith',
      recipientAddress: '10 Collins St, Melbourne VIC 3000',
      packageType: PackageType.DOCUMENT,
      serviceLevel: ServiceLevel.EXPRESS,
    },
    {
      status: ShipmentStatus.IN_TRANSIT,
      recipientName: 'Bob Jones',
      recipientAddress: '55 Pitt St, Sydney NSW 2000',
      packageType: PackageType.PARCEL,
      serviceLevel: ServiceLevel.STANDARD,
    },
    {
      status: ShipmentStatus.PENDING,
      recipientName: 'Carol White',
      recipientAddress: '8 Queen St, Brisbane QLD 4000',
      packageType: PackageType.FRAGILE,
      serviceLevel: ServiceLevel.OVERNIGHT,
    },
  ];

  for (const data of shipmentsData) {
    const trackingNumber = generateTrackingNumber();
    const shipment = await prisma.shipment.create({
      data: {
        trackingNumber,
        userId: demoUser.id,
        senderName: demoUser.fullName,
        senderAddress: `${demoUser.addressLine1}, ${demoUser.city} ${demoUser.state} ${demoUser.postalCode}`,
        recipientName: data.recipientName,
        recipientAddress: data.recipientAddress,
        recipientPhone: '+61400000099',
        weightKg: 1.5,
        dimensionsCm: '30x20x10',
        packageType: data.packageType,
        serviceLevel: data.serviceLevel,
        status: data.status,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.shipmentEvent.create({
      data: {
        shipmentId: shipment.id,
        status: ShipmentStatus.PENDING,
        note: 'Shipment created',
        createdById: demoUser.id,
      },
    });

    if (data.status !== ShipmentStatus.PENDING) {
      await prisma.shipmentEvent.create({
        data: {
          shipmentId: shipment.id,
          status: ShipmentStatus.PICKED_UP,
          location: `${demoUser.city} Depot`,
          note: 'Package picked up from sender',
          createdById: admin.id,
        },
      });
    }

    if (data.status === ShipmentStatus.IN_TRANSIT || data.status === ShipmentStatus.DELIVERED) {
      await prisma.shipmentEvent.create({
        data: {
          shipmentId: shipment.id,
          status: ShipmentStatus.IN_TRANSIT,
          location: 'Sydney Sorting Centre',
          note: 'Package in transit to destination',
          createdById: admin.id,
        },
      });
    }

    if (data.status === ShipmentStatus.DELIVERED) {
      await prisma.shipmentEvent.create({
        data: {
          shipmentId: shipment.id,
          status: ShipmentStatus.DELIVERED,
          location: data.recipientAddress,
          note: 'Package delivered successfully',
          createdById: admin.id,
        },
      });
    }
  }

  console.log('✅ Seed complete!');
  console.log(`   Admin: admin@courier.local / Admin@1234`);
  console.log(`   User:  demo@courier.local  / User@1234`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
