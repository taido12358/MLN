import { PrismaClient } from "@prisma/client";

/**
 * Single shared Prisma Client for the whole api process. Every REST router and the socket layer
 * import this instead of calling `new PrismaClient()` themselves — each PrismaClient instance opens
 * its own connection pool, so the 7 separate instances that used to exist here (one per route file
 * plus one in socket/index.ts) meant up to 7x the intended Postgres connections for no benefit in a
 * single-process app. One instance, one pool, sized by DATABASE_URL's `connection_limit`.
 */
export const prisma = new PrismaClient();
