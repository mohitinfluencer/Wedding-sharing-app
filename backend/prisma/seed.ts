import { PrismaClient, Role, Visibility } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Platform Admin
  const adminHash = await bcrypt.hash('admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@weddingplatform.com' },
    update: {},
    create: {
      email: 'admin@weddingplatform.com',
      name: 'Platform Admin',
      role: Role.platform_admin,
      passwordHash: adminHash,
    },
  });

  // Demo Photographer
  const photoHash = await bcrypt.hash('photographer@123', 12);
  const photographer = await prisma.user.upsert({
    where: { email: 'demo@studio.com' },
    update: {},
    create: {
      email: 'demo@studio.com',
      name: 'Rahul Sharma',
      role: Role.photographer,
      passwordHash: photoHash,
    },
  });

  // Demo Studio
  const studio = await prisma.studio.upsert({
    where: { ownerUserId: photographer.id },
    update: {},
    create: {
      studioName: 'Sharma Wedding Photography',
      ownerUserId: photographer.id,
      brandColor: '#D4AF9A',
    },
  });

  // Update photographer with studioId
  await prisma.user.update({
    where: { id: photographer.id },
    data: { studioId: studio.id },
  });

  // Demo Wedding Event
  const event = await prisma.event.upsert({
    where: { slug: 'rahul-priya-2026' },
    update: {},
    create: {
      studioId: studio.id,
      slug: 'rahul-priya-2026',
      brideName: 'Priya',
      groomName: 'Rahul',
      location: 'The Leela Palace, Mumbai',
      startDate: new Date('2026-03-15T10:00:00Z'),
      endDate: new Date('2026-03-17T23:00:00Z'),
      visibility: Visibility.public,
      theme: 'classic',
    },
  });

  // Demo Albums
  const albumNames = ['Haldi', 'Mehendi', 'Sangeet', 'Wedding', 'Reception'];
  for (let i = 0; i < albumNames.length; i++) {
    await prisma.album.upsert({
      where: {
        id: `demo-album-${i}`,
      },
      update: {},
      create: {
        id: `demo-album-${i}`,
        eventId: event.id,
        title: albumNames[i],
        orderIndex: i,
      },
    });
  }

  console.log('✅ Seed complete!');
  console.log('');
  console.log('📧 Admin:        admin@weddingplatform.com / admin@123');
  console.log('📸 Photographer: demo@studio.com / photographer@123');
  console.log(`💒 Demo Event:   /wedding/rahul-priya-2026`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
