import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';

const server = app.listen(config.port, () => {
  logger.info(`Server listening on port ${config.port}`, { port: config.port, env: config.nodeEnv });
});

export default server;
