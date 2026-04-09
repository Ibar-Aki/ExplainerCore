import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import {
  trainingModules,
  type AudioUploadRequest,
  type EvaluateSessionRequest,
  type GenerateSessionRequest,
  type ModuleId,
} from '../shared/contracts.js';
import { buildEvaluation, buildGeneratedSession, getProviderStatuses } from './aiProviders.js';
import {
  loadRubrics,
  loadScenarios,
  loadSessionHistory,
  saveAudioUpload,
  saveReviewRecord,
  saveTranscriptRecord,
} from './dataStore.js';

dotenv.config();

const app = express();
const port = Number(process.env.APP_PORT ?? 8787);

app.use(cors());
app.use(express.json({ limit: '20mb' }));

function isPracticeModule(moduleId: ModuleId): moduleId is GenerateSessionRequest['moduleId'] {
  return moduleId !== 'session-review-dashboard';
}

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    now: new Date().toISOString(),
  });
});

app.get('/api/bootstrap', async (_request, response) => {
  const [rubrics, scenarios] = await Promise.all([loadRubrics(), loadScenarios()]);

  response.json({
    generatedAt: new Date().toISOString(),
    providers: getProviderStatuses(),
    modules: trainingModules,
    rubrics,
    scenarios,
  });
});

app.get('/api/history', async (request, response) => {
  const requestedLimit = Number(request.query.limit ?? 12);
  const limit = Number.isFinite(requestedLimit) ? Math.max(1, Math.min(50, requestedLimit)) : 12;
  const history = await loadSessionHistory(limit);
  response.json(history);
});

app.post('/api/session/generate', async (request, response) => {
  const payload = request.body as GenerateSessionRequest;

  if (!payload || !isPracticeModule(payload.moduleId)) {
    response.status(400).json({ error: 'Invalid moduleId' });
    return;
  }

  const scenarios = await loadScenarios();
  const candidates = scenarios.filter((scenario) => scenario.moduleId === payload.moduleId);

  if (candidates.length === 0) {
    response.status(404).json({ error: 'Scenario not found' });
    return;
  }

  const scenario =
    candidates.find((entry) => entry.id === payload.scenarioId) ??
    candidates[Math.floor(Math.random() * candidates.length)];

  const generatedSession = await buildGeneratedSession(payload, scenario);
  response.json(generatedSession);
});

app.post('/api/session/audio', async (request, response) => {
  const payload = request.body as AudioUploadRequest;

  if (!payload?.sessionId || !payload.base64Data || !payload.mimeType) {
    response.status(400).json({ error: 'Invalid audio payload' });
    return;
  }

  const fileName = await saveAudioUpload(payload);
  response.json({ fileName });
});

app.post('/api/session/evaluate', async (request, response) => {
  const payload = request.body as EvaluateSessionRequest;

  if (!payload?.sessionId || !payload.transcript || !isPracticeModule(payload.moduleId)) {
    response.status(400).json({ error: 'Invalid evaluation payload' });
    return;
  }

  const [rubrics, scenarios] = await Promise.all([loadRubrics(), loadScenarios()]);
  const rubric = rubrics.find((entry) => entry.moduleId === payload.moduleId);
  const scenario = scenarios.find(
    (entry) => entry.id === payload.scenarioId && entry.moduleId === payload.moduleId,
  );

  if (!rubric || !scenario) {
    response.status(404).json({ error: 'Rubric or scenario not found' });
    return;
  }

  const result = await buildEvaluation(payload, rubric);
  await saveTranscriptRecord(payload, scenario);
  await saveReviewRecord(result, scenario);
  response.json(result);
});

app.listen(port, () => {
  console.log(`coach-web api listening on http://localhost:${port}`);
});
