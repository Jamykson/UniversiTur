import { useCallback, useState } from 'react';
import { Compass, Footprints, Navigation, LocateFixed, Pause } from 'lucide-react';
import CampusMap from './components/CampusMap.jsx';
import TrailSheet from './components/TrailSheet.jsx';
import PlaceDialog from './components/PlaceDialog.jsx';
import CompletionScreen from './components/CompletionScreen.jsx';
import { useTrailNavigation } from './hooks/useTrailNavigation.js';
import { useTrailSheet } from './hooks/useTrailSheet.js';

export default function App() {
  const navigation = useTrailNavigation();
  const sheet = useTrailSheet();
  const [tileError, setTileError] = useState(false);
  const tileFailed = useCallback(() => setTileError(true), []);
  const {
    visited,
    position,
    accuracy,
    heading,
    mode,
    detail,
    following,
    recenter,
    next,
    completionOpen,
    simulated,
    walkingRoute,
    walking,
    inspect,
    explore,
    pause,
    reset,
    centerPosition,
    showCompletion,
  } = navigation;
  const completionVisible = completionOpen && !next && !detail;

  function simulate() {
    sheet.showCurrent();
    navigation.simulate();
  }
  function revisit() {
    navigation.hideCompletion();
    sheet.showList();
  }

  return (
    <main className="map-app">
      <div className="exploration-layer" inert={completionVisible ? true : undefined}>
        <CampusMap
          position={position}
          accuracy={accuracy}
          heading={heading}
          visited={visited}
          next={next}
          walkingRoute={walkingRoute}
          instantPosition={mode === 'demo'}
          following={following}
          recenter={recenter}
          onSelect={inspect}
          onExplore={explore}
          onTileError={tileFailed}
        />
        <header className="map-header">
          <a className="brand" href="#" aria-label="Universitur início">
            <span className="brand-icon">
              <Compass size={23} />
            </span>
            <span>
              Universi<b>tur</b>
              <i>.</i>
              <small>UFRN · CAMPUS CENTRAL</small>
            </span>
          </a>
          <button
            className="progress-chip"
            onClick={() => {
              if (!next) showCompletion();
              else sheet.toggleList();
            }}
            aria-label={`Ver trilha: ${visited.length} de 5 paradas visitadas`}
          >
            <Footprints size={17} />
            <strong>
              {visited.length}
              <span>/5</span>
            </strong>
          </button>
        </header>
        <div className="map-status" role="status">
          <span className={`status-dot ${walking ? 'live' : ''}`} />
          {simulated
            ? 'SIMULAÇÃO'
            : mode === 'gps'
              ? 'EXPLORANDO O CAMPUS'
              : mode === 'loading'
                ? 'LOCALIZANDO…'
                : 'SEU CAMPUS, NOVAS DESCOBERTAS'}
        </div>
        <div className="map-tools">
          <span className="north" aria-label="Norte">
            N<Navigation size={18} />
          </span>
          <button
            className={following && position ? 'tracking' : ''}
            onClick={centerPosition}
            aria-label={
              position ? 'Centralizar e acompanhar minha posição' : 'Ativar minha localização'
            }
            title="Minha posição"
          >
            <LocateFixed size={22} />
          </button>
          {walking && (
            <button onClick={pause} aria-label="Pausar acompanhamento">
              <Pause size={20} />
            </button>
          )}
        </div>
        {tileError && (
          <p className="map-error" role="alert">
            Mapa indisponível. Confira sua conexão com a internet.
          </p>
        )}
        <TrailSheet {...navigation} {...sheet} simulate={simulate} />
      </div>
      {completionVisible && <CompletionScreen onRevisit={revisit} reset={reset} />}
      <div className="map-attribution" inert={completionVisible ? true : undefined}>
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
          © OpenStreetMap
        </a>{' '}
        ·{' '}
        <a href="https://routing.openstreetmap.de/about.html" target="_blank" rel="noreferrer">
          Rotas: FOSSGIS
        </a>{' '}
        ·{' '}
        <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noreferrer">
          Corrigir mapa
        </a>
      </div>
      <PlaceDialog
        detail={detail}
        visited={visited}
        next={next}
        onClose={navigation.closeDetail}
        onContinue={navigation.continueJourney}
        onComplete={showCompletion}
      />
    </main>
  );
}
