export type InterestCategory =
  | 'sightseeing'
  | 'food'
  | 'nature'
  | 'adventure'
  | 'beaches'
  | 'shopping';

export type ComfortTier = 'essential' | 'comfort' | 'boutique';

export type WeatherCondition = 'sunny' | 'partly-cloudy' | 'rain' | 'breezy' | 'clear-night';

export interface MapCoordinate {
  x: number; // 0-100 canvas X percentage
  y: number; // 0-100 canvas Y percentage
  latLabel: string;
  lngLabel: string;
}

export interface DestinationAttraction {
  id: string;
  name: string;
  district: string;
  category: InterestCategory;
  description: string;
  recommendedSlot: 'morning' | 'midday' | 'afternoon' | 'evening';
  durationMinutes: number;
  baseCostPerPerson: number;
  foodPairing: {
    dishOrSpot: string;
    estimatedCostPerPerson: number;
    note: string;
  };
  coords: MapCoordinate;
}

export interface WeatherDay {
  dayOffset: number;
  condition: WeatherCondition;
  label: string;
  highC: number;
  lowC: number;
  precipPct: number;
  windKmh: number;
}

export interface DestinationProfile {
  id: string;
  name: string;
  country: string;
  regionLabel: string;
  tagline: string;
  description: string;
  image: string;
  bestSeason: string;
  currencyNote: string;
  baseFlightPerPerson: number;
  baseStayPerNight: number;
  localTransitPerDay: number;
  mapStyle: 'coastal' | 'mountain' | 'urban-river' | 'island-volcanic' | 'oasis-medina';
  mapLandmarks: { label: string; x: number; y: number }[];
  weatherSummary: string;
  packingTip: string;
  forecast: WeatherDay[];
  highlights: InterestCategory[];
  attractions: DestinationAttraction[];
}

export interface TripConfig {
  destinationId: string;
  customDestinationName?: string;
  startDate: string;
  durationDays: number;
  travellers: number;
  budgetTarget: number;
  comfortTier: ComfortTier;
  interests: InterestCategory[];
}

export interface ItineraryStop {
  id: string;
  time: string;
  title: string;
  district: string;
  category: InterestCategory;
  description: string;
  durationMinutes: number;
  activityCostTotal: number;
  foodSuggestion: string;
  foodCostTotal: number;
  transitToNextMinutes: number | null;
  transitToNextDistanceKm: number | null;
  transitMode: string;
  coords: MapCoordinate;
  isCustom?: boolean;
}

export interface ItineraryDay {
  dayNumber: number;
  dateLabel: string;
  themeTitle: string;
  stops: ItineraryStop[];
}

export interface BudgetBreakdown {
  travel: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
  perPerson: number;
  perDay: number;
  variance: number; // positive = under budget, negative = over budget
}

export interface TripPlan {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  config: TripConfig;
  destination: DestinationProfile;
  days: ItineraryDay[];
  budget: BudgetBreakdown;
}
