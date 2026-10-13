import React from 'react';
import { X, Flame, ArrowRight, Activity, AlertOctagon, Sparkles } from 'lucide-react';
import { SAMPLE_SCENARIOS, SampleScenario } from './sampleScenarios.ts';

interface ScenarioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: SampleScenario) => void;
}

export const ScenarioDrawer: React.FC<ScenarioDrawerProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Quick Demo Scenarios</h3>
                <p className="text-xs text-slate-500">Test triage edge cases in 1-click</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scenario Cards */}
          <div className="space-y-3 pt-2">
            {SAMPLE_SCENARIOS.map((sc) => (
              <div
                key={sc.id}
                onClick={() => {
                  onSelectScenario(sc);
                  onClose();
                }}
                className="p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>

                <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                  {sc.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {sc.description}
                </p>

                <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                  <span>Token: {sc.patient.tokenNumber}</span>
                  <span>ESI Level {sc.patient.triage.esiLevel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer tip */}
        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 text-center">
          Clicking any scenario pre-populates patient ABHA profile, vitals, symptoms, and fires the clinical triage engine.
        </div>
      </div>
    </div>
  );
};
