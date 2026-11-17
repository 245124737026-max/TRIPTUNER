import React, { useState } from 'react';
import { Calendar, Compass, Minus, Plus, Users, Wallet } from 'lucide-react';
import { DESTINATIONS, INTEREST_OPTIONS } from '../data/destinations';
import { ComfortTier, DestinationProfile, InterestCategory, TripConfig } from '../types/travel';

interface PlannerHeroProps {
  config: TripConfig;
  activeDestination: DestinationProfile;
  onChangeConfig: (next: TripConfig) => void;
  onGenerate: () => void;
  onOpenSaved: () => void;
  savedCount: number;
}

export const PlannerHero: React.FC<PlannerHeroProps> = ({
  config,
  activeDestination,
  onChangeConfig,
  onGenerate,
  onOpenSaved,
  savedCount,
}) => {
  const [imgError, setImgError] = useState(false);

  const toggleInterest = (interest: InterestCategory) => {
    const exists = config.interests.includes(interest);
    let nextInterests: InterestCategory[];
    if (exists) {
      if (config.interests.length === 1) return; // keep at least one active
      nextInterests = config.interests.filter((i) => i !== interest);
    } else {
      nextInterests = [...config.interests, interest];
    }
    onChangeConfig({ ...config, interests: nextInterests });
  };

  const handleSelectCurated = (destId: string) => {
    setImgError(false);
    onChangeConfig({
      ...config,
      destinationId: destId,
      customDestinationName: '',
    });
  };

  const handleCustomInput = (value: string) => {
    onChangeConfig({
      ...config,
      customDestinationName: value,
    });
  };

  const comfortOptions: { id: ComfortTier; label: string }[] = [
    { id: 'essential', label: 'Essential' },
    { id: 'comfort', label: 'Comfort' },
    { id: 'boutique', label: 'Boutique' },
  ];

  return (
    <section id="planner" className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Smart Trip Planner Configurator */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium text-sky-700 tracking-wide mb-2">
                Intelligent Travel Planner · Day-Wise Route & Budget Engine
              </p>
              <h1
                className="font-display font-bold tracking-tight text-slate-900 leading-[1.1] mb-3"
                style={{ fontSize: 'clamp(2.1rem, 3.6vw, 3.25rem)', textWrap: 'balance' }}
              >
                Tune every day of your trip around your pace and budget.
              </h1>
              <p className="text-slate-600 text-base leading-relaxed max-w-2xl mb-6">
                Pick a destination, set your travel window, travellers, and interests. TripTuner builds a timed itinerary with transit durations, meal pairings, live weather, and a four-part expense breakdown.
              </p>
            </div>

            {/* Configurator Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
              {/* Destination Selection */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label
                    htmlFor="destination-input"
                    className="text-sm font-semibold text-slate-900"
                  >
                    Destination
                  </label>
                  <button
                    type="button"
                    onClick={onOpenSaved}
                    className="md:hidden text-xs font-medium text-sky-700 hover:text-sky-800 cursor-pointer tabular-nums"
                  >
                    Saved Trips ({savedCount})
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {DESTINATIONS.map((dest) => {
                    const isSelected =
                      !config.customDestinationName && config.destinationId === dest.id;
                    return (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => handleSelectCurated(dest.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                        }`}
                      >
                        {dest.name}
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <Compass
                    className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="destination-input"
                    type="text"
                    value={config.customDestinationName ?? ''}
                    onChange={(e) => handleCustomInput(e.target.value)}
                    placeholder={`Selected: ${activeDestination.name}, ${activeDestination.country} — or type any city (e.g. Lisbon, Portugal)`}
                    className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
                  />
                </div>
              </div>

              {/* Dates, Duration, Travellers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="start-date"
                    className="block text-xs font-medium text-slate-600 mb-1.5"
                  >
                    Departure Date
                  </label>
                  <div className="relative">
                    <Calendar
                      className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="start-date"
                      type="date"
                      value={config.startDate}
                      onChange={(e) =>
                        onChangeConfig({ ...config, startDate: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-600 mb-1.5">
                    Duration (Days)
                  </span>
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-2 py-1.5">
                    <button
                      type="button"
                      aria-label="Decrease duration"
                      onClick={() =>
                        onChangeConfig({
                          ...config,
                          durationDays: Math.max(2, config.durationDays - 1),
                        })
                      }
                      className="w-7 h-7 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-semibold text-slate-900 tabular-nums">
                      {config.durationDays} {config.durationDays === 1 ? 'Day' : 'Days'}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase duration"
                      onClick={() =>
                        onChangeConfig({
                          ...config,
                          durationDays: Math.min(7, config.durationDays + 1),
                        })
                      }
                      className="w-7 h-7 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-600 mb-1.5">
                    Travellers
                  </span>
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-2 py-1.5">
                    <button
                      type="button"
                      aria-label="Decrease travellers"
                      onClick={() =>
                        onChangeConfig({
                          ...config,
                          travellers: Math.max(1, config.travellers - 1),
                        })
                      }
                      className="w-7 h-7 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 tabular-nums">
                      <Users className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      {config.travellers}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase travellers"
                      onClick={() =>
                        onChangeConfig({
                          ...config,
                          travellers: Math.min(10, config.travellers + 1),
                        })
                      }
                      className="w-7 h-7 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Target Budget & Comfort Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="budget-range"
                      className="text-xs font-medium text-slate-600 inline-flex items-center gap-1.5"
                    >
                      <Wallet className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      Target Trip Budget
                    </label>
                    <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                      ${config.budgetTarget.toLocaleString()}
                    </span>
                  </div>
                  <input
                    id="budget-range"
                    type="range"
                    min={600}
                    max={12000}
                    step={100}
                    value={config.budgetTarget}
                    onChange={(e) =>
                      onChangeConfig({ ...config, budgetTarget: Number(e.target.value) })
                    }
                    className="w-full accent-sky-700 cursor-pointer"
                  />
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-600 mb-1.5">
                    Travel Style
                  </span>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-white border border-slate-200 rounded-lg">
                    {comfortOptions.map((tier) => {
                      const active = config.comfortTier === tier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => onChangeConfig({ ...config, comfortTier: tier.id })}
                          className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap cursor-pointer ${
                            active
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {tier.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Interests Selector */}
              <div>
                <span className="block text-xs font-medium text-slate-600 mb-2">
                  Prioritized Interests
                </span>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((item) => {
                    const active = config.interests.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleInterest(item.id)}
                        aria-pressed={active}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                          active
                            ? 'bg-sky-50 text-sky-800 border-sky-300'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Action */}
              <div className="pt-1 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-slate-500">
                  Routes, transit times, and costs adjust automatically as you tune preferences.
                </span>
                <button
                  type="button"
                  onClick={onGenerate}
                  className="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
                >
                  Generate Itinerary
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Destination Photography Card (stretched to match height) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative flex-1 min-h-[340px] lg:min-h-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
              {!imgError ? (
                <img
                  src={activeDestination.image}
                  alt={`${activeDestination.name}, ${activeDestination.country}`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover lg:h-full transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-800 via-sky-900 to-slate-900 flex items-center justify-center p-6 text-center">
                  <span className="font-display text-2xl font-bold text-white">
                    {activeDestination.name}
                  </span>
                </div>
              )}

              {/* Measured contrast scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />

              <div className="absolute bottom-0 inset-x-0 p-6 text-white">
                <div className="flex items-center gap-2 text-xs text-slate-200 mb-1.5">
                  <span>{activeDestination.country}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeDestination.regionLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>Best: {activeDestination.bestSeason}</span>
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-white mb-1.5">
                  {activeDestination.name}
                </h2>
                <p className="text-sm text-slate-200 leading-relaxed line-clamp-3">
                  {activeDestination.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
