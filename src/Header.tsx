import React, { useState } from 'react';
import {
  Stethoscope,
  Activity,
  Languages,
  Maximize2,
  Minimize2,
  FileText,
  AlertTriangle,
  Flame,
  LayoutDashboard,
  ShieldCheck,
  User,
} from 'lucide-react';
import { ViewMode, Language, PatientRecord } from './types.ts';
import { getTranslation } from './languages.ts';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  selectedLanguage: Language;
  onLanguageClick: () => void;
  currentPatient: PatientRecord | null;
  waitingCount: number;
  criticalCount: number;
  onOpenScenarios: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  selectedLanguage,
  onLanguageClick,
  currentPatient,
  waitingCount,
  criticalCount,
  onOpenScenarios,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 select-none shadow-md">
      {/* Top ABDM / Govt Health Advisory Stripe */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 px-4 py-1 text-xs text-white flex items-center justify-between font-medium">
        <div className="flex items-center space-x-2">
          <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
            ABDM Verified
          </span>
          <span>Ayushman Bharat Digital Mission • National Health Authority Kiosk v2.4</span>
        </div>
        <div className="flex items-center space-x-3 text-white/90 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
            OPD Live Server
          </span>
          <button
            onClick={onOpenScenarios}
            className="hover:text-white underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            Quick Demo Scenarios
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => onViewChange('language-select')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                MediKiosk
              </span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono">
                AI TRIAGE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Smart Outpatient Intake & Clinical Decision Support
            </p>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => onViewChange('intake')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'intake' || currentView === 'language-select' || currentView === 'abha-login' || currentView === 'scanner' || currentView === 'patient-summary'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Patient Kiosk
          </button>

          <button
            onClick={() => onViewChange('doctor-dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer relative ${
              currentView === 'doctor-dashboard'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Doctor OPD Queue
            {waitingCount > 0 && (
              <span className="ml-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {waitingCount}
              </span>
            )}
            {criticalCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full animate-bounce">
                {criticalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onViewChange('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'audit'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Clinical AI Audit
          </button>
        </div>

        {/* Right Tools */}
        <div className="flex items-center space-x-2">
          {/* Active Token Pill */}
          {currentPatient && (
            <div className="hidden md:flex items-center bg-slate-800 border border-slate-700 px-3 py-1 rounded-lg text-xs">
              <span className="text-slate-400 mr-1.5">Token:</span>
              <span className="font-bold text-blue-400 font-mono">
                {currentPatient.tokenNumber}
              </span>
            </div>
          )}

          {/* Language Selector Button */}
          <button
            onClick={onLanguageClick}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="Change Kiosk Language"
          >
            <Languages className="w-3.5 h-3.5 text-blue-400" />
            <span>{selectedLanguage.flag}</span>
            <span className="hidden sm:inline font-semibold">{selectedLanguage.nativeName}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Kiosk Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
