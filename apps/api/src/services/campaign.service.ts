import PgBoss from 'pg-boss';
import { AppError, errorCodes } from '@whatsapp/core';
import { prisma } from '../lib/prisma';

let boss: PgBoss | undefined;
export async function getQueue() {
  if (!boss) { boss = new PgBoss(process.env.DATABASE_URL!); await boss.start(); }
  return boss;
}

export async function startCampaign(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign || !['DRAFT', 'SCHEDULED', 'PAUSED'].includes(campaign.status)) {
    throw new AppError(errorCodes.campaignNotReady, 'A campanha não pode ser iniciada no estado atual.', 409);
  }
  await prisma.campaign.update({ where: { id: campaignId }, data: { status: 'RUNNING', startedAt: new Date() } });
  const queue = await getQueue();
  await queue.send(campaign.kind === 'WARMUP' ? 'warmup.execute' : 'campaign.execute', { campaignId });
}

export async function pauseCampaign(campaignId: string) {
  await prisma.campaign.update({ where: { id: campaignId }, data: { status: 'PAUSED' } });
}

