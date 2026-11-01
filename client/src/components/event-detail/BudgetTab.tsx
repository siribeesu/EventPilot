import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { EventFullDetail } from '../../types';

interface BudgetTabProps {
  event: EventFullDetail;
  currency: string;
  totalEstimated: number;
  totalActual: number;
  remainingBalance: number;
  onOpenAddBudgetModal: () => void;
  onDeleteBudgetItem: (itemId: string) => void;
}

export const BudgetTab: React.FC<BudgetTabProps> = ({
  event,
  currency,
  totalEstimated,
  totalActual,
  remainingBalance,
  onOpenAddBudgetModal,
  onDeleteBudgetItem,
}) => {
  return (
    <div
      role="tabpanel"
      id="panel-budget"
      aria-labelledby="tab-budget"
      className="space-y-6"
    >
      {/* Header Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Itemized Budget Manager</h2>
          <p className="text-xs text-slate-500">
            All allocations are calculated in backend application logic to maintain strict accuracy.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAddBudgetModal}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Expense Item</span>
        </button>
      </div>

      {/* Budget Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <caption className="sr-only">Itemized Budget Items Table</caption>
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th scope="col" className="py-3.5 px-4">Category</th>
                <th scope="col" className="py-3.5 px-4">Expense Item</th>
                <th scope="col" className="py-3.5 px-4 text-right">Estimated ({currency})</th>
                <th scope="col" className="py-3.5 px-4 text-right">Actual Cost</th>
                <th scope="col" className="py-3.5 px-4">Status</th>
                <th scope="col" className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {event.budget_items.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 px-2 py-0.5 rounded bg-slate-100 text-xs">
                      {b.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-900">{b.name}</div>
                    {b.notes && <div className="text-[11px] text-slate-400 mt-0.5">{b.notes}</div>}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {currency} {Number(b.estimated_cost).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-600">
                    {Number(b.actual_cost) > 0 ? `${currency} ${Number(b.actual_cost).toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteBudgetItem(b.id)}
                      aria-label={`Delete ${b.name}`}
                      className="p-1 rounded text-slate-400 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                      <span className="sr-only">Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/90 border-t border-slate-200 font-bold text-slate-900 text-xs sm:text-sm">
              <tr>
                <td className="py-3.5 px-4" colSpan={2}>
                  Total Calculated Spending ({event.budget_items.length} items)
                </td>
                <td className="py-3.5 px-4 text-right text-indigo-700">
                  {currency} {totalEstimated.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right">
                  {currency} {totalActual.toLocaleString()}
                </td>
                <td className="py-3.5 px-4" colSpan={2}>
                  <span className={remainingBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    Remaining: {currency} {remainingBalance.toLocaleString()}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
