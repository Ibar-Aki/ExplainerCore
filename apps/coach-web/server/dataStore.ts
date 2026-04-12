import { promises as fs } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  AudioUploadRequest,
  EvaluateSessionRequest,
  EvaluationResult,
  Rubric,
  Scenario,
  SessionHistoryItem,
  SessionTranscriptRecord,
} from '../shared/contracts.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../../..');
const dataRoot = join(repoRoot, 'data');
const sessionsRoot = join(repoRoot, 'sessions');
const reviewsDir = join(sessionsRoot, 'reviews');
const reviewIndexPath = join(reviewsDir, 'index.json');

let rubricsCache: Promise<Rubric[]> | null = null;
let scenariosCache: Promise<Scenario[]> | null = null;

async function ensureDir(target: string) {
  await fs.mkdir(target, { recursive: true });
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw) as T;
}

async function readJsonDir<T>(dirPath: string): Promise<T[]> {
  const files = (await fs.readdir(dirPath))
    .filter((file) => extname(file) === '.json')
    .sort((left, right) => left.localeCompare(right));

  return Promise.all(files.map((file) => readJsonFile<T>(join(dirPath, file))));
}

export async function loadRubrics(): Promise<Rubric[]> {
  rubricsCache ??= readJsonDir<Rubric>(join(dataRoot, 'rubrics'));
  return rubricsCache;
}

export async function loadScenarios(): Promise<Scenario[]> {
  scenariosCache ??= readJsonDir<Scenario[]>(join(dataRoot, 'scenarios')).then((bundles) => bundles.flat());
  return scenariosCache;
}

export async function saveAudioUpload(payload: AudioUploadRequest): Promise<string> {
  await ensureDir(join(sessionsRoot, 'audio'));
  const extension = payload.mimeType.includes('ogg')
    ? 'ogg'
    : payload.mimeType.includes('mp4')
      ? 'mp4'
      : payload.mimeType.includes('wav')
        ? 'wav'
        : 'webm';
  const fileName = `${payload.sessionId}.${extension}`;
  const buffer = Buffer.from(payload.base64Data, 'base64');

  await fs.writeFile(join(sessionsRoot, 'audio', fileName), buffer);
  return fileName;
}

export async function saveTranscriptRecord(
  request: EvaluateSessionRequest,
  scenario: Scenario,
): Promise<SessionTranscriptRecord> {
  await ensureDir(join(sessionsRoot, 'transcripts'));
  const record: SessionTranscriptRecord = {
    sessionId: request.sessionId,
    moduleId: request.moduleId,
    providerId: request.providerId,
    scenarioId: request.scenarioId,
    scenarioTitle: scenario.title,
    transcript: request.transcript,
    selfReview: request.selfReview,
    answerPreparationSec: request.answerPreparationSec,
    timeLimitSec: request.timeLimitSec,
    audioFileName: request.audioFileName,
    savedAt: new Date().toISOString(),
    baselineSelfCheck: request.baselineSelfCheck,
  };

  await fs.writeFile(
    join(sessionsRoot, 'transcripts', `${request.sessionId}.json`),
    JSON.stringify(record, null, 2),
    'utf8',
  );

  return record;
}

export async function saveReviewRecord(result: EvaluationResult, scenario: Scenario): Promise<void> {
  await ensureDir(reviewsDir);
  const historyItem: SessionHistoryItem = {
    sessionId: result.sessionId,
    moduleId: result.moduleId,
    providerId: result.providerId,
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    overallScore: result.overallScore,
    band: result.band,
    summary: result.summary,
    savedAt: result.savedAt,
    fallbackUsed: result.fallbackUsed,
    baselineSelfCheckAverage: result.baselineSelfCheck?.average,
    selfCheckDelta: result.selfCheckComparison?.delta,
  };

  await fs.writeFile(
    join(reviewsDir, `${result.sessionId}.json`),
    JSON.stringify(
      {
        ...result,
        historyItem,
      },
      null,
      2,
    ),
    'utf8',
  );

  const nextIndex = [
    historyItem,
    ...((await loadHistoryIndex()).filter((entry) => entry.sessionId !== historyItem.sessionId)),
  ].sort((left, right) => right.savedAt.localeCompare(left.savedAt));

  await fs.writeFile(reviewIndexPath, JSON.stringify(nextIndex, null, 2), 'utf8');
}

async function rebuildHistoryIndex(): Promise<SessionHistoryItem[]> {
  const files = (await fs.readdir(reviewsDir))
    .filter((file) => extname(file) === '.json' && file !== 'index.json')
    .sort((left, right) => right.localeCompare(left, 'en'));

  const records = await Promise.all(
    files.map(async (file) => {
      const raw = await readJsonFile<{ historyItem?: SessionHistoryItem }>(join(reviewsDir, file));
      return raw.historyItem;
    }),
  );

  const nextIndex = records
    .filter((record): record is SessionHistoryItem => Boolean(record))
    .sort((left, right) => right.savedAt.localeCompare(left.savedAt));

  await ensureDir(reviewsDir);
  await fs.writeFile(reviewIndexPath, JSON.stringify(nextIndex, null, 2), 'utf8');
  return nextIndex;
}

async function loadHistoryIndex(): Promise<SessionHistoryItem[]> {
  try {
    return await readJsonFile<SessionHistoryItem[]>(reviewIndexPath);
  } catch {
    return [];
  }
}

export async function loadSessionHistory(limit = 12): Promise<SessionHistoryItem[]> {
  try {
    const index = await loadHistoryIndex();
    if (index.length > 0) {
      return index.slice(0, limit);
    }

    return (await rebuildHistoryIndex()).slice(0, limit);
  } catch {
    return [];
  }
}
