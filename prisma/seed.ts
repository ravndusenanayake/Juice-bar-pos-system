import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: { name: 'SUPER_ADMIN' },
  });

  const cashierRole = await prisma.role.upsert({
    where: { name: 'CASHIER' },
    update: {},
    create: { name: 'CASHIER' },
  });

  console.log('Roles seeded successfully.');

  // 2. Seed Default SUPER_ADMIN User
  const adminEmail = 'admin@juicebar.com';
  const rawPassword = 'Admin@123';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role_id: superAdminRole.id,
    },
    create: {
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      role_id: superAdminRole.id,
    },
  });

  console.log('Default SUPER_ADMIN user seeded:', {
    id: adminUser.id,
    name: adminUser.name,
    email: adminUser.email,
    role_id: adminUser.role_id,
  });

  console.log('Seeding completed successfully.');
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
