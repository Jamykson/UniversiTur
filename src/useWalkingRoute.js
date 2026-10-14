import { useEffect, useRef, useState } from 'react';
import { distance } from './geography.js';
import { fetchWalkingRoute } from './walkingRouting.js';

export function useWalkingRoute(position, next, simulated) {
  const [result, setResult] = useState(null);
  const lastOrigin = useRef(null);
  const request = useRef(null);
  const generation = useRef(0);
  const failed = useRef(false);

  useEffect(
    () => () => {
      generation.current += 1;
      request.current?.abort();
    },
    [],
  );

  useEffect(() => {
    if (!position || !next || simulated) {
      generation.current += 1;
      request.current?.abort();
      request.current = null;
      lastOrigin.current = null;
      setResult(null);
      return;
    }
    const previous = lastOrigin.current;
    if (
      previous?.id === next.id &&
      distance(previous.position, position) < 25 &&
      (!failed.current || Date.now() - previous.time < 10000)
    )
      return;
    request.current?.abort();
    const current = ++generation.current;
    const controller = new AbortController();
    request.current = controller;
    lastOrigin.current = { id: next.id, position, time: Date.now() };
    failed.current = false;
    setResult({ id: next.id, status: 'loading' });
    fetchWalkingRoute(position, next, controller.signal)
      .then((route) => {
        if (current === generation.current) setResult(route);
      })
      .catch(() => {
        if (current === generation.current) {
          failed.current = true;
          setResult({ id: next.id, status: 'error' });
        }
      })
      .finally(() => {
        if (request.current === controller) request.current = null;
      });
  }, [position, next, simulated]);

  return result?.id === next?.id ? result : null;
}
