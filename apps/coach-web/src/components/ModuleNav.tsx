import type { ModuleId, TrainingModule } from '../../shared/contracts.js';

interface ModuleNavProps {
  modules: TrainingModule[];
  selectedModuleId: ModuleId;
  onSelect: (moduleId: ModuleId) => void;
}

export function ModuleNav(props: ModuleNavProps) {
  const { modules, onSelect, selectedModuleId } = props;

  return (
    <aside className="module-nav">
      <div className="section-heading compact">
        <h2>Modules</h2>
        <p>その日に鍛えたい能力に合わせて切り替えます。</p>
      </div>
      <div className="module-list">
        {modules.map((module) => (
          <button
            key={module.id}
            type="button"
            className={`module-button ${selectedModuleId === module.id ? 'active' : ''}`}
            onClick={() => onSelect(module.id)}
          >
            <strong>{module.title}</strong>
            <span>{module.summary}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
