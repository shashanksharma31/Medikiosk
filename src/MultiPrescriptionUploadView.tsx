import React from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Pill,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { ScannedDocument } from './types.ts';
import { checkInteractions } from './medicationKnowledge.ts';

interface MultiPrescriptionUploadViewProps {
  documents: ScannedDocument[];
  onAddNewScan: () => void;
  onRemoveDoc: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const MultiPrescriptionUploadView: React.FC<MultiPrescriptionUploadViewProps> = ({
  documents,
  onAddNewScan,
  onRemoveDoc,
  onContinue,
  onBack,
}) => {
  const allExtractedMeds = documents.flatMap((d) => d.medications?.map((m) => m.name) || []);
  const interactions = checkInteractions(allExtractedMeds);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Attached Medical Records & Slips
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Multi-Document Clinical Dossier ({documents.length})
            </h2>
            <p className="text-xs text-slate-500">
              Prescriptions, lab investigations, and discharge summaries for physician consultation.
            </p>
          </div>

          <button
            type="button"
            onClick={onAddNewScan}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Scan Another Document</span>
          </button>
        </div>

        {/* Interaction Warnings */}
        {interactions.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Drug Interaction Flagged Across Uploaded Prescriptions:
            </span>
            <ul className="text-xs text-amber-800 list-disc pl-5">
              {interactions.map((it, idx) => (
                <li key={idx}>{it}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Document Cards */}
        {documents.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="text-slate-600 text-sm font-semibold">
              No paper prescriptions or lab reports scanned yet.
            </div>
            <button
              type="button"
              onClick={onAddNewScan}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Open Scanner Camera
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs truncate max-w-44">
                        {doc.fileName}
                      </h4>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {doc.fileType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveDoc(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Remove document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Thumbnail */}
                <div className="h-32 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center">
                  <img
                    src={doc.dataUrl}
                    alt={doc.fileName}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Medications Found */}
                {doc.medications && doc.medications.length > 0 && (
                  <div className="text-[11px] text-slate-600 space-y-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Pill className="w-3.5 h-3.5 text-emerald-600" />
                      Extracted Drugs:
                    </span>
                    <ul className="space-y-0.5 pl-4 list-disc text-slate-700">
                      {doc.medications.slice(0, 3).map((m, i) => (
                        <li key={i}>{m.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            className="text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={onContinue}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Proceed to Intake Summary</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
