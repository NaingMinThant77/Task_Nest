import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { Action, PrismaClient, Resource } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // 1. Create or Find Roles with Permissions
  const roles = [
    {
      name: 'ADMIN',
      permissions: [
        {
          resource: Resource.USERS,
          actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
        },
        {
          resource: Resource.TASKS,
          actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
        },
      ],
    },
    {
      name: 'USER',
      permissions: [
        {
          resource: Resource.USERS,
          actions: [Action.CREATE, Action.SHOW, Action.READ],
        },
        {
          resource: Resource.TASKS,
          actions: [Action.CREATE, Action.SHOW, Action.READ],
        },
      ],
    },
  ];

  for (const roleData of roles) {
    const role = await prisma.role.upsert({
      where: { id: roleData.name === 'ADMIN' ? 1 : 2 },
      update: {},
      create: {
        name: roleData.name,
        permission: {
          create: roleData.permissions,
        },
      },
    });
    console.log(`- Role ${role.name} created/verified`);
  }

  // 2. Create a Default Admin User
  const adminEmail = 'admin@tuto.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'System Admin',
      email: adminEmail,
      password: hashedPassword,
      roleId: 1,
    },
  });

  console.log('✅ Seeding finished successfully');
  console.log('Admin User:', adminUser.email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
