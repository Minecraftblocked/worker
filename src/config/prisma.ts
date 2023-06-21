import { PrismaClient } from '@prisma/client';

declare global {
  let __prisma: PrismaClient | undefined;
}

// @ts-expect-error ignore error as typescript problem ONLY
if (!globalThis.__prisma) {
  // @ts-expect-error ignore error as typescript problem ONLY
  globalThis.__prisma = new PrismaClient();
}

// @ts-expect-error ignore error as typescript problem ONLY
const prisma: PrismaClient = globalThis.__prisma;

export { prisma };
