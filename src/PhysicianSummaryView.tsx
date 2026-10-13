import React from 'react';
import {
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle,
  Download,
  ArrowLeft,
  ShieldAlert,
  Stethoscope,
  Pill,
  ClipboardList,
} from 'lucide-react';
import { PatientRecord } from './types.ts';
import { generateSoapNote } from './medicalHistorySynthesis.ts';
import { generatePatientIntakePdf } from './pdfGenerator.ts';

interface PhysicianSummaryViewProps {
  patient: PatientRecord;
  onBack: () => void;
  onOpenDashboard: () => void;
}

export const PhysicianSummaryView: React.FC<PhysicianSummaryViewProps> = ({
  patient,
  onBack,
  onOpenDashboard,
}) => {
  const soap = generateSoapNote(patient);
  const profile = patient.abhaProfile;
  const isEmergency = patient.triage.severity === 'emergency';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                isEmergency ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
              }`}
            >
              {soap.assessment.triageLevel}
            </span>
            <span className="text-slate-400 text-xs">
              Token: <span className="font-mono text-white font-bold">{patient.tokenNumber}</span>
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Clinical SOAP Assessment & Triage
          </h1>
          <p className="text-xs text-slate-400">
            Automated synthetic summary for Physician OPD review • ABDM FHIR Profile R4
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => generatePatientIntakePdf(patient)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
          <button
            type="button"
            onClick={onOpenDashboard}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            OPD Queue
          </button>
        </div>
      </div>

      {/* Red Flag Warning if present */}
      {patient.triage.criticalFlags.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-5 space-y-2">
          <div className="text-red-800 font-black text-sm flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
            <span>CLINICAL RED FLAGS DETECTED (ACTION REQUIRED)</span>
          </div>
          <ul className="space-y-1 text-xs text-red-900 font-bold pl-7 list-disc">
            {patient.triage.criticalFlags.map((flag, idx) => (
              <li key={idx}>{flag}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Drug-Drug Interaction Alerts */}
      {soap.assessment.interactionAlerts.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 space-y-2">
          <div className="text-amber-800 font-black text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>POTENTIAL DRUG-DRUG INTERACTIONS IDENTIFIED</span>
          </div>
          <ul className="space-y-1 text-xs text-amber-900 font-medium pl-7 list-disc">
            {soap.assessment.interactionAlerts.map((alert, idx) => (
              <li key={idx}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* SOAP 4-Quadrant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* S - Subjective */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-extrabold uppercase text-blue-600 tracking-wider">
              [S] Subjective
            </span>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">
              Patient History
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="font-bold text-slate-700 block">Chief Complaints:</span>
              <p className="text-slate-900 font-medium mt-0.5">{soap.subjective.chiefComplaint}</p>
            </div>

            <div>
              <span className="font-bold text-slate-700 block">History of Present Illness:</span>
              <p className="text-slate-600 leading-relaxed mt-0.5">
                {soap.subjective.historyOfPresentIllness}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-700 block">Allergies:</span>
              <p className="text-red-700 font-semibold mt-0.5">
                {soap.subjective.allergies.join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* O - Objective */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-extrabold uppercase text-emerald-600 tracking-wider">
              [O] Objective
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                soap.objective.vitalStatus === 'Critical'
                  ? 'bg-red-100 text-red-800'
                  : soap.objective.vitalStatus === 'Abnormal'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {soap.objective.vitalStatus} Vitals
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="font-bold text-slate-700 block">Point-of-Care Vitals:</span>
              <p className="font-mono text-slate-900 font-semibold mt-0.5 bg-slate-50 p-2 rounded-xl">
                {soap.objective.vitalsSummary}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-700 block">Current Medications (ABDM Linked):</span>
              <ul className="text-slate-600 space-y-0.5 mt-0.5">
                {soap.objective.recordedMeds.map((m, i) => (
                  <li key={i}>• {m}</li>
                ))}
              </ul>
            </div>

            {soap.objective.scannedFindings.length > 0 && (
              <div>
                <span className="font-bold text-slate-700 block">Scanned Paper Records:</span>
                <ul className="text-slate-600 space-y-0.5 mt-0.5">
                  {soap.objective.scannedFindings.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* A - Assessment */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-extrabold uppercase text-indigo-600 tracking-wider">
              [A] Assessment
            </span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">
              Differential Diagnosis
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="font-bold text-slate-700 block">Working Impression:</span>
              <p className="text-indigo-950 font-bold text-sm mt-0.5">
                {soap.assessment.primaryImpression}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Ranked Differentials:</span>
              <div className="space-y-1.5">
                {patient.triage.differentialDiagnoses.map((diff, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col gap-0.5"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{diff.condition}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          diff.probability === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {diff.probability}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">{diff.clinicalRationale}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* P - Plan */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-extrabold uppercase text-purple-600 tracking-wider">
              [P] Plan
            </span>
            <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded">
              Suggested Orders
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="font-bold text-slate-700 block">Immediate Interventions:</span>
              <ul className="text-slate-800 space-y-1 mt-0.5">
                {soap.plan.immediateInterventions.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="font-bold text-slate-700 block">Recommended Diagnostics:</span>
              <ul className="text-slate-600 space-y-1 mt-0.5">
                {soap.plan.investigations.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>

            <div>
              <span className="font-bold text-slate-700 block">Department Routing:</span>
              <p className="text-slate-900 font-semibold mt-0.5">{soap.plan.referral}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-2 flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          className="text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient View</span>
        </button>

        <button
          type="button"
          onClick={onOpenDashboard}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          Open Doctor OPD Console
        </button>
      </div>
    </div>
  );
};
