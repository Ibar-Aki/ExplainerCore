import type { SessionHistoryItem } from '../../shared/contracts.js';
import type { ModuleSummary } from '../lib/dashboard.js';

function formatScore(score: number) {
  return score.toFixed(1);
}

interface ReviewDashboardPanelProps {
  history: SessionHistoryItem[];
  latestAverage: number;
  latestThreeCount: number;
  moduleSummaries: ModuleSummary[];
  nextRecommendation: string;
  previousThreeCount: number;
  strongestModule?: ModuleSummary;
  trendDelta: number;
  weakestModule?: ModuleSummary;
}

export function ReviewDashboardPanel(props: ReviewDashboardPanelProps) {
  const {
    history,
    latestAverage,
    latestThreeCount,
    moduleSummaries,
    nextRecommendation,
    previousThreeCount,
    strongestModule,
    trendDelta,
    weakestModule,
  } = props;

  return (
    <section className="panel">
      <div className="section-heading compact">
        <h3>Session Review Dashboard</h3>
        <p>履歴から傾向を見て、次に鍛えるべき能力を決めます。</p>
      </div>

      <div className="summary-grid">
        <div className="summary-card emphasis">
          <span>次の推奨アクション</span>
          <strong>{history.length === 0 ? '初回診断' : weakestModule?.title ?? '再分析待ち'}</strong>
          <small>{nextRecommendation}</small>
        </div>
        <div className="summary-card">
          <span>直近 3 セッション傾向</span>
          <strong>{latestThreeCount > 0 ? formatScore(latestAverage) : '-'}</strong>
          <small>
            {previousThreeCount > 0
              ? `${trendDelta >= 0 ? '+' : ''}${formatScore(trendDelta)} の変化`
              : '比較履歴がまだ不足しています。'}
          </small>
        </div>
        <div className="summary-card">
          <span>最も強い領域</span>
          <strong>{strongestModule ? strongestModule.title : '未測定'}</strong>
          <small>{strongestModule ? `平均 ${formatScore(strongestModule.average)}` : '履歴を作ると表示されます。'}</small>
        </div>
        <div className="summary-card">
          <span>最優先で鍛える領域</span>
          <strong>{weakestModule ? weakestModule.title : '未測定'}</strong>
          <small>{weakestModule ? `平均 ${formatScore(weakestModule.average)}` : 'Baseline Assessor から始めてください。'}</small>
        </div>
      </div>

      <div className="history-list">
        {moduleSummaries.map((item) => (
          <div key={item.moduleId} className="history-card">
            <div className="provider-row">
              <strong>{item.title}</strong>
              <span>{item.count > 0 ? formatScore(item.average) : '-'}</span>
            </div>
            <p>{item.count > 0 ? `${item.count} 件の履歴から算出した平均です。` : 'まだこのモジュールの採点履歴はありません。'}</p>
            <small>記録件数 {item.count}</small>
          </div>
        ))}
      </div>

      <div className="history-list">
        {history.length > 0 ? (
          history.map((item) => (
            <div key={item.sessionId} className="history-card">
              <div className="provider-row">
                <strong>{item.scenarioTitle}</strong>
                <span>{item.overallScore.toFixed(1)}</span>
              </div>
              <p>{item.summary}</p>
              <small>
                {item.moduleId} / {item.providerId} / {item.savedAt}
              </small>
              {typeof item.selfCheckDelta === 'number' && (
                <small>
                  自己認識差分 {item.selfCheckDelta >= 0 ? '+' : ''}
                  {formatScore(item.selfCheckDelta)}
                </small>
              )}
            </div>
          ))
        ) : (
          <p className="placeholder">まだ履歴がありません。1 回採点するとここに蓄積されます。</p>
        )}
      </div>
    </section>
  );
}
