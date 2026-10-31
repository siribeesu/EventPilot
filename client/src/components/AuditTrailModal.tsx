import React, { useState, useEffect } from 'react';
import { Shield, Clock, CheckCircle2, X, RefreshCw, Loader2 } from 'lucide-react';

import { AuditLog } from '../types';

interface AuditTrailModalProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ eventId, isOpen, onClose }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/audit-trail`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.warn('Could not fetch audit trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, eventId]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 id="audit-title" className="text-lg font-semibold text-white">Event Security Audit Trail</h2>
              <p className="text-xs text-slate-400">Immutable forensic ledger of actions, actors & timestamps</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              title="Refresh audit trail"
              aria-label="Refresh audit trail"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300 mb-3">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Compliance Forensics: SOC2 & GDPR Article 30 Activity Logging</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">{logs.length} Logged Entries</span>
          </div>

          {loading && logs.length === 0 ? (
            <div className="py-12 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Querying forensic audit ledger...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 bg-slate-800/20 rounded-xl border border-slate-800/50">
              No audit trail events recorded yet for this session.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 max-h-80 overflow-y-auto pr-1 space-y-1">
              {logs.map((log: AuditLog) => (
                <div key={log.id} className="py-3 px-2 flex flex-col gap-1 text-xs hover:bg-slate-800/30 rounded-lg transition">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {log.action}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {log.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>Actor: <strong className="text-slate-300">{log.actor_email || log.actor_id}</strong></span>
                    {log.request_id && (
                      <span className="font-mono text-[10px] text-slate-500">
                        ReqID: {log.request_id.slice(0, 16)}...
                      </span>
                    )}
                  </div>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-1 p-1.5 bg-slate-950/60 rounded border border-slate-800/60 text-[10px] font-mono text-slate-400 truncate">
                      {JSON.stringify(log.metadata)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};
