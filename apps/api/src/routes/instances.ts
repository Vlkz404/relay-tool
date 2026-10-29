import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { EvolutionClient } from '@whatsapp/core';
import { prisma } from '../lib/prisma';
import { writeDevLog } from '../services/dev-log.service';

export async function instanceRoutes(app: FastifyInstance) {
  app.get('/instances', async () => prisma.evolutionInstance.findMany({ select: { id: true, name: true, baseUrl: true, status: true, lastCheck: true } }));

  app.post('/instances/:id/check', async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const instance = await prisma.evolutionInstance.findUniqueOrThrow({ where: { id } });
    try {
      const result = await new EvolutionClient({ baseUrl: instance.baseUrl, apiKey: instance.apiKey, instance: instance.name }).getConnectionState();
      await prisma.evolutionInstance.update({ where: { id }, data: { status: 'CONNECTED', lastCheck: new Date() } });
      await writeDevLog({ scope: 'evolution', event: 'connection_check_ok', details: { instanceId: id } });
      return { connected: true, result };
    } catch (error) {
      await prisma.evolutionInstance.update({ where: { id }, data: { status: 'ERROR', lastCheck: new Date() } });
      await writeDevLog({ level: 'ERROR', scope: 'evolution', event: 'connection_check_failed', details: { instanceId: id, error: String(error) } });
      throw error;
    }
  });
}

