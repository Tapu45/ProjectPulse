import { PrismaClient } from '../../prisma/prisma/generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data into the Project table...');

  const projects = [
    {
      name: 'Website Redesign',
      description: 'Redesign the company website to improve user experience.',
    },
    {
      name: 'Mobile App Development',
      description: 'Develop a mobile application for e-commerce.',
    },
    {
      name: 'Backend API Optimization',
      description: 'Optimize the backend APIs for better performance.',
    },
    {
      name: 'Marketing Campaign',
      description: 'Launch a new marketing campaign for the upcoming product.',
    },
    {
      name: 'Customer Support System',
      description: 'Implement a new customer support ticketing system.',
    },
  ];

  for (const project of projects) {
    await prisma.project.create({
      data: project,
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });