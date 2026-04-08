import React, { useState, useCallback, useEffect, useRef } from 'react';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import FormPanel from './components/FormPanel';
import ResultPanel from './components/ResultPanel';
import HistoryPanel from './components/HistoryPanel';
import TreePanel from './components/TreePanel';
import DimensionnementPanel from './components/DimensionnementPanel';
import './App.css';

const VIEWS = { ANALYSE: 'analyse', HISTORIQUE: 'historique', INFO: 'info', ARBRE: 'arbre', DIMENSIONNEMENT: 'dimensionnement' };

export default function App() {
  const [view,       setView]       = useState(VIEWS.ANALYSE);
  const [result,     setResult]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [history,    setHistory]    = useState([]);
  const [animResult, setAnimResult] = useState(false);

  const isElectron = typeof window !== 'undefined' && window.electronAPI;

  const handlePredict = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    setAnimResult(false);

    try {
      let data;
      if (isElectron) {
        data = await window.electronAPI.runPrediction(params);
      } else {
        // Demo mode (browser preview)
        await new Promise(r => setTimeout(r, 1200));
        data = mockPrediction(params);
      }
      setResult(data);
      setTimeout(() => setAnimResult(true), 50);
    } catch (e) {
      // Extract message from any error shape
      const msg = (e && e.message) ? e.message
                : (e && e.error)   ? String(e.error)
                : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [isElectron]);

  const loadHistory = useCallback(async () => {
    try {
      let rows;
      if (isElectron) {
        rows = await window.electronAPI.loadHistory();
      } else {
        rows = mockHistory();
      }
      setHistory(rows);
    } catch {
      setHistory([]);
    }
  }, [isElectron]);

  useEffect(() => { if (view === VIEWS.HISTORIQUE) loadHistory(); }, [view, loadHistory]);

  return (
    <div className="app-shell">
      <TitleBar />
      <div className="app-body">
        <Sidebar view={view} setView={setView} />
        <main className="main-content">
          {view === VIEWS.ANALYSE && (
            <div className="analyse-layout">
              <FormPanel onSubmit={handlePredict} loading={loading} />
              <ResultPanel result={result} loading={loading} error={error} animated={animResult} />
            </div>
          )}
          {view === VIEWS.HISTORIQUE && (
            <HistoryPanel history={history} onRefresh={loadHistory} />
          )}
          {view === VIEWS.INFO && <InfoPanel />}
          {view === VIEWS.ARBRE && <TreePanel lastResult={result} />}
          {view === VIEWS.DIMENSIONNEMENT && <DimensionnementPanel />}
        </main>
      </div>
    </div>
  );
}

// ── Info page ────────────────────────────────────────────────────
function InfoPanel() {
  const energies = [
    { name: 'Energie Solaire PV', color: '#f59e0b', icon: '☀', desc: 'Conversion du rayonnement solaire en electricite via des panneaux photovoltaiques. Ideal pour les zones a forte irradiation (>1800 kWh/m2/an).', cond: ['Irradiation > 1800 kWh/m2/an', 'Vent < 6 m/s', 'Pas d\'eau courante', 'Biomasse faible/moderate'] },
    { name: 'Energie Eolienne',   color: '#38bdf8', icon: '◌', desc: 'Conversion de l\'energie cinetique du vent en electricite. Optimal pour les sites venteux avec grande disponibilite de terrain.', cond: ['Vitesse vent > 7 m/s', 'Grand terrain disponible', 'Irradiation moderee', 'Pas de contrainte eau'] },
    { name: 'Hydroelectricite',   color: '#3b82f6', icon: '◈', desc: 'Production d\'electricite par la force de l\'eau. Necessite imperativement la presence de cours d\'eau ou de chutes.', cond: ['Disponibilite eau = Oui', 'Debit suffisant', 'Denivele favorable', 'Terrain adapte'] },
    { name: 'Energie Biomasse',   color: '#22c55e', icon: '✿', desc: 'Production d\'energie par combustion ou fermentation de matieres organiques. Requiert un approvisionnement regulier en biomasse.', cond: ['Biomasse = Elevee', 'Acces aux matieres organiques', 'Infrastructure stockage', 'Terrain pour cultures energetiques'] },
  ];

  return (
    <div className="info-panel fade-in">
      <div className="info-header">
        <h1 className="info-title">Sources d'Energie Renouvelable</h1>
        <p className="info-subtitle">Guide de reference et conditions d'application</p>
      </div>
      <div className="info-grid">
        {energies.map(e => (
          <div key={e.name} className="info-card" style={{ '--card-accent': e.color }}>
            <div className="info-card-header">
              <span className="info-icon" style={{ color: e.color }}>{e.icon}</span>
              <h3 style={{ color: e.color }}>{e.name}</h3>
            </div>
            <p className="info-desc">{e.desc}</p>
            <div className="info-conditions">
              <span className="info-cond-label">Conditions optimales</span>
              {e.cond.map((c, i) => (
                <div key={i} className="info-cond-item">
                  <span className="cond-dot" style={{ background: e.color }} />
                  {c}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mock data for browser preview ────────────────────────────────
function mockPrediction(p) {
  const s = p.solaire, v = p.vent, e = p.eau, b = p.biomasse;
  let rec, probs;
  if (e === 'Oui') {
    rec = 'Hydroelectricite';
    probs = [{ energie: 'Hydroelectricite', prob: 92.5, couleur: '#3b82f6' }, { energie: 'Energie Solaire PV', prob: 4.2, couleur: '#f59e0b' }, { energie: 'Energie Eolienne', prob: 2.1, couleur: '#38bdf8' }, { energie: 'Energie Biomasse', prob: 1.2, couleur: '#22c55e' }];
  } else if (b === 'Eleve') {
    rec = 'Energie Biomasse';
    probs = [{ energie: 'Energie Biomasse', prob: 88.0, couleur: '#22c55e' }, { energie: 'Energie Solaire PV', prob: 7.0, couleur: '#f59e0b' }, { energie: 'Hydroelectricite', prob: 3.0, couleur: '#3b82f6' }, { energie: 'Energie Eolienne', prob: 2.0, couleur: '#38bdf8' }];
  } else if (v >= 7) {
    rec = 'Energie Eolienne';
    probs = [{ energie: 'Energie Eolienne', prob: 85.0, couleur: '#38bdf8' }, { energie: 'Energie Solaire PV', prob: 10.0, couleur: '#f59e0b' }, { energie: 'Energie Biomasse', prob: 3.0, couleur: '#22c55e' }, { energie: 'Hydroelectricite', prob: 2.0, couleur: '#3b82f6' }];
  } else {
    rec = 'Energie Solaire PV';
    probs = [{ energie: 'Energie Solaire PV', prob: 100.0, couleur: '#f59e0b' }, { energie: 'Energie Eolienne', prob: 0.0, couleur: '#38bdf8' }, { energie: 'Hydroelectricite', prob: 0.0, couleur: '#3b82f6' }, { energie: 'Energie Biomasse', prob: 0.0, couleur: '#22c55e' }];
  }
  const COULEURS = { 'Energie Solaire PV': '#f59e0b', 'Energie Eolienne': '#38bdf8', 'Hydroelectricite': '#3b82f6', 'Energie Biomasse': '#22c55e' };
  const ICONES   = { 'Energie Solaire PV': 'sun', 'Energie Eolienne': 'wind', 'Hydroelectricite': 'droplets', 'Energie Biomasse': 'leaf' };
  return {
    recommandation: rec, confiance: probs[0].prob,
    couleur: COULEURS[rec], icone: ICONES[rec],
    probabilites: probs,
    decisionPath: [{ feature: 'Irradiation Solaire', threshold: 1750, value: s, direction: s > 1750 ? '>' : '<=' }],
    params: p,
  };
}
function mockHistory() {
  return [
    { id: 3, date_prediction: '2026-03-07 17:44', nom_site: 'Guelmim, Maroc', irradiation_solaire: 2100, vitesse_vent: 5.5, disponibilite_eau: 'Non', disponibilite_biomasse: 'Faible', disponibilite_terrain: 'Grand', temperature_moyenne: 22, energie_recommandee: 'Energie Solaire PV', confiance_pct: 100.0 },
    { id: 2, date_prediction: '2026-03-07 16:30', nom_site: 'Tanger, Maroc',  irradiation_solaire: 1600, vitesse_vent: 8.2, disponibilite_eau: 'Non', disponibilite_biomasse: 'Moyen',  disponibilite_terrain: 'Grand', temperature_moyenne: 18, energie_recommandee: 'Energie Eolienne',   confiance_pct: 85.0  },
    { id: 1, date_prediction: '2026-03-07 15:10', nom_site: 'Ifrane, Maroc',  irradiation_solaire: 1400, vitesse_vent: 3.0, disponibilite_eau: 'Oui', disponibilite_biomasse: 'Moyen',  disponibilite_terrain: 'Moyen', temperature_moyenne: 8,  energie_recommandee: 'Hydroelectricite',   confiance_pct: 92.5  },
  ];
}
