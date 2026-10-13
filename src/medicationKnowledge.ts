import { ExtractedMedication } from './types.ts';

export interface DrugInteraction {
  drugA: string;
  drugB: string;
  severity: 'Severe' | 'Moderate' | 'Minor';
  description: string;
}

export const KNOWN_DRUG_INTERACTIONS: DrugInteraction[] = [
  {
    drugA: 'Aspirin',
    drugB: 'Ibuprofen',
    severity: 'Severe',
    description: 'Concurrent NSAID use attenuates antiplatelet cardioprotective effect of Aspirin and increases gastrointestinal bleeding risk.',
  },
  {
    drugA: 'Telmisartan',
    drugB: 'Spironolactone',
    severity: 'Moderate',
    description: 'Risk of dangerous hyperkalemia. Requires regular serum potassium and creatinine monitoring.',
  },
  {
    drugA: 'Metformin',
    drugB: 'Iodinated Contrast',
    severity: 'Severe',
    description: 'Risk of contrast-induced nephropathy leading to acute Metformin accumulation and lactic acidosis.',
  },
  {
    drugA: 'Atorvastatin',
    drugB: 'Clarithromycin',
    severity: 'Moderate',
    description: 'CYP3A4 inhibition increases statin systemic exposure, increasing risk of rhabdomyolysis.',
  },
  {
    drugA: 'Warfarin',
    drugB: 'Aspirin',
    severity: 'Severe',
    description: 'Synergistic bleeding diathesis. Major bleeding risk without close INR supervision.',
  },
];

export const COMMON_OPD_MEDICATIONS: Record<string, Partial<ExtractedMedication>> = {
  'metformin': {
    name: 'Metformin 500mg',
    dosage: '500 mg',
    frequency: 'Twice daily (BD)',
    timing: 'Immediately after meals',
    warnings: ['Avoid if eGFR < 30 mL/min', 'Take with meals to avoid GI upset'],
  },
  'telmisartan': {
    name: 'Telmisartan 40mg',
    dosage: '40 mg',
    frequency: 'Once daily (OD)',
    timing: 'Morning',
    warnings: ['Monitor blood pressure and serum potassium'],
  },
  'atorvastatin': {
    name: 'Atorvastatin 20mg',
    dosage: '20 mg',
    frequency: 'Once daily (OD)',
    timing: 'Bedtime (Night)',
    warnings: ['Report unexplained muscle pain or brown urine immediately'],
  },
  'amoxicillin': {
    name: 'Amoxicillin-Clavulanate 625mg',
    dosage: '625 mg',
    frequency: 'Twice daily (BD)',
    timing: 'Post meals for 5 days',
    warnings: ['Complete full antibiotic course even if feeling better', 'Check penicillin allergy'],
  },
  'pantoprazole': {
    name: 'Pantoprazole 40mg',
    dosage: '40 mg',
    frequency: 'Once daily (OD)',
    timing: '30 mins before breakfast',
    warnings: ['Take on empty stomach with plain water'],
  },
  'paracetamol': {
    name: 'Paracetamol 650mg',
    dosage: '650 mg',
    frequency: 'As needed (SOS, max 3 doses/day)',
    timing: 'After meals',
    warnings: ['Do not exceed 3000mg in 24 hours to prevent hepatotoxicity'],
  },
};

export function checkInteractions(medications: string[]): string[] {
  const alerts: string[] = [];
  const normalizedMeds = medications.map(m => m.toLowerCase());

  for (const interaction of KNOWN_DRUG_INTERACTIONS) {
    const hasA = normalizedMeds.some(m => m.includes(interaction.drugA.toLowerCase()));
    const hasB = normalizedMeds.some(m => m.includes(interaction.drugB.toLowerCase()));

    if (hasA && hasB) {
      alerts.push(
        `[${interaction.severity.toUpperCase()} INTERACTION] ${interaction.drugA} + ${interaction.drugB}: ${interaction.description}`
      );
    }
  }

  return alerts;
}
