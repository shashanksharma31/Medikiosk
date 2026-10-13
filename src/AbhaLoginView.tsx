import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  UserCheck,
  User,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Phone,
  Info,
} from 'lucide-react';
import { AbhaProfile, Language } from './types.ts';
import { MOCK_ABHA_PROFILES } from './mockAbhaProfiles.ts';
import { getTranslation } from './languages.ts';

interface AbhaLoginViewProps {
  language: Language;
  onProfileLoaded: (profile: AbhaProfile | null, guestInfo?: { name: string; age: number; gender: string }) => void;
  onBack: () => void;
}

export const AbhaLoginView: React.FC<AbhaLoginViewProps> = ({
  language,
  onProfileLoaded,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'abha' | 'qr' | 'guest'>('abha');
  const [inputVal, setInputVal] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVal, setOtpVal] = useState('');
  const [selectedMock, setSelectedMock] = useState<AbhaProfile | null>(null);

  // Guest walk-in state
  const [guestName, setGuestName] = useState('');
  const [guestAge, setGuestAge] = useState<number>(45);
  const [guestGender, setGuestGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  const handleSelectMock = (profile: AbhaProfile) => {
    setSelectedMock(profile);
    setInputVal(profile.abhaNumber);
  };

  const handleSendOtp = () => {
    if (!inputVal) return;
    setOtpSent(true);
    setOtpVal('123456'); // Pre-fill mock OTP for convenience
  };

  const handleVerifyOtp = () => {
    const profile = selectedMock || MOCK_ABHA_PROFILES[0];
    onProfileLoaded(profile);
  };

  const handleGuestSubmit = () => {
    if (!guestName.trim()) return;
    onProfileLoaded(null, {
      name: guestName.trim(),
      age: Number(guestAge) || 35,
      gender: guestGender,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top ABDM Trust Card */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Ayushman Bharat Digital Mission (ABDM) Integration</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {getTranslation(language.code, 'abhaLogin')}
          </h2>
          <p className="text-blue-100 text-sm max-w-lg">
            {getTranslation(language.code, 'abhaLoginSub')}
          </p>
        </div>
        <div className="bg-white/10 p-3 rounded-2xl border border-white/20 text-center">
          <div className="text-2xl font-black text-amber-300">100%</div>
          <div className="text-[11px] text-white/80 font-medium">Consent-Driven ABDM Privacy</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab('abha')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'abha' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>ABHA Number / Mobile</span>
        </button>

        <button
          onClick={() => setActiveTab('qr')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'qr' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Scan ABHA QR</span>
        </button>

        <button
          onClick={() => setActiveTab('guest')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'guest' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Walk-in / No Card</span>
        </button>
      </div>

      {/* Tab 1: ABHA Number / Mobile */}
      {activeTab === 'abha' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          {/* Quick Mock Selectors */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Select Mock Patient Profile for Instant Testing:
              </span>
              <span className="text-slate-400">Click to autofill</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MOCK_ABHA_PROFILES.map((p) => (
                <button
                  key={p.abhaNumber}
                  type="button"
                  onClick={() => handleSelectMock(p)}
                  className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    selectedMock?.abhaNumber === p.abhaNumber
                      ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-blue-300 bg-slate-50/50'
                  }`}
                >
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>{p.fullName}</span>
                    <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                      {p.age}Y, {p.gender}
                    </span>
                  </div>
                  <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                    ABHA: {p.abhaNumber}
                  </div>
                  <div className="text-emerald-600 text-[10px] mt-1 font-medium truncate">
                    {p.chronicConditions.join(', ')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Input field */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                14-Digit ABHA Number or Linked Mobile Number
              </label>
              <div className="relative">
                <CreditCard className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="e.g. 14-5829-3011-8842 or 9876543210"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-base font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition-all"
                />
              </div>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={!inputVal}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Request Aadhaar / ABDM OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="space-y-4 p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-800 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>OTP successfully dispatched to linked mobile number (xxxxxxx210)</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter 6-Digit OTP (Mock auto-filled: 123456)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpVal}
                      onChange={(e) => setOtpVal(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-emerald-400 rounded-xl font-mono text-center tracking-widest text-lg font-bold text-slate-900 focus:outline-hidden"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Verify OTP & Link Health Records</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Scan QR */}
      {activeTab === 'qr' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs text-center space-y-6">
          <div className="max-w-md mx-auto space-y-3">
            <h3 className="text-lg font-bold text-slate-900">Scan ABHA Card QR Code</h3>
            <p className="text-xs text-slate-500">
              Hold your physical ABHA card or Ayushman Bharat App screen up to the kiosk scanner lens below.
            </p>
          </div>

          <div className="w-64 h-64 mx-auto border-4 border-dashed border-blue-500 rounded-3xl flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden group">
            <div className="absolute inset-x-0 h-1 bg-blue-500 animate-[bounce_2s_infinite]"></div>
            <QrCode className="w-24 h-24 text-blue-600/70" />
            <span className="text-xs font-semibold text-slate-600 mt-3">Align QR code inside box</span>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onProfileLoaded(MOCK_ABHA_PROFILES[0])}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Simulate Instant QR Scan (Rajesh Kumar)
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Walk-in / Guest */}
      {activeTab === 'guest' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Patients without an ABHA card can register as walk-in guests. A temporary OPD kiosk token will be assigned for consultation.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Ramesh Chandra"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Age (Years)</label>
              <input
                type="number"
                min={1}
                max={120}
                value={guestAge}
                onChange={(e) => setGuestAge(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Gender</label>
            <div className="flex gap-3">
              {(['Male', 'Female', 'Other'] as const).map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => setGuestGender(gender)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    guestGender === gender
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGuestSubmit}
            disabled={!guestName.trim()}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>Proceed to Symptom Intake</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
