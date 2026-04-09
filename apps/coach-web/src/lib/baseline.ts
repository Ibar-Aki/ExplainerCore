import type { BaselineAbilityScore, BaselineSelfCheck } from '../../shared/contracts.js';

export interface BaselineQuestion {
  id: string;
  ability: string;
  prompt: string;
}

export const baselineQuestions: BaselineQuestion[] = [
  {
    id: 'clarity-1',
    ability: '説明の明快さ',
    prompt: '会議で説明を始めるとき、最初の一言で結論を言えている。',
  },
  {
    id: 'clarity-2',
    ability: '説明の明快さ',
    prompt: '聞き手に合わせて、抽象度や粒度を調整できている。',
  },
  {
    id: 'speed-1',
    ability: '即答力',
    prompt: '急に振られても、数秒で話し始められる。',
  },
  {
    id: 'speed-2',
    ability: '即答力',
    prompt: '30 秒程度でも崩れずに要点を伝えられる。',
  },
  {
    id: 'defense-1',
    ability: '詰め対応',
    prompt: '厳しい質問でも、論点を見失わずに答えられる。',
  },
  {
    id: 'defense-2',
    ability: '詰め対応',
    prompt: '分からないことを無理に断定せず、守りながら会話を進められる。',
  },
  {
    id: 'persuasion-1',
    ability: '説得力',
    prompt: '提案時に、相手のメリットを先に置いて説明できている。',
  },
  {
    id: 'persuasion-2',
    ability: '説得力',
    prompt: '反対意見を想定し、先回りして安心材料を示せる。',
  },
];

export const baselineInitialAnswers = Object.fromEntries(
  baselineQuestions.map((question) => [question.id, 3]),
) as Record<string, number>;

export const baselineDraftStorageKey = 'explainercore.baseline-draft';

export function buildBaselineAbilities(answers: Record<string, number>): BaselineAbilityScore[] {
  return ['説明の明快さ', '即答力', '詰め対応', '説得力'].map((ability) => {
    const questions = baselineQuestions.filter((question) => question.ability === ability);
    const score = questions.reduce((sum, question) => sum + answers[question.id], 0) / questions.length;
    return { ability, score };
  });
}

export function calculateBaselineAverage(answers: Record<string, number>) {
  return baselineQuestions.reduce((sum, question) => sum + answers[question.id], 0) / baselineQuestions.length;
}

export function buildBaselineSelfCheck(
  answers: Record<string, number>,
  note: string,
): BaselineSelfCheck {
  const average = calculateBaselineAverage(answers);
  const abilities = buildBaselineAbilities(answers);

  return {
    answers,
    note: note.trim() || undefined,
    average,
    abilities,
  };
}

export function loadBaselineDraft() {
  if (typeof window === 'undefined') {
    return {
      answers: baselineInitialAnswers,
      note: '',
    };
  }

  try {
    const raw = window.localStorage.getItem(baselineDraftStorageKey);
    if (!raw) {
      return {
        answers: baselineInitialAnswers,
        note: '',
      };
    }

    const parsed = JSON.parse(raw) as { answers?: Record<string, number>; note?: string };
    return {
      answers: {
        ...baselineInitialAnswers,
        ...(parsed.answers ?? {}),
      },
      note: parsed.note ?? '',
    };
  } catch {
    return {
      answers: baselineInitialAnswers,
      note: '',
    };
  }
}

export function saveBaselineDraft(answers: Record<string, number>, note: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    baselineDraftStorageKey,
    JSON.stringify({
      answers,
      note,
    }),
  );
}
