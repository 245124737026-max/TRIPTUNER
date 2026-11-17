import React, { useState } from 'react';
import { CloudRain, CloudSun, Droplets, Sun, Wind } from 'lucide-react';
import { DestinationProfile, WeatherCondition } from '../types/travel';

interface WeatherPreviewProps {
  destination: DestinationProfile;
  durationDays: number;
  startDate: string;
}

function renderConditionIcon(condition: WeatherCondition) {
  switch (condition) {
    case 'sunny':
      return <Sun className="w-5 h-5 text-amber-500" aria-hidden="true" />;
    case 'rain':
      return <CloudRain className="w-5 h-5 text-sky-600" aria-hidden="true" />;
    case 'breezy':
      return <Wind className="w-5 h-5 text-slate-600" aria-hidden="true" />;
    default:
      return <CloudSun className="w-5 h-5 text-amber-500" aria-hidden="true" />;
  }
}

function formatShortDay(startDate: string, offset: number): string {
  const base = startDate ? new Date(`${startDate}T00:00:00`) : new Date();
  if (Number.isNaN(base.getTime())) return `Day ${offset + 1}`;
  const d = new Date(base);
  d.setDate(base.getDate() + offset);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
}

export const WeatherPreview: React.FC<WeatherPreviewProps> = ({
  destination,
  durationDays,
  startDate,
}) => {
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  const convertTemp = (c: number) => (unit === 'C' ? c : Math.round((c * 9) / 5 + 32));
  const visibleForecast = destination.forecast.slice(0, Math.min(7, Math.max(durationDays, 5)));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900 tracking-tight">
            Weather Preview · {destination.name}
          </h3>
          <p className="text-sm text-slate-600 mt-0.5">{destination.weatherSummary}</p>
        </div>

        <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => setUnit('C')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              unit === 'C' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            °C
          </button>
          <button
            type="button"
            onClick={() => setUnit('F')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              unit === 'F' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            °F
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2.5">
        {visibleForecast.map((day, idx) => {
          const isTripDay = idx < durationDays;
          return (
            <div
              key={day.dayOffset}
              className={`rounded-lg border p-3 flex flex-col justify-between transition-colors ${
                isTripDay
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-white border-slate-100 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-slate-700 truncate">
                  {formatShortDay(startDate, day.dayOffset)}
                </span>
                {renderConditionIcon(day.condition)}
              </div>

              <div className="my-1">
                <div className="font-mono text-base font-semibold text-slate-900 tabular-nums">
                  {convertTemp(day.highC)}°{' '}
                  <span className="text-slate-400 font-normal text-sm">
                    / {convertTemp(day.lowC)}°
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-0.5 truncate">{day.label}</div>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums">
                <span className="inline-flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-sky-600" aria-hidden="true" />
                  {day.precipPct}%
                </span>
                <span>{day.windKmh} km/h</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-600 mt-4 pt-3 border-t border-slate-100">
        <span className="font-semibold text-slate-800">Packing note:</span> {destination.packingTip}
      </p>
    </div>
  );
};
