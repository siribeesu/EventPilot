import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Shield, X, Check, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { Collaborator } from '../types';

interface CollaboratorsModalProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  isOwner?: boolean;
}

export const CollaboratorsModal: React.FC<CollaboratorsModalProps> = ({
  eventId,
  isOpen,
  onClose,
  isOwner = true,
}) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCollaborators();
    }
  }, [isOpen, eventId]);

  const loadCollaborators = async () => {
    setLoading(true);
    try {
      const data = await api.getCollaborators(eventId);
      setCollaborators(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    setMessage(null);
    try {
      await api.addCollaborator(eventId, email, role, name);
      setMessage({ text: `Invited ${email} as ${role}!`, type: 'success' });
      setEmail('');
      setName('');
      loadCollaborators();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to add collaborator', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (collabId: string) => {
    try {
      await api.removeCollaborator(eventId, collabId);
      setCollaborators(prev => prev.filter(c => c.id !== collabId));
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to remove', type: 'error' });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="collab-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 id="collab-title" className="text-lg font-semibold text-white">Event Collaboration & Team</h2>
              <p className="text-xs text-slate-400">Role-based access control (RBAC) & team members</p>
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

        {message && (
          <div
            className={`mt-4 p-3 text-xs rounded-xl border flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {message.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <Shield className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {isOwner && (
          <form onSubmit={handleAdd} className="mt-5 space-y-3 p-4 bg-slate-800/40 border border-slate-800 rounded-xl">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-indigo-400" /> Invite Collaborator
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="email"
                required
                placeholder="colleague@domain.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <input
                type="text"
                placeholder="Name (Optional)"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400">Access Role:</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="editor">Editor (Can edit budget & tasks)</option>
                  <option value="viewer">Viewer (Read-only)</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                <span>Invite</span>
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 space-y-2.5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Collaborators ({collaborators.length})
          </h3>
          {loading ? (
            <div className="py-6 flex items-center justify-center text-slate-500 text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> Loading team...
            </div>
          ) : collaborators.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs bg-slate-800/20 rounded-xl border border-slate-800/50">
              No additional collaborators yet. Invite planners to manage budget & schedule together.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 max-h-48 overflow-y-auto pr-1">
              {collaborators.map(c => (
                <div key={c.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-medium text-white">{c.user_name || c.user_email}</p>
                    <p className="text-[11px] text-slate-400">{c.user_email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        c.role === 'editor'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : 'bg-slate-700/50 text-slate-300 border border-slate-600/30'
                      }`}
                    >
                      {c.role}
                    </span>
                    {isOwner && (
                      <button
                        onClick={() => handleRemove(c.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                        title="Remove collaborator"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
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
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
