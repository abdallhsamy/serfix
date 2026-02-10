import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { ErrorCodes } from "../../constants/errorCodes";

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): TokenPayload {
  try {
    const { userId, email, role } =
        jwt.verify(token, config.jwt.secret) as TokenPayload & { iat?: number; exp?: number };
    return { userId, email, role };
  } catch {
    throw new AppError(401, 'Invalid or expired token', ErrorCodes.Unauthorized);
  }
}

export async function register(data: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError(409, 'Email already registered', ErrorCodes.Conflict);
  }
  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: { email: data.email, passwordHash, name: data.name, role: 'USER' },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  const accessToken = signToken({ userId: user.id, email: user.email, role: user.role });
  return { user, accessToken, expiresIn: config.jwt.expiresIn };
}

export async function login(data: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new AppError(401, 'Invalid email or password', ErrorCodes.Unauthorized);
  }
  const valid = await verifyPassword(data.password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password', ErrorCodes.Unauthorized);
  }
  const accessToken = signToken({ userId: user.id, email: user.email, role: user.role });
  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    accessToken,
    expiresIn: config.jwt.expiresIn,
  };
}
