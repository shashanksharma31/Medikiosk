import React, { useState } from 'react';
import {
  ViewMode,
  Language,
  PatientRecord,
  AbhaProfile,
  PatientVitals,
  IntakeAnswer,
  ScannedDocument,
} from './types.ts';
import { SUPPORTED_LANGUAGES } from './languages.ts';
import { SAMPLE_SCENARIOS, SampleScenario } from './sampleScenarios.ts';
import { Header } from './Header.tsx';
import { LanguageSelectView } from './LanguageSelectView.tsx';
import { AbhaLoginView } from './AbhaLoginView.tsx';
import { KioskIntakeView } from './KioskIntakeView.tsx';
import { DocumentScannerView } from './DocumentScannerView.tsx';
import { MultiPrescriptionUploadView } from './MultiPrescriptionUploadView.tsx';
import { PatientSummaryReportView } from './PatientSummaryReportView.tsx';
import { PhysicianSummaryView } from './PhysicianSummaryView.tsx';
import { DoctorDashboardView } from './DoctorDashboardView.tsx';
import { LlamaAuditView } from './LlamaAuditView.tsx';
import { TriageAlertModal } from './TriageAlertModal.tsx';
import { ScenarioDrawer } from './ScenarioDrawer.tsx';
import { ApiKeyModal } from './ApiKeyModal.tsx';
import { evaluateClinicalTriage } from './clinicalInference.ts';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('language-select');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);

  // Initial patient queue populated with sample clinic cases
  const [patientQueue, setPatientQueue] = useState<PatientRecord[]>([
    SAMPLE_SCENARIOS[0].patient,
    SAMPLE_SCENARIOS[1].patient,
    SAMPLE_SCENARIOS[2].patient,
  ]);

  // Active check-in patient session state
  const [activeProfile, setActiveProfile] = useState<AbhaProfile | null>(null);
  const [guestInfo, setGuestInfo] = useState<{ name: string; age: number; gender: string } | undefined>();
  const [currentPatient, setCurrentPatient] = useState<PatientRecord | null>(SAMPLE_SCENARIOS[0].patient);
  const [scannedDocs, setScannedDocs] = useState<ScannedDocument[]>([]);

  // Modals & Drawers
  const [isScenarioDrawerOpen, setIsScenarioDrawerOpen] = useState(false);
  const [isTriageAlertOpen, setIsTriageAlertOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Handlers
  const handleLanguageSelect = (lang: Language) => {
    setSelectedLanguage(lang);
  };

  const handleProfileLoaded = (
    profile: AbhaProfile | null,
    guest?: { name: string; age: number; gender: string }
  ) => {
    setActiveProfile(profile);
    setGuestInfo(guest);
    setCurrentView('intake');
  };

  const handleCompleteIntake = (
    vitals: PatientVitals,
    answers: IntakeAnswer[],
    triageResult: ReturnType<typeof evaluateClinicalTriage>
  ) => {
    const nextTokenNum = `T-${100 + patientQueue.length + 1}`;
    const newRecord: PatientRecord = {
      id: `pt-${Date.now()}`,
      tokenNumber: nextTokenNum,
      timestamp: new Date().toISOString(),
      language: selectedLanguage.code,
      abhaProfile: activeProfile || undefined,
      guestName: guestInfo?.name,
      guestAge: guestInfo?.age,
      guestGender: guestInfo?.gender,
      vitals,
      intakeAnswers: answers,
      scannedDocuments: scannedDocs,
      triage: triageResult,
      status: 'Waiting',
    };

    setCurrentPatient(newRecord);
    setPatientQueue((prev) => [newRecord, ...prev]);

    // If emergency, pop the critical triage alert modal
    if (triageResult.severity === 'emergency' || triageResult.isCritical) {
      setIsTriageAlertOpen(true);
    }

    setCurrentView('patient-summary');
  };

  const handleDocumentAdded = (doc: ScannedDocument) => {
    setScannedDocs((prev) => [...prev, doc]);
    if (currentPatient) {
      setCurrentPatient({
        ...currentPatient,
        scannedDocuments: [...currentPatient.scannedDocuments, doc],
      });
    }
  };

  const handleSelectScenario = (scenario: SampleScenario) => {
    setCurrentPatient(scenario.patient);
    setActiveProfile(scenario.patient.abhaProfile || null);
    setSelectedLanguage(
      SUPPORTED_LANGUAGES.find((l) => l.code === scenario.patient.language) || SUPPORTED_LANGUAGES[0]
    );

    // If not in queue, add it
    if (!patientQueue.some((p) => p.id === scenario.patient.id)) {
      setPatientQueue((prev) => [scenario.patient, ...prev]);
    }

    if (scenario.patient.triage.severity === 'emergency') {
      setIsTriageAlertOpen(true);
    }

    setCurrentView('patient-summary');
  };

  const handleUpdatePatient = (updated: PatientRecord) => {
    setPatientQueue((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (currentPatient?.id === updated.id) {
      setCurrentPatient(updated);
    }
  };

  const handleNewCheckin = () => {
    setActiveProfile(null);
    setGuestInfo(undefined);
    setScannedDocs([]);
    setCurrentView('language-select');
  };

  const criticalCount = patientQueue.filter((p) => p.triage.severity === 'emergency').length;
  const waitingCount = patientQueue.filter((p) => p.status === 'Waiting').length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        selectedLanguage={selectedLanguage}
        onLanguageClick={() => setCurrentView('language-select')}
        currentPatient={currentPatient}
        waitingCount={waitingCount}
        criticalCount={criticalCount}
        onOpenScenarios={() => setIsScenarioDrawerOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 py-4 sm:py-6">
        {currentView === 'language-select' && (
          <LanguageSelectView
            currentLanguage={selectedLanguage}
            onSelectLanguage={handleLanguageSelect}
            onContinue={() => setCurrentView('abha-login')}
          />
        )}

        {currentView === 'abha-login' && (
          <AbhaLoginView
            language={selectedLanguage}
            onProfileLoaded={handleProfileLoaded}
            onBack={() => setCurrentView('language-select')}
          />
        )}

        {currentView === 'intake' && (
          <KioskIntakeView
            language={selectedLanguage}
            profile={activeProfile}
            guestInfo={guestInfo}
            onCompleteIntake={handleCompleteIntake}
            onGoToScanner={() => setCurrentView('scanner')}
            onBack={() => setCurrentView('abha-login')}
          />
        )}

        {currentView === 'scanner' && (
          <DocumentScannerView
            onDocumentAdded={handleDocumentAdded}
            onFinish={() => setCurrentView('intake')}
            onBack={() => setCurrentView('intake')}
          />
        )}

        {currentView === 'prescription-upload' && (
          <MultiPrescriptionUploadView
            documents={scannedDocs}
            onAddNewScan={() => setCurrentView('scanner')}
            onRemoveDoc={(id) => setScannedDocs((prev) => prev.filter((d) => d.id !== id))}
            onContinue={() => setCurrentView('patient-summary')}
            onBack={() => setCurrentView('intake')}
          />
        )}

        {currentView === 'patient-summary' && currentPatient && (
          <PatientSummaryReportView
            patient={currentPatient}
            language={selectedLanguage}
            onViewDoctorSummary={() => setCurrentView('physician-summary')}
            onNewPatient={handleNewCheckin}
          />
        )}

        {currentView === 'physician-summary' && currentPatient && (
          <PhysicianSummaryView
            patient={currentPatient}
            onBack={() => setCurrentView('patient-summary')}
            onOpenDashboard={() => setCurrentView('doctor-dashboard')}
          />
        )}

        {currentView === 'doctor-dashboard' && (
          <DoctorDashboardView
            patients={patientQueue}
            onUpdatePatient={handleUpdatePatient}
            onSelectPatient={(p) => setCurrentPatient(p)}
          />
        )}

        {currentView === 'audit' && (
          <LlamaAuditView currentPatient={currentPatient} />
        )}
      </main>

      {/* Emergency Triage Alert Modal */}
      {currentPatient && (
        <TriageAlertModal
          triage={currentPatient.triage}
          patient={currentPatient}
          isOpen={isTriageAlertOpen}
          onAcknowledge={() => setIsTriageAlertOpen(false)}
          onImmediateEscalation={() => {
            setIsTriageAlertOpen(false);
            setCurrentView('physician-summary');
          }}
        />
      )}

      {/* Quick Demo Scenario Drawer */}
      <ScenarioDrawer
        isOpen={isScenarioDrawerOpen}
        onClose={() => setIsScenarioDrawerOpen(false)}
        onSelectScenario={handleSelectScenario}
      />

      {/* API Key / System Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">MediKiosk v2.4</span>
            <span>•</span>
            <span>National Digital Health Mission (NDHM / ABDM) Compliant</span>
            <span>•</span>
            <span>Fast Healthcare Interoperability Resources (FHIR) Ready</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="hover:text-blue-600 underline cursor-pointer"
            >
              Gateway Status
            </button>
            <button
              onClick={() => setCurrentView('audit')}
              className="hover:text-blue-600 underline cursor-pointer"
            >
              Safety Guardrails
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
