import type { BaselineAbilityScore } from '../../shared/contracts.js';
import type { BaselineQuestion } from '../lib/baseline.js';

function formatScore(score: number) {
  return score.toFixed(1);
}

interface BaselineSelfCheckPanelProps {
  baselineAbilities: BaselineAbilityScore[];
  baselineAnswers: Record<string, number>;
  baselineAverage: number;
  baselineNote: string;
  questions: BaselineQuestion[];
  onAnswersChange: (updater: (current: Record<string, number>) => Record<string, number>) => void;
  onNoteChange: (value: string) => void;
}

export function BaselineSelfCheckPanel(props: BaselineSelfCheckPanelProps) {
  const {
    baselineAbilities,
    baselineAnswers,
    baselineAverage,
    baselineNote,
    onAnswersChange,
    onNoteChange,
    questions,
  } = props;

  return (
    <section className="panel">
      <div className="section-heading compact">
        <h3>Baseline Self Check</h3>
        <p>初回の自己認識を数値化して、AI 採点結果とのズレも確認します。</p>
      </div>

      <div className="summary-grid">
        <div className="summary-card emphasis">
          <span>自己診断平均</span>
          <strong>{formatScore(baselineAverage)}</strong>
          <small>5 点満点の自己評価です。</small>
        </div>
        {baselineAbilities.map((item) => (
          <div key={item.ability} className="summary-card">
            <span>{item.ability}</span>
            <strong>{formatScore(item.score)}</strong>
            <small>{item.score >= 3.5 ? '比較的自信あり' : '重点訓練候補'}</small>
          </div>
        ))}
      </div>

      <div className="question-grid">
        {questions.map((question) => (
          <label key={question.id} className="question-card">
            <div className="provider-row">
              <strong>{question.ability}</strong>
              <span>{baselineAnswers[question.id]}/5</span>
            </div>
            <p>{question.prompt}</p>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={baselineAnswers[question.id]}
              onChange={(event) =>
                onAnswersChange((current) => ({
                  ...current,
                  [question.id]: Number(event.target.value),
                }))
              }
            />
          </label>
        ))}
      </div>

      <label>
        自己認識メモ
        <textarea
          rows={3}
          value={baselineNote}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="例: 結論を言う前に背景から入りがち / 詰められると語尾が弱くなる"
        />
      </label>
    </section>
  );
}
