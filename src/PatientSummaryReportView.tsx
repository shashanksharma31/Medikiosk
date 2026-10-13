import React from 'react';
import {
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Heart,
  Activity,
  FileText,
  User,
  Stethoscope,
  Share2,
} from 'lucide-react';
import { PatientRecord, Language } from './types.ts';
import { generatePatientIntakePdf } from './pdfGenerator.ts';
import confetti from 'canvas-confetti';

interface PatientSummaryReportViewProps {
  patient: PatientRecord;
  language: Language;
  onViewDoctorSummary: () => void;
  onNewPatient: () => void;
}

export const PatientSummaryReportView: React.FC<PatientSummaryReportViewProps> = ({
  patient,
  language,
  onViewDoctorSummary,
  onNewPatient,
}) => {
  const profile = patient.abhaProfile;
  const patientName = profile?.fullName || patient.guestName || 'Walk-in Patient';

  const handleDownloadPdf = () => {
    generatePatientIntakePdf(patient);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (_) {}
  };

  const isEmergency = patient.triage.severity === 'emergency';
  const isUrgent = patient.triage.severity === 'urgent';

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Success Banner */}
      <div
        className={`p-6 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isEmergency
            ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700'
            : isUrgent
            ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700'
            : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600'
        }`}
      >
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-bold opacity-90">
              Intake Registration Completed
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              {isEmergency
                ? 'EMERGENCY TRIAGE ASSIGNED'
                : 'Registration Slip Generated'}
            </h1>
            <p className="text-xs opacity-90 mt-0.5">
              Doctor queue updated • Health records safely linked with ABDM
            </p>
          </div>
        </div>

        {/* Big Token Number */}
        <div className="bg-white/15 px-6 py-3 rounded-2xl border border-white/25 text-center min-w-32">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/80">
            OPD Token
          </div>
          <div className="text-3xl font-black font-mono tracking-tight text-white">
            {patient.tokenNumber}
          </div>
        </div>
      </div>

      {/* Main Printed Slip Layout Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Hospital Slip Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <h2 className="font-extrabold text-slate-900 text-lg">
                MediKiosk Outpatient Clinical Token
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              District Hospital & Primary Health Network • Room 104
            </p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div className="font-mono">{new Date(patient.timestamp).toLocaleDateString()}</div>
            <div className="font-mono text-slate-400">
              {new Date(patient.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Patient Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Patient Name</span>
            <span className="font-bold text-slate-900">{patientName}</span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Age / Gender</span>
            <span className="font-bold text-slate-900">
              {profile?.age || patient.guestAge || 'N/A'} Y / {profile?.gender || patient.guestGender || 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">ABHA Health ID</span>
            <span className="font-bold text-slate-900 font-mono">
              {profile?.abhaNumber || 'Walk-in'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">PM-JAY Ayushman</span>
            <span className={`font-bold ${profile?.pmjayBeneficiary ? 'text-emerald-700' : 'text-slate-600'}`}>
              {profile?.pmjayBeneficiary ? 'Enrolled Active' : 'Not Enrolled'}
            </span>
          </div>
        </div>

        {/* Recorded Vitals */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-blue-600" />
            Point-of-Care Vitals Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Blood Pressure</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {patient.vitals.systolicBp ? `${patient.vitals.systolicBp}/${patient.vitals.diastolicBp || '-'}` : '—'} mmHg
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Pulse O2 (SpO2)</span>
              <span className={`font-bold font-mono text-sm ${patient.vitals.spo2 && patient.vitals.spo2 < 92 ? 'text-red-600' : 'text-slate-900'}`}>
                {patient.vitals.spo2 ? `${patient.vitals.spo2}%` : '—'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Heart Rate</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {patient.vitals.heartRate ? `${patient.vitals.heartRate} bpm` : '—'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Temperature</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {patient.vitals.temperature ? `${patient.vitals.temperature}°F` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Complaints & Instructions */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Reported Intake Concerns
          </h3>
          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 text-xs text-blue-900 space-y-1">
            <div className="font-bold">
              {patient.triage.chiefComplaints.join(' • ') || 'Routine Medical Checkup'}
            </div>
            <div className="text-[11px] text-blue-800">
              Assigned Department: <span className="font-bold">{patient.triage.recommendedDepartment}</span>
            </div>
          </div>
        </div>

        {/* Attached Documents Notice */}
        {patient.scannedDocuments.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {patient.scannedDocuments.length} prescription document(s) scanned & attached to doctor console.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download / Print Clinical Slip (PDF)</span>
          </button>

          <button
            type="button"
            onClick={onViewDoctorSummary}
            className="py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Stethoscope className="w-4 h-4 text-blue-600" />
            <span>View Doctor SOAP Note</span>
          </button>

          <button
            type="button"
            onClick={onNewPatient}
            className="py-3.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl border border-slate-200 transition-all cursor-pointer"
          >
            New Check-in
          </button>
        </div>
      </div>
    </div>
  );
};
