import React, { useState } from 'react';
import type { TaskPriority } from '../../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    category: string;
    priority: TaskPriority;
    due_date?: string;
  }) => Promise<void>;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ title, category, priority, due_date: dueDate || undefined });
      setTitle('');
      setCategory('General');
      setPriority('medium');
      setDueDate('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-add-task-title"
      className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <h3 id="modal-add-task-title" className="font-bold text-slate-900 text-lg">
          Add Preparation Task
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="task-title-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Task Title
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              placeholder="e.g. Taste test dessert samples"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="task-category-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <input
                id="task-category-input"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="task-priority-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                id="task-priority-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="task-duedate-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Due Date
            </label>
            <input
              id="task-duedate-input"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
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
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
