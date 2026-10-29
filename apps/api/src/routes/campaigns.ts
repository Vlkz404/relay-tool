import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { pauseCampaign, startCampaign } from '../services/campaign.service';

const campaignInput = z.object({
  name: z.string().min(1), kind: z.enum(['STANDARD', 'WARMUP']).default('STANDARD'),
  instanceId: z.string(), payload: z.record(z.unknown()), config: z.record(z.unknown()).default({}),
});

export async function campaignRoutes(app: FastifyInstance) {
  app.get('/campaigns', async () => prisma.campaign.findMany({ orderBy: { createdAt: 'desc' }, include: { _count: { select: { recipients: true } } } }));
  app.post('/campaigns', async (request) => {
    const input = campaignInput.parse(request.body);
    return prisma.campaign.create({ data: {
      ...input,
      payload: input.payload as Prisma.InputJsonValue,
      config: input.config as Prisma.InputJsonValue,
    } });
  });
  app.post('/campaigns/:id/start', async (request) => { const { id } = z.object({ id: z.string() }).parse(request.params); await startCampaign(id); return { ok: true }; });
  app.post('/campaigns/:id/pause', async (request) => { const { id } = z.object({ id: z.string() }).parse(request.params); await pauseCampaign(id); return { ok: true }; });
}

