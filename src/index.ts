import express from 'express';
import cors from 'cors';
import { env } from '@/config/env';
import { connectDb, disconnectDb } from '@/config/db';
import router from '@/routers';
import { errorHandler, notFoundHandler } from '@/middlewares/error.middleware';

async function bootstrap() {
  await connectDb();

  const app = express();

  app.use(
    cors({
      origin: env.corsOrigins.length ? env.corsOrigins : true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  const server = app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
    console.log(`CORS origins: ${env.corsOrigins.join(', ') || '(all)'}`);
  });

  const shutdown = async (sig: string) => {
    console.log(`\n${sig} received, shutting down...`);
    server.close(async () => {
      await disconnectDb();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
