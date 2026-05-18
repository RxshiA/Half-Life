import { env } from './config/env';
import { createApp } from './app';
import { logger } from './lib/logger';
import prisma from './lib/prisma';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
  logger.info(`   Environment: ${env.NODE_ENV}`);
});

async function shutdown() {
  logger.info('Shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
