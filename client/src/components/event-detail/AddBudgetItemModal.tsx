import React, { useState } from 'react';

interface AddBudgetItemModalProps {
  isOpen: boolean;
  currency: string;
  onClose: () => void;
  onSubmit: (item: {
    category: string;
    name: string;
    estimated_cost: number;
    notes?: string;
  }) => Promise<void>;
}

export const AddBudgetItemModal: React.FC<AddBudgetItemModalProps> = ({
  isOpen,
  currency,
  onClose,
  onSubmit,
}) => {
  const [category, setCategory] = useState('Venue');
  const [name, setName] = useState('');
  const [cost, setCost] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ category, name, estimated_cost: cost, notes });
      setName('');
      setCost(0);
      setNotes('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-add-budget-title"
      className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <h3 id="modal-add-budget-title" className="font-bold text-slate-900 text-lg">
          Add Expense Line Item
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="budget-item-category" className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              id="budget-item-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <option value="Venue">Venue</option>
              <option value="Catering">Catering</option>
              <option value="Decoration">Decoration</option>
              <option value="Photography">Photography</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Invitations">Invitations</option>
              <option value="Transport">Transport</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>

          <div>
            <label htmlFor="budget-item-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Item Name
            </label>
            <input
              id="budget-item-name"
              type="text"
              required
              placeholder="e.g. Wedding Cake, Floral Mandap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="budget-item-cost" className="block text-xs font-semibold text-slate-700 mb-1">
              Estimated Cost ({currency})
            </label>
            <input
              id="budget-item-cost"
              type="number"
              required
              min="0"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="budget-item-notes" className="block text-xs font-semibold text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <input
              id="budget-item-notes"
              type="text"
              placeholder="e.g. Includes delivery & setup"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
