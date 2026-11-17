import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { BudgetPanel } from './components/BudgetPanel';
import { ExploreDestinations } from './components/ExploreDestinations';
import { InteractiveMap } from './components/InteractiveMap';
import { ItinerarySection } from './components/ItinerarySection';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { PlannerHero } from './components/PlannerHero';
import { SavedTripsDrawer } from './components/SavedTripsDrawer';
import { WeatherPreview } from './components/WeatherPreview';
import { ComfortTier, ItineraryStop, TripConfig, TripPlan } from './types/travel';
import {
  generateTripPlan,
  linkDayTransitions,
  recalculateBudget,
  resolveDestination,
} from './utils/itineraryEngine';

const STORAGE_KEY = 'triptuner_saved_trips_v1';
const AUTH_STORAGE_KEY = 'triptuner_auth_user_v1';

function loadInitialAuthUser(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw && raw.trim().length > 0 ? raw : null;
  } catch {
    return null;
  }
}

const DEFAULT_CONFIG: TripConfig = {
  destinationId: 'kyoto',
  customDestinationName: '',
  startDate: '2026-11-24',
  durationDays: 4,
  travellers: 2,
  budgetTarget: 3600,
  comfortTier: 'comfort',
  interests: ['sightseeing', 'food', 'nature'],
};

function loadInitialSavedTrips(): TripPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore storage read errors
  }

  // Seed one realistic saved sample trip on first visit
  const sampleTrip = generateTripPlan({
    destinationId: 'amalfi',
    customDestinationName: '',
    startDate: '2026-06-12',
    durationDays: 3,
    travellers: 2,
    budgetTarget: 3400,
    comfortTier: 'comfort',
    interests: ['beaches', 'food', 'sightseeing'],
  });
  sampleTrip.id = 'sample-amalfi-trip';
  sampleTrip.title = 'Amalfi Coast Summer Weekend';
  return [sampleTrip];
}

export default function App() {
  const [authUser, setAuthUser] = useState<string | null>(() => loadInitialAuthUser());
  const [config, setConfig] = useState<TripConfig>(DEFAULT_CONFIG);
  const [tripPlan, setTripPlan] = useState<TripPlan>(() => generateTripPlan(DEFAULT_CONFIG));
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [focusedStopId, setFocusedStopId] = useState<string | null>(null);
  const [savedTrips, setSavedTrips] = useState<TripPlan[]>(() => loadInitialSavedTrips());
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const previewDestination = useMemo(() => resolveDestination(config), [config]);

  const handleLogin = (username: string) => {
    setAuthUser(username);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, username);
    } catch {
      // Ignore storage errors
    }
  };

  const handleLogout = () => {
    setAuthUser(null);
    setIsSavedOpen(false);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTrips));
    } catch {
      // Ignore storage write errors
    }
  }, [savedTrips]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGenerate = () => {
    const nextPlan = generateTripPlan(config);
    setTripPlan(nextPlan);
    setSelectedDay('all');
    setFocusedStopId(nextPlan.days[0]?.stops[0]?.id ?? null);
    scrollToSection('itinerary');
  };

  const handleSelectExploreDestination = (destinationId: string) => {
    const nextConfig: TripConfig = {
      ...config,
      destinationId,
      customDestinationName: '',
    };
    setConfig(nextConfig);
    const nextPlan = generateTripPlan(nextConfig);
    setTripPlan(nextPlan);
    setSelectedDay('all');
    setFocusedStopId(nextPlan.days[0]?.stops[0]?.id ?? null);
    scrollToSection('itinerary');
  };

  const handleChangeComfortTier = (tier: ComfortTier) => {
    const nextConfig: TripConfig = { ...tripPlan.config, comfortTier: tier };
    setConfig(nextConfig);
    const nextPlan = generateTripPlan(nextConfig);
    setTripPlan(nextPlan);
  };

  const applyDaysUpdate = (nextDays: TripPlan['days']) => {
    const nextBudget = recalculateBudget(nextDays, tripPlan.destination, tripPlan.config);
    setTripPlan({
      ...tripPlan,
      days: nextDays,
      budget: nextBudget,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleUpdateStop = (dayNumber: number, updatedStop: ItineraryStop) => {
    const nextDays = tripPlan.days.map((day) => {
      if (day.dayNumber !== dayNumber) return day;
      const updatedStops = day.stops.map((s) => (s.id === updatedStop.id ? updatedStop : s));
      return {
        ...day,
        stops: linkDayTransitions(updatedStops, tripPlan.destination.mapStyle),
      };
    });
    applyDaysUpdate(nextDays);
  };

  const handleDeleteStop = (dayNumber: number, stopId: string) => {
    const nextDays = tripPlan.days.map((day) => {
      if (day.dayNumber !== dayNumber) return day;
      const filtered = day.stops.filter((s) => s.id !== stopId);
      return {
        ...day,
        stops: linkDayTransitions(filtered, tripPlan.destination.mapStyle),
      };
    });
    if (focusedStopId === stopId) setFocusedStopId(null);
    applyDaysUpdate(nextDays);
  };

  const handleMoveStop = (
    dayNumber: number,
    stopId: string,
    direction: 'up' | 'down'
  ) => {
    const nextDays = tripPlan.days.map((day) => {
      if (day.dayNumber !== dayNumber) return day;
      const index = day.stops.findIndex((s) => s.id === stopId);
      if (index === -1) return day;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= day.stops.length) return day;

      const reordered = [...day.stops];
      const [moved] = reordered.splice(index, 1);
      reordered.splice(targetIndex, 0, moved);

      return {
        ...day,
        stops: linkDayTransitions(reordered, tripPlan.destination.mapStyle),
      };
    });
    applyDaysUpdate(nextDays);
  };

  const handleAddStop = (
    dayNumber: number,
    newStopData: Omit<
      ItineraryStop,
      'id' | 'transitToNextMinutes' | 'transitToNextDistanceKm' | 'transitMode'
    >
  ) => {
    const createdId = `custom-${Date.now()}`;
    const nextDays = tripPlan.days.map((day) => {
      if (day.dayNumber !== dayNumber) return day;
      const added: ItineraryStop = {
        ...newStopData,
        id: createdId,
        transitToNextMinutes: null,
        transitToNextDistanceKm: null,
        transitMode: 'Walk',
      };
      const nextStops = [...day.stops, added].sort((a, b) => a.time.localeCompare(b.time));
      return {
        ...day,
        stops: linkDayTransitions(nextStops, tripPlan.destination.mapStyle),
      };
    });
    setFocusedStopId(createdId);
    applyDaysUpdate(nextDays);
  };

  const handleFocusStopOnMap = (stopId: string, dayNumber: number) => {
    setSelectedDay(dayNumber);
    setFocusedStopId(stopId);
    scrollToSection('map-weather');
  };

  const handleSaveTrip = (customTitle?: string) => {
    const titleToSave = customTitle || tripPlan.title;
    const savedSnapshot: TripPlan = {
      ...tripPlan,
      id: `saved-${Date.now()}`,
      title: titleToSave,
      updatedAt: new Date().toISOString(),
    };
    setSavedTrips((prev) => [savedSnapshot, ...prev]);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2200);
  };

  const handleLoadTrip = (trip: TripPlan) => {
    setConfig(trip.config);
    setTripPlan(trip);
    setSelectedDay('all');
    setFocusedStopId(trip.days[0]?.stops[0]?.id ?? null);
    scrollToSection('itinerary');
  };

  const handleDuplicateTrip = (trip: TripPlan) => {
    const copy: TripPlan = {
      ...trip,
      id: `saved-${Date.now()}`,
      title: `${trip.title} (Copy)`,
      updatedAt: new Date().toISOString(),
    };
    setSavedTrips((prev) => [copy, ...prev]);
  };

  const handleDeleteSavedTrip = (tripId: string) => {
    setSavedTrips((prev) => prev.filter((t) => t.id !== tripId));
  };

  if (!authUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        onNavigate={scrollToSection}
        onOpenSaved={() => setIsSavedOpen(true)}
        onSaveCurrentTrip={() => {
          handleSaveTrip();
          setIsSavedOpen(true);
        }}
        onLogout={handleLogout}
        savedCount={savedTrips.length}
        justSaved={justSaved}
      />

      <main className="flex-1">
        <PlannerHero
          config={config}
          activeDestination={previewDestination}
          onChangeConfig={setConfig}
          onGenerate={handleGenerate}
          onOpenSaved={() => setIsSavedOpen(true)}
          savedCount={savedTrips.length}
        />

        {/* Active Trip Workspace: Weather, Map, Budget & Day-Wise Itinerary */}
        <motion.div
          key={tripPlan.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10"
        >
          {/* Trip Summary Header Strip */}
          <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="text-xs font-medium text-slate-500 mb-1 tabular-nums">
                Active Itinerary · {tripPlan.destination.country} · Departs{' '}
                {tripPlan.config.startDate} · {tripPlan.config.durationDays} Days ·{' '}
                {tripPlan.config.travellers}{' '}
                {tripPlan.config.travellers === 1 ? 'Traveller' : 'Travellers'}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {tripPlan.title}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSavedOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Manage Saved Trips ({savedTrips.length})
              </button>
            </div>
          </div>

          {/* Map & Weather Preview Section */}
          <div id="map-weather" className="space-y-6">
            <WeatherPreview
              destination={tripPlan.destination}
              durationDays={tripPlan.config.durationDays}
              startDate={tripPlan.config.startDate}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
                <InteractiveMap
                  destination={tripPlan.destination}
                  days={tripPlan.days}
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                  focusedStopId={focusedStopId}
                  onFocusStop={setFocusedStopId}
                />
              </div>

              <div className="lg:col-span-5">
                <BudgetPanel
                  budget={tripPlan.budget}
                  budgetTarget={tripPlan.config.budgetTarget}
                  travellers={tripPlan.config.travellers}
                  durationDays={tripPlan.config.durationDays}
                  comfortTier={tripPlan.config.comfortTier}
                  onChangeTier={handleChangeComfortTier}
                  destinationId={tripPlan.destination.id}
                />
              </div>
            </div>
          </div>

          {/* Day-Wise Itinerary Timeline */}
          <ItinerarySection
            days={tripPlan.days}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            focusedStopId={focusedStopId}
            onFocusStopOnMap={handleFocusStopOnMap}
            onUpdateStop={handleUpdateStop}
            onDeleteStop={handleDeleteStop}
            onMoveStop={handleMoveStop}
            onAddStop={handleAddStop}
          />
        </motion.div>

        <ExploreDestinations
          activeDestinationId={tripPlan.destination.id}
          onSelectDestination={handleSelectExploreDestination}
        />
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-display font-semibold text-slate-800">TripTuner</span> ·
            Signed in as <span className="font-medium text-slate-700">{authUser}</span>
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => scrollToSection('planner')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Planner
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('itinerary')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Itinerary
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('explore')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Explore
            </button>
            <button
              type="button"
              onClick={() => setIsSavedOpen(true)}
              className="hover:text-slate-900 cursor-pointer"
            >
              Saved Trips
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="hover:text-slate-900 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </footer>

      <SavedTripsDrawer
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        currentTrip={tripPlan}
        savedTrips={savedTrips}
        onSaveTrip={(title) => handleSaveTrip(title)}
        onLoadTrip={handleLoadTrip}
        onDuplicateTrip={handleDuplicateTrip}
        onDeleteTrip={handleDeleteSavedTrip}
      />
    </div>
  );
}
