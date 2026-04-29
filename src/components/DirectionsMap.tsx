import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Laboratory } from '../types';
import { Navigation2, MapPin, Loader2, ChevronRight, Info } from 'lucide-react';
import { cn } from '../lib/utils';

// Fix Leaflet default marker icons which often break in build systems
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

interface DirectionsMapProps {
    userLocation: [number, number];
    lab: Laboratory;
}

interface RouteStep {
    instruction: string;
    distance: number;
}

interface RouteData {
    coordinates: [number, number][];
    distance: number;
    duration: number;
    steps: RouteStep[];
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export default function DirectionsMap({ userLocation, lab }: DirectionsMapProps) {
    const [route, setRoute] = useState<RouteData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoute = async () => {
            setLoading(true);
            setError(null);
            try {
                // OSRM API call
                const url = `https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${lab.coordinates.lng},${lab.coordinates.lat}?overview=full&geometries=geojson&steps=true`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.code !== 'Ok') {
                    throw new Error('Could not calculate route');
                }

                const mainRoute = data.routes[0];
                const coords = mainRoute.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);

                const steps = mainRoute.legs[0].steps.map((s: any) => ({
                    instruction: s.maneuver.instruction,
                    distance: s.distance
                }));

                setRoute({
                    coordinates: coords,
                    distance: mainRoute.distance,
                    duration: mainRoute.duration,
                    steps: steps
                });
            } catch (err) {
                console.error('Route error:', err);
                setError('Failed to load directions. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchRoute();
    }, [userLocation, lab]);

    const center = useMemo(() => {
        return [(userLocation[0] + lab.coordinates.lat) / 2, (userLocation[1] + lab.coordinates.lng) / 2] as [number, number];
    }, [userLocation, lab]);

    if (loading) {
        return (
            <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-muted/20 animate-pulse">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Calculating route...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-red-50 p-6 text-center">
                <Info className="w-8 h-8 text-red-500 mb-2" />
                <p className="text-sm font-bold text-red-600 mb-1">{error}</p>
                <p className="text-xs text-red-500/70">Check your internet connection or try again later.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col relative rounded-xl overflow-hidden border shadow-inner bg-muted/5">
            {/* Stats Overlay */}
            <div className="absolute top-3 left-3 right-3 z-[1000] flex gap-2">
                <div className="bg-white/95 dark:bg-card/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border flex items-center gap-3">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Distance</span>
                        <span className="text-sm font-black text-primary">
                            {route ? (route.distance / 1000).toFixed(1) : '--'} km
                        </span>
                    </div>
                    <div className="w-px h-6 bg-border" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Est. Time</span>
                        <span className="text-sm font-black text-primary">
                            {route ? Math.ceil(route.duration / 60) : '--'} min
                        </span>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 w-full min-h-[250px]">
                <MapContainer
                    center={center}
                    zoom={13}
                    scrollWheelZoom={false}
                    className="w-full h-full"
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ZoomControl position="bottomright" />

                    <Marker position={userLocation}>
                        <div className="bg-primary w-4 h-4 rounded-full border-2 border-white shadow-md animate-pulse" />
                    </Marker>

                    <Marker position={[lab.coordinates.lat, lab.coordinates.lng]} />

                    {route && (
                        <Polyline
                            positions={route.coordinates}
                            pathOptions={{ color: '#0ea5e9', weight: 5, opacity: 0.8, lineJoin: 'round' }}
                        />
                    )}

                    <ChangeView center={center} zoom={13} />
                </MapContainer>
            </div>

            {/* Directions List */}
            {route && route.steps.length > 0 && (
                <div className="h-40 overflow-y-auto bg-white dark:bg-card border-t">
                    <div className="sticky top-0 bg-muted/30 px-4 py-2 border-b flex items-center justify-between">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                            <Navigation2 className="w-3 h-3" /> Step-by-Step
                        </h4>
                    </div>
                    <div className="divide-y divide-border/50">
                        {route.steps.map((step, idx) => (
                            <div key={idx} className="px-4 py-3 flex items-start gap-3 hover:bg-muted/10 transition-colors">
                                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold leading-snug">{step.instruction}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                                        {step.distance < 1000 ? `${Math.round(step.distance)} m` : `${(step.distance / 1000).toFixed(1)} km`}
                                    </p>
                                </div>
                                <ChevronRight className="w-3 h-3 text-muted-foreground/30 shrink-0 mt-1" />
                            </div>
                        ))}
                        <div className="px-4 py-6 text-center bg-green-50/50">
                            <MapPin className="w-5 h-5 text-green-600 mx-auto mb-1" />
                            <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Arrive at {lab.name}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
