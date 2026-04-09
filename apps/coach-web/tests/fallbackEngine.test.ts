import test from 'node:test';
import assert from 'node:assert/strict';
import type { EvaluateSessionRequest, Rubric } from '../shared/contracts.js';
import { createFallbackEvaluation } from '../server/fallbackEngine.js';

const rubric: Rubric = {
  id: 'rapid-response-rubric',
  moduleId: 'rapid-response-drill',
  title: '即答ドリルルーブリック',
  description: '短時間での端的な応答を評価する。',
  scale: {
    min: 1,
    max: 5,
    labels: {
      '1': '崩れている',
      '3': '要点は出せる',
      '5': '短く鋭く伝わる',
    },
  },
  criteria: [
    {
      id: 'speed',
      name: '初動速度',
      weight: 0.3,
      description: '迷いなく話し始められたか。',
      signals: ['無音が短い', 'すぐ結論に入る'],
    },
    {
      id: 'clarity',
      name: '要点の明快さ',
      weight: 0.25,
      description: '最初の数文で伝わるか。',
      signals: ['端的', '一文目が強い'],
    },
    {
      id: 'structure',
      name: '短時間構成',
      weight: 0.25,
      description: '限られた時間でも構造があるか。',
      signals: ['結論', '理由', '次アクション'],
    },
    {
      id: 'conciseness',
      name: '簡潔さ',
      weight: 0.2,
      description: '冗長にならず収まっているか。',
      signals: ['脱線が少ない', '時間内完結'],
    },
  ],
  aggregateMetrics: ['answerPreparationSec', 'charCount'],
};

const request: EvaluateSessionRequest = {
  sessionId: 'test-session',
  moduleId: 'rapid-response-drill',
  providerId: 'openai',
  scenarioId: 'rapid-status-surprise',
  transcript:
    '結論から言うと、進捗は概ね予定通りです。今の状況は主要タスクが完了済みで、次アクションは依存先確認です。',
  answerPreparationSec: 2,
};

test('createFallbackEvaluation keeps breakdown order aligned with rubric criteria', () => {
  const result = createFallbackEvaluation(request, rubric);

  assert.deepEqual(
    result.breakdown.map((item) => item.criterionId),
    rubric.criteria.map((criterion) => criterion.id),
  );
});

test('createFallbackEvaluation sorts next actions without mutating breakdown order', () => {
  const result = createFallbackEvaluation(request, rubric);

  assert.equal(result.nextActions.length, 3);
  assert.deepEqual(
    result.breakdown.map((item) => item.label),
    rubric.criteria.map((criterion) => criterion.name),
  );
});
