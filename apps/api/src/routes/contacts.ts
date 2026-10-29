import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const contactInput = z.object({ phone: z.string().regex(/^\d{10,15}$/), name: z.string().optional(), source: z.string().optional() });

export async function contactRoutes(app: FastifyInstance) {
  app.get('/contacts', async () => prisma.contact.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }));
  app.post('/contacts', async (request) => {
    const body = contactInput.parse(request.body);
    return prisma.contact.upsert({ where: { phone: body.phone }, create: body, update: { name: body.name, source: body.source } });
  });
  app.post('/contacts/:id/block', async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    return prisma.contact.update({ where: { id }, data: { blockedAt: new Date() } });
  });
}

