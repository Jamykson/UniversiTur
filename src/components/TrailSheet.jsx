import {
  ArrowUpRight,
  MapPin,
  Navigation,
  Check,
  Leaf,
  Play,
  RotateCcw,
  Route,
  Pause,
  LockKeyhole,
  Trophy,
} from 'lucide-react';
import { stops, distance, formatDistance } from '../data.js';
import { OWL_IMAGE } from '../assets.js';

export default function TrailSheet({
  sheetState,
  startSheetGesture,
  endSheetGesture,
  cancelSheetGesture,
  handleSheetClick,
  next,
  visited,
  position,
  walkingRoute,
  inspect,
  showCompletion,
  walking,
  mode,
  pause,
  startGPS,
  simulate,
  reset,
  message,
}) {
  const expanded = sheetState === 'expanded',
    minimized = sheetState === 'minimized';
  const nextDistance = position && next ? distance(position, next.coords) : null;
  return (
    <section className={`journey-sheet ${sheetState}`} aria-label="Sua trilha">
      <button
        className="sheet-handle"
        onPointerDown={startSheetGesture}
        onPointerUp={endSheetGesture}
        onPointerCancel={cancelSheetGesture}
        onClick={handleSheetClick}
        aria-expanded={!minimized}
        aria-controls="sheet-content"
        aria-label={
          minimized
            ? 'Abrir painel da trilha; arraste para cima'
            : 'Recolher painel da trilha; arraste para baixo'
        }
      >
        <span />
      </button>
      <div className="sheet-heading">
        <div>
          <div className="eyebrow">
            <Leaf size={12} /> TRILHA A PÉ · ENTRE SABERES
          </div>
          <h1>
            {next
              ? minimized
                ? `${visited.length + 1}. ${next.tag || next.name}`
                : `Ponto ${visited.length + 1} de ${stops.length} · siga o caminho`
              : 'Trilha concluída!'}
          </h1>
        </div>
      </div>
      <div id="sheet-content" hidden={minimized}>
        <div className="trail-progress" aria-label={`${visited.length} de 5 lugares descobertos`}>
          {stops.map((s) => (
            <span key={s.id} className={visited.includes(s.id) ? 'complete' : ''} />
          ))}
        </div>
        {next ? (
          <button className="destination" onClick={() => inspect(next)}>
            <div className="destination-icon">
              <MapPin size={24} />
            </div>
            <div>
              <h2>{next.name}</h2>
              <p>
                {nextDistance !== null ? (
                  <>
                    <strong>
                      {formatDistance(
                        walkingRoute?.status === 'ready' ? walkingRoute.distance : nextDistance,
                      )}
                    </strong>{' '}
                    {walkingRoute?.status === 'ready'
                      ? `a pé · ${Math.max(1, Math.ceil(walkingRoute.duration / 60))} min caminhando`
                      : 'em linha reta'}
                    <span> · </span>
                  </>
                ) : (
                  'Ative o GPS para ver a distância · '
                )}
                {next.duration} min de visita
              </p>
            </div>
            <ArrowUpRight size={20} />
          </button>
        ) : (
          <button className="completed completion-preview" onClick={() => showCompletion()}>
            <img src={OWL_IMAGE} alt="Coruja branca, mascote da trilha" />
            <div>
              <strong>Você conquistou o campus!</strong>
              <span>Toque para ver sua conquista</span>
            </div>
            <Trophy size={22} />
          </button>
        )}
        <div className="sheet-actions">
          <button
            className="primary"
            onClick={walking || mode === 'demo-loading' ? pause : startGPS}
            disabled={mode === 'loading'}
          >
            {walking ? <Pause size={18} /> : <Navigation size={18} />}{' '}
            {mode === 'loading'
              ? 'Localizando…'
              : walking || mode === 'demo-loading'
                ? 'Pausar passeio'
                : mode === 'paused'
                  ? 'Retomar GPS'
                  : 'Explorar com GPS'}
          </button>
          {next ? (
            <button
              className="simulate-button"
              onClick={simulate}
              disabled={mode === 'demo' || mode === 'demo-loading'}
            >
              <Play size={17} />
              {mode === 'demo-loading'
                ? 'Preparando…'
                : mode === 'demo'
                  ? 'Caminhando…'
                  : mode === 'demo-paused'
                    ? 'Próxima'
                    : 'Simular'}
            </button>
          ) : (
            <button className="simulate-button" onClick={reset}>
              <RotateCcw size={17} />
              Recomeçar
            </button>
          )}
        </div>
        <p className="guidance" role="status">
          {walkingRoute?.status === 'loading'
            ? 'Calculando seu trajeto a pé…'
            : walkingRoute?.status === 'error'
              ? 'Trajeto indisponível. Linha pontilhada indica apenas a direção.'
              : message || 'Vá até o ponto 1 para liberar a próxima etapa.'}
        </p>
        <div id="trail-list" className="trail-list" hidden={!expanded}>
          <div className="list-heading">
            <h2>Seu passaporte pelo campus</h2>
            <span>{visited.length}/5 descobertos</span>
          </div>
          {stops.map((s, i) => (
            <button
              className="stop-row"
              key={s.id}
              disabled={!visited.includes(s.id) && next?.id !== s.id}
              onClick={() => inspect(s)}
            >
              <span className={`stop-number ${visited.includes(s.id) ? 'done' : ''}`}>
                {visited.includes(s.id) ? (
                  <Check size={18} />
                ) : next?.id === s.id ? (
                  String(i + 1).padStart(2, '0')
                ) : (
                  <LockKeyhole size={16} />
                )}
              </span>
              <div>
                <strong>{s.name}</strong>
                <small>
                  {visited.includes(s.id)
                    ? 'Concluído'
                    : next?.id !== s.id
                      ? `Visite o ponto ${i} para desbloquear`
                      : 'Etapa liberada · seu destino atual'}
                </small>
              </div>
              <ArrowUpRight size={17} />
            </button>
          ))}
          <div className="trail-notes">
            <Route size={16} />
            <p>
              Visite os pontos em ordem para liberar cada caminho. Coordenadas aproximadas; rotas a
              pé dependem dos caminhos cadastrados no mapa.
            </p>
          </div>
          <div className="sheet-footer">
            <a href="https://campusvirtual.ufrn.br/" target="_blank" rel="noreferrer">
              Fotos: Campus Virtual UFRN ↗
            </a>
            <button onClick={reset}>
              <RotateCcw size={14} />
              Reiniciar trilha
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
