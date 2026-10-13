import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, ArrowRight, Footprints, MapPin, Compass, Navigation, Clock, Check, X, LocateFixed, Leaf, Play, RotateCcw, BookOpen, Route, Pause, LockKeyhole, Sparkles, Trophy } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './style.css';
import { stops, distance, formatDistance } from './data';
import { PLAYER_ICON_HTML } from './playerIcon';
import { PROGRESS_KEY, normalizeProgress, nextStop, canVisit } from './trail';
import { useWalkingRoute, fetchWalkingRoute } from './useWalkingRoute';
import { prepareRoute, routePosition, reachedRouteDestination, GPS_ARRIVAL_RADIUS } from './routeMovement';

const CAMPUS = [-5.8415, -35.2011];
function bearing(a, b) {
 const rad = Math.PI / 180, lat1 = a[0] * rad, lat2 = b[0] * rad, d = (b[1] - a[1]) * rad;
 return (Math.atan2(Math.sin(d) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(d)) / rad + 360) % 360;
}
function CampusMap({ position, accuracy, heading, visited, selected, next, walkingRoute, instantPosition, following, recenter, onSelect, onExplore, onTileError }) {
 const root = useRef(null), map = useRef(null), pins = useRef(null), route = useRef(null), player = useRef(null), halo = useRef(null), frame = useRef(null), overview = useRef(null);
 useEffect(() => {
  const instance = L.map(root.current, { zoomControl: false, attributionControl: false, scrollWheelZoom: true }).setView(CAMPUS, 16);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap contributors' }).on('tileerror', onTileError).addTo(instance);
  pins.current = L.layerGroup().addTo(instance);
  route.current = L.layerGroup().addTo(instance);
  instance.on('dragstart', onExplore);
  const observer = new ResizeObserver(() => instance.invalidateSize({ pan: false }));
  observer.observe(root.current);
  map.current = instance;
  return () => { observer.disconnect(); cancelAnimationFrame(frame.current); instance.remove(); };
 }, [onExplore, onTileError]);
 useEffect(() => {
  pins.current.clearLayers();
  stops.forEach((stop, i) => {
   const done = visited.includes(stop.id), active = next?.id === stop.id, locked = !done && !active;
   L.marker(stop.coords, { title: locked ? `${stop.name} · Bloqueado` : stop.name, icon: L.divIcon({ className: 'discovery-marker', html: `<div class="discovery-pin ${done ? 'discovered' : ''} ${active ? 'selected' : ''} ${locked ? 'locked' : ''}"><span>${done ? '✓' : String(i + 1).padStart(2, '0')}</span></div><div class="pin-base"></div>`, iconSize: [48, 64], iconAnchor: [24, 60] }) })
    .addTo(pins.current).bindTooltip(stop.name, { direction: 'top', offset: [0, -50] }).on('click', () => { if (!locked) onSelect(stop); });
  });
 }, [visited, selected, next, onSelect]);
 useEffect(() => {
  route.current.clearLayers();
  if (position && next) {
   const ready = walkingRoute?.status === 'ready';
   L.polyline(ready ? walkingRoute.points : [position, next.coords], { color: '#17457e', weight: ready ? 5 : 3, dashArray: ready ? undefined : '3 10', lineCap: 'round', opacity: .85 }).addTo(route.current);
   if (ready && overview.current !== next.id) {
    overview.current = next.id;
    const sheet = document.querySelector('.journey-sheet')?.getBoundingClientRect();
    const bottom = window.innerWidth < 600 ? Math.min(sheet?.height || 280, window.innerHeight * .55) : 40;
    map.current.fitBounds(L.latLngBounds(walkingRoute.points), { paddingTopLeft: [65, 140], paddingBottomRight: [65, bottom + 35], maxZoom: 17, animate: false });
   }
  } else { overview.current = null; }
 }, [position, next, walkingRoute]);
 useEffect(() => {
  if (!position) return;
  if (!player.current) {
   player.current = L.marker(position, { keyboard: false, zIndexOffset: 1000, icon: L.divIcon({ className: 'player-marker', html: PLAYER_ICON_HTML, iconSize: [60, 90], iconAnchor: [30, 55] }) }).addTo(map.current);
   halo.current = L.circle(position, { radius: accuracy || 12, weight: 1, color: '#17457e', fillColor: '#548bd2', fillOpacity: .09, interactive: false }).addTo(map.current);
  }
  const from = player.current.getLatLng(), start = performance.now();
  cancelAnimationFrame(frame.current);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animate = now => {
   const t = reduced || instantPosition ? 1 : Math.min((now - start) / 900, 1), ease = 1 - (1 - t) ** 3;
   const current = [from.lat + (position[0] - from.lat) * ease, from.lng + (position[1] - from.lng) * ease];
   player.current.setLatLng(current); halo.current.setLatLng(current);
   if (t < 1) frame.current = requestAnimationFrame(animate);
  };
  frame.current = requestAnimationFrame(animate);
  halo.current.setRadius(accuracy || 12);
  const arrow = player.current.getElement()?.querySelector('.player-heading');
  if (arrow) arrow.style.transform = `rotate(${heading || 0}deg)`;
  if (following) map.current.panTo(position, { animate: !reduced, duration: .9 });
  return () => cancelAnimationFrame(frame.current);
 }, [position, accuracy, heading, following, recenter, instantPosition]);
 useEffect(() => {
  if (!position && player.current) { player.current.remove(); halo.current.remove(); player.current = null; halo.current = null; }
 }, [position]);
 return <div ref={root} className="campus-map" aria-label="Mapa interativo da trilha na UFRN" />;
}
function Photo({ src, alt }) {
 const [failed, setFailed] = useState(false);
 useEffect(() => setFailed(false), [src]);
 return failed ? <div className="photo-unavailable"><Leaf size={26}/><span>Foto indisponível no momento</span></div> : <img src={src} alt={alt} onError={() => setFailed(true)} />;
}
function App() {
 const [visited, setVisited] = useState(() => { try { const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]'); return normalizeProgress(saved); } catch { return []; } });
 const [position, setPosition] = useState(null), [accuracy, setAccuracy] = useState(null), [heading, setHeading] = useState(0), [mode, setMode] = useState('idle');
 const [message, setMessage] = useState(''), [detail, setDetail] = useState(null), [selected, setSelected] = useState('reitoria'), [following, setFollowing] = useState(true), [recenter, setRecenter] = useState(0), [sheetState, setSheetState] = useState('compact'), [tileError, setTileError] = useState(false);
 const expanded = sheetState === 'expanded', minimized = sheetState === 'minimized';
 const sheetGesture = useRef(null), draggedSheet = useRef(false);
 const toggleList = () => setSheetState(state => state === 'expanded' ? 'compact' : 'expanded');
 function startSheetGesture(event) {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  sheetGesture.current = event.clientY; draggedSheet.current = false;
  event.currentTarget.setPointerCapture(event.pointerId);
 }
 function endSheetGesture(event) {
  if (sheetGesture.current === null) return;
  const delta = event.clientY - sheetGesture.current; sheetGesture.current = null;
  if (Math.abs(delta) < 25) return;
  draggedSheet.current = true;
  setSheetState(state => delta > 0 ? state === 'expanded' ? 'compact' : 'minimized' : state === 'minimized' ? 'compact' : 'expanded');
 }
 const completionPanel = useRef(null);
 const [completionOpen, setCompletionOpen] = useState(visited.length === stops.length);
 const [simulationRoute, setSimulationRoute] = useState(null);
 const watch = useRef(null), demo = useRef(null), simulationRequest = useRef(null), visitedRef = useRef(visited), positionRef = useRef(null), dialog = useRef(null);
 useEffect(() => { visitedRef.current = visited; try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(visited)); } catch { /* Private browsing can disable storage. */ } }, [visited]);
 const stopTracking = useCallback(() => { if (watch.current !== null) navigator.geolocation?.clearWatch(watch.current); watch.current = null; cancelAnimationFrame(demo.current); demo.current = null; simulationRequest.current?.abort(); simulationRequest.current = null; }, []);
 useEffect(() => stopTracking, [stopTracking]);
 useEffect(() => { if (detail && !dialog.current.open) dialog.current.showModal(); else if (!detail && dialog.current.open) dialog.current.close(); }, [detail]);
 const next = nextStop(visited);
 useEffect(() => { if (completionOpen && !next && !detail) completionPanel.current?.focus(); }, [completionOpen, next, detail]);
 const simulated = mode === 'demo' || mode === 'demo-paused' || mode === 'demo-loading' || !!simulationRoute;
 const gpsRoute = useWalkingRoute(position, next, simulated);
 const walkingRoute = simulationRoute?.id === next?.id ? simulationRoute : gpsRoute;
 const arrive = useCallback(stop => {
  if (!canVisit(stop, visitedRef.current)) return;
  visitedRef.current = [...visitedRef.current, stop.id]; setVisited(visitedRef.current); setSelected(stop.id); setDetail(stop);
  if (visitedRef.current.length === stops.length) { stopTracking(); setMode('finished'); setCompletionOpen(true); }
  if (navigator.vibrate) navigator.vibrate([100, 60, 100]);
 }, [stopTracking]);
 const updatePosition = useCallback((pos, gpsHeading) => {
  if (Number.isFinite(gpsHeading)) setHeading(gpsHeading);
  else if (positionRef.current && distance(positionRef.current, pos) > 2) setHeading(bearing(positionRef.current, pos));
  positionRef.current = pos; setPosition(pos);
 }, []);
 const startGPS = useCallback(() => {
  if (!navigator.geolocation) { setMessage('GPS indisponível neste navegador. Experimente a simulação.'); return; }
  stopTracking(); setSimulationRoute(null); setMode('loading'); setFollowing(true); setMessage('Buscando sua localização…');
  watch.current = navigator.geolocation.watchPosition(p => {
   const pos = [p.coords.latitude, p.coords.longitude]; updatePosition(pos, p.coords.heading); setAccuracy(p.coords.accuracy); setMode('gps');
   setMessage(p.coords.accuracy > 80 ? 'GPS impreciso. Aguarde em uma área aberta.' : 'GPS ativo. Caminhe para descobrir o campus.');
   if (p.coords.accuracy <= 80) {
    const target = nextStop(visitedRef.current);
    if (target && distance(pos, target.coords) <= GPS_ARRIVAL_RADIUS) arrive(target);
   }
  }, error => { stopTracking(); setMode('idle'); setMessage(error.code === 1 ? 'Permita a localização no navegador ou experimente a simulação.' : 'Sem sinal de GPS. Tente novamente em uma área aberta.'); }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 });
 }, [stopTracking, updatePosition, arrive]);
 useEffect(() => { if (visitedRef.current.length < stops.length) startGPS(); }, [startGPS]);
 async function simulate() {
  if (!next) return;
  const target = next, origin = positionRef.current || [next.coords[0] + .0009, next.coords[1] - .0007];
  const existing = walkingRoute?.status === 'ready' && distance(origin, walkingRoute.points[0]) < 50 ? walkingRoute : null;
  stopTracking(); setMode('demo-loading'); setFollowing(true); setSheetState('compact'); setMessage('Preparando a simulação pelo caminho a pé…');
  const controller = new AbortController(); simulationRequest.current = controller;
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
   const calculated = existing || await fetchWalkingRoute(origin, target, controller.signal);
   if (controller.signal.aborted || simulationRequest.current !== controller) return;
   const path = prepareRoute(calculated.points);
   // Routing can snap a destination to a distant accessible road: do not fake arrival.
   if (distance(path.points.at(-1), target.coords) > GPS_ARRIVAL_RADIUS) throw new Error('Route does not reach destination');
   setSimulationRoute(calculated); setMode('demo'); setAccuracy(12); updatePosition(path.points[0]);
   setMessage('Simulação: seguindo as curvas do trajeto a pé.');
   const started = performance.now();
   const advance = now => {
    const t = Math.min((now - started) / 14000, 1);
    const pos = routePosition(path, t);
    updatePosition(pos, bearing(pos, routePosition(path, Math.min(t + .002, 1))));
    if (t < 1 && !reachedRouteDestination(path, t, target.coords)) demo.current = requestAnimationFrame(advance);
    else { demo.current = null; setMode('demo-paused'); setSimulationRoute(null); arrive(target); setMessage('Você chegou às proximidades! Próxima etapa desbloqueada.'); }
   };
   demo.current = requestAnimationFrame(advance);
  } catch {
   if (simulationRequest.current === controller) { setMode('demo-paused'); setSimulationRoute(null); setMessage('Não foi possível obter um caminho a pé até a parada. Tente simular novamente.'); }
  } finally {
   clearTimeout(timeout);
   if (simulationRequest.current === controller) simulationRequest.current = null;
  }
 }
 function pause() { stopTracking(); setMode('paused'); setMessage('Acompanhamento pausado. Sua posição permanece no mapa.'); }
 function reset() { setCompletionOpen(false); stopTracking(); setSimulationRoute(null); visitedRef.current = []; positionRef.current = null; setVisited([]); setPosition(null); setAccuracy(null); setMode('idle'); setSelected(stops[0].id); setDetail(null); setFollowing(true); setMessage('Trilha reiniciada. Pronto para explorar?'); }
 const inspect = useCallback(stop => { if (!visitedRef.current.includes(stop.id) && !canVisit(stop, visitedRef.current)) return; setSelected(stop.id); setDetail(stop); }, []);
 const explore = useCallback(() => setFollowing(false), []);
 const tileFailed = useCallback(() => setTileError(true), []);
 const walking = mode === 'gps' || mode === 'demo', nextDistance = position && next ? distance(position, next.coords) : null;
 return <main className="map-app"><div className="exploration-layer" inert={completionOpen && !next && !detail ? true : undefined}>
  <CampusMap position={position} accuracy={accuracy} heading={heading} visited={visited} selected={selected} next={next} walkingRoute={walkingRoute} instantPosition={mode === 'demo'} following={following} recenter={recenter} onSelect={inspect} onExplore={explore} onTileError={tileFailed}/>
  <header className="map-header"><a className="brand" href="#" aria-label="Universitur início"><span className="brand-icon"><Compass size={23}/></span><span>Universi<b>tur</b><i>.</i><small>UFRN · CAMPUS CENTRAL</small></span></a><button className="progress-chip" onClick={() => { if (!next) setCompletionOpen(true); else toggleList(); }} aria-label={`Ver trilha: ${visited.length} de 5 paradas visitadas`}><Footprints size={17}/><strong>{visited.length}<span>/5</span></strong></button></header>
  <div className="map-status" role="status"><span className={`status-dot ${walking ? 'live' : ''}`}/>{simulated ? 'SIMULAÇÃO' : mode === 'gps' ? 'EXPLORANDO O CAMPUS' : mode === 'loading' ? 'LOCALIZANDO…' : 'SEU CAMPUS, NOVAS DESCOBERTAS'}</div>
  <div className="map-tools"><span className="north" aria-label="Norte">N<Navigation size={18}/></span><button className={following && position ? 'tracking' : ''} onClick={() => { if (!position) startGPS(); else { setFollowing(true); setRecenter(n => n + 1); } }} aria-label={position ? 'Centralizar e acompanhar minha posição' : 'Ativar minha localização'} title="Minha posição"><LocateFixed size={22}/></button>{walking && <button onClick={pause} aria-label="Pausar acompanhamento"><Pause size={20}/></button>}</div>
  {tileError && <p className="map-error" role="alert">Mapa indisponível. Confira sua conexão com a internet.</p>}
  <section className={`journey-sheet ${sheetState}`} aria-label="Sua trilha">
   <button className="sheet-handle" onPointerDown={startSheetGesture} onPointerUp={endSheetGesture} onPointerCancel={() => { sheetGesture.current = null; draggedSheet.current = true; }} onClick={() => { if (draggedSheet.current) { draggedSheet.current = false; return; } setSheetState(state => state === 'expanded' ? 'compact' : state === 'compact' ? 'minimized' : 'compact'); }} aria-expanded={!minimized} aria-controls="sheet-content" aria-label={minimized ? 'Abrir painel da trilha; arraste para cima' : 'Recolher painel da trilha; arraste para baixo'}><span/></button>
   <div className="sheet-heading"><div><div className="eyebrow"><Leaf size={12}/> TRILHA A PÉ · ENTRE SABERES</div><h1>{next ? minimized ? `${visited.length + 1}. ${next.tag || next.name}` : `Ponto ${visited.length + 1} de ${stops.length} · siga o caminho` : 'Trilha concluída!'}</h1></div></div>
   <div id="sheet-content" hidden={minimized}>
   <div className="trail-progress" aria-label={`${visited.length} de 5 lugares descobertos`}>{stops.map(s => <span key={s.id} className={visited.includes(s.id) ? 'complete' : ''}/>)}</div>
   {next ? <button className="destination" onClick={() => inspect(next)}><div className="destination-icon"><MapPin size={24}/></div><div><h2>{next.name}</h2><p>{nextDistance !== null ? <><strong>{formatDistance(walkingRoute?.status === 'ready' ? walkingRoute.distance : nextDistance)}</strong> {walkingRoute?.status === 'ready' ? `a pé · ${Math.max(1, Math.ceil(walkingRoute.duration / 60))} min caminhando` : 'em linha reta'}<span> · </span></> : 'Ative o GPS para ver a distância · '}{next.duration} min de visita</p></div><ArrowUpRight size={20}/></button> : <button className="completed completion-preview" onClick={() => setCompletionOpen(true)}><img src="/images/coruja-conquista.png" alt="Coruja branca, mascote da trilha"/><div><strong>Você conquistou o campus!</strong><span>Toque para ver sua conquista</span></div><Trophy size={22}/></button>}
   <div className="sheet-actions"><button className="primary" onClick={walking || mode === 'demo-loading' ? pause : startGPS} disabled={mode === 'loading'}>{walking ? <Pause size={18}/> : <Navigation size={18}/>} {mode === 'loading' ? 'Localizando…' : walking || mode === 'demo-loading' ? 'Pausar passeio' : mode === 'paused' ? 'Retomar GPS' : 'Explorar com GPS'}</button>{next ? <button className="simulate-button" onClick={simulate} disabled={mode === 'demo' || mode === 'demo-loading'}><Play size={17}/>{mode === 'demo-loading' ? 'Preparando…' : mode === 'demo' ? 'Caminhando…' : mode === 'demo-paused' ? 'Próxima' : 'Simular'}</button> : <button className="simulate-button" onClick={reset}><RotateCcw size={17}/>Recomeçar</button>}</div>
   <p className="guidance" role="status">{walkingRoute?.status === 'loading' ? 'Calculando seu trajeto a pé…' : walkingRoute?.status === 'error' ? 'Trajeto indisponível. Linha pontilhada indica apenas a direção.' : message || 'Vá até o ponto 1 para liberar a próxima etapa.'}</p>
   <div id="trail-list" className="trail-list" hidden={!expanded}><div className="list-heading"><h2>Seu passaporte pelo campus</h2><span>{visited.length}/5 descobertos</span></div>{stops.map((s, i) => <button className="stop-row" key={s.id} disabled={!visited.includes(s.id) && next?.id !== s.id} onClick={() => inspect(s)}><span className={`stop-number ${visited.includes(s.id) ? 'done' : ''}`}>{visited.includes(s.id) ? <Check size={18}/> : next?.id === s.id ? String(i + 1).padStart(2, '0') : <LockKeyhole size={16}/>}</span><div><strong>{s.name}</strong><small>{visited.includes(s.id) ? 'Concluído' : next?.id !== s.id ? `Visite o ponto ${i} para desbloquear` : 'Etapa liberada · seu destino atual'}</small></div><ArrowUpRight size={17}/></button>)}<div className="trail-notes"><Route size={16}/><p>Visite os pontos em ordem para liberar cada caminho. Coordenadas aproximadas; rotas a pé dependem dos caminhos cadastrados no mapa.</p></div><div className="sheet-footer"><a href="https://campusvirtual.ufrn.br/" target="_blank" rel="noreferrer">Fotos: Campus Virtual UFRN ↗</a><button onClick={reset}><RotateCcw size={14}/>Reiniciar trilha</button></div></div>
   </div>
  </section>
  </div>
  {completionOpen && !next && !detail && <section ref={completionPanel} tabIndex={-1} className="completion-screen" aria-labelledby="completion-title">
   <div className="completion-scroll">
    <div className="completion-top"><span><Compass size={20}/>Universitur<span className="completion-brand-dot">.</span></span><span>UFRN · NATAL</span></div>
    <div className="completion-art"><div className="owl-orbit orbit-one"/><div className="owl-orbit orbit-two"/><span className="completion-star star-one">✦</span><span className="completion-star star-two">✧</span><span className="completion-star star-three">✦</span><span className="completion-star star-four">✧</span><img className="completion-owl" src="/images/coruja-conquista.png" alt="Coruja branca de olhos dourados comemorando com a asa levantada"/><div className="completion-medal"><Trophy size={18}/><span>EXPLORADOR DO CAMPUS</span></div></div>
    <div className="completion-copy"><div className="completion-eyebrow"><Sparkles size={14}/> TRILHA CONCLUÍDA</div><h2 id="completion-title">Você foi além.<br/><em>O campus é seu!</em></h2><p>Entre passos e descobertas, você conheceu<br/>cinco lugares e levou novas histórias.</p></div>
    <div className="completion-stats"><div><MapPin size={19}/><strong>5 de 5</strong><span>lugares descobertos</span></div><div><Footprints size={19}/><strong>Uma trilha</strong><span>muitas histórias</span></div></div>
    <div className="completion-passport" aria-label="Todas as cinco paradas concluídas">{stops.map((stop, i) => <span key={stop.id}><Check size={12}/>{String(i + 1).padStart(2,'0')} · {stop.tag || (stop.id === 'biblioteca' ? 'Biblioteca' : stop.id === 'convivencia' ? 'Convivência' : stop.name)}</span>)}</div>
    <div className="completion-actions"><button className="completion-primary" onClick={() => { setCompletionOpen(false); setSheetState('expanded'); }}><BookOpen size={18}/>Revisitar minhas descobertas<ArrowRight size={18}/></button><button className="completion-secondary" onClick={reset}><RotateCcw size={16}/>Começar uma nova trilha</button></div>
    <p className="completion-signoff">Leve as histórias. Deixe boas pegadas. <Leaf size={12}/></p>
   </div>
  </section>}
  <div className="map-attribution" inert={completionOpen && !next && !detail ? true : undefined}><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a> · <a href="https://routing.openstreetmap.de/about.html" target="_blank" rel="noreferrer">Rotas: FOSSGIS</a> · <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noreferrer">Corrigir mapa</a></div>
  <dialog ref={dialog} className="place-dialog" aria-labelledby="place-title" onCancel={() => setDetail(null)} onClick={e => { if (e.target === dialog.current) setDetail(null); }}>{detail && <><div className="dialog-photo"><Photo src={detail.image} alt={detail.caption || detail.name}/><button className="close-dialog" autoFocus aria-label="Fechar informações" onClick={() => setDetail(null)}><X size={22}/></button>{visited.includes(detail.id) && <span className="arrival-badge"><Check size={15}/>Lugar descoberto!</span>}</div><div className="dialog-body"><div className="eyebrow">{detail.category}</div><h2 id="place-title">{detail.name}</h2>{detail.caption && <small className="photo-credit">{detail.caption}</small>}<p>{detail.description}</p><div className="tip"><Leaf size={20}/><p>{detail.tip}</p></div><p className="coordinate-note">Localização aproximada. Respeite os caminhos e acessos do campus.</p><a className="primary" href={`https://www.google.com/maps/dir/?api=1&destination=${detail.coords.join(',')}&travelmode=walking`} target="_blank" rel="noreferrer"><Navigation size={17}/>Ver caminho a pé<ArrowUpRight size={17}/></a>{visited.includes(detail.id) && next && <button className="continue-button" onClick={() => { setDetail(null); setSelected(next.id); setFollowing(true); }}>Próxima parada: {next.tag || next.name}<ArrowRight size={17}/></button>}{visited.includes(detail.id) && !next && <button className="continue-button" onClick={() => { setDetail(null); setCompletionOpen(true); }}><Trophy size={18}/>Ver minha conquista<ArrowRight size={17}/></button>}<a className="source-link" href="https://campusvirtual.ufrn.br/" target="_blank" rel="noreferrer"><BookOpen size={14}/>Campus Virtual UFRN</a></div></>}</dialog>
 </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
