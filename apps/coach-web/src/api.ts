import type {
  AudioUploadRequest,
  AudioUploadResponse,
  BootstrapData,
  EvaluateSessionRequest,
  EvaluationResult,
  GeneratedSession,
  GenerateSessionRequest,
  SessionHistoryItem,
} from '../shared/contracts.js';

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`${path} failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function fetchBootstrap() {
  return requestJson<BootstrapData>('/api/bootstrap');
}

export function fetchHistory() {
  return requestJson<SessionHistoryItem[]>('/api/history?limit=12');
}

export function generateSession(payload: GenerateSessionRequest) {
  return requestJson<GeneratedSession>('/api/session/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function uploadAudio(payload: AudioUploadRequest) {
  return requestJson<AudioUploadResponse>('/api/session/audio', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function evaluateSession(payload: EvaluateSessionRequest) {
  return requestJson<EvaluationResult>('/api/session/evaluate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

