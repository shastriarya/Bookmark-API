import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const folderCount = await prisma.folder.count();

  console.log("Database connection successful.");
  console.log(`Folder count: ${folderCount}`);
}

main()
  .catch((error: unknown) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });