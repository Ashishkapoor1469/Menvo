import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test', override: true });

const db_url = process.env.DATABASE_URL!;

const adapter = new PrismaPg({
  connectionString: db_url,
});

const prisma = new PrismaClient({ adapter });

beforeAll(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
