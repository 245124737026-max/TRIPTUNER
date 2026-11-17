import React, { useState } from 'react';
import { BookmarkCheck, Copy, FolderOpen, Trash2, X } from 'lucide-react';
import { TripPlan } from '../types/travel';

interface SavedTripsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrip: TripPlan;
  savedTrips: TripPlan[];
  onSaveTrip: (customTitle: string) => void;
  onLoadTrip: (trip: TripPlan) => void;
  onDuplicateTrip: (trip: TripPlan) => void;
  onDeleteTrip: (tripId: string) => void;
}

export const SavedTripsDrawer: React.FC<SavedTripsDrawerProps> = ({
  isOpen,
  onClose,
  currentTrip,
  savedTrips,
  onSaveTrip,
  onLoadTrip,
  onDuplicateTrip,
  onDeleteTrip,
}) => {
  const [titleInput, setTitleInput] = useState(currentTrip.title);

  React.useEffect(() => {
    setTitleInput(currentTrip.title);
  }, [currentTrip.title, isOpen]);

  if (!isOpen) return null;

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTrip(titleInput.trim() || currentTrip.title);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-trips-title"
    >
      <div className="w-full max-w-md bg-white h-full border-l border-slate-200 flex flex-col shadow-xl">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2
              id="saved-trips-title"
              className="font-display text-lg font-bold text-slate-900"
            >
              Saved Trips
            </h2>
            <p className="text-xs text-slate-500">
              Store customized itineraries locally and reload them anytime.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close saved trips drawer"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Save Current Trip Form */}
        <form
          onSubmit={handleSaveSubmit}
          className="p-6 bg-slate-50 border-b border-slate-200 space-y-3"
        >
          <label
            htmlFor="trip-name-input"
            className="block text-xs font-semibold text-slate-800"
          >
            Save Active Plan ({currentTrip.destination.name} ·{' '}
            <span className="font-mono tabular-nums">
              ${currentTrip.budget.total.toLocaleString()}
            </span>
            )
          </label>
          <div className="flex gap-2">
            <input
              id="trip-name-input"
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Name this trip..."
              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
            >
              <BookmarkCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Save
            </button>
          </div>
        </form>

        {/* Saved List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {savedTrips.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl">
              <p className="text-sm font-medium text-slate-700 mb-1">
                No saved trips yet
              </p>
              <p className="text-xs text-slate-500">
                Save your current itinerary above to revisit or compare plans later.
              </p>
            </div>
          ) : (
            savedTrips.map((trip) => {
              const totalStops = trip.days.reduce((s, d) => s + d.stops.length, 0);
              return (
                <div
                  key={trip.id}
                  className="border border-slate-200 rounded-xl p-4 bg-white space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500 font-mono tabular-nums mb-1">
                      <span>
                        {trip.destination.name} · {trip.config.durationDays}d ·{' '}
                        {trip.config.travellers}{' '}
                        {trip.config.travellers === 1 ? 'traveller' : 'travellers'}
                      </span>
                      <span className="font-semibold text-slate-900">
                        ${trip.budget.total.toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-slate-900 leading-snug">
                      {trip.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                      Departs {trip.config.startDate} · {totalStops} planned stops ·{' '}
                      <span className="capitalize">{trip.config.comfortTier}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadTrip(trip);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer whitespace-nowrap"
                    >
                      <FolderOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      Load Plan
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onDuplicateTrip(trip)}
                        title="Duplicate trip"
                        aria-label={`Duplicate ${trip.title}`}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTrip(trip.id)}
                        title="Delete trip"
                        aria-label={`Delete ${trip.title}`}
                        className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
