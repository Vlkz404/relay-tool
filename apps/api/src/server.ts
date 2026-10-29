import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { AppError } from '@whatsapp/core';
import { env } from './env';
import { healthRoutes } from './routes/health';
import { instanceRoutes } from './routes/instances';
import { campaignRoutes } from './routes/campaigns';
import { contactRoutes } from './routes/contacts';

async function main() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: process.env.APP_URL ?? true });
  await app.register(healthRoutes);
  await app.register(instanceRoutes, { prefix: '/api' });
  await app.register(campaignRoutes, { prefix: '/api' });
  await app.register(contactRoutes, { prefix: '/api' });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) return reply.status(error.statusCode).send({ error: error.code, message: error.message, details: error.details });
    if (error && typeof error === 'object' && 'issues' in error) {
      return reply.status(422).send({ error: 'VALIDATION_ERROR', message: 'Dados inválidos.', details: (error as { issues: unknown }).issues });
    }
    app.log.error(error); return reply.status(500).send({ error: 'INTERNAL_ERROR', message: 'Erro interno.' });
  });
  await app.listen({ port: env.API_PORT, host: '0.0.0.0' });
}

main().catch((error) => { console.error(error); process.exit(1); });
