import React from 'react';
import { Task } from '../types';
import { TaskItem } from './TaskItem';
import { motion, AnimatePresence } from 'motion/react';

interface TaskListProps {
  tasks: Task[];
  onUpdate: () => void;
  loading: boolean;
  disabled?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onUpdate, loading, disabled }) => {
  if (loading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-zinc-500 font-medium">Cargando tareas...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 transition-colors">
        <p className="text-zinc-400 dark:text-zinc-500 font-medium">No se encontraron tareas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <TaskItem 
            key={task.id} 
            task={task} 
            onUpdate={onUpdate} 
            disabled={disabled}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
