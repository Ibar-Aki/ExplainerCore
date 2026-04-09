import type { EvaluationResult, GeneratedSession, Rubric, Scenario } from '../../shared/contracts.js';

function formatScore(score: number) {
  return score.toFixed(1);
}

interface PracticeWorkspaceProps {
  audioFileName: string;
  audioUrl: string;
  currentRubric?: Rubric;
  currentScenarios: Scenario[];
  deferredTranscriptLength: number;
  elapsedSec: number;
  evaluation: EvaluationResult | null;
  generatedSession: GeneratedSession | null;
  isRecording: boolean;
  loading: boolean;
  selfReview: string;
  selectedScenarioId: string;
  timeLimitSec: number;
  transcript: string;
  customFocus: string;
  onCustomFocusChange: (value: string) => void;
  onEvaluate: () => void;
  onGenerate: () => void;
  onScenarioChange: (scenarioId: string) => void;
  onSelfReviewChange: (value: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTimeLimitChange: (value: number) => void;
  onTranscriptChange: (value: string) => void;
}

export function PracticeWorkspace(props: PracticeWorkspaceProps) {
  const {
    audioFileName,
    audioUrl,
    currentRubric,
    currentScenarios,
    customFocus,
    deferredTranscriptLength,
    elapsedSec,
    evaluation,
    generatedSession,
    isRecording,
    loading,
    onCustomFocusChange,
    onEvaluate,
    onGenerate,
    onScenarioChange,
    onSelfReviewChange,
    onStartRecording,
    onStopRecording,
    onTimeLimitChange,
    onTranscriptChange,
    selectedScenarioId,
    selfReview,
    timeLimitSec,
    transcript,
  } = props;

  return (
    <>
      <section className="panel">
        <div className="section-heading compact">
          <h3>Session Setup</h3>
          <p>シナリオ、重点観点、制限時間を決めてセッションを生成します。</p>
        </div>

        <div className="form-grid">
          <label>
            シナリオ
            <select value={selectedScenarioId} onChange={(event) => onScenarioChange(event.target.value)}>
              {currentScenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            制限時間 (秒)
            <input
              type="number"
              min={15}
              max={180}
              value={timeLimitSec}
              onChange={(event) => onTimeLimitChange(Number(event.target.value))}
            />
          </label>

          <label className="wide">
            今回の重点
            <input
              type="text"
              placeholder="例: 結論を先に置く / 反論先回りを強める"
              value={customFocus}
              onChange={(event) => onCustomFocusChange(event.target.value)}
            />
          </label>
        </div>

        <button className="primary-button" type="button" onClick={onGenerate} disabled={loading}>
          セッション生成
        </button>
      </section>

      <section className="split-grid">
        <article className="panel">
          <div className="section-heading compact">
            <h3>Scenario</h3>
            <p>実戦に近い問いを先に読み、一言目の型を固めます。</p>
          </div>

          {generatedSession ? (
            <div className="scenario-block">
              <div className="scenario-meta">
                <span>{generatedSession.scenario.title}</span>
                <span>{generatedSession.scenario.difficulty}</span>
                <span>{generatedSession.providerMessage}</span>
              </div>
              <p className="scenario-context">{generatedSession.scenario.context}</p>
              <p className="scenario-prompt">{generatedSession.scenario.prompt}</p>

              <div className="mini-columns">
                <div>
                  <h4>答えの骨格</h4>
                  <ol>
                    {generatedSession.suggestedAnswerFrame.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h4>追及例</h4>
                  <ul>
                    {generatedSession.scenario.followUps.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="coach-note">
                <strong>Coach Note</strong>
                <p>{generatedSession.coachNote}</p>
              </div>
            </div>
          ) : (
            <p className="placeholder">ここに生成されたシナリオが表示されます。</p>
          )}
        </article>

        <article className="panel">
          <div className="section-heading compact">
            <h3>Record / Transcript</h3>
            <p>録音と簡易文字起こしを同時に回し、必要なら手動で補正します。</p>
          </div>

          <div className="recording-bar">
            <button className="primary-button" type="button" onClick={onStartRecording} disabled={!generatedSession || isRecording}>
              録音開始
            </button>
            <button className="ghost-button" type="button" onClick={onStopRecording} disabled={!isRecording}>
              録音停止
            </button>
            <div className="timer-chip">{isRecording ? `REC ${elapsedSec}s` : `制限 ${timeLimitSec}s`}</div>
          </div>

          <label>
            文字起こし
            <textarea
              rows={10}
              value={transcript}
              onChange={(event) => onTranscriptChange(event.target.value)}
              placeholder="音声認識に追記するか、手動で文字起こしを貼り付けます。"
            />
          </label>

          <label>
            自己レビュー
            <textarea
              rows={4}
              value={selfReview}
              onChange={(event) => onSelfReviewChange(event.target.value)}
              placeholder="例: 一言目が弱かった / 質問意図を取り違えた"
            />
          </label>

          <div className="mini-metrics">
            <span>文字数: {deferredTranscriptLength}</span>
            <span>録音ファイル: {audioFileName || '未保存'}</span>
          </div>

          {audioUrl && <audio className="audio-player" controls src={audioUrl} />}

          <button
            className="primary-button"
            type="button"
            onClick={onEvaluate}
            disabled={!generatedSession || !transcript.trim() || loading}
          >
            採点して保存
          </button>
        </article>
      </section>

      <section className="split-grid">
        <article className="panel">
          <div className="section-heading compact">
            <h3>Rubric</h3>
            <p>今回の採点観点です。スコアだけでなく、何を見ているかを先に明確にします。</p>
          </div>

          {currentRubric ? (
            <div className="rubric-list">
              {currentRubric.criteria.map((criterion) => (
                <div key={criterion.id} className="rubric-card">
                  <div className="provider-row">
                    <strong>{criterion.name}</strong>
                    <span>{criterion.weight}</span>
                  </div>
                  <p>{criterion.description}</p>
                  <small>{criterion.signals.join(' / ')}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="placeholder">ルーブリックを読み込んでいます。</p>
          )}
        </article>

        <article className="panel">
          <div className="section-heading compact">
            <h3>Evaluation</h3>
            <p>AI 採点か fallback 採点のどちらでも、改善アクションまで返します。</p>
          </div>

          {evaluation ? (
            <div className="evaluation-block">
              <div className="score-hero">
                <div>
                  <span>総合スコア</span>
                  <strong>{formatScore(evaluation.overallScore)}</strong>
                </div>
                <div>
                  <span>判定</span>
                  <strong>{evaluation.band}</strong>
                </div>
                <div>
                  <span>Mode</span>
                  <strong>{evaluation.fallbackUsed ? 'Fallback' : 'Remote'}</strong>
                </div>
              </div>

              <p className="evaluation-summary">{evaluation.summary}</p>
              <p className="provider-note">{evaluation.providerMessage}</p>

              {evaluation.selfCheckComparison && (
                <div className="comparison-card">
                  <div className="provider-row">
                    <strong>自己認識との比較</strong>
                    <span>{evaluation.selfCheckComparison.delta >= 0 ? '+' : ''}{formatScore(evaluation.selfCheckComparison.delta)}</span>
                  </div>
                  <p>
                    自己評価 {formatScore(evaluation.selfCheckComparison.selfAverage)} / AI 評価{' '}
                    {formatScore(evaluation.selfCheckComparison.aiOverallScore)}
                  </p>
                  <small>{evaluation.selfCheckComparison.summary}</small>
                </div>
              )}

              <div className="mini-columns">
                <div>
                  <h4>強み</h4>
                  <ul>
                    {evaluation.strengths.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>リスク</h4>
                  <ul>
                    {evaluation.risks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="breakdown-list">
                {evaluation.breakdown.map((item) => (
                  <div key={item.criterionId} className="breakdown-card">
                    <div className="provider-row">
                      <strong>{item.label}</strong>
                      <span>{item.score}/5</span>
                    </div>
                    <p>{item.rationale}</p>
                    <small>{item.improvement}</small>
                  </div>
                ))}
              </div>

              <div className="next-actions">
                <h4>次回アクション</h4>
                <ul>
                  {evaluation.nextActions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="placeholder">採点結果はここに表示されます。</p>
          )}
        </article>
      </section>
    </>
  );
}
