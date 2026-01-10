import { PrismaClient } from '@prisma/client';
import { NodeEnv } from '../config/env.js';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === NodeEnv.Development ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== NodeEnv.Production) {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
