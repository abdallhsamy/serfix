import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';

const prisma = new PrismaClient();

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface ListServicesQuery {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export interface CreateServiceInput {
  name: string;
  description?: string;
  slug: string;
  isActive?: boolean;
  metadata?: Prisma.InputJsonValue;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  slug?: string;
  isActive?: boolean;
  metadata?: Prisma.InputJsonValue;
}

function validateSlug(slug: string): void {
  if (!SLUG_REGEX.test(slug)) {
    throw new AppError(400, 'Slug must be URL-safe lowercase with hyphens (e.g. my-service)', 'VALIDATION_ERROR');
  }
}

export async function listServices(query: ListServicesQuery) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;
  const where = query.isActive !== undefined ? { isActive: query.isActive } : {};
  const [items, total] = await Promise.all([
    prisma.service.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.service.count({ where }),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getServiceById(id: string) {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) {
    throw new AppError(404, 'Service not found', 'NOT_FOUND');
  }
  return service;
}

export async function getServiceBySlug(slug: string) {
  const service = await prisma.service.findUnique({ where: { slug } });
  if (!service) {
    throw new AppError(404, 'Service not found', 'NOT_FOUND');
  }
  return service;
}

export async function createService(data: CreateServiceInput) {
  validateSlug(data.slug);
  const existing = await prisma.service.findUnique({ where: { slug: data.slug } });
  if (existing) {
    throw new AppError(409, 'Service with this slug already exists', 'CONFLICT');
  }
  return prisma.service.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      slug: data.slug,
      isActive: data.isActive ?? true,
      metadata: data.metadata,
    },
  });
}

export async function updateService(id: string, data: UpdateServiceInput) {
  if (data.slug !== undefined) validateSlug(data.slug);
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'Service not found', 'NOT_FOUND');
  }
  if (data.slug !== undefined && data.slug !== existing.slug) {
    const slugTaken = await prisma.service.findUnique({ where: { slug: data.slug } });
    if (slugTaken) {
      throw new AppError(409, 'Service with this slug already exists', 'CONFLICT');
    }
  }
  const updateData: Prisma.ServiceUpdateInput = {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.slug !== undefined && { slug: data.slug }),
    ...(data.isActive !== undefined && { isActive: data.isActive }),
    ...(data.metadata !== undefined && { metadata: data.metadata }),
  };
  return prisma.service.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteService(id: string) {
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'Service not found', 'NOT_FOUND');
  }
  await prisma.service.delete({ where: { id } });
  return { deleted: true };
}
