export interface Laboratory {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  services: string[];
  availability: 'available' | 'busy' | 'closed';
  contact: string;
  rating: number;
  distance?: number; // Calculated at runtime
}

export type LabService = 'Blood Test' | 'X-Ray' | 'MRI' | 'CT Scan' | 'Ultrasound' | 'Biopsy' | 'Urine Analysis';
