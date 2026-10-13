import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  AlertOctagon,
  Clock,
  CheckCircle,
  FileText,
  Activity,
  Download,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  Send,
  Plus,
} from 'lucide-react';
import { PatientRecord } from './types.ts';
import { generateSoapNote } from './medicalHistorySynthesis.ts';
import { generatePatientIntakePdf } from './pdfGenerator.ts';

interface DoctorDashboardViewProps {
  patients: PatientRecord[];
  onUpdatePatient: (updated: PatientRecord) => void;
  onSelectPatient: (patient: PatientRecord) => void;
}

export const DoctorDashboardView: React.FC<DoctorDashboardViewProps> = ({
  patients,
  onUpdatePatient,
  onSelectPatient,
}) => {
  const [selectedId, setSelectedId] = useState<string>(patients[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [doctorNoteInput, setDoctorNoteInput] = useState('');
  const [rxMedsInput, setRxMedsInput] = useState('');

  // Sort patients: Emergencies first, then Urgent, then Routine
  const sortedPatients = [...patients].sort((a, b) => {
    const scoreMap = { emergency: 3, urgent: 2, routine: 1 };
    return scoreMap[b.triage.severity] - scoreMap[a.triage.severity];
  });

  const filteredPatients = sortedPatients.filter((p) => {
    const name = (p.abhaProfile?.fullName || p.guestName || '').toLowerCase();
    const token = p.tokenNumber.toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase()) || token.includes(searchQuery.toLowerCase());
    const matchesFilter = filterSeverity === 'all' || p.triage.severity === filterSeverity;
    return matchesSearch && matchesFilter;
  });

  const currentSelected = patients.find((p) => p.id === selectedId) || filteredPatients[0];
  const soap = currentSelected ? generateSoapNote(currentSelected) : null;

  const handleStatusChange = (status: PatientRecord['status']) => {
    if (!currentSelected) return;
    const updated: PatientRecord = { ...currentSelected, status };
    onUpdatePatient(updated);
  };

  const handleSaveNotes = () => {
    if (!currentSelected) return;
    const updated: PatientRecord = {
      ...currentSelected,
      doctorNotes: doctorNoteInput,
      prescribedMeds: rxMedsInput ? rxMedsInput.split('\n').filter(Boolean) : currentSelected.prescribedMeds,
      status: 'Completed',
    };
    onUpdatePatient(updated);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* OPD Header Stats */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <Stethoscope className="w-4 h-4" />
            <span>Consulting Room 104 • Dr. Sunita Rao, MD (Internal Med)</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">
            Outpatient Triage & Consultation Console
          </h1>
          <p className="text-xs text-slate-400">
            Real-time queue synchronized with Kiosk intake terminal & ABDM National Health Stack
          </p>
        </div>

        {/* Counters */}
        <div className="flex gap-3 text-center">
          <div className="bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-700 min-w-24">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Total In Queue</span>
            <span className="text-xl font-black text-white">{patients.length}</span>
          </div>

          <div className="bg-red-950/80 px-4 py-2.5 rounded-2xl border border-red-800/80 min-w-24">
            <span className="text-[10px] text-red-300 block font-bold uppercase">Emergency</span>
            <span className="text-xl font-black text-red-400">
              {patients.filter((p) => p.triage.severity === 'emergency').length}
            </span>
          </div>

          <div className="bg-emerald-950/80 px-4 py-2.5 rounded-2xl border border-emerald-800/80 min-w-24">
            <span className="text-[10px] text-emerald-300 block font-bold uppercase">Completed</span>
            <span className="text-xl font-black text-emerald-400">
              {patients.filter((p) => p.status === 'Completed').length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Queue on Left, Patient details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Queue List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search & Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by Token (A-101) or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden"
              />
            </div>

            <div className="flex gap-1.5 text-xs font-bold">
              {[
                { id: 'all', label: 'All' },
                { id: 'emergency', label: 'Emergency (Red)' },
                { id: 'urgent', label: 'Urgent (Yellow)' },
                { id: 'routine', label: 'Routine (Green)' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterSeverity(f.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    filterSeverity === f.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Queue List Items */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredPatients.map((p) => {
              const isSelected = p.id === currentSelected?.id;
              const name = p.abhaProfile?.fullName || p.guestName || 'Walk-in';
              const isRed = p.triage.severity === 'emergency';
              const isYellow = p.triage.severity === 'urgent';

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                      : isRed
                      ? 'border-red-300 bg-red-50/30 hover:border-red-400'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black bg-slate-900 text-white px-2 py-0.5 rounded-lg">
                        {p.tokenNumber}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm truncate max-w-44">
                        {name}
                      </h4>
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isRed
                          ? 'bg-red-500 text-white animate-pulse'
                          : isYellow
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      ESI {p.triage.esiLevel}
                    </span>
                  </div>

                  {/* Complaints line */}
                  <div className="text-xs text-slate-600 font-medium mt-2 line-clamp-1">
                    {p.triage.chiefComplaints.join(', ') || 'Routine consultation'}
                  </div>

                  {/* Vitals summary bar */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                    <span className="font-mono">
                      BP: {p.vitals.systolicBp || '-'}/{p.vitals.diastolicBp || '-'} | SpO2: {p.vitals.spo2 || '-'}%
                    </span>
                    <span className="font-semibold text-blue-600">{p.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Patient Detail & Consultation Note (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {currentSelected && soap ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              {/* Header with quick status toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-slate-900">
                      {currentSelected.abhaProfile?.fullName || currentSelected.guestName}
                    </span>
                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                      {currentSelected.tokenNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {currentSelected.abhaProfile
                      ? `ABHA: ${currentSelected.abhaProfile.abhaNumber} • Age ${currentSelected.abhaProfile.age}Y (${currentSelected.abhaProfile.gender})`
                      : 'Walk-in Guest Patient'}
                  </p>
                </div>

                {/* Status Switcher Buttons */}
                <div className="flex gap-1.5 text-xs font-bold">
                  {(['Waiting', 'In Consultation', 'Completed', 'Referred'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st)}
                      className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                        currentSelected.status === st
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Triage Alert banner */}
              {currentSelected.triage.criticalFlags.length > 0 && (
                <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl space-y-1 text-xs">
                  <span className="font-bold text-red-800 flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-red-600" />
                    EMERGENCY TRIAGE TRIGGERS:
                  </span>
                  <ul className="text-red-900 font-semibold list-disc pl-5">
                    {currentSelected.triage.criticalFlags.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Vitals Ribbon */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Blood Pressure</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {currentSelected.vitals.systolicBp ? `${currentSelected.vitals.systolicBp}/${currentSelected.vitals.diastolicBp || '-'}` : '—'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">SpO2</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {currentSelected.vitals.spo2 ? `${currentSelected.vitals.spo2}%` : '—'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Heart Rate</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {currentSelected.vitals.heartRate ? `${currentSelected.vitals.heartRate} bpm` : '—'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Temperature</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {currentSelected.vitals.temperature ? `${currentSelected.vitals.temperature}°F` : '—'}
                  </span>
                </div>
              </div>

              {/* Primary Impression & Differential */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-xs space-y-1.5">
                <div className="font-bold text-indigo-950 flex items-center justify-between">
                  <span>Working Impression: {soap.assessment.primaryImpression}</span>
                  <span className="bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded text-[10px]">
                    ESI Level {currentSelected.triage.esiLevel}
                  </span>
                </div>
                <div className="text-indigo-800 text-[11px]">
                  Order: {currentSelected.triage.recommendedAction}
                </div>
              </div>

              {/* Doctor Consultation Note & Digital Rx */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Physician Clinical Notes & Observations:
                  </label>
                  <textarea
                    rows={2}
                    value={doctorNoteInput}
                    onChange={(e) => setDoctorNoteInput(e.target.value)}
                    placeholder="Enter clinical examination notes, heart/lung sounds, ECG review..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Prescribed Medicines (Rx):
                  </label>
                  <textarea
                    rows={2}
                    value={rxMedsInput}
                    onChange={(e) => setRxMedsInput(e.target.value)}
                    placeholder="1. Tab Sorbitrate 5mg SL stat&#10;2. Tab Clopidogrel 300mg stat&#10;3. Tab Pantoprazole 40mg OD"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Save Consultation & Complete Visit</span>
                </button>

                <button
                  type="button"
                  onClick={() => generatePatientIntakePdf(currentSelected)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF Slip</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              Select a patient from the queue to view clinical details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
