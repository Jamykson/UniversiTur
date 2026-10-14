import { useCallback, useEffect, useRef, useState } from 'react';
import { stops } from '../data.js';
import { bearing, distance, isCoordinate } from '../geography.js';
import { canVisit, nextStop, readProgress, saveProgress } from '../trail.js';
import { fetchWalkingRoute } from '../walkingRouting.js';
import { useWalkingRoute } from '../useWalkingRoute.js';
import {
  GPS_ARRIVAL_RADIUS,
  prepareRoute,
  reachedRouteDestination,
  routePosition,
} from '../routeMovement.js';

const SIMULATION_DURATION_MS = 14000;
const MAX_GPS_ACCURACY_METERS = 80;

export function useTrailNavigation() {
  const [visited, setVisited] = useState(readProgress);
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [heading, setHeading] = useState(0);
  const [mode, setMode] = useState('idle');
  const [message, setMessage] = useState('');
  const [detail, setDetail] = useState(null);
  const [following, setFollowing] = useState(true);
  const [recenter, setRecenter] = useState(0);
  const [completionOpen, setCompletionOpen] = useState(visited.length === stops.length);
  const [simulationRoute, setSimulationRoute] = useState(null);
  const visitedRef = useRef(visited);
  const positionRef = useRef(null);
  const watch = useRef(null);
  const animation = useRef(null);
  const simulationRequest = useRef(null);
  const generation = useRef(0);

  useEffect(() => saveProgress(visited), [visited]);

  const stopTracking = useCallback(() => {
    // Invalidates queued GPS callbacks and pending asynchronous simulation work.
    generation.current += 1;
    if (watch.current !== null) navigator.geolocation?.clearWatch(watch.current);
    watch.current = null;
    cancelAnimationFrame(animation.current);
    animation.current = null;
    simulationRequest.current?.abort();
    simulationRequest.current = null;
  }, []);
  useEffect(() => stopTracking, [stopTracking]);

  const next = nextStop(visited);
  const simulated =
    mode === 'demo' || mode === 'demo-paused' || mode === 'demo-loading' || !!simulationRoute;
  const gpsRoute = useWalkingRoute(position, next, simulated);
  const walkingRoute = simulationRoute?.id === next?.id ? simulationRoute : gpsRoute;

  const arrive = useCallback(
    (stop) => {
      if (!canVisit(stop, visitedRef.current)) return;
      visitedRef.current = [...visitedRef.current, stop.id];
      setVisited(visitedRef.current);
      setDetail(stop);
      if (visitedRef.current.length === stops.length) {
        stopTracking();
        setMode('finished');
        setCompletionOpen(true);
      }
      navigator.vibrate?.([100, 60, 100]);
    },
    [stopTracking],
  );

  const updatePosition = useCallback((coordinates, gpsHeading) => {
    if (Number.isFinite(gpsHeading)) setHeading(gpsHeading);
    else if (positionRef.current && distance(positionRef.current, coordinates) > 2) {
      setHeading(bearing(positionRef.current, coordinates));
    }
    positionRef.current = coordinates;
    setPosition(coordinates);
  }, []);

  const startGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setMessage('GPS indisponível neste navegador. Experimente a simulação.');
      return;
    }
    stopTracking();
    const current = generation.current;
    const isCurrent = () => generation.current === current;
    setSimulationRoute(null);
    setMode('loading');
    setFollowing(true);
    setMessage('Buscando sua localização…');
    const watchId = navigator.geolocation.watchPosition(
      (reading) => {
        if (!isCurrent()) return;
        const coordinates = [reading.coords.latitude, reading.coords.longitude];
        const precision = reading.coords.accuracy;
        if (!isCoordinate(coordinates) || !Number.isFinite(precision) || precision < 0) {
          setMessage('Leitura de GPS inválida. Aguarde uma nova localização.');
          return;
        }
        updatePosition(coordinates, reading.coords.heading);
        setAccuracy(precision);
        setMode('gps');
        setMessage(
          precision > MAX_GPS_ACCURACY_METERS
            ? 'GPS impreciso. Aguarde em uma área aberta.'
            : 'GPS ativo. Caminhe para descobrir o campus.',
        );
        const target = nextStop(visitedRef.current);
        if (
          precision <= MAX_GPS_ACCURACY_METERS &&
          target &&
          distance(coordinates, target.coords) <= GPS_ARRIVAL_RADIUS
        ) {
          arrive(target);
        }
      },
      (error) => {
        if (!isCurrent()) return;
        stopTracking();
        setMode('idle');
        setMessage(
          error.code === 1
            ? 'Permita a localização no navegador ou experimente a simulação.'
            : 'Sem sinal de GPS. Tente novamente em uma área aberta.',
        );
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 },
    );
    // Also handles implementations that invoke the callback synchronously.
    if (isCurrent()) watch.current = watchId;
    else navigator.geolocation.clearWatch(watchId);
  }, [stopTracking, updatePosition, arrive]);

  useEffect(() => {
    if (visitedRef.current.length < stops.length) startGPS();
  }, [startGPS]);

  async function simulate() {
    if (!next) return;
    const target = next;
    const origin = positionRef.current || [target.coords[0] + 0.0009, target.coords[1] - 0.0007];
    const existing =
      walkingRoute?.status === 'ready' && distance(origin, walkingRoute.points[0]) < 50
        ? walkingRoute
        : null;
    stopTracking();
    const current = generation.current;
    const isCurrent = () => generation.current === current;
    setMode('demo-loading');
    setFollowing(true);
    setMessage('Preparando a simulação pelo caminho a pé…');
    const controller = new AbortController();
    simulationRequest.current = controller;
    try {
      const calculated = existing || (await fetchWalkingRoute(origin, target, controller.signal));
      if (!isCurrent()) return;
      const path = prepareRoute(calculated.points);
      if (distance(path.points.at(-1), target.coords) > GPS_ARRIVAL_RADIUS) {
        throw new Error('Route does not reach destination');
      }
      setSimulationRoute(calculated);
      setMode('demo');
      setAccuracy(12);
      updatePosition(path.points[0]);
      setMessage('Simulação: seguindo as curvas do trajeto a pé.');
      const started = performance.now();
      const advance = (now) => {
        if (!isCurrent()) return;
        const progress = Math.min((now - started) / SIMULATION_DURATION_MS, 1);
        const coordinates = routePosition(path, progress);
        updatePosition(
          coordinates,
          bearing(coordinates, routePosition(path, Math.min(progress + 0.002, 1))),
        );
        if (progress < 1 && !reachedRouteDestination(path, progress, target.coords)) {
          animation.current = requestAnimationFrame(advance);
        } else {
          animation.current = null;
          setMode('demo-paused');
          setSimulationRoute(null);
          arrive(target);
          setMessage('Você chegou às proximidades! Próxima etapa desbloqueada.');
        }
      };
      animation.current = requestAnimationFrame(advance);
    } catch {
      if (!isCurrent()) return;
      setMode('demo-paused');
      setSimulationRoute(null);
      setMessage('Não foi possível obter um caminho a pé até a parada. Tente simular novamente.');
    } finally {
      if (simulationRequest.current === controller) simulationRequest.current = null;
    }
  }

  function pause() {
    stopTracking();
    setMode('paused');
    setMessage('Acompanhamento pausado. Sua posição permanece no mapa.');
  }

  function reset() {
    stopTracking();
    visitedRef.current = [];
    positionRef.current = null;
    setVisited([]);
    setPosition(null);
    setAccuracy(null);
    setHeading(0);
    setSimulationRoute(null);
    setCompletionOpen(false);
    setDetail(null);
    setMode('idle');
    setFollowing(true);
    setMessage('Trilha reiniciada. Pronto para explorar?');
  }

  const inspect = useCallback((stop) => {
    if (visitedRef.current.includes(stop.id) || canVisit(stop, visitedRef.current)) setDetail(stop);
  }, []);
  const explore = useCallback(() => setFollowing(false), []);

  function centerPosition() {
    if (!position) startGPS();
    else {
      setFollowing(true);
      setRecenter((value) => value + 1);
    }
  }

  function continueJourney() {
    setDetail(null);
    setFollowing(true);
  }
  function showCompletion() {
    setDetail(null);
    setCompletionOpen(true);
  }

  return {
    visited,
    position,
    accuracy,
    heading,
    mode,
    message,
    detail,
    following,
    recenter,
    completionOpen,
    simulated,
    walkingRoute,
    next,
    walking: mode === 'gps' || mode === 'demo',
    startGPS,
    simulate,
    pause,
    reset,
    inspect,
    explore,
    centerPosition,
    continueJourney,
    showCompletion,
    hideCompletion: () => setCompletionOpen(false),
    closeDetail: () => setDetail(null),
  };
}
