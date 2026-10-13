import { useEffect, useRef, useState } from 'react';
import { distance } from './data';
import { fetchWalkingRoute } from './walkingRouting.js';
export { fetchWalkingRoute } from './walkingRouting.js';
export function useWalkingRoute(position, next, simulated) {
 const [result, setResult] = useState(null);
 const last = useRef(null), request = useRef(null), timer = useRef(null), version = useRef(0);
 useEffect(() => () => { request.current?.abort(); clearTimeout(timer.current); }, []);
 useEffect(() => {
  if (!position || !next || simulated) {
   version.current++; request.current?.abort(); clearTimeout(timer.current); last.current = null; setResult(null); return;
  }
  const previous = last.current;
  const changed = previous?.id !== next.id;
  if (!changed && distance(previous.position, position) < 25) return;
  request.current?.abort(); clearTimeout(timer.current);
  const current = ++version.current;
  // Limit requests even when the GPS updates frequently or a destination changes.
  const wait = Math.max(0, 1000 - (Date.now() - (previous?.time || 0)));
  last.current = { id: next.id, position, time: Date.now() + wait };
  setResult({ id: next.id, status: 'loading' });
  timer.current = setTimeout(async () => {
   const controller = new AbortController(); request.current = controller;
   const timeout = setTimeout(() => controller.abort(), 12000);
   try {
    const route = await fetchWalkingRoute(position, next, controller.signal);
    if (current === version.current) setResult(route);
   } catch {
    if (current === version.current) setResult({ id: next.id, status: 'error' });
   } finally { clearTimeout(timeout); }
  }, wait);
 }, [position, next, simulated]);
 return result?.id === next?.id ? result : null;
}
