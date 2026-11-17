import { buildCustomDestinationProfile, DESTINATIONS } from '../data/destinations';
import {
  BudgetBreakdown,
  ComfortTier,
  DestinationAttraction,
  DestinationProfile,
  ItineraryDay,
  ItineraryStop,
  MapCoordinate,
  TripConfig,
  TripPlan,
} from '../types/travel';

const TIER_MULTIPLIERS: Record<ComfortTier, { stay: number; food: number; activity: number; travel: number }> = {
  essential: { stay: 0.72, food: 0.78, activity: 0.85, travel: 0.86 },
  comfort: { stay: 1.0, food: 1.0, activity: 1.0, travel: 1.0 },
  boutique: { stay: 1.48, food: 1.35, activity: 1.25, travel: 1.24 },
};

const SLOT_TIMES: Record<'morning' | 'midday' | 'afternoon' | 'evening', string> = {
  morning: '09:00',
  midday: '12:15',
  afternoon: '15:00',
  evening: '18:45',
};

const DAY_THEMES = [
  'Historic Core & First Impressions',
  'Local Flavors & Neighborhood Rhythm',
  'Scenic Horizons & Outdoor Trails',
  'Artisan Craft & Coastal / Valley Views',
  'Hidden Corners & Farewell Tasting',
  'Extended Regional Discovery',
  'Slow Morning & Departure Highlights',
];

export function resolveDestination(config: TripConfig): DestinationProfile {
  if (config.customDestinationName && config.customDestinationName.trim().length > 0) {
    const matched = DESTINATIONS.find(
      (d) => d.name.toLowerCase() === config.customDestinationName?.trim().toLowerCase()
    );
    if (matched) return matched;
    return buildCustomDestinationProfile(config.customDestinationName);
  }
  return DESTINATIONS.find((d) => d.id === config.destinationId) || DESTINATIONS[0];
}

function formatDateOffset(startDateStr: string, offsetDays: number): string {
  const base = startDateStr ? new Date(`${startDateStr}T00:00:00`) : new Date();
  if (Number.isNaN(base.getTime())) {
    return `Day ${offsetDays + 1}`;
  }
  const next = new Date(base);
  next.setDate(base.getDate() + offsetDays);
  return next.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function computeDistanceAndTransit(
  a: MapCoordinate,
  b: MapCoordinate,
  mapStyle: DestinationProfile['mapStyle']
): { minutes: number; km: number; mode: string } {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const rawUnits = Math.sqrt(dx * dx + dy * dy);
  const scaleKm = mapStyle === 'mountain' || mapStyle === 'island-volcanic' ? 0.85 : 0.22;
  const km = Math.max(0.6, Number((rawUnits * scaleKm).toFixed(1)));

  if (km <= 1.4) {
    return {
      km,
      minutes: Math.max(6, Math.round(km * 12)),
      mode: 'Walk',
    };
  }
  if (mapStyle === 'coastal') {
    return {
      km,
      minutes: Math.max(12, Math.round(km * 3.8 + 6)),
      mode: km > 7 ? 'Coastal Ferry' : 'Local Shuttle',
    };
  }
  if (mapStyle === 'mountain' || mapStyle === 'island-volcanic') {
    return {
      km,
      minutes: Math.max(15, Math.round(km * 1.4 + 8)),
      mode: 'Scenic Drive',
    };
  }
  return {
    km,
    minutes: Math.max(10, Math.round(km * 2.9 + 5)),
    mode: 'Metro / Rail',
  };
}

export function linkDayTransitions(
  stops: ItineraryStop[],
  mapStyle: DestinationProfile['mapStyle']
): ItineraryStop[] {
  return stops.map((stop, idx) => {
    const next = stops[idx + 1];
    if (!next) {
      return {
        ...stop,
        transitToNextMinutes: null,
        transitToNextDistanceKm: null,
        transitMode: 'End of day',
      };
    }
    const transit = computeDistanceAndTransit(stop.coords, next.coords, mapStyle);
    return {
      ...stop,
      transitToNextMinutes: transit.minutes,
      transitToNextDistanceKm: transit.km,
      transitMode: transit.mode,
    };
  });
}

export function recalculateBudget(
  days: ItineraryDay[],
  destination: DestinationProfile,
  config: TripConfig
): BudgetBreakdown {
  const mult = TIER_MULTIPLIERS[config.comfortTier];
  const travellers = Math.max(1, config.travellers);
  const duration = Math.max(1, config.durationDays);

  const flights = Math.round(destination.baseFlightPerPerson * mult.travel * travellers);
  const localTransit = Math.round(destination.localTransitPerDay * duration * Math.max(1, travellers * 0.75));
  const travel = flights + localTransit;

  const roomsNeeded = Math.ceil(travellers / 2);
  const accommodation = Math.round(
    destination.baseStayPerNight * mult.stay * duration * roomsNeeded
  );

  let food = 0;
  let activities = 0;

  for (const day of days) {
    for (const stop of day.stops) {
      food += stop.foodCostTotal;
      activities += stop.activityCostTotal;
    }
  }

  // Add light baseline breakfast/snacks per day not covered by stop pairings
  food += Math.round(14 * mult.food * travellers * duration);

  const total = travel + accommodation + food + activities;
  const perPerson = Math.round(total / travellers);
  const perDay = Math.round(total / duration);
  const variance = config.budgetTarget - total;

  return {
    travel,
    accommodation,
    food,
    activities,
    total,
    perPerson,
    perDay,
    variance,
  };
}

export function generateTripPlan(config: TripConfig): TripPlan {
  const destination = resolveDestination(config);
  const mult = TIER_MULTIPLIERS[config.comfortTier];
  const travellers = Math.max(1, config.travellers);
  const duration = Math.min(7, Math.max(2, config.durationDays));

  // Score attractions based on selected interests
  const scoredPool = [...destination.attractions]
    .map((attr, originalIdx) => {
      const interestMatch = config.interests.includes(attr.category) ? 10 : 0;
      const foodBonus = config.interests.includes('food') && attr.category === 'food' ? 4 : 0;
      return {
        attr,
        score: interestMatch + foodBonus - originalIdx * 0.1,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.attr);

  const slotsOrder: ('morning' | 'midday' | 'afternoon' | 'evening')[] = [
    'morning',
    'midday',
    'afternoon',
    'evening',
  ];

  const usedIds = new Set<string>();
  const days: ItineraryDay[] = [];

  for (let d = 0; d < duration; d++) {
    const stopsPerDay = d === duration - 1 ? 3 : 3 + (d % 2 === 0 ? 1 : 0);
    const chosenForDay: DestinationAttraction[] = [];

    for (let s = 0; s < stopsPerDay; s++) {
      const targetSlot = slotsOrder[s % slotsOrder.length];
      let candidate = scoredPool.find(
        (a) => !usedIds.has(a.id) && a.recommendedSlot === targetSlot
      );
      if (!candidate) {
        candidate = scoredPool.find((a) => !usedIds.has(a.id));
      }
      if (!candidate) {
        // Wrap around gracefully for longer trips with distinct phrasing
        candidate = scoredPool[(d * 3 + s) % scoredPool.length];
      }
      if (candidate) {
        usedIds.add(candidate.id);
        chosenForDay.push(candidate);
      }
    }

    // Sort stops chronologically by slot order
    chosenForDay.sort(
      (a, b) => slotsOrder.indexOf(a.recommendedSlot) - slotsOrder.indexOf(b.recommendedSlot)
    );

    const rawStops: ItineraryStop[] = chosenForDay.map((attr, idx) => {
      const slot = slotsOrder[Math.min(idx, slotsOrder.length - 1)];
      const activityCostTotal = Math.round(attr.baseCostPerPerson * mult.activity * travellers);
      const foodCostTotal = Math.round(
        attr.foodPairing.estimatedCostPerPerson * mult.food * travellers
      );

      return {
        id: `${attr.id}-d${d + 1}-${idx}`,
        time: SLOT_TIMES[attr.recommendedSlot] || SLOT_TIMES[slot],
        title: attr.name,
        district: attr.district,
        category: attr.category,
        description: attr.description,
        durationMinutes: attr.durationMinutes,
        activityCostTotal,
        foodSuggestion: `${attr.foodPairing.dishOrSpot} — ${attr.foodPairing.note}`,
        foodCostTotal,
        transitToNextMinutes: null,
        transitToNextDistanceKm: null,
        transitMode: 'Walk',
        coords: attr.coords,
      };
    });

    days.push({
      dayNumber: d + 1,
      dateLabel: formatDateOffset(config.startDate, d),
      themeTitle: DAY_THEMES[d % DAY_THEMES.length],
      stops: linkDayTransitions(rawStops, destination.mapStyle),
    });
  }

  const budget = recalculateBudget(days, destination, config);
  const nowIso = new Date().toISOString();

  return {
    id: `trip-${Date.now()}`,
    title: `${destination.name} ${duration}-Day Escape`,
    createdAt: nowIso,
    updatedAt: nowIso,
    config: { ...config, durationDays: duration },
    destination,
    days,
    budget,
  };
}
