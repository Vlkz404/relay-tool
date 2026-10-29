export type SendChannel = 'standard' | 'warmup';
export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled' | 'failed';
export type RecipientStatus = 'pending' | 'processing' | 'sent' | 'failed' | 'skipped';
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document';

export interface EvolutionConfig {
  baseUrl: string;
  apiKey: string;
  instance: string;
}

export interface SendPayload {
  type: MessageType;
  text?: string;
  mediaUrl?: string;
  fileName?: string;
  caption?: string;
}

export interface SendAttempt {
  campaignId: string;
  recipientId: string;
  number: string;
  payload: SendPayload;
}

