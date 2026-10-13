import React, { useState } from 'react';
import {
  Volume2,
  Mic,
  MicOff,
  Activity,
  Heart,
  Thermometer,
  Droplet,
  Wind,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Camera,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Language, PatientVitals, IntakeAnswer, PatientRecord, AbhaProfile } from './types.ts';
import { INTAKE_QUESTIONS, IntakeQuestion } from './conversationTree.ts';
import { KioskSpeechEngine } from './speechUtils.ts';
import { evaluateClinicalTriage } from './clinicalInference.ts';

interface KioskIntakeViewProps {
  language: Language;
  profile: AbhaProfile | null;
  guestInfo?: { name: string; age: number; gender: string };
  onCompleteIntake: (
    vitals: PatientVitals,
    answers: IntakeAnswer[],
    triageResult: ReturnType<typeof evaluateClinicalTriage>
  ) => void;
  onGoToScanner: () => void;
  onBack: () => void;
}

export const KioskIntakeView: React.FC<KioskIntakeViewProps> = ({
  language,
  profile,
  guestInfo,
  onCompleteIntake,
  onGoToScanner,
  onBack,
}) => {
  const [step, setStep] = useState<'symptoms' | 'vitals'>('symptoms');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<IntakeAnswer[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Vitals state
  const [vitals, setVitals] = useState<PatientVitals>({
    systolicBp: 124,
    diastolicBp: 82,
    heartRate: 76,
    spo2: 98,
    temperature: 98.6,
    bloodSugar: 110,
    respiratoryRate: 18,
  });

  const currentQ: IntakeQuestion = INTAKE_QUESTIONS[currentQuestionIndex] || INTAKE_QUESTIONS[0];

  const handleSpeakQuestion = () => {
    const textToSpeak = language.code === 'hi' ? currentQ.promptHindi : currentQ.question;
    KioskSpeechEngine.speak(textToSpeak, language.voiceLangCode);
  };

  const handleSelectOption = (opt: (typeof currentQ.options)[0]) => {
    const updatedAnswers = [
      ...answers.filter((a) => a.questionId !== currentQ.id),
      {
        questionId: currentQ.id,
        questionText: currentQ.question,
        answerText: opt.label,
        severityScore: opt.severityScore,
      },
    ];
    setAnswers(updatedAnswers);

    // If there is a next question indicated or more questions
    if (opt.nextQuestionId) {
      const nextIdx = INTAKE_QUESTIONS.findIndex((q) => q.id === opt.nextQuestionId);
      if (nextIdx !== -1) {
        setCurrentQuestionIndex(nextIdx);
        return;
      }
    }

    if (currentQuestionIndex < 2) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Move to vitals step
      setStep('vitals');
    }
  };

  const handleToggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    KioskSpeechEngine.startListening(
      language.voiceLangCode,
      (transcript) => {
        setIsListening(false);
        // Find best match in options
        const match = currentQ.options.find(
          (o) =>
            o.label.toLowerCase().includes(transcript.toLowerCase()) ||
            transcript.toLowerCase().includes(o.label.toLowerCase())
        );
        if (match) {
          handleSelectOption(match);
        } else {
          // Store raw answer
          setAnswers((prev) => [
            ...prev.filter((a) => a.questionId !== currentQ.id),
            {
              questionId: currentQ.id,
              questionText: currentQ.question,
              answerText: transcript,
              severityScore: 5,
            },
          ]);
          setStep('vitals');
        }
      },
      () => setIsListening(false)
    );
  };

  const handleFinish = () => {
    const evaluation = evaluateClinicalTriage(vitals, answers, profile || undefined);
    onCompleteIntake(vitals, answers, evaluation);
  };

  const patientDisplayName = profile?.fullName || guestInfo?.name || 'Walk-in Patient';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Patient Header Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            {patientDisplayName.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">{patientDisplayName}</div>
            <div className="text-xs text-slate-500">
              {profile ? `ABHA: ${profile.abhaNumber}` : `Walk-in Guest • ${guestInfo?.gender}`}
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span
            className={`px-3 py-1 rounded-full ${
              step === 'symptoms' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            1. Symptoms
          </span>
          <span
            className={`px-3 py-1 rounded-full ${
              step === 'vitals' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            2. Vitals
          </span>
        </div>
      </div>

      {step === 'symptoms' ? (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          {/* Question Title & Audio Button */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Question {currentQuestionIndex + 1} of 3
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {language.code === 'hi' ? currentQ.promptHindi : currentQ.question}
              </h2>
              {language.code !== 'hi' && (
                <p className="text-xs text-slate-500 italic">{currentQ.promptHindi}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSpeakQuestion}
                className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-2xl transition-all cursor-pointer"
                title="Read question aloud"
              >
                <Volume2 className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title="Speak answer into mic"
              >
                {isListening ? <Mic className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                <span className="text-xs font-bold hidden sm:inline">
                  {isListening ? 'Listening...' : 'Voice Input'}
                </span>
              </button>
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {currentQ.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectOption(opt)}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 flex items-start justify-between gap-3 group ${
                  opt.triggersCritical
                    ? 'border-red-200 bg-red-50/30'
                    : 'border-slate-200 bg-slate-50/30'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    {language.code === 'hi' ? opt.labelHindi : opt.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {language.code === 'hi' ? opt.label : opt.labelHindi}
                  </div>
                </div>

                {opt.triggersCritical ? (
                  <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    High Priority
                  </span>
                ) : (
                  <span className="text-slate-300 group-hover:text-blue-500">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Skip to vitals */}
          <div className="pt-4 flex justify-between items-center border-t border-slate-100 text-xs">
            <button
              onClick={onBack}
              className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
            >
              ← Back to ABHA Login
            </button>
            <button
              onClick={() => setStep('vitals')}
              className="text-blue-600 hover:underline font-bold cursor-pointer"
            >
              Skip to Vitals Recording →
            </button>
          </div>
        </div>
      ) : (
        /* Vitals Step */
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Point-of-Care Diagnostic Vitals
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Check or Adjust Measured Vitals
              </h2>
              <p className="text-xs text-slate-500">
                Sensors simulate automatic digital cuff, pulse oximeter, and IR thermometer intake.
              </p>
            </div>
            <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl text-xs font-bold border border-emerald-200">
              Sensors Synced
            </div>
          </div>

          {/* Vitals Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Blood Pressure */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-rose-500" />
                  Blood Pressure (mmHg)
                </span>
                {vitals.systolicBp && vitals.systolicBp >= 180 && (
                  <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.2 rounded">
                    CRISIS
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={vitals.systolicBp || ''}
                  onChange={(e) => setVitals({ ...vitals, systolicBp: Number(e.target.value) })}
                  placeholder="Systolic"
                  className="w-1/2 p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-center font-bold text-slate-900"
                />
                <input
                  type="number"
                  value={vitals.diastolicBp || ''}
                  onChange={(e) => setVitals({ ...vitals, diastolicBp: Number(e.target.value) })}
                  placeholder="Diastolic"
                  className="w-1/2 p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-center font-bold text-slate-900"
                />
              </div>
            </div>

            {/* SpO2 */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-cyan-500" />
                  Oxygen Saturation (SpO2 %)
                </span>
                {vitals.spo2 && vitals.spo2 < 92 && (
                  <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.2 rounded">
                    LOW
                  </span>
                )}
              </div>
              <input
                type="number"
                value={vitals.spo2 || ''}
                onChange={(e) => setVitals({ ...vitals, spo2: Number(e.target.value) })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-center font-bold text-slate-900"
              />
            </div>

            {/* Heart Rate */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-red-500" />
                  Heart Rate (BPM)
                </span>
                {vitals.heartRate && vitals.heartRate > 100 && (
                  <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded">
                    TACHY
                  </span>
                )}
              </div>
              <input
                type="number"
                value={vitals.heartRate || ''}
                onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-center font-bold text-slate-900"
              />
            </div>

            {/* Temperature */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-orange-500" />
                Temperature (°F)
              </span>
              <input
                type="number"
                step="0.1"
                value={vitals.temperature || ''}
                onChange={(e) => setVitals({ ...vitals, temperature: Number(e.target.value) })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-center font-bold text-slate-900"
              />
            </div>

            {/* Blood Sugar */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-purple-500" />
                Random Blood Glucose (mg/dL)
              </span>
              <input
                type="number"
                value={vitals.bloodSugar || ''}
                onChange={(e) => setVitals({ ...vitals, bloodSugar: Number(e.target.value) })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-center font-bold text-slate-900"
              />
            </div>

            {/* Optional Scan Prescriptions */}
            <div className="p-4 rounded-2xl border border-dashed border-blue-300 bg-blue-50/40 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-blue-900 block">
                  Have Past Paper Prescriptions?
                </span>
                <span className="text-[11px] text-blue-700">
                  Scan doctor slips or lab reports to auto-extract medications.
                </span>
              </div>
              <button
                type="button"
                onClick={onGoToScanner}
                className="mt-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Open Document Scanner</span>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep('symptoms')}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Questions</span>
            </button>

            <button
              type="button"
              onClick={handleFinish}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Evaluate Clinical Triage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
