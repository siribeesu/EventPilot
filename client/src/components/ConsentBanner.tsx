import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, Info } from 'lucide-react';

interface ConsentBannerProps {
  onOpenPrivacy: () => void;
}

export const ConsentBanner: React.FC<ConsentBannerProps> = ({ onOpenPrivacy }) => {
  const [accepted, setAccepted] = useState(true); // default true to avoid flash

  useEffect(() => {
    const hasConsent = localStorage.getItem('eventpilot_privacy_consent');
    if (!hasConsent) {
      setAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('eventpilot_privacy_consent', 'true');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div
      role="region"
      aria-label="Privacy & Data Protection Notice"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 p-4 bg-slate-900/95 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 flex-1">
          <h4 className="text-xs font-semibold text-white">Privacy & Zero-Retention Notice</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            EventPilot enforces strict data isolation: your event parameters and budgets are never used to train external AI models. Passwords are salted with PBKDF2.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleAccept}
              aria-label="Accept and continue with data protection terms"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition shadow-sm flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept & Continue</span>
            </button>
            <button
              onClick={onOpenPrivacy}
              aria-label="Review data protection rights and GDPR details"
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded-lg"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Review Rights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
