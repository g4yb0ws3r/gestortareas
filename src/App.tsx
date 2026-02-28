import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { AuthPage } from './pages/AuthPage';
import { TasksPage } from './pages/TasksPage';
import { Session } from '@supabase/supabase-js';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-zinc-100 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-amber-600 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-4">Configuración Requerida</h2>
          <p className="text-zinc-600 mb-6">
            Para que la aplicación funcione, necesitas configurar las variables de entorno de Supabase en el panel de <strong>Secrets</strong>.
          </p>
          <div className="text-left bg-zinc-50 p-4 rounded-xl font-mono text-xs text-zinc-500 space-y-2">
            <p>VITE_SUPABASE_URL</p>
            <p>VITE_SUPABASE_ANON_KEY</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="antialiased text-zinc-900">
      {!session ? <AuthPage /> : <TasksPage />}
    </div>
  );
}
