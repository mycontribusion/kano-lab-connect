import L from 'leaflet';

export const createUserIcon = () => L.divIcon({
    className: 'user-location-marker',
    html: `<div class="relative flex h-5 w-5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-5 w-5 bg-blue-600 border-2 border-white shadow-md"></span>
        </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

export const createLabIcon = (status: 'available' | 'busy' | 'closed', isSelected: boolean) => {
    const color =
        status === 'available' ? '#22c55e' : // green-500
            status === 'busy' ? '#eab308' :      // yellow-500
                '#ef4444';                           // red-500

    const size = isSelected ? 36 : 32;
    const pulseClass = isSelected ? 'animate-pulse' : '';
    const ringColor = isSelected ? 'ring-2 ring-offset-2 ring-primary' : '';

    return L.divIcon({
        className: `lab-marker-${status} ${pulseClass}`,
        html: `<div style="background-color: ${color};" class="w-full h-full rounded-full border-2 border-white shadow-lg flex items-center justify-center ${ringColor}">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
};
