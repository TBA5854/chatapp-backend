import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();
export { prisma };
export function connectDB(): void {
    prisma.$connect().then(() => { console.log('Connected to the database'); }).catch((e) => { console.log(e); });
}