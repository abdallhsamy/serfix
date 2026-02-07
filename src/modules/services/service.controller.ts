import { Request, Response, NextFunction } from 'express';
import * as serviceService from './service.service';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = req.query.page as string | undefined;
    const limit = req.query.limit as string | undefined;
    const isActive = req.query.isActive as string | undefined;
    const result = await serviceService.listServices({
      page: page ? Number.parseInt(page, 10) : undefined,
      limit: limit ? Number.parseInt(limit, 10) : undefined,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const service = await serviceService.getServiceById(id);
    res.json(service);
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const service = await serviceService.createService(req.body);
    res.status(201).json(service);
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const service = await serviceService.updateService(id, req.body);
    res.json(service);
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await serviceService.deleteService(id);
    res.json(result);
  } catch (e) {
    next(e);
  }
}
