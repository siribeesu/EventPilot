import React from 'react';
import { Sparkles, Check, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import type { EventFullDetail, TaskItem } from '../../types';

interface OverviewTabProps {
  event: EventFullDetail;
  currency: string;
  chartData: Array<{ name: string; amount: number }>;
  onToggleTaskStatus: (task: TaskItem) => void;
  onNavigateTimeline: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  event,
  currency,
  chartData,
  onToggleTaskStatus,
  onNavigateTimeline,
}) => {
  return (
    <div
      role="tabpanel"
      id="panel-overview"
      aria-labelledby="tab-overview"
      className="space-y-6"
    >
      {/* AI Executive Strategy Card */}
      {event.ai_summary && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600" aria-hidden="true">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">EventPilot AI Executive Strategy</h3>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
            {event.ai_summary}
          </p>
        </div>
      )}

      {/* Quick Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spending Breakdown Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Estimated Spending by Category</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${currency} ${Number(val || 0).toLocaleString()}`, 'Estimated']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Preparation Milestones Progress */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Key Priority Tasks</h3>
            <p className="text-xs text-slate-500 mt-0.5">Urgent and high-priority preparation milestones</p>

            <div className="space-y-2.5 mt-4">
              {event.tasks
                .filter((t) => t.priority === 'urgent' || t.priority === 'high')
                .slice(0, 4)
                .map((t) => (
                  <div
                    key={t.id}
                    role="checkbox"
                    aria-checked={t.status === 'completed'}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        onToggleTaskStatus(t);
                      }
                    }}
                    onClick={() => onToggleTaskStatus(t)}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      t.status === 'completed'
                        ? 'bg-slate-50 border-slate-200 opacity-60 line-through'
                        : 'bg-white border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div
                        aria-hidden="true"
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          t.status === 'completed' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {t.status === 'completed' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="font-medium text-slate-800">{t.title}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        t.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {event.metrics.tasksCompleted} of {event.metrics.tasksTotal} tasks completed
            </span>
            <button
              type="button"
              onClick={onNavigateTimeline}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded flex items-center space-x-1"
            >
              <span>View All Tasks</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
