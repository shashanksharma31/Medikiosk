import { jsPDF } from 'jspdf';
import { PatientRecord } from './types.ts';
import { generateSoapNote } from './medicalHistorySynthesis.ts';

export function generatePatientIntakePdf(patient: PatientRecord): void {
  const doc = new jsPDF();
  const soap = generateSoapNote(patient);
  const profile = patient.abhaProfile;

  // Header
  doc.setFillColor(15, 76, 129); // Deep hospital blue
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('MEDIKIOSK - CLINICAL INTAKE SLIP', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('National Health Mission / Ayushman Bharat Digital Health Ecosystem', 14, 19);
  doc.text(`Token: ${patient.tokenNumber}`, 160, 12);
  doc.text(`Time: ${new Date(patient.timestamp).toLocaleTimeString()}`, 160, 19);

  // Patient Demographic Banner
  doc.setFillColor(243, 246, 250);
  doc.rect(14, 32, 182, 28, 'F');
  doc.setTextColor(30, 41, 59);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const patientName = profile?.fullName || patient.guestName || 'Walk-in Patient';
  doc.text(`Patient: ${patientName}`, 18, 40);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Age/Sex: ${profile?.age || patient.guestAge || 'N/A'} Y / ${profile?.gender || patient.guestGender || 'N/A'}`, 18, 47);
  doc.text(`Blood Group: ${profile?.bloodGroup || 'N/A'}`, 18, 54);

  doc.text(`ABHA ID: ${profile?.abhaNumber || 'Walk-in (Unlinked)'}`, 105, 40);
  doc.text(`Mobile: ${profile?.mobile || 'N/A'}`, 105, 47);
  doc.text(`PM-JAY Scheme: ${profile?.pmjayBeneficiary ? 'Enrolled Active' : 'Not Enrolled'}`, 105, 54);

  // Triage Status
  let triageColor: [number, number, number] = [34, 197, 94];
  if (patient.triage.severity === 'emergency') triageColor = [239, 68, 68];
  else if (patient.triage.severity === 'urgent') triageColor = [245, 158, 11];

  doc.setFillColor(triageColor[0], triageColor[1], triageColor[2]);
  doc.rect(14, 64, 182, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`TRIAGE STATUS: ${patient.triage.severity.toUpperCase()} (ESI LEVEL ${patient.triage.esiLevel}) - DEPT: ${patient.triage.recommendedDepartment}`, 18, 71);

  // Vitals
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Recorded Vitals (Point of Care)', 14, 84);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(soap.objective.vitalsSummary || 'No vital sensor connected', 14, 91);

  // Critical Flags / Warnings
  if (patient.triage.criticalFlags.length > 0) {
    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
    doc.text('RED FLAG ALERTS DETECTED:', 14, 101);
    doc.setFont('helvetica', 'normal');
    let y = 107;
    for (const flag of patient.triage.criticalFlags) {
      doc.text(`• ${flag}`, 18, y);
      y += 6;
    }
  }

  // Chief Complaint & History
  let ySection = patient.triage.criticalFlags.length > 0 ? 122 : 104;
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Subjective Symptoms & Intake History', 14, ySection);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Chief Complaints: ${soap.subjective.chiefComplaint}`, 14, ySection + 7);
  doc.text(`Current Medications: ${profile?.currentMedications.join('; ') || 'None reported'}`, 14, ySection + 14);
  doc.text(`Allergies: ${profile?.allergies.join(', ') || 'No known allergies'}`, 14, ySection + 21);

  // Clinical Impression & Plan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Preliminary Clinical Impression & Action Plan', 14, ySection + 32);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Differential: ${soap.assessment.primaryImpression}`, 14, ySection + 39);
  doc.text(`Recommended Action: ${patient.triage.recommendedAction}`, 14, ySection + 46);

  // Footer & Barcode note
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 270, 196, 270);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('This is an automated kiosk intake record generated for outpatient triage. Not a final diagnostic prescription.', 14, 276);
  doc.text('Verified by ABDM Health Facility Registry (HFR-IND-9021)', 14, 282);

  doc.save(`MediKiosk_Intake_${patient.tokenNumber}.pdf`);
}
