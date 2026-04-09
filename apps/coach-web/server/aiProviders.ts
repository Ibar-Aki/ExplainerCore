import type {
  EvaluateSessionRequest,
  EvaluationResult,
  GenerateSessionRequest,
  GeneratedSession,
  ProviderId,
  ProviderStatus,
  Rubric,
  Scenario,
} from '../shared/contracts.js';
import {
  createFallbackEvaluation,
  createFallbackSession,
  createSelfCheckComparison,
} from './fallbackEngine.js';

interface ProviderConfig {
  id: ProviderId;
  label: string;
  envKey: string;
  envModel: string;
  defaultModel: string;
}

const providerConfigs: ProviderConfig[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    envKey: 'OPENAI_API_KEY',
    envModel: 'OPENAI_MODEL',
    defaultModel: 'gpt-4.1-mini',
  },
  {
    id: 'claude',
    label: 'Claude',
    envKey: 'ANTHROPIC_API_KEY',
    envModel: 'ANTHROPIC_MODEL',
    defaultModel: 'claude-3-5-sonnet-latest',
  },
  {
    id: 'gemini',
    label: 'Gemini',
    envKey: 'GEMINI_API_KEY',
    envModel: 'GEMINI_MODEL',
    defaultModel: 'gemini-2.0-flash',
  },
];

const providerRequestTimeoutMs = 20000;

function getConfig(id: ProviderId) {
  const config = providerConfigs.find((entry) => entry.id === id);
  if (!config) {
    throw new Error(`Unknown provider: ${id}`);
  }
  return config;
}

function getApiKey(config: ProviderConfig) {
  return process.env[config.envKey]?.trim();
}

function getModel(config: ProviderConfig) {
  return process.env[config.envModel]?.trim() || config.defaultModel;
}

function extractJsonObject(raw: string) {
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');

  if (start === -1 || end === -1) {
    throw new Error('JSON object not found');
  }

  return cleaned.slice(start, end + 1);
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = providerRequestTimeoutMs) {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Provider request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutHandle);
  }
}

async function callOpenAI(systemPrompt: string, userPrompt: string, model: string, apiKey: string) {
  const response = await fetchWithTimeout('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      instructions: systemPrompt,
      input: userPrompt,
      text: {
        format: {
          type: 'text',
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status} ${await response.text()}`.trim());
  }

  const payload = (await response.json()) as {
    output?: Array<{
      content?: Array<{ type?: string; text?: string }>;
    }>;
  };

  const text = payload.output
    ?.flatMap((item) => item.content ?? [])
    .filter((item) => item.type === 'output_text')
    .map((item) => item.text ?? '')
    .join('\n')
    .trim();

  if (!text) {
    throw new Error('OpenAI response was empty');
  }

  return text;
}

async function callClaude(systemPrompt: string, userPrompt: string, model: string, apiKey: string) {
  const response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude request failed: ${response.status} ${await response.text()}`.trim());
  }

  const payload = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };

  const text = payload.content
    ?.filter((item) => item.type === 'text')
    .map((item) => item.text ?? '')
    .join('\n')
    .trim();

  if (!text) {
    throw new Error('Claude response was empty');
  }

  return text;
}

async function callGemini(systemPrompt: string, userPrompt: string, model: string, apiKey: string) {
  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed: ${response.status} ${await response.text()}`.trim());
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const text = payload.candidates?.[0]?.content?.parts?.map((item) => item.text ?? '').join('\n').trim();

  if (!text) {
    throw new Error('Gemini response was empty');
  }

  return text;
}

async function requestText(providerId: ProviderId, systemPrompt: string, userPrompt: string) {
  const config = getConfig(providerId);
  const apiKey = getApiKey(config);
  const model = getModel(config);

  if (!apiKey) {
    throw new Error(`${config.label} API key is not configured`);
  }

  switch (providerId) {
    case 'openai':
      return {
        model,
        text: await callOpenAI(systemPrompt, userPrompt, model, apiKey),
      };
    case 'claude':
      return {
        model,
        text: await callClaude(systemPrompt, userPrompt, model, apiKey),
      };
    case 'gemini':
      return {
        model,
        text: await callGemini(systemPrompt, userPrompt, model, apiKey),
      };
  }
}

export function getProviderStatuses(): ProviderStatus[] {
  return providerConfigs.map((config) => {
    const configured = Boolean(getApiKey(config));

    return {
      id: config.id,
      label: config.label,
      configured,
      model: getModel(config),
      availability: configured ? 'configured' : 'fallback-only',
      note: configured
        ? 'API キー検出済み。各実行結果ごとに Remote / Fallback を表示します。'
        : 'API キー未設定のため、このプロバイダは fallback 専用です。',
    };
  });
}

function summarizeError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return message.replace(/\s+/g, ' ').slice(0, 240);
}

function buildFallbackProviderMessage(providerId: ProviderId, action: string, error: unknown) {
  const config = getConfig(providerId);
  const configured = Boolean(getApiKey(config));

  if (!configured) {
    return `${config.label} の API キー未設定のため、ローカル fallback で${action}しました。`;
  }

  return `${config.label} Remote ${action} に失敗したため、ローカル fallback を使用しました。原因: ${summarizeError(error)}`;
}

export async function buildGeneratedSession(
  request: GenerateSessionRequest,
  scenario: Scenario,
): Promise<GeneratedSession> {
  const fallback = createFallbackSession(request, scenario);
  const systemPrompt =
    'あなたは日本語のビジネス会話トレーナーです。必ず JSON のみを返してください。';
  const userPrompt = [
    '以下のシナリオを基に、短いコーチング情報を JSON で返してください。',
    '必須キー: suggestedAnswerFrame(string[]), coachNote(string), followUps(string[])',
    `moduleId: ${request.moduleId}`,
    `timeLimitSec: ${request.timeLimitSec}`,
    `customFocus: ${request.customFocus ?? 'なし'}`,
    `scenarioTitle: ${scenario.title}`,
    `scenarioContext: ${scenario.context}`,
    `scenarioPrompt: ${scenario.prompt}`,
    `followUps: ${scenario.followUps.join(' / ')}`,
  ].join('\n');

  try {
    const response = await requestText(request.providerId, systemPrompt, userPrompt);
    const parsed = JSON.parse(extractJsonObject(response.text)) as {
      suggestedAnswerFrame?: string[];
      coachNote?: string;
      followUps?: string[];
    };

    return {
      ...fallback,
      suggestedAnswerFrame: parsed.suggestedAnswerFrame?.length
        ? parsed.suggestedAnswerFrame
        : fallback.suggestedAnswerFrame,
      coachNote: parsed.coachNote ?? fallback.coachNote,
      scenario: {
        ...scenario,
        followUps: parsed.followUps?.length ? parsed.followUps : scenario.followUps,
      },
      providerMessage: `${getConfig(request.providerId).label} (${response.model}) で生成しました。`,
      fallbackUsed: false,
    };
  } catch (error) {
    return {
      ...fallback,
      providerMessage: buildFallbackProviderMessage(request.providerId, 'シナリオ生成', error),
    };
  }
}

export async function buildEvaluation(
  request: EvaluateSessionRequest,
  rubric: Rubric,
): Promise<EvaluationResult> {
  const fallback = createFallbackEvaluation(request, rubric);
  const systemPrompt =
    'あなたは日本語の会話コーチです。回答を採点し、必ず JSON のみで返してください。';
  const userPrompt = [
    '以下の会話回答を採点してください。',
    '必須キー: overallScore(number), band(string), summary(string), strengths(string[]), risks(string[]), nextActions(string[]), breakdown([{criterionId,label,score,rationale,improvement}]), metrics(object), selfCheckComparison(object|null)',
    `moduleId: ${request.moduleId}`,
    `answerPreparationSec: ${request.answerPreparationSec}`,
    `rubric: ${JSON.stringify(rubric)}`,
    `transcript: ${request.transcript}`,
    `selfReview: ${request.selfReview ?? ''}`,
    `baselineSelfCheck: ${request.baselineSelfCheck ? JSON.stringify(request.baselineSelfCheck) : 'none'}`,
  ].join('\n');

  try {
    const response = await requestText(request.providerId, systemPrompt, userPrompt);
    const parsed = JSON.parse(extractJsonObject(response.text)) as Partial<EvaluationResult>;
    const overallScore =
      typeof parsed.overallScore === 'number' ? Number(parsed.overallScore.toFixed(1)) : fallback.overallScore;
    const fallbackComparison = createSelfCheckComparison(request.baselineSelfCheck, overallScore);

    return {
      ...fallback,
      overallScore,
      band: parsed.band ?? fallback.band,
      summary: parsed.summary ?? fallback.summary,
      strengths: parsed.strengths?.length ? parsed.strengths : fallback.strengths,
      risks: parsed.risks?.length ? parsed.risks : fallback.risks,
      nextActions: parsed.nextActions?.length ? parsed.nextActions : fallback.nextActions,
      breakdown:
        parsed.breakdown?.length === fallback.breakdown.length
          ? parsed.breakdown.map((item, index) => ({
              criterionId: item.criterionId ?? fallback.breakdown[index].criterionId,
              label: item.label ?? fallback.breakdown[index].label,
              score:
                typeof item.score === 'number'
                  ? Math.max(1, Math.min(5, Math.round(item.score)))
                  : fallback.breakdown[index].score,
              rationale: item.rationale ?? fallback.breakdown[index].rationale,
              improvement: item.improvement ?? fallback.breakdown[index].improvement,
            }))
          : fallback.breakdown,
      metrics: parsed.metrics ?? fallback.metrics,
      fallbackUsed: false,
      providerMessage: `${getConfig(request.providerId).label} (${response.model}) で採点しました。`,
      savedAt: new Date().toISOString(),
      baselineSelfCheck: request.baselineSelfCheck,
      selfCheckComparison: parsed.selfCheckComparison ?? fallbackComparison,
    };
  } catch (error) {
    return {
      ...fallback,
      providerMessage: buildFallbackProviderMessage(request.providerId, '採点', error),
    };
  }
}
