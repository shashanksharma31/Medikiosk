import { PatientVitals, IntakeAnswer, TriageEvaluation, AbhaProfile } from './types.ts';

export function evaluateClinicalTriage(
  vitals: PatientVitals,
  intakeAnswers: IntakeAnswer[],
  profile?: AbhaProfile
): TriageEvaluation {
  const criticalFlags: string[] = [];
  const vitalWarnings: string[] = [];
  const chiefComplaints: string[] = [];
  let highestSeverityScore = 1;

  // Extract complaints and scores
  for (const item of intakeAnswers) {
    chiefComplaints.push(item.answerText);
    if (item.severityScore && item.severityScore > highestSeverityScore) {
      highestSeverityScore = item.severityScore;
    }
  }

  const complaintsJoined = chiefComplaints.join(' ').toLowerCase();

  // 1. Vital Signs Emergency Checks
  if (vitals.systolicBp && vitals.systolicBp >= 180) {
    criticalFlags.push(`Hypertensive Crisis Alert: Systolic BP ${vitals.systolicBp} mmHg (Threshold >= 180)`);
  } else if (vitals.systolicBp && vitals.systolicBp > 140) {
    vitalWarnings.push(`Stage 2 Hypertension: BP ${vitals.systolicBp}/${vitals.diastolicBp || '-'} mmHg`);
  }

  if (vitals.spo2 && vitals.spo2 < 90) {
    criticalFlags.push(`Critical Hypoxemia: SpO2 ${vitals.spo2}% (Severe respiratory compromise)`);
  } else if (vitals.spo2 && vitals.spo2 < 94) {
    vitalWarnings.push(`Mild-Moderate Hypoxia: SpO2 ${vitals.spo2}% (Normal >= 95%)`);
  }

  if (vitals.heartRate && (vitals.heartRate > 130 || vitals.heartRate < 45)) {
    criticalFlags.push(`Marked Hemodynamic Instability: Pulse ${vitals.heartRate} bpm`);
  } else if (vitals.heartRate && (vitals.heartRate > 100 || vitals.heartRate < 55)) {
    vitalWarnings.push(`Abnormal Resting Heart Rate: ${vitals.heartRate} bpm`);
  }

  if (vitals.temperature && vitals.temperature >= 103) {
    criticalFlags.push(`Hyperpyrexia: Core Temperature ${vitals.temperature}°F (Risk of febrile delirium/sepsis)`);
  } else if (vitals.temperature && vitals.temperature >= 100.4) {
    vitalWarnings.push(`Fever detected: ${vitals.temperature}°F`);
  }

  if (vitals.bloodSugar && (vitals.bloodSugar >= 400 || vitals.bloodSugar <= 60)) {
    criticalFlags.push(`Severe Glycemic Emergency: Random Blood Glucose ${vitals.bloodSugar} mg/dL`);
  }

  // 2. Symptomatic Red Flags
  const isChestPain = complaintsJoined.includes('chest pain') || complaintsJoined.includes('tightness') || complaintsJoined.includes('छाती');
  const isRadiation = complaintsJoined.includes('left arm') || complaintsJoined.includes('sweating') || complaintsJoined.includes('बाएं हाथ');
  const isAcuteDyspnea = complaintsJoined.includes('breath') || complaintsJoined.includes('सांस') || complaintsJoined.includes('blue lips');
  const isAppendicitis = complaintsJoined.includes('lower right side') || complaintsJoined.includes('inability to walk');

  if (isChestPain && isRadiation) {
    criticalFlags.push('High Suspicion for Acute Coronary Syndrome (ACS / STEMI): Chest pain radiating to arm/jaw with diaphoresis');
  }

  if (isAcuteDyspnea && complaintsJoined.includes('sudden onset')) {
    criticalFlags.push('Acute Severe Respiratory Distress: Sudden onset dyspnea');
  }

  if (isAppendicitis) {
    criticalFlags.push('Acute Surgical Abdomen: Right lower quadrant localized peritoneal irritation');
  }

  // Determine Severity and ESI Level
  const isCritical = criticalFlags.length > 0;
  let severity: 'emergency' | 'urgent' | 'routine' = 'routine';
  let esiLevel: 1 | 2 | 3 | 4 | 5 = 5;

  if (isCritical || highestSeverityScore >= 9) {
    severity = 'emergency';
    esiLevel = criticalFlags.some(f => f.includes('SpO2 < 90') || f.includes('Marked Hemodynamic')) ? 1 : 2;
  } else if (highestSeverityScore >= 5 || vitalWarnings.length > 0) {
    severity = 'urgent';
    esiLevel = 3;
  } else if (highestSeverityScore >= 3) {
    severity = 'routine';
    esiLevel = 4;
  } else {
    severity = 'routine';
    esiLevel = 5;
  }

  // Differential Diagnoses
  const differentialDiagnoses: {
    condition: string;
    probability: 'High' | 'Medium' | 'Low';
    clinicalRationale: string;
  }[] = [];

  if (isChestPain) {
    differentialDiagnoses.push({
      condition: 'Acute Coronary Syndrome (Angina / Myocardial Infarction)',
      probability: isRadiation ? 'High' : 'Medium',
      clinicalRationale: 'Classic ischemic retrosternal pressure with autonomic signs and demographic risk profile.',
    });
    differentialDiagnoses.push({
      condition: 'Gastroesophageal Reflux Disease (GERD) / Esophageal Spasm',
      probability: isRadiation ? 'Low' : 'High',
      clinicalRationale: 'Burning epigastric discomfort, often postprandial, mimicking cardiac pain.',
    });
    differentialDiagnoses.push({
      condition: 'Costochondritis / Musculoskeletal Chest Wall Strain',
      probability: complaintsJoined.includes('touching') ? 'High' : 'Low',
      clinicalRationale: 'Directly reproducible on local palpation of costochondral junctions.',
    });
  } else if (isAcuteDyspnea) {
    differentialDiagnoses.push({
      condition: 'Acute Exacerbation of COPD / Bronchial Asthma',
      probability: 'High',
      clinicalRationale: 'Expiratory wheezing, cough, and history of airway reactivity or smoking history.',
    });
    differentialDiagnoses.push({
      condition: 'Acute Pulmonary Embolism or Cardiogenic Pulmonary Edema',
      probability: profile?.chronicConditions.some(c => c.includes('CAD')) ? 'Medium' : 'Low',
      clinicalRationale: 'Sudden onset respiratory distress with underlying cardiovascular risk factors.',
    });
  } else if (complaintsJoined.includes('fever') || complaintsJoined.includes('बुखार')) {
    differentialDiagnoses.push({
      condition: 'Acute Viral Febrile Illness / Dengue / Influenza',
      probability: 'High',
      clinicalRationale: 'Sudden onset high-grade pyrexia, myalgia, arthralgia endemic to seasonal changes.',
    });
    differentialDiagnoses.push({
      condition: 'Lower Respiratory Tract Infection (Community-Acquired Pneumonia)',
      probability: vitalWarnings.some(w => w.includes('Hypoxia')) ? 'High' : 'Low',
      clinicalRationale: 'Fever accompanied by productive cough and reduced oxygen saturation.',
    });
  } else if (complaintsJoined.includes('abdominal') || complaintsJoined.includes('पेट')) {
    differentialDiagnoses.push({
      condition: 'Acute Gastroenteritis / Enteric Infection',
      probability: 'High',
      clinicalRationale: 'Diffuse crampy abdominal discomfort associated with nausea and diarrheal stools.',
    });
    differentialDiagnoses.push({
      condition: 'Acute Appendicitis / Cholecystitis',
      probability: isAppendicitis ? 'High' : 'Low',
      clinicalRationale: 'Focal right-sided peritoneal guarding with systemic malaise.',
    });
  } else {
    differentialDiagnoses.push({
      condition: 'Routine Chronic Disease Maintenance & Medication Review',
      probability: 'High',
      clinicalRationale: 'Asymptomatic or stable follow-up for chronic lifestyle disorders.',
    });
  }

  let recommendedAction = 'Proceed to primary outpatient consulting room for routine evaluation.';
  let recommendedDepartment = 'General Outpatient (OPD)';

  if (severity === 'emergency') {
    recommendedAction = 'STAT Bedside ECG, IV Access, Supplemental Oxygen, and immediate Emergency Medical Officer (EMO) assessment within 5 minutes.';
    recommendedDepartment = 'Emergency Medicine & Trauma / Resuscitation Bay';
  } else if (severity === 'urgent') {
    recommendedAction = 'Priority triage token. Basic point-of-care vitals recheck, targeted physician consultation within 20 minutes.';
    recommendedDepartment = 'Acute Care / Fast-Track Medical OPD';
  }

  return {
    severity,
    esiLevel,
    isCritical,
    criticalFlags,
    chiefComplaints,
    differentialDiagnoses,
    vitalWarnings,
    recommendedAction,
    recommendedDepartment,
  };
}
