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

  // 3. Seed Dummy Categories
  const categoryJuices = await prisma.category.upsert({
    where: { name: 'Fresh Juices' },
    update: {},
    create: { name: 'Fresh Juices', status: true },
  });

  const categorySmoothies = await prisma.category.upsert({
    where: { name: 'Smoothies' },
    update: {},
    create: { name: 'Smoothies', status: true },
  });

  const categoryAddons = await prisma.category.upsert({
    where: { name: 'Add-ons' },
    update: {},
    create: { name: 'Add-ons', status: true },
  });

  console.log('Dummy categories seeded.');

  // 4. Seed Dummy Products
  const ensureProduct = async (productData: any) => {
    const existing = await prisma.product.findFirst({ where: { name: productData.name } });
    if (!existing) {
      await prisma.product.create({ data: productData });
    }
  };

  await ensureProduct({
    name: 'Orange Juice',
    category_id: categoryJuices.id,
    product_type: 'FINISHED',
    price: 5.00,
    quantity: 50,
    status: true,
  });

  await ensureProduct({
    name: 'Green Detox',
    category_id: categorySmoothies.id,
    product_type: 'RECIPE',
    price: 7.50,
    quantity: 0,
    status: true,
  });

  await ensureProduct({
    name: 'Berry Blast',
    category_id: categorySmoothies.id,
    product_type: 'FINISHED',
    price: 6.50,
    quantity: 4, // Low stock testing
    status: true,
  });

  await ensureProduct({
    name: 'Extra Ginger Shot',
    category_id: categoryAddons.id,
    product_type: 'RECIPE',
    price: 1.50,
    quantity: 0,
    status: true,
  });

  await ensureProduct({
    name: 'Spring Water',
    category_id: categoryAddons.id,
    product_type: 'FINISHED',
    price: 2.00,
    quantity: 100,
    status: true,
  });

  console.log('Dummy products seeded successfully.');

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
