import type { ProviderId, ProviderStatus } from '../../shared/contracts.js';

interface ProviderPanelProps {
  providers: ProviderStatus[];
  selectedProviderId: ProviderId;
  onSelect: (providerId: ProviderId) => void;
}

export function ProviderPanel(props: ProviderPanelProps) {
  const { onSelect, providers, selectedProviderId } = props;

  return (
    <section className="providers-panel">
      <div className="section-heading">
        <h2>Provider Adapter</h2>
        <p>OpenAI / Claude / Gemini を共通導線で切り替えます。実際の Remote / Fallback 結果は各セッションに表示します。</p>
      </div>
      <div className="provider-grid">
        {providers.map((provider) => (
          <button
            key={provider.id}
            className={`provider-card ${selectedProviderId === provider.id ? 'active' : ''}`}
            onClick={() => onSelect(provider.id)}
            type="button"
          >
            <div className="provider-row">
              <strong>{provider.label}</strong>
              <span className={`provider-badge ${provider.configured ? 'ready' : 'fallback'}`}>
                {provider.configured ? 'CONFIGURED' : 'FALLBACK ONLY'}
              </span>
            </div>
            <p>{provider.model}</p>
            <small>{provider.note}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
