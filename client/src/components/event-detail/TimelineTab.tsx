import React from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';
import type { EventFullDetail, TaskItem } from '../../types';

interface TimelineTabProps {
  event: EventFullDetail;
  onOpenAddTaskModal: () => void;
  onToggleTaskStatus: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  event,
  onOpenAddTaskModal,
  onToggleTaskStatus,
  onDeleteTask,
}) => {
  return (
    <div
      role="tabpanel"
      id="panel-timeline"
      aria-labelledby="tab-timeline"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Timeline Milestones & Task Manager</h2>
          <p className="text-xs text-slate-500">
            Chronologically ordered based on your event date ({event.event_date}).
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAddTaskModal}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Task</span>
        </button>
      </div>

      <div className="space-y-3">
        {event.tasks.map((task) => {
          const isDone = task.status === 'completed';
          return (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                isDone
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : task.priority === 'urgent'
                  ? 'bg-red-50/30 border-red-200 shadow-2xs'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isDone}
                  aria-label={`Mark task ${task.title} as ${isDone ? 'incomplete' : 'complete'}`}
                  onClick={() => onToggleTaskStatus(task)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 hover:border-indigo-500'
                  }`}
                >
                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />}
                </button>

                <div>
                  <div className={`font-semibold text-sm ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {task.title}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                    <span className="font-medium text-slate-600">{task.category}</span>
                    <span aria-hidden="true">•</span>
                    <span>
                      {task.due_date
                        ? `Due: ${task.due_date}`
                        : task.days_before_event !== undefined
                        ? `T-${task.days_before_event} Days`
                        : 'Pending Schedule'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    task.priority === 'urgent'
                      ? 'bg-red-100 text-red-700'
                      : task.priority === 'high'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {task.priority}
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  aria-label={`Delete task ${task.title}`}
                  className="p-1 rounded text-slate-400 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  <span className="sr-only">Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
