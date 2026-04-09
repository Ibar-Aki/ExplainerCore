export type ModuleId =
  | 'baseline-assessor'
  | 'rapid-response-drill'
  | 'pressure-defense-simulator'
  | 'persuasion-lab'
  | 'session-review-dashboard';

export type ProviderId = 'openai' | 'claude' | 'gemini';

export interface BaselineAbilityScore {
  ability: string;
  score: number;
}

export interface BaselineSelfCheck {
  answers: Record<string, number>;
  note?: string;
  average: number;
  abilities: BaselineAbilityScore[];
}

export interface SelfCheckComparison {
  selfAverage: number;
  aiOverallScore: number;
  delta: number;
  summary: string;
}

export interface TrainingModule {
  id: ModuleId;
  title: string;
  summary: string;
  goal: string;
  primarySkills: string[];
  defaultTimeLimitSec: number;
}

export const trainingModules: TrainingModule[] = [
  {
    id: 'baseline-assessor',
    title: 'Baseline Assessor',
    summary: '現状の説明力と会話力を横断診断する。',
    goal: '現状把握と再測定比較',
    primarySkills: ['説明の明快さ', '構造化', '応答速度'],
    defaultTimeLimitSec: 60,
  },
  {
    id: 'rapid-response-drill',
    title: 'Rapid Response Drill',
    summary: '短時間で崩れずに答える反射神経を鍛える。',
    goal: '会議の即答力向上',
    primarySkills: ['初動速度', '端的さ', '結論先行'],
    defaultTimeLimitSec: 45,
  },
  {
    id: 'pressure-defense-simulator',
    title: 'Pressure Defense Simulator',
    summary: '厳しい追及でも論点を守る練習を行う。',
    goal: '詰め対応と防御力向上',
    primarySkills: ['論点維持', '落ち着き', '再着地'],
    defaultTimeLimitSec: 90,
  },
  {
    id: 'persuasion-lab',
    title: 'Persuasion Lab',
    summary: '提案を通すための説得と反論処理を鍛える。',
    goal: '社内提案の納得感向上',
    primarySkills: ['相手視点', '提案構造', 'クロージング'],
    defaultTimeLimitSec: 90,
  },
  {
    id: 'session-review-dashboard',
    title: 'Session Review Dashboard',
    summary: '過去セッションを比較し、改善点を見つける。',
    goal: '振り返りと比較',
    primarySkills: ['傾向分析', '改善点抽出', '再計画'],
    defaultTimeLimitSec: 0,
  },
];

export interface RubricCriterion {
  id: string;
  name: string;
  weight: number;
  description: string;
  signals: string[];
}

export interface Rubric {
  id: string;
  moduleId: Exclude<ModuleId, 'session-review-dashboard'>;
  title: string;
  description: string;
  scale: {
    min: number;
    max: number;
    labels: Record<string, string>;
  };
  criteria: RubricCriterion[];
  aggregateMetrics: string[];
}

export interface Scenario {
  id: string;
  moduleId: Exclude<ModuleId, 'session-review-dashboard'>;
  title: string;
  difficulty: 'basic' | 'stretch' | 'pressure';
  context: string;
  role: string;
  prompt: string;
  followUps: string[];
  successSignals: string[];
  constraints: string[];
}

export interface ProviderStatus {
  id: ProviderId;
  label: string;
  configured: boolean;
  model: string;
  availability: 'configured' | 'fallback-only';
  note: string;
}

export interface BootstrapData {
  generatedAt: string;
  providers: ProviderStatus[];
  modules: TrainingModule[];
  rubrics: Rubric[];
  scenarios: Scenario[];
}

export interface GeneratedSession {
  sessionId: string;
  moduleId: Exclude<ModuleId, 'session-review-dashboard'>;
  providerId: ProviderId;
  scenario: Scenario;
  suggestedAnswerFrame: string[];
  coachNote: string;
  providerMessage: string;
  fallbackUsed: boolean;
  timeLimitSec: number;
  createdAt: string;
}

export interface GenerateSessionRequest {
  moduleId: Exclude<ModuleId, 'session-review-dashboard'>;
  providerId: ProviderId;
  scenarioId?: string;
  customFocus?: string;
  timeLimitSec: number;
}

export interface ScoreBreakdown {
  criterionId: string;
  label: string;
  score: number;
  rationale: string;
  improvement: string;
}

export interface EvaluationResult {
  sessionId: string;
  moduleId: Exclude<ModuleId, 'session-review-dashboard'>;
  providerId: ProviderId;
  overallScore: number;
  band: string;
  summary: string;
  strengths: string[];
  risks: string[];
  nextActions: string[];
  breakdown: ScoreBreakdown[];
  metrics: Record<string, number | string>;
  fallbackUsed: boolean;
  providerMessage: string;
  savedAt: string;
  baselineSelfCheck?: BaselineSelfCheck;
  selfCheckComparison?: SelfCheckComparison;
}

export interface EvaluateSessionRequest {
  sessionId: string;
  moduleId: Exclude<ModuleId, 'session-review-dashboard'>;
  providerId: ProviderId;
  scenarioId: string;
  transcript: string;
  selfReview?: string;
  answerPreparationSec: number;
  audioFileName?: string;
  baselineSelfCheck?: BaselineSelfCheck;
}

export interface AudioUploadRequest {
  sessionId: string;
  mimeType: string;
  base64Data: string;
}

export interface AudioUploadResponse {
  fileName: string;
}

export interface SessionHistoryItem {
  sessionId: string;
  moduleId: Exclude<ModuleId, 'session-review-dashboard'>;
  providerId: ProviderId;
  scenarioId: string;
  scenarioTitle: string;
  overallScore: number;
  band: string;
  summary: string;
  savedAt: string;
  fallbackUsed: boolean;
  baselineSelfCheckAverage?: number;
  selfCheckDelta?: number;
}

export interface SessionTranscriptRecord {
  sessionId: string;
  moduleId: Exclude<ModuleId, 'session-review-dashboard'>;
  providerId: ProviderId;
  scenarioId: string;
  scenarioTitle: string;
  transcript: string;
  selfReview?: string;
  answerPreparationSec: number;
  audioFileName?: string;
  savedAt: string;
  baselineSelfCheck?: BaselineSelfCheck;
}
