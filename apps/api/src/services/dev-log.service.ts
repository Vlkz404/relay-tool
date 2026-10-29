import { prisma } from '../lib/prisma';
import { sanitizeForLog } from '../lib/sanitize';

export async function writeDevLog(input: {
  level?: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'; scope: string; event: string;
  requestId?: string; campaignId?: string; details?: unknown;
}) {
  return prisma.devLog.create({ data: { ...input, details: sanitizeForLog(input.details) as never } });
}

