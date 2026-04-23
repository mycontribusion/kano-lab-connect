export interface Laboratory {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  services: LabService[];
  availability: 'available' | 'busy' | 'closed';
  contact: string;
  rating: number;
  distance?: number; // Calculated at runtime
  featured?: boolean; // Paid/sponsored – appears first by default
}

export type LabService =
  // Haematology
  | 'Full Blood Count (FBC)'
  | 'Erythrocyte Sedimentation Rate (ESR)'
  | 'Blood Group & Crossmatch'
  | 'Coagulation Profile (PT/APTT)'
  | 'Peripheral Blood Film'
  // Clinical Chemistry
  | 'Fasting Blood Sugar (FBS)'
  | 'Random Blood Sugar (RBS)'
  | 'HbA1c'
  | 'Urea & Electrolytes (U&E)'
  | 'Liver Function Test (LFT)'
  | 'Renal Function Test (RFT)'
  | 'Lipid Profile'
  | 'Thyroid Function Test (TFT)'
  | 'Serum Uric Acid'
  | 'Serum Albumin'
  | 'Serum Calcium'
  | 'Serum Phosphate'
  | 'C-Reactive Protein (CRP)'
  | 'Troponin I'
  | 'BNP / NT-proBNP'
  // Microbiology / Serology
  | 'Malaria RDT / Microscopy'
  | 'Widal Test'
  | 'Blood Culture & Sensitivity'
  | 'Urine Culture & Sensitivity'
  | 'Hepatitis B Surface Antigen (HBsAg)'
  | 'Hepatitis C Antibody (Anti-HCV)'
  | 'HIV Screening'
  | 'VDRL / Syphilis Screen'
  | 'Sputum AFB / Culture'
  | 'H. pylori Test'
  | 'COVID-19 Antigen / PCR'
  | 'Rheumatoid Factor (RF)'
  | 'Antinuclear Antibody (ANA)'
  | 'ASOT'
  // Immunology / Hormones
  | 'PSA (Prostate Specific Antigen)'
  | 'CA-125'
  | 'Beta-hCG (Pregnancy Test)'
  | 'Prolactin'
  | 'LH / FSH'
  | 'Testosterone'
  | 'Cortisol'
  // Urine / Stool
  | 'Urinalysis'
  | 'Urine Microscopy'
  | 'Stool Microscopy & Culture'
  | 'Urine Protein'
  // Imaging
  | 'X-Ray'
  | 'Ultrasound'
  | 'CT Scan'
  | 'MRI'
  | 'Echocardiography'
  | 'Mammography'
  // Pathology
  | 'Biopsy / Histopathology'
  | 'FNAC'
  | 'Pap Smear';

// All available services as an array (used for picker UI)
export const ALL_SERVICES: LabService[] = [
  'Full Blood Count (FBC)',
  'Erythrocyte Sedimentation Rate (ESR)',
  'Blood Group & Crossmatch',
  'Coagulation Profile (PT/APTT)',
  'Peripheral Blood Film',
  'Fasting Blood Sugar (FBS)',
  'Random Blood Sugar (RBS)',
  'HbA1c',
  'Urea & Electrolytes (U&E)',
  'Liver Function Test (LFT)',
  'Renal Function Test (RFT)',
  'Lipid Profile',
  'Thyroid Function Test (TFT)',
  'Serum Uric Acid',
  'Serum Albumin',
  'Serum Calcium',
  'Serum Phosphate',
  'C-Reactive Protein (CRP)',
  'Troponin I',
  'BNP / NT-proBNP',
  'Malaria RDT / Microscopy',
  'Widal Test',
  'Blood Culture & Sensitivity',
  'Urine Culture & Sensitivity',
  'Hepatitis B Surface Antigen (HBsAg)',
  'Hepatitis C Antibody (Anti-HCV)',
  'HIV Screening',
  'VDRL / Syphilis Screen',
  'Sputum AFB / Culture',
  'H. pylori Test',
  'COVID-19 Antigen / PCR',
  'Rheumatoid Factor (RF)',
  'Antinuclear Antibody (ANA)',
  'ASOT',
  'PSA (Prostate Specific Antigen)',
  'CA-125',
  'Beta-hCG (Pregnancy Test)',
  'Prolactin',
  'LH / FSH',
  'Testosterone',
  'Cortisol',
  'Urinalysis',
  'Urine Microscopy',
  'Stool Microscopy & Culture',
  'Urine Protein',
  'X-Ray',
  'Ultrasound',
  'CT Scan',
  'MRI',
  'Echocardiography',
  'Mammography',
  'Biopsy / Histopathology',
  'FNAC',
  'Pap Smear',
];

export const SERVICE_CATEGORIES: Record<string, LabService[]> = {
  'Haematology': [
    'Full Blood Count (FBC)',
    'Erythrocyte Sedimentation Rate (ESR)',
    'Blood Group & Crossmatch',
    'Coagulation Profile (PT/APTT)',
    'Peripheral Blood Film',
  ],
  'Chemistry': [
    'Fasting Blood Sugar (FBS)',
    'Random Blood Sugar (RBS)',
    'HbA1c',
    'Urea & Electrolytes (U&E)',
    'Liver Function Test (LFT)',
    'Renal Function Test (RFT)',
    'Lipid Profile',
    'Thyroid Function Test (TFT)',
    'Serum Uric Acid',
    'Serum Albumin',
    'Serum Calcium',
    'Serum Phosphate',
    'C-Reactive Protein (CRP)',
    'Troponin I',
    'BNP / NT-proBNP',
  ],
  'Microbiology': [
    'Malaria RDT / Microscopy',
    'Widal Test',
    'Blood Culture & Sensitivity',
    'Urine Culture & Sensitivity',
    'Hepatitis B Surface Antigen (HBsAg)',
    'Hepatitis C Antibody (Anti-HCV)',
    'HIV Screening',
    'VDRL / Syphilis Screen',
    'Sputum AFB / Culture',
    'H. pylori Test',
    'COVID-19 Antigen / PCR',
    'Rheumatoid Factor (RF)',
    'Antinuclear Antibody (ANA)',
    'ASOT',
  ],
  'Hormones': [
    'PSA (Prostate Specific Antigen)',
    'CA-125',
    'Beta-hCG (Pregnancy Test)',
    'Prolactin',
    'LH / FSH',
    'Testosterone',
    'Cortisol',
  ],
  'Urine / Stool': [
    'Urinalysis',
    'Urine Microscopy',
    'Stool Microscopy & Culture',
    'Urine Protein',
  ],
  'Imaging': [
    'X-Ray',
    'Ultrasound',
    'CT Scan',
    'MRI',
    'Echocardiography',
    'Mammography',
  ],
  'Pathology': [
    'Biopsy / Histopathology',
    'FNAC',
    'Pap Smear',
  ],
};
