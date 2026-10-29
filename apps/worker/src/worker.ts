import 'dotenv/config';
import PgBoss from 'pg-boss';
import { PrismaClient } from '@prisma/client';
import { EvolutionClient, type SendPayload } from '@whatsapp/core';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL não configurada.');

const prisma = new PrismaClient();
const boss = new PgBoss(databaseUrl);
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function devLog(level: 'INFO' | 'WARN' | 'ERROR', event: string, campaignId: string, details?: object) {
  await prisma.devLog.create({ data: { level, scope: 'worker', event, campaignId, details } });
}

async function executeCampaign(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId }, include: { instance: true } });
  if (!campaign || campaign.status !== 'RUNNING') return;

  const client = new EvolutionClient({ baseUrl: campaign.instance.baseUrl, apiKey: campaign.instance.apiKey, instance: campaign.instance.name });
  const config = (campaign.config ?? {}) as { delayMs?: number };
  const delayMs = Math.max(500, config.delayMs ?? 3_000);

  await devLog('INFO', 'campaign_started', campaignId, { kind: campaign.kind, delayMs });

  while (true) {
    const current = await prisma.campaign.findUniqueOrThrow({ where: { id: campaignId }, select: { status: true } });
    if (current.status !== 'RUNNING') break;

    const recipient = await prisma.campaignRecipient.findFirst({
      where: { campaignId, status: 'PENDING', contact: { blockedAt: null } },
      include: { contact: true }, orderBy: { createdAt: 'asc' },
    });
    if (!recipient) break;

    await prisma.campaignRecipient.update({ where: { id: recipient.id }, data: { status: 'PROCESSING', attempts: { increment: 1 } } });
    try {
      await client.send(recipient.contact.phone, campaign.payload as unknown as SendPayload);
      await prisma.$transaction([
        prisma.campaignRecipient.update({ where: { id: recipient.id }, data: { status: 'SENT', sentAt: new Date(), lastError: null } }),
        prisma.sendLog.create({ data: { campaignId, recipientId: recipient.id, phone: recipient.contact.phone, result: 'SENT' } }),
      ]);
      await devLog('INFO', 'evolution_send_ok', campaignId, { recipientId: recipient.id, statusCode: 200 });
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Falha desconhecida';
      await prisma.$transaction([
        prisma.campaignRecipient.update({ where: { id: recipient.id }, data: { status: 'FAILED', lastError: reason } }),
        prisma.sendLog.create({ data: { campaignId, recipientId: recipient.id, phone: recipient.contact.phone, result: 'FAILED', reason } }),
      ]);
      await devLog('ERROR', 'evolution_send_failed', campaignId, { recipientId: recipient.id, reason });
    }
    await wait(delayMs);
  }

  const pending = await prisma.campaignRecipient.count({ where: { campaignId, status: { in: ['PENDING', 'PROCESSING'] } } });
  if (pending === 0) {
    await prisma.campaign.update({ where: { id: campaignId }, data: { status: 'COMPLETED', endedAt: new Date() } });
    await devLog('INFO', 'campaign_completed', campaignId);
  }
}

async function main() {
  await boss.start();
  await boss.work('campaign.execute', async (jobs) => {
    for (const job of jobs) await executeCampaign((job.data as { campaignId: string }).campaignId);
  });
  // Aquecimento ganha um worker e regras próprias, mas usa a mesma fila durável.
  await boss.work('warmup.execute', async (jobs) => {
    for (const job of jobs) await executeCampaign((job.data as { campaignId: string }).campaignId);
  });
  console.log('Worker ativo: aguardando campanhas e aquecimentos.');
}

main().catch((error) => { console.error(error); process.exit(1); });

