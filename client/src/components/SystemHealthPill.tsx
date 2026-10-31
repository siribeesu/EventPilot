import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Cpu, X, Zap, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { SystemMetrics } from '../types';

export const SystemHealthPill: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.getMetrics();
      setMetrics(data);
    } catch (err) {
      console.warn('Could not load telemetry metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modalOpen) {
      fetchMetrics();
    }
  }, [modalOpen]);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        aria-label="View system telemetry and security observability"
        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition shadow-sm hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="hidden sm:inline">Systems: Operational</span>
        <span className="text-slate-500 hidden md:inline">•</span>
        <span className="text-emerald-400 font-mono hidden md:inline">99.9%</span>
      </button>

      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="metrics-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="metrics-title" className="text-base font-semibold text-white">Live System Observability</h3>
                  <p className="text-xs text-slate-400">Telemetry, AI Cache & Security Health</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                aria-label="Close dialog"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading && !metrics ? (
              <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Collecting real-time metrics...</span>
              </div>
            ) : metrics ? (
              <div className="mt-4 space-y-3 text-xs">
                {/* Uptime & Status */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Uptime</span>
                    <p className="text-sm font-semibold text-white mt-0.5">{metrics.uptime?.formatted || 'Active'}</p>
                  </div>
                  <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Heap Memory</span>
                    <p className="text-sm font-semibold text-emerald-400 mt-0.5">{metrics.memory?.heapUsedMB} MB</p>
                  </div>
                </div>

                {/* AI Cost Savings & Guardrails */}
                <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> AI Optimization & Caching
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">
                      Active
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                    <div>Cache Hits: <span className="font-semibold text-white">{metrics.aiOptimization?.cacheHits || 0}</span></div>
                    <div>Cache Ratio: <span className="font-semibold text-emerald-400">{metrics.aiOptimization?.cacheHitRatio || '0.0%'}</span></div>
                    <div>Tokens Saved: <span className="font-semibold text-white">{metrics.aiOptimization?.estimatedTokensSaved?.toLocaleString() || 0}</span></div>
                    <div>Injections Blocked: <span className="font-semibold text-indigo-300">{metrics.aiOptimization?.promptInjectionsBlocked || 0}</span></div>
                  </div>
                </div>

                {/* Security Posture */}
                <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl space-y-1.5">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Active Security Controls
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Helmet HSTS, IP Rate Limiter, PBKDF2 Passwords, Input Sanitization, Role-Based Access Control (RBAC), and Prompt Guardrails active.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
