import React, { useEffect, useState } from 'react';
import { LogOut, CheckCircle2, Sun, Moon } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface HeaderProps {
  userEmail: string | undefined;
}

export const Header: React.FC<HeaderProps> = ({ userEmail }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id) {
        navigator.clipboard.writeText(data.user.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10 transition-colors">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="text-emerald-600 w-6 h-6" />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">TaskFlow</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={handleCopyId}
          className={`text-xs font-mono px-2 py-1 rounded transition-all ${
            copied 
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
          title="Click para copiar tu User ID"
        >
          {copied ? '¡Copiado!' : `ID: ${userEmail?.split('@')[0]}...`}
        </button>

        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <span className="text-sm text-zinc-500 dark:text-zinc-400 hidden sm:inline">{userEmail}</span>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Salir</span>
        </button>
      </div>
    </header>
  );
};
