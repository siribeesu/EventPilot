import React from 'react';
import type { EventFullDetail } from '../../types';

interface IdeasTabProps {
  event: EventFullDetail;
  currency: string;
}

export const IdeasTab: React.FC<IdeasTabProps> = ({ event, currency }) => {
  return (
    <div
      role="tabpanel"
      id="panel-ideas"
      aria-labelledby="tab-ideas"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Personalized Themes, Menus & Activities</h2>
          <p className="text-xs text-slate-500">
            Curated AI concepts tailored to your culture ({event.cultural_preference || 'Standard'}), dietary preferences, and venue scale.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {event.ideas.map((idea) => (
          <div
            key={idea.id}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  idea.type === 'theme'
                    ? 'bg-pink-50 text-pink-700'
                    : idea.type === 'menu'
                    ? 'bg-purple-50 text-purple-700'
                    : idea.type === 'decoration'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {idea.type}
              </span>
              {idea.estimated_cost > 0 && (
                <span className="text-xs font-semibold text-slate-600">
                  Est: {currency} {Number(idea.estimated_cost).toLocaleString()}
                </span>
              )}
            </div>

            <h3 className="font-bold text-slate-900 text-base">{idea.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{idea.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
