import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const connectionString = process.env.DATABASE_URL?.replace(
    "sslmode=require",
    "sslmode=verify-full",
  );
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured. Copy .env.example to .env.local.");
  }

  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}
