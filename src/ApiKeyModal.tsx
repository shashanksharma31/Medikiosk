import React from 'react';
import { X, Key, ShieldCheck, CheckCircle } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Backend & ABDM Gateway</h3>
              <p className="text-xs text-slate-500">System Credentials & Integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              ABDM Sandbox Environment: Active
            </span>
            <p className="text-[11px] text-slate-500">
              Simulating National Health Authority (NHA) ABDM M1, M2, and M3 milestones with instant test OTP autofill and synthetic demographic matching.
            </p>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-1">
            <span className="font-bold text-blue-900 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              Gemini Clinical Inference API:
            </span>
            <p className="text-[11px] text-blue-800">
              Configured via server-side environment variables (`GEMINI_API_KEY`). Client requests are safely proxied with zero key leakage.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
