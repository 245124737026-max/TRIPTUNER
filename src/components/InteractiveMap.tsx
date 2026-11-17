import React, { useMemo, useState } from 'react';
import { Clock, LocateFixed, MapPin, Minus, Plus } from 'lucide-react';
import { DestinationProfile, ItineraryDay, ItineraryStop } from '../types/travel';

interface InteractiveMapProps {
  destination: DestinationProfile;
  days: ItineraryDay[];
  selectedDay: number | 'all';
  onSelectDay: (day: number | 'all') => void;
  focusedStopId: string | null;
  onFocusStop: (stopId: string | null) => void;
}

interface PlottedPin {
  stop: ItineraryStop;
  dayNumber: number;
  orderIndex: number;
}

const DAY_COLORS = [
  '#0369a1', // sky-700
  '#0f766e', // teal-700
  '#b45309', // amber-700
  '#4338ca', // indigo-700
  '#be123c', // rose-700
  '#15803d', // green-700
  '#334155', // slate-700
];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  destination,
  days,
  selectedDay,
  onSelectDay,
  focusedStopId,
  onFocusStop,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });

  const plottedPins: PlottedPin[] = useMemo(() => {
    const filteredDays =
      selectedDay === 'all' ? days : days.filter((d) => d.dayNumber === selectedDay);

    const pins: PlottedPin[] = [];
    filteredDays.forEach((day) => {
      day.stops.forEach((stop, idx) => {
        pins.push({
          stop,
          dayNumber: day.dayNumber,
          orderIndex: idx + 1,
        });
      });
    });
    return pins;
  }, [days, selectedDay]);

  const activePin = useMemo(() => {
    if (!focusedStopId) return plottedPins[0] || null;
    return plottedPins.find((p) => p.stop.id === focusedStopId) || plottedPins[0] || null;
  }, [focusedStopId, plottedPins]);

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setDragOrigin({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const nextX = Math.max(-160, Math.min(160, e.clientX - dragOrigin.x));
    const nextY = Math.max(-120, Math.min(120, e.clientY - dragOrigin.y));
    setPan({ x: nextX, y: nextY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Group pins by day to draw sequential polylines
  const dayRoutes = useMemo(() => {
    const groups = new Map<number, PlottedPin[]>();
    plottedPins.forEach((pin) => {
      const existing = groups.get(pin.dayNumber) || [];
      existing.push(pin);
      groups.set(pin.dayNumber, existing);
    });
    return Array.from(groups.entries());
  }, [plottedPins]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900 tracking-tight">
            Interactive Travel Map · {destination.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any numbered stop to inspect coordinates, timing, and transit routes. Drag to pan.
          </p>
        </div>

        {/* Day Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => onSelectDay('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
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
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
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

      {/* Map Viewport */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`relative h-[380px] sm:h-[420px] rounded-lg border border-slate-200 bg-slate-100 overflow-hidden select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Transformed Cartographic Layer */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
          className="absolute inset-0 transition-transform duration-150 ease-out"
        >
          {/* SVG Terrain, Water, Contour & Route Polylines */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full block"
            aria-hidden="true"
          >
            <defs>
              <pattern id="map-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="0.18"
                  strokeOpacity="0.7"
                />
              </pattern>
            </defs>

            {/* Base Terrain */}
            <rect width="100" height="100" fill="#f1f5f9" />
            <rect width="100" height="100" fill="url(#map-grid)" />

            {/* Stylized Geography by Map Style */}
            {destination.mapStyle === 'coastal' && (
              <>
                <path
                  d="M 0 68 Q 28 58, 52 72 T 100 62 L 100 100 L 0 100 Z"
                  fill="#dbeafe"
                />
                <path
                  d="M 0 68 Q 28 58, 52 72 T 100 62"
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth="0.6"
                />
                <path
                  d="M 0 25 Q 40 16, 75 30 T 100 22"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="0.4"
                  strokeDasharray="1.5 1.5"
                />
              </>
            )}

            {destination.mapStyle === 'urban-river' && (
              <>
                <path
                  d="M 55 0 C 50 28, 63 52, 54 78 L 48 100 L 58 100 L 64 78 C 72 52, 59 28, 65 0 Z"
                  fill="#dbeafe"
                />
                <path
                  d="M 12 48 L 88 48 M 42 15 L 42 88 M 74 18 L 74 84"
                  stroke="#e2e8f0"
                  strokeWidth="0.7"
                />
              </>
            )}

            {destination.mapStyle === 'island-volcanic' && (
              <>
                <path
                  d="M 0 78 Q 35 66, 68 78 T 100 72 L 100 100 L 0 100 Z"
                  fill="#dbeafe"
                />
                <path
                  d="M 0 0 L 34 0 Q 26 30, 10 46 L 0 46 Z"
                  fill="#dbeafe"
                />
                <ellipse
                  cx="58"
                  cy="24"
                  rx="20"
                  ry="11"
                  fill="#e2e8f0"
                  stroke="#cbd5e1"
                  strokeWidth="0.4"
                />
              </>
            )}

            {destination.mapStyle === 'mountain' && (
              <>
                <path
                  d="M 8 70 Q 32 32, 60 52 T 94 24"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="0.6"
                />
                <path
                  d="M 14 28 Q 36 42, 52 56 T 88 68"
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth="0.9"
                />
                <ellipse cx="24" cy="42" rx="6" ry="3.5" fill="#bae6fd" />
                <ellipse cx="20" cy="32" rx="4.5" ry="2.8" fill="#bae6fd" />
              </>
            )}

            {destination.mapStyle === 'oasis-medina' && (
              <>
                <polygon
                  points="36,34 62,32 66,64 34,62"
                  fill="#e2e8f0"
                  fillOpacity="0.65"
                  stroke="#cbd5e1"
                  strokeWidth="0.5"
                />
                <path
                  d="M 10 86 Q 48 76, 92 88"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="0.7"
                  strokeDasharray="2 1.5"
                />
              </>
            )}

            {/* Route Polylines per Day */}
            {dayRoutes.map(([dayNumber, pins]) => {
              if (pins.length < 2) return null;
              const points = pins.map((p) => `${p.stop.coords.x},${p.stop.coords.y}`).join(' ');
              const color = DAY_COLORS[(dayNumber - 1) % DAY_COLORS.length];
              return (
                <polyline
                  key={`route-${dayNumber}`}
                  points={points}
                  fill="none"
                  stroke={color}
                  strokeWidth="0.7"
                  strokeDasharray="1.8 1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.8"
                />
              );
            })}
          </svg>

          {/* Geographic Landmark Labels */}
          {destination.mapLandmarks.map((lm) => (
            <div
              key={lm.label}
              style={{ left: `${lm.x}%`, top: `${lm.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none text-[10px] font-medium tracking-wide text-slate-400 uppercase whitespace-nowrap"
            >
              {lm.label}
            </div>
          ))}

          {/* Interactive Stop Pins */}
          {plottedPins.map((pin) => {
            const isActive = activePin?.stop.id === pin.stop.id;
            const color = DAY_COLORS[(pin.dayNumber - 1) % DAY_COLORS.length];
            return (
              <button
                key={pin.stop.id}
                type="button"
                onClick={() => onFocusStop(pin.stop.id)}
                style={{
                  left: `${pin.stop.coords.x}%`,
                  top: `${pin.stop.coords.y}%`,
                  backgroundColor: isActive ? '#0f172a' : color,
                }}
                aria-label={`Day ${pin.dayNumber} Stop ${pin.orderIndex}: ${pin.stop.title}`}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full text-white font-mono text-[11px] font-bold border-2 border-white shadow-sm transition-transform duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                  isActive ? 'w-8 h-8 scale-110 z-20' : 'w-6 h-6 hover:scale-110 z-10'
                }`}
              >
                {selectedDay === 'all' ? `${pin.dayNumber}.${pin.orderIndex}` : pin.orderIndex}
              </button>
            );
          })}
        </div>

        {/* Zoom & Reset Controls */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1 bg-white/95 border border-slate-200 rounded-lg p-1 shadow-xs">
          <button
            type="button"
            aria-label="Zoom in map"
            onClick={() => setZoom((z) => Math.min(2, Number((z + 0.25).toFixed(2))))}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Zoom out map"
            onClick={() => setZoom((z) => Math.max(0.85, Number((z - 0.25).toFixed(2))))}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Reset map view"
            onClick={handleResetView}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <LocateFixed className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Active Pin Detail Card */}
        {activePin && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-80 z-20 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg p-3.5 shadow-sm">
            <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 font-mono tabular-nums mb-1">
              <span>
                Day {activePin.dayNumber} · {activePin.stop.time} · {activePin.stop.district}
              </span>
              <span>
                {activePin.stop.coords.latLabel}, {activePin.stop.coords.lngLabel}
              </span>
            </div>
            <div className="font-display text-sm font-bold text-slate-900 leading-snug">
              {activePin.stop.title}
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-600 tabular-nums">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                {activePin.stop.durationMinutes} min
              </span>
              {activePin.stop.transitToNextMinutes !== null && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-700" aria-hidden="true" />
                    Next: {activePin.stop.transitToNextMinutes}m ({activePin.stop.transitMode})
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
