import type { EvidenceWarmup } from '../lib/evidenceWarmups.js';

function evidenceTone(level: EvidenceWarmup['evidenceLevel']) {
  switch (level) {
    case '強':
      return 'strong';
    case '中':
      return 'medium';
    default:
      return 'supporting';
  }
}

interface EvidenceWarmupsPanelProps {
  warmups: EvidenceWarmup[];
  onApplyFocusTemplate: (value: string) => void;
}

export function EvidenceWarmupsPanel(props: EvidenceWarmupsPanelProps) {
  const { onApplyFocusTemplate, warmups } = props;

  if (warmups.length === 0) {
    return null;
  }

  return (
    <section className="panel">
      <div className="section-heading compact">
        <h3>Evidence-Based Warmups</h3>
        <p>調査済みの短時間訓練から、このモジュールと相性が良いものだけを先に回せます。</p>
      </div>

      <div className="warmup-grid">
        {warmups.map((warmup) => (
          <article key={warmup.id} className="warmup-card">
            <div className="provider-row">
              <strong>{warmup.title}</strong>
              <div className="warmup-meta">
                <span className={`evidence-badge ${evidenceTone(warmup.evidenceLevel)}`}>{warmup.evidenceLevel}</span>
                <span>{warmup.durationLabel}</span>
              </div>
            </div>
            <p>{warmup.summary}</p>
            <small className="warmup-why">{warmup.whyItWorks}</small>

            <div className="warmup-steps">
              <h4>やり方</h4>
              <ol>
                {warmup.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="warmup-focus">
              <strong>重点テンプレート</strong>
              <p>{warmup.focusTemplate}</p>
            </div>

            <div className="warmup-footer">
              <small>{warmup.sourceNote}</small>
              <button className="ghost-button" type="button" onClick={() => onApplyFocusTemplate(warmup.focusTemplate)}>
                今回の重点に反映
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
