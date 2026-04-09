import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.EMPLOYER_EMAIL || "admin@akijresource.com";
  const password = process.env.EMPLOYER_PASSWORD || "Admin@123456";
  const name = process.env.EMPLOYER_NAME || "Akij Resource Admin";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`✓ Employer already exists: ${email}`);
    return;
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      name,
      password: hashed,
      role: "EMPLOYER",
    },
  });

  console.log(`✓ Built-in employer created: ${email}`);
  console.log(`  Password: ${password}`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
