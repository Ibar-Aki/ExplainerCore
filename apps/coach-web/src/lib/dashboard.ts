import type { BaselineAbilityScore, SessionHistoryItem, TrainingModule } from '../../shared/contracts.js';

export interface ModuleSummary {
  moduleId: TrainingModule['id'];
  title: string;
  average: number;
  count: number;
}

export interface DashboardSnapshot {
  recentAverageLabel: string;
  moduleSummaries: ModuleSummary[];
  strongestModule?: ModuleSummary;
  weakestModule?: ModuleSummary;
  latestThree: SessionHistoryItem[];
  previousThree: SessionHistoryItem[];
  latestAverage: number;
  trendDelta: number;
  nextRecommendation: string;
  baselineAverage: number;
  baselineAbilities: BaselineAbilityScore[];
}

export function buildDashboardSnapshot(
  history: SessionHistoryItem[],
  modules: TrainingModule[],
  baselineAverage: number,
  baselineAbilities: BaselineAbilityScore[],
): DashboardSnapshot {
  const moduleTotals = new Map<string, { total: number; count: number }>();

  for (const item of history) {
    const current = moduleTotals.get(item.moduleId) ?? { total: 0, count: 0 };
    current.total += item.overallScore;
    current.count += 1;
    moduleTotals.set(item.moduleId, current);
  }

  const moduleSummaries = modules
    .filter((module) => module.id !== 'session-review-dashboard')
    .map((module) => {
      const stats = moduleTotals.get(module.id) ?? { total: 0, count: 0 };
      return {
        moduleId: module.id,
        title: module.title,
        average: stats.count > 0 ? stats.total / stats.count : 0,
        count: stats.count,
      };
    })
    .sort((left, right) => {
      if (left.count === 0 && right.count === 0) {
        return left.title.localeCompare(right.title);
      }
      if (left.count === 0) {
        return 1;
      }
      if (right.count === 0) {
        return -1;
      }
      return right.average - left.average;
    });

  const strongestModule = moduleSummaries.find((item) => item.count > 0);
  const weakestModule = [...moduleSummaries].reverse().find((item) => item.count > 0);
  const latestThree = history.slice(0, 3);
  const previousThree = history.slice(3, 6);
  const latestAverage =
    latestThree.length > 0 ? latestThree.reduce((sum, item) => sum + item.overallScore, 0) / latestThree.length : 0;
  const previousAverage =
    previousThree.length > 0
      ? previousThree.reduce((sum, item) => sum + item.overallScore, 0) / previousThree.length
      : 0;
  const trendDelta = latestAverage - previousAverage;

  return {
    recentAverageLabel:
      history.length > 0 ? (history.reduce((sum, item) => sum + item.overallScore, 0) / history.length).toFixed(1) : '-',
    moduleSummaries,
    strongestModule,
    weakestModule,
    latestThree,
    previousThree,
    latestAverage,
    trendDelta,
    nextRecommendation:
      history.length === 0
        ? 'まずは Baseline Assessor で自己診断と初回採点を 1 回実施してください。'
        : weakestModule
          ? `${weakestModule.title} の平均が最も低いため、次回はこのモジュールを 2 本続けて回すのが効率的です。`
          : '履歴が増えたら弱点別に優先順位を再計算します。',
    baselineAverage,
    baselineAbilities,
  };
}
