const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const restaurants = await prisma.restaurant.findMany();
  console.log("Restaurants:");
  restaurants.forEach(r => console.log(`ID: ${r.id}, Name: ${r.name}, Slug: '${r.slug}'`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
