
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Checking database for CreditTransactions...");
  try {
    const count = await prisma.creditTransaction.count();
    console.log(`Total CreditTransactions: ${count}`);

    const transactions = await prisma.creditTransaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    console.log("Recent 5 transactions:");
    console.log(JSON.stringify(transactions, null, 2));

    const users = await prisma.user.findMany({
        take: 5
    });
    console.log("Recent 5 users:");
    console.log(JSON.stringify(users, null, 2));

  } catch (e) {
    console.error("Error querying database:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
