import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.investment.deleteMany({});
  await prisma.fund.deleteMany({});
  await prisma.investor.deleteMany({});

  // Create funds
  const fund1 = await prisma.fund.create({
    data: {
      name: 'Titanbay Growth Fund I',
      vintage_year: 2024,
      target_size_usd: '250000000.00',
      status: 'Fundraising',
    },
  });

  const fund2 = await prisma.fund.create({
    data: {
      name: 'Titanbay Infrastructure Fund II',
      vintage_year: 2023,
      target_size_usd: '500000000.00',
      status: 'Investing',
    },
  });

  const fund3 = await prisma.fund.create({
    data: {
      name: 'Titanbay Tech Ventures III',
      vintage_year: 2022,
      target_size_usd: '150000000.00',
      status: 'Closed',
    },
  });

  console.log('✓ Created 3 funds');

  // Create investors
  const investor1 = await prisma.investor.create({
    data: {
      name: 'Goldman Sachs Asset Management',
      investor_type: 'Institution',
      email: 'investments@gsam.com',
    },
  });

  const investor2 = await prisma.investor.create({
    data: {
      name: 'CalPERS',
      investor_type: 'Institution',
      email: 'privateequity@calpers.ca.gov',
    },
  });

  const investor3 = await prisma.investor.create({
    data: {
      name: 'Brookfield Asset Management',
      investor_type: 'Institution',
      email: 'pe@brookfield.com',
    },
  });

  const investor4 = await prisma.investor.create({
    data: {
      name: 'Jane Smith Family Office',
      investor_type: 'FamilyOffice',
      email: 'jane@familyoffice.com',
    },
  });

  const investor5 = await prisma.investor.create({
    data: {
      name: 'John Doe',
      investor_type: 'Individual',
      email: 'john.doe@example.com',
    },
  });

  console.log('✓ Created 5 investors');

  // Create investments
  await prisma.investment.create({
    data: {
      investor_id: investor1.id,
      fund_id: fund1.id,
      amount_usd: '50000000.00',
      investment_date: new Date('2024-03-15'),
    },
  });

  await prisma.investment.create({
    data: {
      investor_id: investor2.id,
      fund_id: fund1.id,
      amount_usd: '75000000.00',
      investment_date: new Date('2024-04-20'),
    },
  });

  await prisma.investment.create({
    data: {
      investor_id: investor3.id,
      fund_id: fund2.id,
      amount_usd: '100000000.00',
      investment_date: new Date('2023-06-10'),
    },
  });

  await prisma.investment.create({
    data: {
      investor_id: investor4.id,
      fund_id: fund2.id,
      amount_usd: '60000000.00',
      investment_date: new Date('2023-07-15'),
    },
  });

  await prisma.investment.create({
    data: {
      investor_id: investor1.id,
      fund_id: fund3.id,
      amount_usd: '30000000.00',
      investment_date: new Date('2022-09-01'),
    },
  });

  await prisma.investment.create({
    data: {
      investor_id: investor5.id,
      fund_id: fund3.id,
      amount_usd: '5000000.00',
      investment_date: new Date('2022-10-15'),
    },
  });

  console.log('✓ Created 6 investments');
  console.log('\nDatabase seeding completed successfully!');
}

main()
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
