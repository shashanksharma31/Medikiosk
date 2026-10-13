import React, { useEffect } from 'react';
import {
  AlertOctagon,
  Flame,
  PhoneCall,
  Bell,
  Activity,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { TriageEvaluation, PatientRecord } from './types.ts';

interface TriageAlertModalProps {
  triage: TriageEvaluation;
  patient: PatientRecord;
  isOpen: boolean;
  onAcknowledge: () => void;
  onImmediateEscalation: () => void;
}

export const TriageAlertModal: React.FC<TriageAlertModalProps> = ({
  triage,
  patient,
  isOpen,
  onAcknowledge,
  onImmediateEscalation,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Audio alarm beep simulation via Web Audio API
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High urgent A5 note
        osc.frequency.setValueAtTime(440, audioCtx.currentTime + 0.2); // Drop to A4 note
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      } catch (_) {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full border-4 border-red-600 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Flashing Top Emergency Bar */}
        <div className="bg-red-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl animate-pulse">
              <AlertOctagon className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-xs font-black tracking-widest uppercase text-red-200">
                Critical Clinical Alert • ESI LEVEL {triage.esiLevel}
              </div>
              <h2 className="text-xl font-black tracking-tight">
                IMMEDIATE EMERGENCY TRIAGE
              </h2>
            </div>
          </div>
          <span className="bg-white text-red-700 text-xs font-black px-2.5 py-1 rounded-full animate-bounce uppercase">
            STAT CODE RED
          </span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2">
            <div className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Red Flag Life-Safety Triggers Detected</span>
            </div>
            <ul className="space-y-1.5">
              {triage.criticalFlags.map((flag, idx) => (
                <li
                  key={idx}
                  className="text-sm font-bold text-red-900 flex items-start gap-2"
                >
                  <span className="text-red-500 font-black">•</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Patient Quick Vitals Snapshot */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center text-xs">
            <div>
              <span className="text-slate-500 block">Blood Pressure</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {patient.vitals.systolicBp ? `${patient.vitals.systolicBp}/${patient.vitals.diastolicBp || '-'}` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Pulse O2 (SpO2)</span>
              <span className={`font-mono font-bold text-sm ${patient.vitals.spo2 && patient.vitals.spo2 < 92 ? 'text-red-600' : 'text-slate-900'}`}>
                {patient.vitals.spo2 ? `${patient.vitals.spo2}%` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Heart Rate</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {patient.vitals.heartRate ? `${patient.vitals.heartRate} bpm` : 'N/A'}
              </span>
            </div>
          </div>

          {/* Protocol Order */}
          <div className="text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">Recommended Protocol:</span>
            <p className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-xl font-medium">
              {triage.recommendedAction}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onImmediateEscalation}
              className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-101"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Route Directly to Resuscitation Bay</span>
            </button>

            <button
              type="button"
              onClick={onAcknowledge}
              className="py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl transition-all cursor-pointer"
            >
              View Clinical Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
