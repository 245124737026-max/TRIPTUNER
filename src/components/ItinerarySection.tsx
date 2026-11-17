import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Clock,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Utensils,
  X,
} from 'lucide-react';
import { INTEREST_OPTIONS } from '../data/destinations';
import { InterestCategory, ItineraryDay, ItineraryStop } from '../types/travel';

interface ItinerarySectionProps {
  days: ItineraryDay[];
  selectedDay: number | 'all';
  onSelectDay: (day: number | 'all') => void;
  focusedStopId: string | null;
  onFocusStopOnMap: (stopId: string, dayNumber: number) => void;
  onUpdateStop: (dayNumber: number, updatedStop: ItineraryStop) => void;
  onDeleteStop: (dayNumber: number, stopId: string) => void;
  onMoveStop: (dayNumber: number, stopId: string, direction: 'up' | 'down') => void;
  onAddStop: (dayNumber: number, newStop: Omit<ItineraryStop, 'id' | 'transitToNextMinutes' | 'transitToNextDistanceKm' | 'transitMode'>) => void;
}

const CATEGORY_LABEL: Record<InterestCategory, string> = {
  sightseeing: 'Sightseeing',
  food: 'Food & Dining',
  nature: 'Nature',
  adventure: 'Adventure',
  beaches: 'Beaches & Coast',
  shopping: 'Shopping',
};

export const ItinerarySection: React.FC<ItinerarySectionProps> = ({
  days,
  selectedDay,
  onSelectDay,
  focusedStopId,
  onFocusStopOnMap,
  onUpdateStop,
  onDeleteStop,
  onMoveStop,
  onAddStop,
}) => {
  const [editingStopId, setEditingStopId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    title: string;
    time: string;
    district: string;
    category: InterestCategory;
    durationMinutes: number;
    activityCostTotal: number;
    foodSuggestion: string;
    foodCostTotal: number;
  } | null>(null);

  const [addingToDay, setAddingToDay] = useState<number | null>(null);
  const [newStopDraft, setNewStopDraft] = useState({
    time: '16:30',
    title: '',
    district: 'City Center',
    category: 'sightseeing' as InterestCategory,
    description: 'Custom itinerary stop added by traveller.',
    durationMinutes: 90,
    activityCostTotal: 20,
    foodSuggestion: 'Nearby local café or bistro stop',
    foodCostTotal: 25,
  });

  const visibleDays =
    selectedDay === 'all' ? days : days.filter((d) => d.dayNumber === selectedDay);

  const startEditing = (stop: ItineraryStop) => {
    setEditingStopId(stop.id);
    setEditDraft({
      title: stop.title,
      time: stop.time,
      district: stop.district,
      category: stop.category,
      durationMinutes: stop.durationMinutes,
      activityCostTotal: stop.activityCostTotal,
      foodSuggestion: stop.foodSuggestion,
      foodCostTotal: stop.foodCostTotal,
    });
  };

  const commitEdit = (dayNumber: number, original: ItineraryStop) => {
    if (!editDraft || !editDraft.title.trim()) return;
    onUpdateStop(dayNumber, {
      ...original,
      title: editDraft.title.trim(),
      time: editDraft.time,
      district: editDraft.district.trim() || original.district,
      category: editDraft.category,
      durationMinutes: Math.max(15, Number(editDraft.durationMinutes) || 60),
      activityCostTotal: Math.max(0, Number(editDraft.activityCostTotal) || 0),
      foodSuggestion: editDraft.foodSuggestion.trim() || original.foodSuggestion,
      foodCostTotal: Math.max(0, Number(editDraft.foodCostTotal) || 0),
    });
    setEditingStopId(null);
    setEditDraft(null);
  };

  const handleAddSubmit = (e: React.FormEvent, dayNumber: number) => {
    e.preventDefault();
    if (!newStopDraft.title.trim()) return;
    const randomOffset = (dayNumber * 17 + Math.floor(Math.random() * 25)) % 48;
    onAddStop(dayNumber, {
      time: newStopDraft.time,
      title: newStopDraft.title.trim(),
      district: newStopDraft.district.trim() || 'Central District',
      category: newStopDraft.category,
      description: newStopDraft.description.trim(),
      durationMinutes: Math.max(15, Number(newStopDraft.durationMinutes) || 90),
      activityCostTotal: Math.max(0, Number(newStopDraft.activityCostTotal) || 0),
      foodSuggestion: newStopDraft.foodSuggestion.trim(),
      foodCostTotal: Math.max(0, Number(newStopDraft.foodCostTotal) || 0),
      coords: {
        x: 25 + randomOffset,
        y: 28 + ((dayNumber * 13 + randomOffset) % 45),
        latLabel: 'Custom Pin',
        lngLabel: 'Route Stop',
      },
      isCustom: true,
    });
    setAddingToDay(null);
    setNewStopDraft({
      time: '16:30',
      title: '',
      district: 'City Center',
      category: 'sightseeing',
      description: 'Custom itinerary stop added by traveller.',
      durationMinutes: 90,
      activityCostTotal: 20,
      foodSuggestion: 'Nearby local café or bistro stop',
      foodCostTotal: 25,
    });
  };

  return (
    <div id="itinerary" className="space-y-5">
      {/* Header + Day Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            Day-Wise Travel Itinerary
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Edit times or expenses, reorder stops, add custom places, or click a stop to inspect it on the map.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
          <button
            type="button"
            onClick={() => onSelectDay('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              selectedDay === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Days
          </button>
          {days.map((day) => (
            <button
              key={day.dayNumber}
              type="button"
              onClick={() => onSelectDay(day.dayNumber)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                selectedDay === day.dayNumber
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Day {day.dayNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Days Feed */}
      <div className="space-y-6">
        {visibleDays.map((day) => {
          const dayCost = day.stops.reduce(
            (sum, s) => sum + s.activityCostTotal + s.foodCostTotal,
            0
          );

          return (
            <section
              key={day.dayNumber}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden"
            >
              {/* Day Header */}
              <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium tabular-nums">
                    <span className="text-sky-700 font-semibold">Day {day.dayNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span>{day.dateLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{day.stops.length} stops</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 mt-0.5">
                    {day.themeTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right font-mono tabular-nums">
                    <div className="text-xs text-slate-500">Day Activities & Food</div>
                    <div className="text-sm font-semibold text-slate-900">
                      ${dayCost.toLocaleString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setAddingToDay(addingToDay === day.dayNumber ? null : day.dayNumber)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-white border border-slate-200 hover:border-sky-300 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    Add Activity
                  </button>
                </div>
              </div>

              {/* Add Custom Activity Form */}
              {addingToDay === day.dayNumber && (
                <form
                  onSubmit={(e) => handleAddSubmit(e, day.dayNumber)}
                  className="p-5 sm:p-6 bg-sky-50/50 border-b border-slate-200 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">
                      Add Stop to Day {day.dayNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAddingToDay(null)}
                      aria-label="Cancel adding stop"
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Place or Activity Title
                      </label>
                      <input
                        type="text"
                        required
                        value={newStopDraft.title}
                        onChange={(e) =>
                          setNewStopDraft({ ...newStopDraft, title: e.target.value })
                        }
                        placeholder="e.g. Sunset Rooftop Espresso & Gallery"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={newStopDraft.time}
                        onChange={(e) =>
                          setNewStopDraft({ ...newStopDraft, time: e.target.value })
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-sky-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Category
                      </label>
                      <select
                        value={newStopDraft.category}
                        onChange={(e) =>
                          setNewStopDraft({
                            ...newStopDraft,
                            category: e.target.value as InterestCategory,
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                      >
                        {INTEREST_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Neighborhood
                      </label>
                      <input
                        type="text"
                        value={newStopDraft.district}
                        onChange={(e) =>
                          setNewStopDraft({ ...newStopDraft, district: e.target.value })
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Activity Cost ($)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={newStopDraft.activityCostTotal}
                        onChange={(e) =>
                          setNewStopDraft({
                            ...newStopDraft,
                            activityCostTotal: Number(e.target.value),
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-sky-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Food Suggestion
                      </label>
                      <input
                        type="text"
                        value={newStopDraft.foodSuggestion}
                        onChange={(e) =>
                          setNewStopDraft({ ...newStopDraft, foodSuggestion: e.target.value })
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Food Cost ($)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={newStopDraft.foodCostTotal}
                        onChange={(e) =>
                          setNewStopDraft({
                            ...newStopDraft,
                            foodCostTotal: Number(e.target.value),
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-sky-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setAddingToDay(null)}
                      className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg cursor-pointer"
                    >
                      Add to Day {day.dayNumber}
                    </button>
                  </div>
                </form>
              )}

              {/* Stops List */}
              {day.stops.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-600 mb-3">
                    No activities scheduled for Day {day.dayNumber} yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAddingToDay(day.dayNumber)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg cursor-pointer"
                  >
                    Add First Activity
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {day.stops.map((stop, stopIndex) => {
                    const isEditing = editingStopId === stop.id && editDraft !== null;
                    const isFocused = focusedStopId === stop.id;
                    const stopTotalCost = stop.activityCostTotal + stop.foodCostTotal;

                    return (
                      <div
                        key={stop.id}
                        className={`p-5 sm:p-6 transition-colors ${
                          isFocused ? 'bg-sky-50/40' : 'bg-white hover:bg-slate-50/50'
                        }`}
                      >
                        {isEditing && editDraft ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                  Activity Title
                                </label>
                                <input
                                  type="text"
                                  value={editDraft.title}
                                  onChange={(e) =>
                                    setEditDraft({ ...editDraft, title: e.target.value })
                                  }
                                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                  Time
                                </label>
                                <input
                                  type="time"
                                  value={editDraft.time}
                                  onChange={(e) =>
                                    setEditDraft({ ...editDraft, time: e.target.value })
                                  }
                                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-sky-600"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                  Duration (min)
                                </label>
                                <input
                                  type="number"
                                  min={15}
                                  value={editDraft.durationMinutes}
                                  onChange={(e) =>
                                    setEditDraft({
                                      ...editDraft,
                                      durationMinutes: Number(e.target.value),
                                    })
                                  }
                                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-sky-600"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                  Food Pairing
                                </label>
                                <input
                                  type="text"
                                  value={editDraft.foodSuggestion}
                                  onChange={(e) =>
                                    setEditDraft({
                                      ...editDraft,
                                      foodSuggestion: e.target.value,
                                    })
                                  }
                                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                  Activity Cost ($)
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={editDraft.activityCostTotal}
                                  onChange={(e) =>
                                    setEditDraft({
                                      ...editDraft,
                                      activityCostTotal: Number(e.target.value),
                                    })
                                  }
                                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-sky-600"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                  Food Cost ($)
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={editDraft.foodCostTotal}
                                  onChange={(e) =>
                                    setEditDraft({
                                      ...editDraft,
                                      foodCostTotal: Number(e.target.value),
                                    })
                                  }
                                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-sky-600"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingStopId(null);
                                  setEditDraft(null);
                                }}
                                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => commitEdit(day.dayNumber, stop)}
                                className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              {/* Unboxed Metadata Line (Zero-Pill Discipline) */}
                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono tabular-nums mb-1.5">
                                <span className="font-semibold text-slate-900">
                                  {stop.time}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="font-sans font-medium text-sky-700">
                                  {CATEGORY_LABEL[stop.category]}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="font-sans">{stop.district}</span>
                                <span aria-hidden="true">·</span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
                                  {stop.durationMinutes}m
                                </span>
                              </div>

                              <h4 className="font-display text-base font-bold text-slate-900 leading-snug">
                                {stop.title}
                              </h4>
                              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                {stop.description}
                              </p>

                              {/* Food Suggestion */}
                              <div className="mt-2.5 flex items-start gap-2 text-xs text-slate-700">
                                <Utensils
                                  className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0"
                                  aria-hidden="true"
                                />
                                <span>
                                  <span className="font-semibold">Food pairing:</span>{' '}
                                  {stop.foodSuggestion}{' '}
                                  <span className="font-mono text-slate-500 tabular-nums">
                                    (${stop.foodCostTotal.toLocaleString()})
                                  </span>
                                </span>
                              </div>

                              {/* Transit to Next Stop */}
                              {stop.transitToNextMinutes !== null && (
                                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
                                  <MapPin className="w-3.5 h-3.5 text-sky-700 shrink-0" aria-hidden="true" />
                                  <span>
                                    Travel to next stop: {stop.transitToNextMinutes} min via{' '}
                                    {stop.transitMode} ({stop.transitToNextDistanceKm} km)
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Right Actions & Cost */}
                            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                              <div className="text-left sm:text-right font-mono tabular-nums">
                                <div className="text-sm font-semibold text-slate-900">
                                  ${stopTotalCost.toLocaleString()}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  Entry ${stop.activityCostTotal} · Meal ${stop.foodCostTotal}
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => onFocusStopOnMap(stop.id, day.dayNumber)}
                                  title="Show on map"
                                  aria-label={`Locate ${stop.title} on map`}
                                  className="p-2 text-slate-500 hover:text-sky-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                >
                                  <MapPin className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onMoveStop(day.dayNumber, stop.id, 'up')}
                                  disabled={stopIndex === 0}
                                  title="Move earlier"
                                  aria-label={`Move ${stop.title} earlier`}
                                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onMoveStop(day.dayNumber, stop.id, 'down')}
                                  disabled={stopIndex === day.stops.length - 1}
                                  title="Move later"
                                  aria-label={`Move ${stop.title} later`}
                                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => startEditing(stop)}
                                  title="Edit activity"
                                  aria-label={`Edit ${stop.title}`}
                                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteStop(day.dayNumber, stop.id)}
                                  title="Remove activity"
                                  aria-label={`Remove ${stop.title}`}
                                  className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};
