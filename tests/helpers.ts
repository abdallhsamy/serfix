import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/** Returns true if the database is reachable. */
export async function isDbAvailable(): Promise<boolean> {
  try {
    await prisma.$connect();
    return true;
  } catch {
    return false;
  }
}

export async function truncateDb(): Promise<void> {
  await prisma.service.deleteMany({});
  await prisma.user.deleteMany({});
}

export async function disconnectDb(): Promise<void> {
  await prisma.$disconnect();
}

export async function createUser(params: {
  email: string;
  password: string;
  name: string;
  role: 'USER' | 'ADMIN';
}): Promise<{ id: string; email: string; role: string }> {
  const passwordHash = await bcrypt.hash(params.password, 12);
  const user = await prisma.user.create({
    data: {
      email: params.email,
      passwordHash,
      name: params.name,
      role: params.role,
    },
  });
  return { id: user.id, email: user.email, role: user.role };
}

export { prisma };
