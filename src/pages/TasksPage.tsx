import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Task, FilterStatus } from '../types';
import { Header } from '../components/Header';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { FilterBar } from '../components/FilterBar';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { User } from '@supabase/supabase-js';

export const TasksPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [emailConfirmed, setEmailConfirmed] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('is_completed', false);
      } else if (filter === 'completed') {
        query = query.eq('is_completed', true);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      // Check if email is confirmed
      // Note: Supabase user object has email_confirmed_at
      setEmailConfirmed(!!user?.email_confirmed_at);
    };
    checkUser();

    fetchTasks();

    // Realtime Subscription
    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks]);

  const [confirmationMessage, setConfirmationMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleResendConfirmation = async () => {
    if (!user?.email) return;
    setConfirmationMessage(null);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    });
    if (error) {
      setConfirmationMessage({ text: 'Error al reenviar: ' + error.message, type: 'error' });
    } else {
      setConfirmationMessage({ text: 'Correo de confirmación reenviado.', type: 'success' });
    }
    setTimeout(() => setConfirmationMessage(null), 5000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-12 transition-colors">
      <Header userEmail={user?.email} />

      <main className="max-w-3xl mx-auto px-6 mt-8 space-y-8">
        {confirmationMessage && (
          <div className={`p-4 rounded-2xl border text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300 ${
            confirmationMessage.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {confirmationMessage.text}
          </div>
        )}

        {!emailConfirmed && (
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-2xl flex items-start gap-4 shadow-sm">
            <AlertTriangle className="text-amber-600 dark:text-amber-500 w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">Email no confirmado</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                Por favor, confirma tu correo electrónico para poder crear o modificar tareas.
              </p>
              <button
                onClick={handleResendConfirmation}
                className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 underline underline-offset-4"
              >
                <RefreshCcw className="w-3 h-3" />
                Reenviar instrucciones
              </button>
            </div>
          </div>
        )}

        <section className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Nueva Tarea</h2>
          <TaskForm onTaskCreated={fetchTasks} disabled={!emailConfirmed} />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between ml-1">
            <h2 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Mis Tareas</h2>
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-md">
              {tasks.length}
            </span>
          </div>
          
          <FilterBar
            filter={filter}
            onFilterChange={setFilter}
            search={search}
            onSearchChange={setSearch}
          />

          <TaskList 
            tasks={tasks} 
            onUpdate={fetchTasks} 
            loading={loading} 
            disabled={!emailConfirmed}
          />
        </section>
      </main>
    </div>
  );
};
