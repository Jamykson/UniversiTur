// FOSSGIS selects the pedestrian graph through /routed-foot/.
// The OSRM URL token "driving" is retained by this server for every graph;
// it does not select a car route. Never substitute /routed-car/ here.
export const WALKING_ROUTER = 'https://routing.openstreetmap.de/routed-foot';
export async function fetchWalkingRoute(position, next, signal) {
 const coordinates = `${position[1]},${position[0]};${next.coords[1]},${next.coords[0]}`;
 const response = await fetch(`${WALKING_ROUTER}/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`, { signal });
 if (!response.ok) throw new Error('Routing unavailable');
 const data = await response.json(), route = data.routes?.[0];
 if (data.code !== 'Ok' || !route?.geometry?.coordinates || route.geometry.coordinates.length < 2) throw new Error('No walking route');
 return { id: next.id, status: 'ready', travelMode: 'walking', points: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]), distance: route.distance, duration: route.duration };
}
