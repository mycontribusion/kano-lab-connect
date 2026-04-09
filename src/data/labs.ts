import { Laboratory } from '../types';

export const KANO_LABS: Laboratory[] = [
  {
    id: '1',
    name: 'Aminu Kano Teaching Hospital Lab',
    address: 'Zaria Road, Kano',
    coordinates: { lat: 11.9686, lng: 8.5222 },
    services: ['Blood Test', 'X-Ray', 'MRI', 'CT Scan', 'Biopsy'],
    availability: 'available',
    contact: '+234 803 000 0001',
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Murtala Muhammad Specialist Hospital Lab',
    address: 'Kofar Mata, Kano City',
    coordinates: { lat: 12.0022, lng: 8.5250 },
    services: ['Blood Test', 'X-Ray', 'Urine Analysis'],
    availability: 'busy',
    contact: '+234 803 000 0002',
    rating: 4.0,
  },
  {
    id: '3',
    name: 'Prime Diagnostic Center',
    address: 'Bompai Road, Kano',
    coordinates: { lat: 12.0150, lng: 8.5450 },
    services: ['Ultrasound', 'X-Ray', 'Blood Test'],
    availability: 'available',
    contact: '+234 803 000 0003',
    rating: 4.8,
  },
  {
    id: '4',
    name: 'Standard Medical Laboratory',
    address: 'Zoo Road, Kano',
    coordinates: { lat: 11.9750, lng: 8.5350 },
    services: ['Blood Test', 'Urine Analysis'],
    availability: 'closed',
    contact: '+234 803 000 0004',
    rating: 3.8,
  },
  {
    id: '5',
    name: 'Kano State Public Health Lab',
    address: 'Gidan Murtala, Kano',
    coordinates: { lat: 12.0000, lng: 8.5100 },
    services: ['Blood Test', 'Biopsy'],
    availability: 'available',
    contact: '+234 803 000 0005',
    rating: 4.2,
  }
];
