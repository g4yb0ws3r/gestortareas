import React, { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { FilterStatus } from '../types';

interface FilterBarProps {
  filter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filter, onFilterChange, search, onSearchChange }) => {
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Buscar tareas..."
          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        />
      </div>

      <div className="flex items-center gap-2 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-xl w-full sm:w-auto">
        {(['all', 'pending', 'completed'] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => onFilterChange(status)}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
              filter === status
                ? 'bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {status === 'all' ? 'Todas' : status === 'pending' ? 'Pendientes' : 'Completadas'}
          </button>
        ))}
      </div>
    </div>
  );
};
