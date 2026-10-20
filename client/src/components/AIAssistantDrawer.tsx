import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  PlusCircle,
  MessageSquare,
} from 'lucide-react';
import { EventFullDetail, AIAssistantAction } from '../types';
import { api } from '../services/api';

interface AIAssistantDrawerProps {
  event: EventFullDetail;
  isOpen: boolean;
  onClose: () => void;
  onPlanUpdated: (updatedEvent: EventFullDetail) => void;
  onTriggerBudgetRescue: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  action?: AIAssistantAction;
  changesApplied?: boolean;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  event,
  isOpen,
  onClose,
  onPlanUpdated,
  onTriggerBudgetRescue,
}) => {
  const currency = event.currency || 'INR';

  const defaultMessages: Message[] = [
    {
      id: 'm-init',
      sender: 'assistant',
      text: `Hello! I'm your Planora AI Copilot. I'm actively monitoring your event plan for "${event.title}" (${currency} ${Number(event.budget).toLocaleString()}). How can I help you adjust your budget, menu, timeline, or vendors today?`,
    },
  ];

  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [applyingChangeId, setApplyingChangeId] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    `Reduce my budget to ${currency === 'INR' ? '₹' : currency}35,000`,
    'Make the wedding more traditional',
    'Suggest a vegetarian menu for 100 guests',
    'The event is in 7 days. What should I prioritize?',
    'Replace expensive decor with affordable alternatives',
  ];

  const handleSendMessage = async (msgToSend?: string) => {
    const text = msgToSend || inputText.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
    };

    setMessages(prev => [...prev, userMsg]);
    if (!msgToSend) setInputText('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.sender,
        content: m.text,
      }));

      const action = await api.sendAssistantMessage(event.id, text, history);

      const assistantMsg: Message = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: action.reply,
        action,
        changesApplied: false,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ Error processing request: ${(err as Error).message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyChanges = async (msgId: string, action: AIAssistantAction) => {
    setApplyingChangeId(msgId);
    try {
      const res = await api.applyAssistantChanges(
        event.id,
        action.proposedChanges,
        'Applied suggestions from Planora AI Assistant conversation'
      );
      onPlanUpdated(res.event);

      setMessages(prev =>
        prev.map(m => (m.id === msgId ? { ...m, changesApplied: true } : m))
      );
    } catch (err) {
      alert(`Failed to apply changes: ${(err as Error).message}`);
    } finally {
      setApplyingChangeId(null);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl border-l border-slate-200 flex flex-col transition-all">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
            <Bot className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight flex items-center space-x-1.5">
              <span>Planora AI Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-xs text-indigo-100/90">Contextual Co-Planner</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="bg-indigo-50/70 border-b border-indigo-100 p-3 overflow-x-auto">
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1.5">
          Suggested Prompts:
        </span>
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs font-medium whitespace-nowrap bg-white border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-full hover:bg-indigo-600 hover:text-white transition shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-slate-800 text-white'
                    : 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] space-y-2`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-slate-100 text-slate-800 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  {m.text}
                </div>

                {/* Clarifying Questions */}
                {m.action?.clarifyingQuestions && m.action.clarifyingQuestions.length > 0 && (
                  <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-800">
                    <span className="font-bold flex items-center space-x-1 text-amber-900">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Clarification Needed:</span>
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-amber-800/90">
                      {m.action.clarifyingQuestions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Proposed Changes Preview Box */}
                {m.action?.proposedChanges && (
                  <div className="p-3.5 bg-white border border-indigo-200 rounded-xl shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900 flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Proposed Plan Modifications</span>
                      </span>
                      {m.changesApplied ? (
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Changes Applied</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-amber-600">Pending Approval</span>
                      )}
                    </div>

                    {/* Budget Adjustments */}
                    {m.action.proposedChanges.budgetAdjustments && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-600 uppercase">Budget Adjustments:</span>
                        {m.action.proposedChanges.budgetAdjustments.map((adj, i) => (
                          <div key={i} className="text-xs bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-700">
                            <span className="font-semibold text-slate-900">{adj.name}: </span>
                            {adj.newCost !== undefined && (
                              <span className="font-bold text-indigo-700">
                                {currency} {adj.newCost.toLocaleString()}
                              </span>
                            )}
                            <p className="text-[11px] text-slate-500 mt-0.5">{adj.reason}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tasks to add */}
                    {m.action.proposedChanges.tasksToAdd && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-600 uppercase">New Tasks:</span>
                        {m.action.proposedChanges.tasksToAdd.map((t, i) => (
                          <div key={i} className="text-xs bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-700 flex items-center justify-between">
                            <span>{t.title}</span>
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                              {t.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Ideas to add */}
                    {m.action.proposedChanges.ideasToAdd && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-600 uppercase">New Creative Concepts:</span>
                        {m.action.proposedChanges.ideasToAdd.map((idea, i) => (
                          <div key={i} className="text-xs bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-700">
                            <span className="font-semibold text-slate-900">{idea.title}</span>
                            <p className="text-[11px] text-slate-600 mt-0.5">{idea.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action button */}
                    {!m.changesApplied ? (
                      <button
                        type="button"
                        onClick={() => handleApplyChanges(m.id, m.action!)}
                        disabled={applyingChangeId === m.id}
                        className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.99] transition flex items-center justify-center space-x-1.5 shadow-2xs"
                      >
                        {applyingChangeId === m.id ? (
                          <span>Applying to your Plan...</span>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve & Apply Changes</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="p-2 bg-emerald-50 text-emerald-800 text-xs rounded-lg text-center font-medium">
                        ✓ All proposed updates have been merged into your active plan.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-2 text-slate-500 text-xs italic p-2 bg-slate-50 rounded-xl w-fit">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
            <span>Planora AI is analyzing your event and calculating adjustments...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AI to modify budget, suggest menus, add tasks..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
