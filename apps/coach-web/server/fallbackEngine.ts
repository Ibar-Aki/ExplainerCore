import type {
  BaselineSelfCheck,
  EvaluateSessionRequest,
  EvaluationResult,
  GeneratedSession,
  GenerateSessionRequest,
  Rubric,
  ScoreBreakdown,
  Scenario,
  SelfCheckComparison,
} from '../shared/contracts.js';

function countMatches(source: string, markers: string[]) {
  return markers.reduce((count, marker) => count + (source.includes(marker) ? 1 : 0), 0);
}

function countOccurrences(source: string, markers: string[]) {
  return markers.reduce((count, marker) => {
    const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matches = source.match(new RegExp(escaped, 'g'));
    return count + (matches?.length ?? 0);
  }, 0);
}

function clampScore(value: number) {
  return Math.max(1, Math.min(5, Math.round(value)));
}

function normalizeText(value: string) {
  return value.toLowerCase();
}

function containsKeyword(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function estimateReadingSec(charCount: number) {
  return Math.max(5, Math.round(charCount / 6));
}

function buildAnswerFrame(moduleId: GenerateSessionRequest['moduleId']) {
  switch (moduleId) {
    case 'baseline-assessor':
      return ['結論', '理由', '影響', '次の打ち手'];
    case 'rapid-response-drill':
      return ['結論', '今の状況', '一番重要なリスク', '次アクション'];
    case 'pressure-defense-simulator':
      return ['事実', '現時点の解釈', '不足情報', '是正策'];
    case 'persuasion-lab':
      return ['相手の利益', '提案内容', '懸念への対応', '合意したい次ステップ'];
  }
}

function buildCoachNote(moduleId: GenerateSessionRequest['moduleId']) {
  switch (moduleId) {
    case 'baseline-assessor':
      return '一言目で結論を出し、その後に理由と次の一手を短く続けてください。';
    case 'rapid-response-drill':
      return '最初の 5 秒で結論を置き、背景ではなく状況要約を優先してください。';
    case 'pressure-defense-simulator':
      return '防御ではなく整理を優先し、事実と見通しを分けて答えると崩れにくくなります。';
    case 'persuasion-lab':
      return '相手の利益を先に置いてから提案に入ると、説得力が安定します。';
  }
}

export function createFallbackSession(
  request: GenerateSessionRequest,
  scenario: Scenario,
): GeneratedSession {
  const sessionId = `session-${Date.now()}`;

  return {
    sessionId,
    moduleId: request.moduleId,
    providerId: request.providerId,
    scenario,
    suggestedAnswerFrame: buildAnswerFrame(request.moduleId),
    coachNote: buildCoachNote(request.moduleId),
    providerMessage: 'API キー未設定または応答失敗のため、ローカル fallback でシナリオを組み立てました。',
    fallbackUsed: true,
    timeLimitSec: request.timeLimitSec,
    createdAt: new Date().toISOString(),
  };
}

function buildBreakdown(
  rubric: Rubric,
  transcript: string,
  answerPreparationSec: number,
  timeLimitSec: number,
): ScoreBreakdown[] {
  const structureMarkers = countMatches(transcript, ['結論', '理由', 'まず', '次に', '最後に', '要するに']);
  const benefitMarkers = countMatches(transcript, ['メリット', '効果', '便益', '価値', '改善']);
  const repairMarkers = countMatches(transcript, ['確認', '是正', '再発防止', '対応', '次']);
  const hedgeMarkers = countMatches(transcript, ['現時点', '確認中', '見込み', '仮説', '未確定']);
  const interactionMarkers = countMatches(transcript, ['確認', '認識', '判断', '相手', '意図']);
  const responsibilityMarkers = countMatches(transcript, ['責任', '私の判断', '見落とし', '説明責任', '担当']);
  const boundaryMarkers = countMatches(transcript, ['確認できている範囲', '未確認', '言える範囲', '現時点', '前提']);
  const charCount = transcript.length;
  const estimatedReading = estimateReadingSec(charCount);
  const conciseBonus = charCount > 120 && charCount < 380 ? 1 : 0;
  const fillerCount = countOccurrences(transcript, ['えっと', 'えーと', 'ええと', 'あの', 'そのー']);
  const longPauseCount = countOccurrences(transcript, ['…', '......', '（沈黙）', '[pause]', '(pause)']);
  const fillerPenalty = fillerCount * 0.35 + longPauseCount * 0.2;
  const timeboxScore =
    estimatedReading <= timeLimitSec
      ? 4.8
      : estimatedReading <= Math.round(timeLimitSec * 1.2)
        ? 3.6
        : estimatedReading <= Math.round(timeLimitSec * 1.5)
          ? 2.6
          : 1.8;

  return rubric.criteria.map((criterion) => {
    const criterionText = normalizeText(
      `${criterion.name} ${criterion.description} ${criterion.signals.join(' ')}`,
    );
    let rawScore = 3;

    if (containsKeyword(criterionText, ['速度', '初動', '応答', '無音'])) {
      rawScore = 5 - Math.min(answerPreparationSec, 12) * 0.25;
    } else if (containsKeyword(criterionText, ['時間設計', '時間内', '30', '60', '90', '秒'])) {
      rawScore = timeboxScore;
    } else if (containsKeyword(criterionText, ['簡潔', '端的', '冗長', '時間内'])) {
      rawScore = charCount < 420 ? 4 : 2.5;
    } else if (containsKeyword(criterionText, ['構造', '順序', '理由', '次アクション'])) {
      rawScore = 2 + structureMarkers * 0.75;
    } else if (containsKeyword(criterionText, ['明快', '明確', '結論', '要点'])) {
      rawScore = 2.4 + structureMarkers * 0.6 + conciseBonus;
    } else if (containsKeyword(criterionText, ['対話', '確認', '認識', '聞き手', '判断材料'])) {
      rawScore = 2.3 + interactionMarkers * 0.55 + repairMarkers * 0.2;
    } else if (containsKeyword(criterionText, ['説得', '便益', '相手', '効果'])) {
      rawScore = 2.4 + benefitMarkers * 0.7 + repairMarkers * 0.15;
    } else if (containsKeyword(criterionText, ['利害関係者', '相手別'])) {
      rawScore = 2.4 + benefitMarkers * 0.55 + interactionMarkers * 0.35;
    } else if (containsKeyword(criterionText, ['両面', 'リスク', '透明', '不確実性'])) {
      rawScore = 2.2 + hedgeMarkers * 0.55 + benefitMarkers * 0.45;
    } else if (containsKeyword(criterionText, ['反論', 'トレードオフ', '懸念'])) {
      rawScore = 2.3 + hedgeMarkers * 0.4 + benefitMarkers * 0.35;
    } else if (containsKeyword(criterionText, ['責任', '説明責任', '自己否定'])) {
      rawScore = 2.2 + responsibilityMarkers * 0.6 + hedgeMarkers * 0.2;
    } else if (containsKeyword(criterionText, ['境界', '未確認', '言える範囲', '不当'])) {
      rawScore = 2.2 + boundaryMarkers * 0.55 + hedgeMarkers * 0.25;
    } else if (containsKeyword(criterionText, ['落ち着き', 'テンポ', '感情'])) {
      rawScore = 3.2 - fillerPenalty;
    } else if (containsKeyword(criterionText, ['着地', '修復', '次アクション', '宿題'])) {
      rawScore = 2.3 + repairMarkers * 0.7;
    } else if (containsKeyword(criterionText, ['論点', '詰め', '防御', '追及'])) {
      rawScore = 2.2 + hedgeMarkers * 0.5 + repairMarkers * 0.45;
    } else {
      rawScore = 3;
    }

    const score = clampScore(rawScore);

    return {
      criterionId: criterion.id,
      label: criterion.name,
      score,
      rationale:
        score >= 4
          ? `${criterion.name}は比較的安定しています。`
          : `${criterion.name}は改善余地があります。`,
      improvement: `${criterion.signals[0] ?? '要点整理'}を次回は冒頭に反映してください。`,
    };
  });
}

export function createSelfCheckComparison(
  baselineSelfCheck: BaselineSelfCheck | undefined,
  aiOverallScore: number,
): SelfCheckComparison | undefined {
  if (!baselineSelfCheck) {
    return undefined;
  }

  const delta = Number((aiOverallScore - baselineSelfCheck.average).toFixed(1));
  const summary =
    Math.abs(delta) < 0.4
      ? '自己認識と AI 評価は概ね一致しています。'
      : delta > 0
        ? '自己認識より AI 評価が高く、実力を控えめに見積もっている可能性があります。'
        : '自己認識より AI 評価が低く、構造化や一言目の精度を再確認した方がよい状態です。';

  return {
    selfAverage: baselineSelfCheck.average,
    aiOverallScore,
    delta,
    summary,
  };
}

export function createFallbackEvaluation(
  request: EvaluateSessionRequest,
  rubric: Rubric,
): EvaluationResult {
  const transcript = request.transcript.trim();
  let breakdown = buildBreakdown(rubric, transcript, request.answerPreparationSec, request.timeLimitSec);
  let weightedScore =
    breakdown.reduce((sum, item) => {
      const criterion = rubric.criteria.find((entry) => entry.id === item.criterionId);
      return sum + item.score * (criterion?.weight ?? 0);
    }, 0) /
    rubric.criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  let overallScore = Number(weightedScore.toFixed(1));
  let selfCheckComparison = createSelfCheckComparison(request.baselineSelfCheck, overallScore);

  breakdown = breakdown.map((item) => {
    if (item.criterionId !== 'metacognition') {
      return item;
    }

    if (!selfCheckComparison) {
      return {
        ...item,
        score: 3,
        rationale: '自己評価がないため、今回は中立評価にしています。',
        improvement: 'Baseline Assessor では先に自己評価を入力し、差分の推移も見てください。',
      };
    }

    const gap = Math.abs(selfCheckComparison.delta);
    const score = gap < 0.4 ? 5 : gap < 0.8 ? 4 : gap < 1.3 ? 3 : gap < 1.8 ? 2 : 1;

    return {
      ...item,
      score,
      rationale:
        gap < 0.8
          ? '自己評価と AI 評価の差分は比較的安定しています。'
          : '自己評価と AI 評価の差分が大きく、自己認識の調整余地があります。',
      improvement: '回答前の自己評価と回答後の transcript を見比べ、過大評価か過小評価かを言語化してください。',
    };
  });

  weightedScore =
    breakdown.reduce((sum, item) => {
      const criterion = rubric.criteria.find((entry) => entry.id === item.criterionId);
      return sum + item.score * (criterion?.weight ?? 0);
    }, 0) /
    rubric.criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  overallScore = Number(weightedScore.toFixed(1));
  const band = overallScore >= 4.2 ? '強い' : overallScore >= 3 ? '実務で通用' : '要改善';
  selfCheckComparison = createSelfCheckComparison(request.baselineSelfCheck, overallScore);

  const strengths = breakdown
    .filter((item) => item.score >= 4)
    .map((item) => `${item.label}が比較的安定しています。`)
    .slice(0, 2);
  const risks = breakdown
    .filter((item) => item.score <= 3)
    .map((item) => `${item.label}は次回の重点改善対象です。`)
    .slice(0, 2);
  const nextActions = breakdown
    .slice()
    .sort((left, right) => left.score - right.score)
    .slice(0, 3)
    .map((item) => `${item.label}: ${item.improvement}`);

  return {
    sessionId: request.sessionId,
    moduleId: request.moduleId,
    providerId: request.providerId,
    overallScore,
    band,
    summary:
      overallScore >= 4
        ? '回答は比較的整理されています。次はより短く、相手視点を強めると伸びます。'
        : '回答の骨格はありますが、冒頭の結論と構造の明示を強めると大きく改善します。',
    strengths: strengths.length > 0 ? strengths : ['内容は成立しており、改善の土台があります。'],
    risks: risks.length > 0 ? risks : ['大きな破綻はありませんが、再現性の確認が必要です。'],
    nextActions,
    breakdown,
    metrics: {
      answerPreparationSec: request.answerPreparationSec,
      timeLimitSec: request.timeLimitSec,
      charCount: transcript.length,
      estimatedReadingSec: estimateReadingSec(transcript.length),
      structureMarkerCount: countMatches(transcript, ['結論', '理由', 'まず', '次に', '最後に']),
      benefitMarkerCount: countMatches(transcript, ['メリット', '効果', '便益']),
      repairMarkerCount: countMatches(transcript, ['確認', '対応', '次']),
      hedgeMarkerCount: countMatches(transcript, ['現時点', '確認中', '見込み', '仮説', '未確定']),
      closingMarkerCount: countMatches(transcript, ['次アクション', '判断', '合意', '進めます']),
      fillerCount: countOccurrences(transcript, ['えっと', 'えーと', 'ええと', 'あの', 'そのー']),
      longPauseCount: countOccurrences(transcript, ['…', '......', '（沈黙）', '[pause]', '(pause)']),
      selfPerceptionGap: selfCheckComparison?.delta ?? 0,
    },
    fallbackUsed: true,
    providerMessage: 'ローカル fallback ルーブリックで採点しました。',
    savedAt: new Date().toISOString(),
    baselineSelfCheck: request.baselineSelfCheck,
    selfCheckComparison,
  };
}
