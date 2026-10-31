import { logger } from '../utils/logger';
import React, { useState } from 'react';
import { ShieldCheck, Download, Lock, X, Check, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface PrivacyDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyDataModal: React.FC<PrivacyDataModalProps> = ({ isOpen, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [exported, setExported] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setDownloading(true);
    try {
      await api.exportUserData();
      setExported(true);
      setTimeout(() => setExported(false), 4000);
    } catch (err) {
      logger.error('Export failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="privacy-title" className="text-lg font-semibold text-white">Data Privacy & GDPR Portability</h2>
              <p className="text-xs text-slate-400">Security posture, data ownership & rights</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-indigo-400" /> Enterprise Privacy Guarantees
            </h3>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Zero AI Retention:</strong> Your event notes & budgets are never used to train external LLM models.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Cryptographic Storage:</strong> Passwords protected with PBKDF2 SHA-512 (10,000 salt iterations).</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>In-Transit Security:</strong> Strict-Transport-Security (HSTS 1-year) with full TLS 1.3 headers.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>RBAC Isolation:</strong> Every budget and vendor item is scoped strictly to authorized collaborators.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-white">GDPR Article 15 Data Export</h4>
                <p className="text-[11px] text-slate-400">Download all your events, budgets, tasks, and audit logs as a portable JSON package.</p>
              </div>
            </div>
            <button
              onClick={handleExport}
              disabled={downloading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Package...</span>
                </>
              ) : exported ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Data Archive Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Personal Data Package (.json)</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
