export type TripType = 'one-way' | 'round-trip' | 'multi-city';
export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface FlightSearchParams {
  originSkyId: string;
  destinationSkyId: string;
  originEntityId: string;
  destinationEntityId: string;
  date: string;
  returnDate?: string;
  cabinClass: CabinClass;
  adults: number;
  children?: number;
  infants?: number;
  sortBy?: 'best' | 'cheapest' | 'fastest';
  currency?: string;
  market?: string;
  locale?: string;
}

export interface FlightSegment {
  id: string;
  origin: {
    airport: string;
    city: string;
    time: string;
    displayCode: string;
  };
  destination: {
    airport: string;
    city: string;
    time: string;
    displayCode: string;
  };
  departure: string;
  arrival: string;
  duration: number;
  airline: {
    name: string;
    code: string;
    logo?: string;
  };
  flightNumber: string;
  aircraft?: string;
  operatingAirline?: string;
  stops: number;
  cabinClass: string;
}

export interface FlightItinerary {
  id: string;
  segments: FlightSegment[];
  totalDuration: number;
  stops: number;
}

export interface PriceInfo {
  amount: number;
  currency: string;
  formatted: string;
}

export interface FlightOffer {
  id: string;
  token: string;
  price: PriceInfo;
  outbound: FlightItinerary;
  inbound?: FlightItinerary;
  deepLink: string;
  agent?: {
    name: string;
    rating?: number;
  };
  isBestValue?: boolean;
  isCheapest?: boolean;
  isFastest?: boolean;
}

export interface FlightSearchResult {
  sessionId: string;
  query: FlightSearchParams;
  offers: FlightOffer[];
  filterStats: {
    minPrice: number;
    maxPrice: number;
    airlines: string[];
    stops: number[];
    totalResults: number;
  };
  timestamp: string;
}

export interface FlightFilters {
  priceRange?: [number, number];
  airlines?: string[];
  stops?: number[];
  departureTimeRange?: [number, number];
  arrivalTimeRange?: [number, number];
  duration?: number;
}

export interface RecentSearch {
  id: string;
  from: Airport;
  to: Airport;
  date: string;
  returnDate?: string;
  passengers: number;
  timestamp: string;
}

export interface FlightState {
  searchParams: FlightSearchParams | null;
  searchResults: FlightSearchResult | null;
  selectedOffer: FlightOffer | null;
  isLoading: boolean;
  error: string | null;
  filters: FlightFilters;
  recentSearches: RecentSearch[];
}

export type FlightAction =
  | { type: 'SEARCH_START'; payload: FlightSearchParams }
  | { type: 'SEARCH_SUCCESS'; payload: FlightSearchResult }
  | { type: 'SEARCH_FAILURE'; payload: string }
  | { type: 'SELECT_OFFER'; payload: FlightOffer }
  | { type: 'UPDATE_FILTERS'; payload: Partial<FlightFilters> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'ADD_RECENT_SEARCH'; payload: RecentSearch }
  | { type: 'CLEAR_SEARCH' };
