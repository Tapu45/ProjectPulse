import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create admin user
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@projectpulse.com' }
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@projectpulse.com',
          password: hashedPassword,
          role: 'ADMIN',
          organization: 'Project Pulse'
        }
      });
      console.log('Admin user created:', admin.email);
    } else {
      console.log('Admin user already exists');
    }

    // Create support user
    const supportExists = await prisma.user.findUnique({
      where: { email: 'support@projectpulse.com' }
    });

    if (!supportExists) {
      const hashedPassword = await bcrypt.hash('support123', 10);
      
      const support = await prisma.user.create({
        data: {
          name: 'Support Team',
          email: 'support@projectpulse.com',
          password: hashedPassword,
          role: 'SUPPORT',
          organization: 'Project Pulse'
        }
      });
      console.log('Support user created:', support.email);
    } else {
      console.log('Support user already exists');
    }

    // Create sample client
    const clientExists = await prisma.user.findUnique({
      where: { email: 'client@example.com' }
    });

    if (!clientExists) {
      const hashedPassword = await bcrypt.hash('client123', 10);
      
      const client = await prisma.user.create({
        data: {
          name: 'Sample Client',
          email: 'client@example.com',
          password: hashedPassword,
          role: 'CLIENT',
          organization: 'Client Company'
        }
      });
      console.log('Client user created:', client.email);
    } else {
      console.log('Client user already exists');
    }

    // Create sample project
    const projectExists = await prisma.project.findFirst({
      where: { name: 'Sample Project' }
    });

    if (!projectExists) {
      const project = await prisma.project.create({
        data: {
          name: 'Sample Project',
          description: 'This is a sample project for demonstration purposes.'
        }
      });
      console.log('Sample project created:', project.name);
    } else {
      console.log('Sample project already exists');
    }

  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });