import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 12);

  // Create or update admin user
  await prisma.user.upsert({
    where: { email: 'admin@truplat.app' },
    update: { password },
    create: {
      email: 'admin@truplat.app',
      password,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // Create or update client user
  await prisma.user.upsert({
    where: { email: 'client@truplat.app' },
    update: { password },
    create: {
      email: 'client@truplat.app',
      password,
      firstName: 'Client',
      lastName: 'User',
      role: 'CLIENT',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Users created:');
  console.log('   - admin@truplat.app / password123 (ADMIN)');
  console.log('   - client@truplat.app / password123 (CLIENT)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
