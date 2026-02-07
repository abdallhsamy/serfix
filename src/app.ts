import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config/env';
import { globalLimiter, authLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import serviceRoutes from './modules/services/service.routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger/openapi';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.cors.origins, credentials: true }));
app.use(express.json());
app.use(globalLimiter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/ready', async (_req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/services', serviceRoutes);

app.use(errorHandler);

export default app;
