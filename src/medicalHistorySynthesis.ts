import { PatientRecord } from './types.ts';
import { checkInteractions } from './medicationKnowledge.ts';

export interface SoapNote {
  subjective: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    reviewOfSystems: string[];
    allergies: string[];
  };
  objective: {
    vitalsSummary: string;
    vitalStatus: 'Normal' | 'Abnormal' | 'Critical';
    recordedMeds: string[];
    scannedFindings: string[];
  };
  assessment: {
    primaryImpression: string;
    differentials: string[];
    triageLevel: string;
    interactionAlerts: string[];
  };
  plan: {
    immediateInterventions: string[];
    investigations: string[];
    referral: string;
    patientInstructions: string[];
  };
}

export function generateSoapNote(patient: PatientRecord): SoapNote {
  const complaints = patient.triage.chiefComplaints.join(', ') || 'General routine consultation';
  const profile = patient.abhaProfile;

  const vitalsText = [
    patient.vitals.systolicBp ? `BP: ${patient.vitals.systolicBp}/${patient.vitals.diastolicBp || '-'} mmHg` : null,
    patient.vitals.heartRate ? `Pulse: ${patient.vitals.heartRate} bpm` : null,
    patient.vitals.spo2 ? `SpO2: ${patient.vitals.spo2}% on room air` : null,
    patient.vitals.temperature ? `Temp: ${patient.vitals.temperature}°F` : null,
    patient.vitals.bloodSugar ? `RBS: ${patient.vitals.bloodSugar} mg/dL` : null,
    patient.vitals.respiratoryRate ? `RR: ${patient.vitals.respiratoryRate}/min` : null,
  ].filter(Boolean).join(' | ');

  const vitalStatus = patient.triage.isCritical
    ? 'Critical'
    : patient.triage.vitalWarnings.length > 0
    ? 'Abnormal'
    : 'Normal';

  // Gather all medications for interaction check
  const allMeds: string[] = [
    ...(profile?.currentMedications || []),
    ...(patient.scannedDocuments.flatMap(d => d.medications?.map(m => m.name) || [])),
  ];
  const interactionAlerts = checkInteractions(allMeds);

  return {
    subjective: {
      chiefComplaint: complaints,
      historyOfPresentIllness: `Patient ${profile?.fullName || patient.guestName || 'Walk-in'} presented via Kiosk intake reporting ${complaints}. ${
        profile?.chronicConditions.length ? `Known history of ${profile.chronicConditions.join(', ')}.` : 'No significant chronic history recorded.'
      }`,
      reviewOfSystems: patient.triage.criticalFlags.length > 0 ? patient.triage.criticalFlags : ['Stable baseline reported'],
      allergies: profile?.allergies || ['None reported'],
    },
    objective: {
      vitalsSummary: vitalsText || 'Vitals not recorded at kiosk',
      vitalStatus,
      recordedMeds: profile?.currentMedications || ['None registered'],
      scannedFindings: patient.scannedDocuments.flatMap(d => d.findings || []),
    },
    assessment: {
      primaryImpression: patient.triage.differentialDiagnoses[0]?.condition || 'Undifferentiated Outpatient Symptoms',
      differentials: patient.triage.differentialDiagnoses.map(d => `${d.condition} (${d.probability} likelihood)`),
      triageLevel: `ESI Level ${patient.triage.esiLevel} (${patient.triage.severity.toUpperCase()})`,
      interactionAlerts,
    },
    plan: {
      immediateInterventions: patient.triage.isCritical
        ? [
            'Immediate bedside ECG & Troponin I',
            'Establish 18G IV line & start normal saline slow run',
            'Continuous cardiac & pulse oximetry monitoring',
            'Keep Sublingual Nitroglycerin and Aspirin 300mg stat ready on EMO review',
          ]
        : ['Routine physician clinical examination', 'Assess adherence to current medications'],
      investigations: [
        'Complete Blood Count (CBC) with Platelet count',
        'Random Blood Sugar (RBS)',
        'Kidney Function Test (Serum Creatinine & Urea)',
        'Baseline 12-Lead Electrocardiogram (ECG)',
      ],
      referral: patient.triage.recommendedDepartment,
      patientInstructions: [
        'Please wait in the designated consultation waiting area.',
        'Keep your ABHA intake token visible on your phone or printed slip.',
        'If pain or breathlessness increases suddenly, alert the triage counter nurse immediately.',
      ],
    },
  };
}
