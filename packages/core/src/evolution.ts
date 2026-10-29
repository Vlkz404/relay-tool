import { AppError, errorCodes } from './errors';
import type { EvolutionConfig, SendPayload } from './types';

const trimSlash = (value: string) => value.replace(/\/$/, '');

export class EvolutionClient {
  constructor(private readonly config: EvolutionConfig) {}

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${trimSlash(this.config.baseUrl)}${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        apikey: this.config.apiKey,
        ...init.headers,
      },
      signal: AbortSignal.timeout(30_000),
    }).catch((cause) => {
      throw new AppError(errorCodes.evolutionOffline, 'Não foi possível conectar à Evolution API.', 503, { cause: String(cause) });
    });

    const body = await response.json().catch(() => null);
    if (!response.ok) {
      throw new AppError(errorCodes.evolutionRequestFailed, 'A Evolution API recusou a requisição.', response.status, {
        path,
        response: body,
      });
    }
    return body as T;
  }

  getConnectionState() {
    return this.request(`/instance/connectionState/${this.config.instance}`);
  }

  findContacts() {
    return this.request(`/chat/findContacts/${this.config.instance}`, { method: 'POST', body: JSON.stringify({ where: {} }) });
  }

  fetchGroups() {
    return this.request(`/group/fetchAllGroups/${this.config.instance}?getParticipants=false`);
  }

  fetchGroupParticipants(groupJid: string) {
    return this.request(`/group/participants/${this.config.instance}?groupJid=${encodeURIComponent(groupJid)}`);
  }

  send(number: string, payload: SendPayload) {
    if (payload.type === 'text') {
      return this.request(`/message/sendText/${this.config.instance}`, {
        method: 'POST', body: JSON.stringify({ number, text: payload.text ?? '' }),
      });
    }

    const mimetype = {
      image: 'image/jpeg', video: 'video/mp4', audio: 'audio/mpeg', document: 'application/pdf',
    }[payload.type];
    return this.request(`/message/sendMedia/${this.config.instance}`, {
      method: 'POST',
      body: JSON.stringify({ number, mediatype: payload.type, mimetype, media: payload.mediaUrl, caption: payload.caption ?? '', fileName: payload.fileName }),
    });
  }
}

