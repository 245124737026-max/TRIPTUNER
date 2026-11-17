import React, { useState } from 'react';
import { ArrowUpRight, Compass } from 'lucide-react';
import { DESTINATIONS, INTEREST_OPTIONS } from '../data/destinations';
import { InterestCategory } from '../types/travel';

interface ExploreDestinationsProps {
  activeDestinationId: string;
  onSelectDestination: (destinationId: string) => void;
}

export const ExploreDestinations: React.FC<ExploreDestinationsProps> = ({
  activeDestinationId,
  onSelectDestination,
}) => {
  const [filter, setFilter] = useState<'all' | InterestCategory>('all');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const filteredDestinations =
    filter === 'all'
      ? DESTINATIONS
      : DESTINATIONS.filter((dest) => dest.highlights.includes(filter));

  return (
    <section id="explore" className="py-12 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
              Explore Destinations & Popular Attractions
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Browse curated regions with seasonal timing, signature landmarks, and nightly stay baselines. Select any destination to tune a custom itinerary.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Regions
            </button>
            {INTEREST_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFilter(opt.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  filter === opt.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((dest) => {
            const isCurrent = dest.id === activeDestinationId;
            const topAttractions = dest.attractions.slice(0, 3);

            return (
              <article
                key={dest.id}
                className={`group rounded-xl border overflow-hidden flex flex-col justify-between transition-colors ${
                  isCurrent
                    ? 'border-sky-600 bg-sky-50/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                    {!failedImages[dest.id] ? (
                      <img
                        src={dest.image}
                        alt={`${dest.name}, ${dest.country}`}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [dest.id]: true }))
                        }
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-sky-900 flex items-center justify-center">
                        <Compass className="w-8 h-8 text-slate-300" aria-hidden="true" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <div className="text-xs text-slate-200 mb-0.5">
                        {dest.country} · {dest.bestSeason}
                      </div>
                      <h3 className="font-display text-xl font-bold tracking-tight">
                        {dest.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {dest.description}
                    </p>

                    <div className="border-t border-slate-100 pt-3 space-y-1.5">
                      <div className="text-xs font-semibold text-slate-800">
                        Top Recommended Places
                      </div>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {topAttractions.map((attr) => (
                          <li key={attr.id} className="truncate">
                            · {attr.name} ({attr.district})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-600 font-mono tabular-nums">
                    Stay ~${dest.baseStayPerNight}/night
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectDestination(dest.id)}
                    className={`inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      isCurrent
                        ? 'bg-slate-900 text-white'
                        : 'bg-sky-700 hover:bg-sky-800 text-white'
                    }`}
                  >
                    {isCurrent ? 'Active in Planner' : 'Tune This Trip'}
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
