import React from 'react';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
  onOpenSaved: () => void;
  onSaveCurrentTrip: () => void;
  onLogout: () => void;
  savedCount: number;
  justSaved: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onOpenSaved,
  onSaveCurrentTrip,
  onLogout,
  savedCount,
  justSaved,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#planner"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('planner');
          }}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded-sm"
        >
          TripTuner
        </a>

        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => onNavigate('planner')}
            className="hover:text-slate-900 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer py-1 border-b border-transparent hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            Planner
          </button>
          <button
            type="button"
            onClick={() => onNavigate('itinerary')}
            className="hover:text-slate-900 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer py-1 border-b border-transparent hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            Itinerary
          </button>
          <button
            type="button"
            onClick={() => onNavigate('explore')}
            className="hover:text-slate-900 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer py-1 border-b border-transparent hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            Explore
          </button>
          <button
            type="button"
            onClick={onOpenSaved}
            className="hover:text-slate-900 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer py-1 border-b border-transparent hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 tabular-nums"
          >
            Saved Trips ({savedCount})
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="hover:text-slate-900 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer py-1 border-b border-transparent hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            Sign Out
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onSaveCurrentTrip}
            className="px-4 py-2 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
          >
            {justSaved ? 'Trip Saved' : 'Save My Trip'}
          </button>
        </div>
      </div>
    </header>
  );
};
