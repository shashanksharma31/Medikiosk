export type ViewMode =
  | 'language-select'
  | 'abha-login'
  | 'intake'
  | 'scanner'
  | 'prescription-upload'
  | 'patient-summary'
  | 'physician-summary'
  | 'doctor-dashboard'
  | 'audit';

export type TriageSeverity = 'emergency' | 'urgent' | 'routine';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  voiceLangCode: string;
}

export interface AbhaProfile {
  abhaNumber: string;
  abhaAddress: string;
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  age: number;
  mobile: string;
  photoUrl?: string;
  bloodGroup: string;
  pmjayBeneficiary: boolean;
  pmjayId?: string;
  chronicConditions: string[];
  currentMedications: string[];
  allergies: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface PatientVitals {
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  spo2?: number;
  temperature?: number;
  respiratoryRate?: number;
  bloodSugar?: number;
}

export interface IntakeAnswer {
  questionId: string;
  questionText: string;
  answerText: string;
  severityScore?: number;
}

export interface ExtractedMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  duration?: string;
  confidence: number;
  warnings?: string[];
}

export interface ScannedDocument {
  id: string;
  fileName: string;
  fileType: 'prescription' | 'lab_report' | 'discharge_summary' | 'other';
  dataUrl: string;
  uploadDate: string;
  enhanced: boolean;
  extractedText?: string;
  medications?: ExtractedMedication[];
  findings?: string[];
}

export interface TriageEvaluation {
  severity: TriageSeverity;
  esiLevel: 1 | 2 | 3 | 4 | 5; // Emergency Severity Index
  isCritical: boolean;
  criticalFlags: string[];
  chiefComplaints: string[];
  differentialDiagnoses: {
    condition: string;
    probability: 'High' | 'Medium' | 'Low';
    clinicalRationale: string;
  }[];
  vitalWarnings: string[];
  recommendedAction: string;
  recommendedDepartment: string;
}

export interface PatientRecord {
  id: string;
  tokenNumber: string;
  timestamp: string;
  language: string;
  abhaProfile?: AbhaProfile;
  guestName?: string;
  guestAge?: number;
  guestGender?: string;
  vitals: PatientVitals;
  intakeAnswers: IntakeAnswer[];
  scannedDocuments: ScannedDocument[];
  triage: TriageEvaluation;
  status: 'Waiting' | 'In Consultation' | 'Completed' | 'Referred';
  doctorNotes?: string;
  prescribedMeds?: string[];
}
