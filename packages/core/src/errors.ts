export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorCodes = {
  evolutionOffline: 'EVOLUTION_INSTANCE_OFFLINE',
  evolutionRequestFailed: 'EVOLUTION_REQUEST_FAILED',
  campaignNotReady: 'CAMPAIGN_NOT_READY',
  recipientBlocked: 'RECIPIENT_BLOCKED',
  invalidMedia: 'INVALID_MEDIA',
  aiNotConfigured: 'AI_NOT_CONFIGURED',
} as const;

