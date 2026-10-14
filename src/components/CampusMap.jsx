import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { stops } from '../data.js';
import { PLAYER_ICON_HTML } from '../playerIcon.js';
import { CAMPUS } from '../geography.js';

export default function CampusMap({
  position,
  accuracy,
  heading,
  visited,
  next,
  walkingRoute,
  instantPosition,
  following,
  recenter,
  onSelect,
  onExplore,
  onTileError,
}) {
  const root = useRef(null),
    map = useRef(null),
    pins = useRef(null),
    route = useRef(null),
    player = useRef(null),
    halo = useRef(null),
    frame = useRef(null),
    overview = useRef(null),
    geometry = useRef(null);
  useEffect(() => {
    const instance = L.map(root.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
    }).setView(CAMPUS, 16);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    })
      .on('tileerror', onTileError)
      .addTo(instance);
    pins.current = L.layerGroup().addTo(instance);
    route.current = L.layerGroup().addTo(instance);
    instance.on('dragstart', onExplore);
    const observer = new ResizeObserver(() => instance.invalidateSize({ pan: false }));
    observer.observe(root.current);
    map.current = instance;
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame.current);
      instance.remove();
      map.current = null;
      player.current = null;
      halo.current = null;
      overview.current = null;
      geometry.current = null;
    };
  }, [onExplore, onTileError]);
  useEffect(() => {
    pins.current.clearLayers();
    stops.forEach((stop, i) => {
      const done = visited.includes(stop.id),
        active = next?.id === stop.id,
        locked = !done && !active;
      L.marker(stop.coords, {
        title: locked ? `${stop.name} · Bloqueado` : stop.name,
        icon: L.divIcon({
          className: 'discovery-marker',
          html: `<div class="discovery-pin ${done ? 'discovered' : ''} ${active ? 'selected' : ''} ${locked ? 'locked' : ''}"><span>${done ? '✓' : String(i + 1).padStart(2, '0')}</span></div><div class="pin-base"></div>`,
          iconSize: [48, 64],
          iconAnchor: [24, 60],
        }),
      })
        .addTo(pins.current)
        .bindTooltip(stop.name, { direction: 'top', offset: [0, -50] })
        .on('click', () => {
          if (!locked) onSelect(stop);
        });
    });
  }, [visited, next, onSelect]);
  useEffect(() => {
    const ready = walkingRoute?.status === 'ready';
    // Keep the route layer intact during each frame of avatar animation.
    if (position && next && ready && geometry.current === walkingRoute.points) return;
    geometry.current = ready ? walkingRoute.points : null;
    route.current.clearLayers();
    if (position && next) {
      L.polyline(ready ? walkingRoute.points : [position, next.coords], {
        color: '#17457e',
        weight: ready ? 5 : 3,
        dashArray: ready ? undefined : '3 10',
        lineCap: 'round',
        opacity: 0.85,
      }).addTo(route.current);
      if (ready && overview.current !== next.id) {
        overview.current = next.id;
        const sheet = document.querySelector('.journey-sheet')?.getBoundingClientRect();
        const bottom =
          window.innerWidth < 600 ? Math.min(sheet?.height || 280, window.innerHeight * 0.55) : 40;
        map.current.fitBounds(L.latLngBounds(walkingRoute.points), {
          paddingTopLeft: [65, 140],
          paddingBottomRight: [65, bottom + 35],
          maxZoom: 17,
          animate: false,
        });
      }
    } else {
      overview.current = null;
    }
  }, [position, next, walkingRoute]);
  useEffect(() => {
    if (!position) return;
    if (!player.current) {
      player.current = L.marker(position, {
        keyboard: false,
        zIndexOffset: 1000,
        icon: L.divIcon({
          className: 'player-marker',
          html: PLAYER_ICON_HTML,
          iconSize: [60, 90],
          iconAnchor: [30, 55],
        }),
      }).addTo(map.current);
      halo.current = L.circle(position, {
        radius: accuracy || 12,
        weight: 1,
        color: '#17457e',
        fillColor: '#548bd2',
        fillOpacity: 0.09,
        interactive: false,
      }).addTo(map.current);
    }
    const from = player.current.getLatLng(),
      start = performance.now();
    cancelAnimationFrame(frame.current);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animate = (now) => {
      const t = reduced || instantPosition ? 1 : Math.min((now - start) / 900, 1),
        ease = 1 - (1 - t) ** 3;
      const current = [
        from.lat + (position[0] - from.lat) * ease,
        from.lng + (position[1] - from.lng) * ease,
      ];
      player.current.setLatLng(current);
      halo.current.setLatLng(current);
      if (t < 1) frame.current = requestAnimationFrame(animate);
    };
    if (instantPosition || reduced) animate(start + 900);
    else frame.current = requestAnimationFrame(animate);
    halo.current.setRadius(accuracy || 12);
    const arrow = player.current.getElement()?.querySelector('.player-heading');
    if (arrow) arrow.style.transform = `rotate(${heading || 0}deg)`;
    if (following)
      map.current.panTo(position, { animate: !reduced && !instantPosition, duration: 0.9 });
    return () => cancelAnimationFrame(frame.current);
  }, [position, accuracy, heading, following, recenter, instantPosition]);
  useEffect(() => {
    if (!position && player.current) {
      player.current.remove();
      halo.current.remove();
      player.current = null;
      halo.current = null;
    }
  }, [position]);
  return <div ref={root} className="campus-map" aria-label="Mapa interativo da trilha na UFRN" />;
}
