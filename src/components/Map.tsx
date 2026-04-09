import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Laboratory } from '../types';
import { useEffect } from 'react';

// Fix for default marker icons in Leaflet with React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  labs: Laboratory[];
  userLocation: [number, number] | null;
  selectedLab: Laboratory | null;
  onSelectLab: (lab: Laboratory) => void;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function Map({ labs, userLocation, selectedLab, onSelectLab }: MapProps) {
  const kanoCenter: [number, number] = [12.0022, 8.5920];
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
        <Marker position={userLocation}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {labs.map((lab) => (
        <Marker 
          key={lab.id} 
          position={[lab.coordinates.lat, lab.coordinates.lng]}
          eventHandlers={{
            click: () => onSelectLab(lab),
          }}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-bold">{lab.name}</h3>
              <p className="text-sm">{lab.address}</p>
              <div className="mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  lab.availability === 'available' ? 'bg-green-100 text-green-800' :
                  lab.availability === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {lab.availability}
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
