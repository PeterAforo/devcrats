import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('P@ssw0rd!', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@estateiq.com' },
    update: {},
    create: {
      email: 'admin@estateiq.com',
      passwordHash,
      firstName: 'Kofi',
      lastName: 'Mensah',
      role: 'super_admin',
      emailVerified: true,
      phone: '+233200000001',
    },
  });
  console.log('  ✓ Super Admin created:', superAdmin.email);

  const estate = await prisma.estate.create({
    data: {
      name: 'Cantonments Heights Estate',
      address: '14 Cantonments Road, Cantonments',
      city: 'Accra',
      state: 'Greater Accra',
      country: 'Ghana',
      postalCode: 'GA-184',
      latitude: 5.5780,
      longitude: -0.1790,
      description: 'A premium gated residential estate in Cantonments with modern amenities and 24/7 security.',
      timezone: 'Africa/Accra',
      currency: 'GHS',
      rules: 'No loud music after 10pm. Pets must be leashed in common areas. Visitors must register at gate.',
      createdBy: superAdmin.id,
    },
  });
  console.log('  ✓ Estate created:', estate.name);

  const manager = await prisma.user.create({
    data: {
      email: 'manager@estateiq.com',
      passwordHash,
      firstName: 'Kwame',
      lastName: 'Boateng',
      role: 'estate_manager',
      emailVerified: true,
      estateId: estate.id,
      phone: '+233200000002',
    },
  });
  console.log('  ✓ Estate Manager created:', manager.email);

  const blockA = await prisma.building.create({
    data: { name: 'Block A — Sapphire', estateId: estate.id, floors: 5 },
  });
  const blockB = await prisma.building.create({
    data: { name: 'Block B — Emerald', estateId: estate.id, floors: 4 },
  });
  console.log('  ✓ Buildings created: Block A, Block B');

  const unitTypes: Array<{ type: any; beds: number; baths: number; sqft: number; rent: number }> = [
    { type: 'studio', beds: 0, baths: 1, sqft: 400, rent: 2500 },
    { type: 'one_bed', beds: 1, baths: 1, sqft: 650, rent: 4000 },
    { type: 'two_bed', beds: 2, baths: 2, sqft: 950, rent: 6500 },
    { type: 'three_bed', beds: 3, baths: 2, sqft: 1200, rent: 9000 },
    { type: 'penthouse', beds: 4, baths: 3, sqft: 2000, rent: 15000 },
  ];

  const units = [];
  for (let floor = 1; floor <= 5; floor++) {
    for (let unit = 1; unit <= 4; unit++) {
      const config = unitTypes[Math.min(floor - 1, unitTypes.length - 1)];
      const u = await prisma.unit.create({
        data: {
          unitNumber: `A-${floor}0${unit}`,
          buildingId: blockA.id,
          floor,
          unitType: config.type,
          status: Math.random() > 0.15 ? 'occupied' : 'vacant',
          sizeSqft: config.sqft,
          bedrooms: config.beds,
          bathrooms: config.baths,
          rentAmount: config.rent,
        },
      });
      units.push(u);
    }
  }
  for (let floor = 1; floor <= 4; floor++) {
    for (let unit = 1; unit <= 3; unit++) {
      const config = unitTypes[Math.min(floor - 1, unitTypes.length - 1)];
      await prisma.unit.create({
        data: {
          unitNumber: `B-${floor}0${unit}`,
          buildingId: blockB.id,
          floor,
          unitType: config.type,
          status: Math.random() > 0.2 ? 'occupied' : 'vacant',
          sizeSqft: config.sqft,
          bedrooms: config.beds,
          bathrooms: config.baths,
          rentAmount: config.rent,
        },
      });
    }
  }
  console.log(`  ✓ ${20 + 12} Units created`);

  const landlordUser = await prisma.user.create({
    data: {
      email: 'landlord@estateiq.com',
      passwordHash,
      firstName: 'Nana',
      lastName: 'Akufo-Mensah',
      role: 'landlord',
      emailVerified: true,
      estateId: estate.id,
      phone: '+233200000003',
    },
  });
  const landlord = await prisma.landlord.create({
    data: {
      userId: landlordUser.id,
      estateId: estate.id,
      bankName: 'GCB Bank',
      bankAccountNo: '1234567890',
      bankAccountName: 'Nana Akufo-Mensah',
    },
  });
  console.log('  ✓ Landlord created:', landlordUser.email);

  const tenantUser = await prisma.user.create({
    data: {
      email: 'tenant@estateiq.com',
      passwordHash,
      firstName: 'Kwame',
      lastName: 'Asante',
      role: 'tenant',
      emailVerified: true,
      estateId: estate.id,
      phone: '+233200000004',
    },
  });
  const tenant = await prisma.tenant.create({
    data: {
      userId: tenantUser.id,
      estateId: estate.id,
      emergencyContact: 'Ama Asante',
      emergencyPhone: '+233200000005',
      employerName: 'MTN Ghana Ltd',
    },
  });
  console.log('  ✓ Tenant created:', tenantUser.email);

  const occupiedUnit = units.find((u) => u.status === 'occupied');
  if (occupiedUnit) {
    await prisma.lease.create({
      data: {
        unitId: occupiedUnit.id,
        tenantId: tenant.id,
        landlordId: landlord.id,
        status: 'active',
        rentAmount: Number(occupiedUnit.rentAmount || 500000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        depositAmount: Number(occupiedUnit.rentAmount || 500000),
        depositStatus: 'held',
        signedAt: new Date('2024-01-01'),
        createdBy: manager.id,
      },
    });
    console.log('  ✓ Lease created for', occupiedUnit.unitNumber);
  }

  const securityFee = await prisma.feeComponent.create({
    data: {
      estateId: estate.id,
      name: '24/7 Security Service',
      description: 'Round-the-clock armed and unarmed security patrol, CCTV monitoring, and gate access control.',
      category: 'security',
      chargeType: 'fixed',
      amount: 250,
      frequency: 'monthly',
      justification: 'Security coverage for 32 units with 8 guards in rotation',
      createdBy: manager.id,
    },
  });
  const cleaningFee = await prisma.feeComponent.create({
    data: {
      estateId: estate.id,
      name: 'Common Area Cleaning',
      description: 'Daily cleaning of lobbies, hallways, staircases, parking areas, and gardens.',
      category: 'cleaning',
      chargeType: 'fixed',
      amount: 150,
      frequency: 'monthly',
      createdBy: manager.id,
    },
  });
  const generatorFee = await prisma.feeComponent.create({
    data: {
      estateId: estate.id,
      name: 'Generator & Backup Power',
      description: 'Diesel generator for common areas and elevator during power outages.',
      category: 'utility',
      chargeType: 'per_unit',
      amount: 200,
      frequency: 'monthly',
      createdBy: manager.id,
    },
  });
  const reserveFund = await prisma.feeComponent.create({
    data: {
      estateId: estate.id,
      name: 'Maintenance Reserve Fund',
      description: 'Reserve fund for major repairs and capital improvements.',
      category: 'reserve_fund',
      chargeType: 'fixed',
      amount: 100,
      frequency: 'monthly',
      createdBy: manager.id,
    },
  });
  console.log('  ✓ Fee Components created: Security, Cleaning, Generator, Reserve Fund');

  const schedule = await prisma.feeSchedule.create({
    data: {
      estateId: estate.id,
      name: '2024 Standard Fee Schedule',
      status: 'active',
      effectiveDate: new Date('2024-01-01'),
      version: 1,
      createdBy: manager.id,
    },
  });

  for (const comp of [securityFee, cleaningFee, generatorFee, reserveFund]) {
    await prisma.feeScheduleComponent.create({
      data: {
        feeScheduleId: schedule.id,
        feeComponentId: comp.id,
        landlordSplit: 30,
        tenantSplit: 70,
      },
    });
  }
  console.log('  ✓ Fee Schedule created with 4 components');

  const amenities = ['Swimming Pool', 'Gym & Fitness Center', 'Children Playground', 'Tennis Court', 'Clubhouse', 'Garden & Green Space'];
  for (const name of amenities) {
    const amenity = await prisma.amenity.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    await prisma.estateAmenity.create({
      data: { estateId: estate.id, amenityId: amenity.id },
    });
  }
  console.log('  ✓ Amenities linked:', amenities.length);

  await prisma.serviceRequest.create({
    data: {
      estateId: estate.id,
      unitId: occupiedUnit?.id,
      tenantId: tenant.id,
      title: 'Kitchen sink leaking',
      description: 'The kitchen sink has been dripping water for 3 days. Water is pooling under the cabinet.',
      category: 'plumbing',
      priority: 'high',
      status: 'assigned',
      createdBy: tenantUser.id,
    },
  });
  await prisma.serviceRequest.create({
    data: {
      estateId: estate.id,
      title: 'Lobby light fixtures flickering',
      description: 'Multiple fluorescent lights in the Block A ground floor lobby are flickering.',
      category: 'electrical',
      priority: 'normal',
      status: 'submitted',
      createdBy: manager.id,
    },
  });
  console.log('  ✓ Service requests created');

  await prisma.complaint.create({
    data: {
      estateId: estate.id,
      tenantId: tenant.id,
      title: 'Excessive noise from unit A-302',
      description: 'Loud music playing past midnight on weekdays repeatedly. Affecting sleep.',
      category: 'noise',
      status: 'investigating',
      urgency: 'high',
      createdBy: tenantUser.id,
    },
  });
  console.log('  ✓ Complaint created');

  await prisma.notification.create({
    data: {
      userId: tenantUser.id,
      estateId: estate.id,
      type: 'rent_due',
      title: 'Rent Payment Due',
      message: 'Your rent payment of GH₵ 5,000 for Unit A-101 is due in 3 days.',
      channel: 'in_app',
    },
  });
  console.log('  ✓ Notification created');

  // ─── DEVTRACO COURTS (DEVCRAS) ─────────────────────────────
  const devtraco = await prisma.estate.create({
    data: {
      name: 'Devtraco Courts (DEVCRAS)',
      address: 'No. 2, El Minya Crescent, Horizon, Devtraco Courts',
      city: 'Accra',
      state: 'Greater Accra',
      country: 'Ghana',
      postalCode: 'AN 12284',
      latitude: 5.6340,
      longitude: -0.0210,
      description: 'Devtraco Courts Residents Association — a premier gated community in Tema with multiple clusters.',
      timezone: 'Africa/Accra',
      currency: 'GHS',
      rules: 'EMF payable monthly. Gate registration required for all visitors. Community meetings every quarter.',
      createdBy: superAdmin.id,
    },
  });
  console.log('  ✓ Devtraco Courts estate created');

  // Create clusters
  const bellavilla = await prisma.cluster.create({
    data: { name: 'Bellavilla', estateId: devtraco.id, code: 'BV' },
  });
  const horizon = await prisma.cluster.create({
    data: { name: 'Horizon', estateId: devtraco.id, code: 'HR' },
  });
  const bellavista = await prisma.cluster.create({
    data: { name: 'Bellavista', estateId: devtraco.id, code: 'BT' },
  });
  console.log('  ✓ Clusters created: Bellavilla, Horizon, Bellavista');

  // Create buildings within clusters
  const bvBlock = await prisma.building.create({
    data: { name: 'Bellavilla Block A', estateId: devtraco.id, clusterId: bellavilla.id, floors: 2 },
  });
  const hrBlock = await prisma.building.create({
    data: { name: 'Horizon Block A', estateId: devtraco.id, clusterId: horizon.id, floors: 2 },
  });
  await prisma.building.create({
    data: { name: 'Bellavista Block A', estateId: devtraco.id, clusterId: bellavista.id, floors: 2 },
  });

  // Create units with house numbers (e.g. AC12, BD05)
  const devtracoHouses = ['AC03', 'AC12', 'AC15', 'AC22', 'BD05', 'BD08', 'HR02', 'HR08', 'BV14', 'BV21'];
  for (const houseNo of devtracoHouses.slice(0, 5)) {
    await prisma.unit.create({
      data: {
        unitNumber: houseNo,
        houseNumber: houseNo,
        buildingId: bvBlock.id,
        floor: 1,
        unitType: 'three_bed',
        status: 'occupied',
        bedrooms: 3,
        bathrooms: 2,
        rentAmount: 300, // EMF amount
      },
    });
  }
  for (const houseNo of devtracoHouses.slice(5)) {
    await prisma.unit.create({
      data: {
        unitNumber: houseNo,
        houseNumber: houseNo,
        buildingId: hrBlock.id,
        floor: 1,
        unitType: 'three_bed',
        status: 'occupied',
        bedrooms: 3,
        bathrooms: 2,
        rentAmount: 450,
      },
    });
  }
  console.log('  ✓ Devtraco Courts houses created:', devtracoHouses.join(', '));

  console.log('\n✅ Database seeded successfully!');
  console.log('\nLogin credentials:');
  console.log('  Super Admin  : admin@estateiq.com / P@ssw0rd!');
  console.log('  Manager      : manager@estateiq.com / P@ssw0rd!');
  console.log('  Landlord     : landlord@estateiq.com / P@ssw0rd!');
  console.log('  Tenant       : tenant@estateiq.com / P@ssw0rd!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
