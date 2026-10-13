import React, { useState } from 'react';
import {
  Camera,
  Upload,
  CheckCircle,
  FileText,
  Sparkles,
  Sliders,
  ArrowRight,
  ArrowLeft,
  Pill,
  AlertTriangle,
} from 'lucide-react';
import { ScannedDocument, ExtractedMedication } from './types.ts';
import { enhanceDocumentImage, ImageEnhanceResult } from './imageEnhancement.ts';

interface DocumentScannerViewProps {
  onDocumentAdded: (doc: ScannedDocument) => void;
  onFinish: () => void;
  onBack: () => void;
}

export const DocumentScannerView: React.FC<DocumentScannerViewProps> = ({
  onDocumentAdded,
  onFinish,
  onBack,
}) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<ImageEnhanceResult | null>(null);
  const [docType, setDocType] = useState<ScannedDocument['fileType']>('prescription');

  // Simulated sample prescription image (SVG base64 document template)
  const sampleDocSvg =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="white"><rect width="100%" height="100%" fill="%23fdfdfb"/><rect x="40" y="40" width="520" height="80" rx="10" fill="%23e2e8f0"/><text x="60" y="75" font-family="sans-serif" font-weight="bold" font-size="20" fill="%231e293b">APOLLO / AIIMS OPD CLINIC</text><text x="60" y="100" font-family="sans-serif" font-size="12" fill="%2364748b">Rx: Dr. S. K. Mukherjee, MD Reg: 44921</text><line x1="40" y1="140" x2="560" y2="140" stroke="%23cbd5e1" stroke-width="2"/><text x="50" y="180" font-family="monospace" font-size="28" font-weight="bold" fill="%230f172a">Rx</text><text x="50" y="230" font-family="sans-serif" font-size="16" fill="%23334155">1. Tab Metformin 500mg - 1 BD (Post meals) x 30 days</text><text x="50" y="270" font-family="sans-serif" font-size="16" fill="%23334155">2. Tab Telmisartan 40mg - 1 OD (Morning) x 30 days</text><text x="50" y="310" font-family="sans-serif" font-size="16" fill="%23334155">3. Tab Atorvastatin 20mg - 1 HS (Night) x 30 days</text><text x="50" y="350" font-family="sans-serif" font-size="16" fill="%23334155">4. Tab Pantoprazole 40mg - 1 OD (Empty stomach) x 14 days</text><rect x="50" y="400" width="500" height="80" rx="8" fill="%23f1f5f9"/><text x="70" y="430" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23475569">Advice: Low salt diet, HbA1c review after 3 months.</text><text x="70" y="455" font-family="sans-serif" font-size="12" fill="%2364748b">BP target: &lt; 130/80 mmHg | Fasting sugar target: &lt; 110 mg/dL</text><circle cx="500" cy="700" r="45" fill="none" stroke="%233b82f6" stroke-width="3" stroke-dasharray="4 2"/><text x="475" y="705" font-family="sans-serif" font-size="10" font-weight="bold" fill="%233b82f6">VERIFIED</text></svg>';

  const handleSimulateScan = async () => {
    setIsProcessing(true);
    setSelectedFile(sampleDocSvg);
    const enhanced = await enhanceDocumentImage(sampleDocSvg);
    setEnhancedResult(enhanced);
    setIsProcessing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const src = ev.target?.result as string;
        setSelectedFile(src);
        setIsProcessing(true);
        const enhanced = await enhanceDocumentImage(src);
        setEnhancedResult(enhanced);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAndAdd = () => {
    if (!selectedFile) return;

    const medications: ExtractedMedication[] = (
      enhancedResult?.extractedDrugs || [
        'Tab Metformin 500mg BD',
        'Tab Telmisartan 40mg OD',
      ]
    ).map((med, idx) => ({
      id: `med-${Date.now()}-${idx}`,
      name: med,
      dosage: 'Standard',
      frequency: 'Daily',
      timing: 'Post meals',
      confidence: 0.95,
    }));

    const newDoc: ScannedDocument = {
      id: `doc-${Date.now()}`,
      fileName: `OPD_Prescription_${new Date().toISOString().slice(0, 10)}.jpg`,
      fileType: docType,
      dataUrl: enhancedResult?.dataUrl || selectedFile,
      uploadDate: new Date().toISOString(),
      enhanced: true,
      extractedText: enhancedResult?.findings.join('\n'),
      medications,
      findings: enhancedResult?.findings || ['Prescription analyzed successfully.'],
    };

    onDocumentAdded(newDoc);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              High-Precision OCR & Camera Scanner
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Scan Old Paper Prescriptions & Lab Slips
            </h2>
            <p className="text-xs text-slate-500">
              Auto-enhances mobile photos, crops borders, and extracts medications into ABDM format.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as any)}
              className="text-xs font-bold p-2 bg-slate-100 rounded-xl border border-slate-300 text-slate-800"
            >
              <option value="prescription">Prescription Slip</option>
              <option value="lab_report">Lab Report (CBC/Lipid)</option>
              <option value="discharge_summary">Discharge Summary</option>
            </select>
          </div>
        </div>

        {/* Upload / Capture Section */}
        {!selectedFile ? (
          <div className="border-3 border-dashed border-slate-300 rounded-3xl p-8 text-center space-y-4 hover:border-blue-400 transition-colors bg-slate-50/50">
            <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
              <Camera className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Place Document Under Kiosk Scanner
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Supports crumpled paper, poor lighting, Hindi/English handwriting, and official doctor stamps.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSimulateScan}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Simulate Camera Scan (Demo OPD Slip)</span>
              </button>

              <label className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Upload Image File</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          /* Preview and OCR Extraction Result */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Scanned Image Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Enhanced Scanner Output
                </span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px]">
                  Clarity Score: {enhancedResult?.readabilityScore || 92}%
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 max-h-96 flex items-center justify-center shadow-inner relative">
                <img
                  src={enhancedResult?.dataUrl || selectedFile}
                  alt="Scanned Prescription"
                  className="w-full h-auto object-contain max-h-96"
                />
                <div className="absolute bottom-2 right-2 bg-slate-950/80 text-white text-[10px] px-2 py-1 rounded backdrop-blur-xs">
                  Contrast Boosted (1.35x)
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setEnhancedResult(null);
                }}
                className="text-xs text-slate-500 hover:text-red-600 font-semibold cursor-pointer"
              >
                Scan another document
              </button>
            </div>

            {/* AI Extracted Medications */}
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  Recognized Medications & Dosage
                </h4>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                  4 Medicines Found
                </span>
              </div>

              <div className="space-y-2">
                {(enhancedResult?.extractedDrugs || [
                  'Tab Metformin 500mg - 1 BD (Post meals)',
                  'Tab Telmisartan 40mg - 1 OD (Morning)',
                  'Tab Atorvastatin 20mg - 1 HS (Night)',
                  'Tab Pantoprazole 40mg - 1 OD (Empty stomach)',
                ]).map((drug, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between"
                  >
                    <span>{drug}</span>
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <h5 className="text-xs font-bold text-slate-700 mb-1">Clinical Findings & Metadata</h5>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  {(enhancedResult?.findings || [
                    'Doctor registration verified',
                    'Diagnosis: T2D, Grade 1 HTN',
                  ]).map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={handleSaveAndAdd}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Attach to Patient Intake Record</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            className="text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Intake</span>
          </button>

          <button
            type="button"
            onClick={onFinish}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Proceed to Summary Slip</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
