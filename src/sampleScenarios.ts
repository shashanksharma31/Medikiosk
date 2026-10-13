import { PatientRecord } from './types.ts';
import { MOCK_ABHA_PROFILES } from './mockAbhaProfiles.ts';
import { evaluateClinicalTriage } from './clinicalInference.ts';

export interface SampleScenario {
  id: string;
  title: string;
  badge: 'Red Emergency' | 'Yellow Urgent' | 'Green Routine';
  badgeColor: string;
  description: string;
  patient: PatientRecord;
}

const scenario1Answers = [
  {
    questionId: 'q_primary_issue',
    questionText: 'What is the main reason for your visit today?',
    answerText: 'Chest pain or heavy tightness in chest',
    severityScore: 9,
  },
  {
    questionId: 'q_chest_pain_nature',
    questionText: 'Does the pain spread to your left arm, neck, or jaw, or cause sweating?',
    answerText: 'Yes, spreading to left arm/jaw with sweating',
    severityScore: 10,
  },
];

const scenario1Vitals = {
  systolicBp: 185,
  diastolicBp: 110,
  heartRate: 118,
  spo2: 91,
  temperature: 98.6,
  respiratoryRate: 24,
  bloodSugar: 224,
};

export const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    id: 'scenario_cardiac_emergency',
    title: '58M Acute Crushing Chest Pain (STEMI Suspect)',
    badge: 'Red Emergency',
    badgeColor: 'bg-red-500 text-white',
    description: 'Patient with known T2D & HTN presenting with severe retrosternal squeezing pain radiating to left arm with diaphoresis and BP 185/110.',
    patient: {
      id: 'pt-101',
      tokenNumber: 'A-101',
      timestamp: new Date().toISOString(),
      language: 'hi',
      abhaProfile: MOCK_ABHA_PROFILES[0],
      vitals: scenario1Vitals,
      intakeAnswers: scenario1Answers,
      scannedDocuments: [],
      triage: evaluateClinicalTriage(scenario1Vitals, scenario1Answers, MOCK_ABHA_PROFILES[0]),
      status: 'Waiting',
    },
  },
  {
    id: 'scenario_copd_hypoxia',
    title: '74M Severe COPD Exacerbation & Hypoxia',
    badge: 'Yellow Urgent',
    badgeColor: 'bg-amber-500 text-white',
    description: 'Elderly male with chronic bronchitis showing productive cough, wheezing, and resting SpO2 of 89% on room air.',
    patient: {
      id: 'pt-102',
      tokenNumber: 'B-204',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      language: 'ta',
      abhaProfile: MOCK_ABHA_PROFILES[2],
      vitals: {
        systolicBp: 135,
        diastolicBp: 85,
        heartRate: 102,
        spo2: 89,
        temperature: 99.1,
        respiratoryRate: 28,
      },
      intakeAnswers: [
        {
          questionId: 'q_primary_issue',
          questionText: 'What is the main reason for your visit today?',
          answerText: 'Shortness of breath or heavy breathing',
          severityScore: 8,
        },
        {
          questionId: 'q_breath_onset',
          questionText: 'How quickly did the breathing difficulty start?',
          answerText: 'Gradual increase over 2-3 days with productive cough',
          severityScore: 6,
        },
      ],
      scannedDocuments: [],
      triage: evaluateClinicalTriage(
        { systolicBp: 135, diastolicBp: 85, heartRate: 102, spo2: 89 },
        [
          {
            questionId: 'q_primary_issue',
            questionText: 'What is the main reason for your visit today?',
            answerText: 'Shortness of breath or heavy breathing',
            severityScore: 8,
          },
        ],
        MOCK_ABHA_PROFILES[2]
      ),
      status: 'Waiting',
    },
  },
  {
    id: 'scenario_routine_anc',
    title: '25F 2nd Trimester Routine ANC & Blood Test Review',
    badge: 'Green Routine',
    badgeColor: 'bg-emerald-600 text-white',
    description: 'Healthy antenatal patient at 26 weeks for routine blood pressure check and hemoglobin review.',
    patient: {
      id: 'pt-103',
      tokenNumber: 'C-312',
      timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
      language: 'hi',
      abhaProfile: MOCK_ABHA_PROFILES[3],
      vitals: {
        systolicBp: 118,
        diastolicBp: 76,
        heartRate: 78,
        spo2: 99,
        temperature: 98.4,
        bloodSugar: 98,
      },
      intakeAnswers: [
        {
          questionId: 'q_primary_issue',
          questionText: 'What is the main reason for your visit today?',
          answerText: 'Regular BP / Sugar / Chronic Medicine Checkup',
          severityScore: 2,
        },
        {
          questionId: 'q_routine_check',
          questionText: 'What routine follow-up is needed?',
          answerText: 'Routine antenatal checkup for pregnancy',
          severityScore: 2,
        },
      ],
      scannedDocuments: [],
      triage: evaluateClinicalTriage(
        { systolicBp: 118, diastolicBp: 76, heartRate: 78, spo2: 99 },
        [
          {
            questionId: 'q_primary_issue',
            questionText: 'Routine ANC',
            answerText: 'Routine antenatal checkup for pregnancy',
            severityScore: 2,
          },
        ],
        MOCK_ABHA_PROFILES[3]
      ),
      status: 'Completed',
    },
  },
];
