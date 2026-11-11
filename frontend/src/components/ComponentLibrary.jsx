
import { useMemo, useState } from 'react';
import {
  Search, Cpu, X, ArrowLeft, CircuitBoard,
  Zap, Layers, Info
} from 'lucide-react';

import components from '../data/components';

function ComponentLibrary() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedComponent, setSelectedComponent] = useState(null);

  const categories = [
    'All',
    'Passive',
    'Semiconductor',
    'Sensor'
  ];

  const filteredComponents = useMemo(() => {
    return components.filter((component) => {
      const matchesSearch =
        component.name.toLowerCase().includes(search.toLowerCase()) ||
        component.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === 'All' || component.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  if (selectedComponent) {
    return (
      <div className="page-content component-page">
        <button
          className="component-back"
          onClick={() => setSelectedComponent(null)}
        >
          <ArrowLeft size={17} /> Back to Component Library
        </button>

        <div className="component-detail">
          <div className="component-detail-heading">
            <div className="component-symbol-large">
              {selectedComponent.symbol}
            </div>

            <div>
              <div className="eyebrow">
                COMPONENT DETAILS / {selectedComponent.category.toUpperCase()}
              </div>
              <h1>{selectedComponent.name}</h1>
              <p>{selectedComponent.description}</p>
            </div>
          </div>

          <section className="panel component-info-panel">
            <div className="component-section-title">
              <Info size={19} />
              <h3>Technical Specifications</h3>
            </div>

            <div className="component-spec-grid">
              {selectedComponent.specs.map((spec) => (
                <div className="component-spec" key={spec.label}>
                  <span>{spec.label}</span>
                  <strong>{spec.value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="panel component-info-panel">
            <div className="component-section-title">
              <Zap size={19} />
              <h3>Common Applications</h3>
            </div>

            <div className="application-list">
              {selectedComponent.applications.map((application) => (
                <div className="application-item" key={application}>
                  <span className="application-dot" />
                  {application}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content component-page">
      <div className="page-title">
        <div className="eyebrow">ENGINEERING TOOLS / COMPONENT DATABASE</div>
        <h1>Component Library</h1>
        <p>
          Explore electronic components, technical specifications and
          their applications.
        </p>
      </div>

      <div className="component-summary">
        <div className="component-summary-icon">
          <Layers size={23} />
        </div>
        <div>
          <h3>{components.length} Components</h3>
          <p>Electronic component reference library</p>
        </div>
      </div>

      <div className="component-toolbar">
        <div className="component-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="category-filters">
          {categories.map((item) => (
            <button
              key={item}
              className={`category-button ${category === item ? 'selected' : ''}`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="component-results-heading">
        <h2>Electronic Components</h2>
        <span>{filteredComponents.length} results</span>
      </div>

      {filteredComponents.length > 0 ? (
        <div className="component-grid">
          {filteredComponents.map((component) => (
            <article className="component-card" key={component.id}>
              <div className="component-card-top">
                <div className="component-symbol">
                  {component.symbol}
                </div>
                <span className="component-category">
                  {component.category}
                </span>
              </div>

              <h3>{component.name}</h3>
              <p>{component.description}</p>

              <div className="component-card-bottom">
                <span><Cpu size={14} /> {component.specs[0].value}</span>
                <button
                  onClick={() => setSelectedComponent(component)}
                >
                  View details <CircuitBoard size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="component-empty">
          <Search size={30} />
          <h3>No components found</h3>
          <p>Try another search term or category.</p>
          <button
            className="secondary-button"
            onClick={() => {
              setSearch('');
              setCategory('All');
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

export default ComponentLibrary;
