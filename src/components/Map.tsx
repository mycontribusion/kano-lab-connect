import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Laboratory } from '../types';
import { useEffect } from 'react';
import { createUserIcon, createLabIcon } from './MapMarkers';

interface MapProps {
  labs: Laboratory[];
  userLocation: [number, number] | null;
  selectedLab: Laboratory | null;
  onSelectLab: (lab: Laboratory) => void;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13, { animate: true });
  }, [center, map]);
  return null;
}

export default function Map({ labs, userLocation, selectedLab, onSelectLab }: MapProps) {
  const kanoCenter: [number, number] = [11.9686, 8.5222]; // Centered on AKTH
  const center = selectedLab
    ? [selectedLab.coordinates.lat, selectedLab.coordinates.lng] as [number, number]
    : userLocation || kanoCenter;

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {userLocation && (
        <Marker
          position={userLocation}
          icon={createUserIcon()}
        >
          <Popup>You are here</Popup>
        </Marker>
      )}

      {labs.map((lab) => (
        <Marker
          key={lab.id}
          position={[lab.coordinates.lat, lab.coordinates.lng]}
          icon={createLabIcon(lab.availability, selectedLab?.id === lab.id)}
          eventHandlers={{
            click: () => onSelectLab(lab),
          }}
        >
          <Popup className="lab-popup">
            <div className="p-1 min-w-[150px]">
              <h3 className="font-bold text-base leading-tight mb-1">{lab.name}</h3>
              <p className="text-xs text-muted-foreground mb-2 flex items-center">
                {lab.address}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${lab.availability === 'available' ? 'bg-green-100 text-green-800' :
                    lab.availability === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                  }`}>
                  {lab.availability}
                </span>
                <span className="text-xs font-semibold text-primary">
                  {lab.rating} ★
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {selectedLab && <ChangeView center={[selectedLab.coordinates.lat, selectedLab.coordinates.lng]} />}
    </MapContainer>
  );
}
