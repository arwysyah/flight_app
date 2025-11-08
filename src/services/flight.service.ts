import axios from 'axios';
import { RAPIDAPI_KEY, RAPIDAPI_HOST } from '@env';
import {
  FlightSearchParams,
  FlightSearchResult,
  FlightOffer,
  Airport,
} from '../types/flight';

const BASE_URL_V1 = `https://${RAPIDAPI_HOST}/api/v1`;
const BASE_URL_V2 = `https://${RAPIDAPI_HOST}/api/v2`;

// Enhanced axios configuration
const createApiClient = (baseURL: string) => {
  return axios.create({
    baseURL,
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
    maxRedirects: 5,
    validateStatus: function (status) {
      return status >= 200 && status < 500;
    },
  });
};

const apiClientV1 = createApiClient(BASE_URL_V1);
const apiClientV2 = createApiClient(BASE_URL_V2);

// Add request interceptor for logging
apiClientV1.interceptors.request.use(
  config => {
    console.log(
      'Making V1 API Request:',
      config.method?.toUpperCase(),
      config.url,
    );
    return config;
  },
  error => {
    console.error('V1 Request Error:', error);
    return Promise.reject(error);
  },
);

apiClientV2.interceptors.request.use(
  config => {
    console.log(
      'Making V2 API Request:',
      config.method?.toUpperCase(),
      config.url,
    );
    return config;
  },
  error => {
    console.error('V2 Request Error:', error);
    return Promise.reject(error);
  },
);

// Add response interceptor for better error handling
apiClientV1.interceptors.response.use(
  response => {
    console.log('V1 API Response:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('V1 Response Error:', {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      status: error.response?.status,
    });
    return Promise.reject(error);
  },
);

apiClientV2.interceptors.response.use(
  response => {
    console.log('V2 API Response:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('V2 Response Error:', {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      status: error.response?.status,
    });
    return Promise.reject(error);
  },
);

export const flightService = {
  async searchAirport(query: string): Promise<Airport[]> {
    try {
      console.log('Searching airports for query:', query);

      if (!query || query.trim().length < 2) {
        return [];
      }

      const response = await apiClientV1.get('/flights/searchAirport', {
        params: {
          query: query.trim(),
          locale: 'en-US',
        },
      });

      console.log('Airport search response status:', response.status);

      if (!response.data || !response.data.data) {
        console.warn('No airport data found in response');
        return [];
      }

      const airports: Airport[] = response.data.data
        .filter((item: any) => item.navigation?.relevantFlightParams)
        .map((item: any) => ({
          code: item.navigation?.relevantFlightParams?.skyId || '',
          name:
            item.presentation?.suggestionTitle ||
            item.navigation?.localizedName ||
            '',
          city: item.navigation?.relevantFlightParams?.city || '',
          country: item.navigation?.relevantFlightParams?.country || '',
          entityId: item.navigation?.relevantFlightParams?.entityId || '',
        }))
        .filter((airport: Airport) => airport.code && airport.name);

      console.log(`Found ${airports.length} airports`);
      return airports;
    } catch (error: any) {
      console.error('Airport search error details:', {
        message: error?.message,
        code: error?.code,
        isAxiosError: axios.isAxiosError(error),
        status: error.response?.status,
        data: error.response?.data,
      });

      if (axios.isAxiosError(error)) {
        if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
          throw new Error(
            'Network connection failed. Please check your internet connection.',
          );
        }
        if (error.response?.status === 401) {
          throw new Error(
            'API key is invalid. Please check your RapidAPI credentials.',
          );
        }
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
      }

      throw new Error('Failed to search airports. Please try again.');
    }
  },

  async searchFlights(params: FlightSearchParams): Promise<FlightSearchResult> {
    try {
      console.log('Searching flights with params:', params);

      const queryParams: any = {
        originSkyId: params.originSkyId,
        destinationSkyId: params.destinationSkyId,
        originEntityId: params.originEntityId,
        destinationEntityId: params.destinationEntityId,
        date: params.date,
        adults: params.adults.toString(),
        cabinClass: params.cabinClass,
        sortBy: params.sortBy || 'best',
        currency: params.currency || 'USD',
        market: params.market || 'en-US',
        locale: params.locale || 'en-US',
      };

      if (params.returnDate) {
        queryParams.returnDate = params.returnDate;
      }

      if (params.children) {
        queryParams.children = params.children.toString();
      }

      if (params.infants) {
        queryParams.infants = params.infants.toString();
      }

      const response = await apiClientV2.get('/flights/searchFlights', {
        params: queryParams,
      });

      console.log('Flight search response status:', response.status);

      if (!response.data || !response.data.data) {
        throw new Error('No flight data received from API');
      }

      const data = response.data.data;

      const offers: FlightOffer[] = (data.itineraries || []).map(
        (item: any, index: number) => {
          const price = item.price?.raw || item.price?.formatted || 0;

          return {
            id: item.id || `offer-${index}`,
            token: item.token || '',
            price: {
              amount:
                typeof price === 'number' ? price : parseFloat(price) || 0,
              currency: params.currency || 'USD',
              formatted: item.price?.formatted || `$${price}`,
            },
            outbound: this.transformItinerary(item.legs?.[0]),
            inbound: item.legs?.[1]
              ? this.transformItinerary(item.legs[1])
              : undefined,
            deepLink: item.deepLink || '',
            agent: item.agent
              ? {
                  name: item.agent.name || 'Unknown',
                  rating: item.agent.rating,
                }
              : undefined,
            isBestValue: item.isBestValue || false,
            isCheapest: item.isCheapest || false,
            isFastest: item.isFastest || false,
          };
        },
      );

      const prices = offers.map(o => o.price.amount).filter(p => p > 0);
      const airlines = [
        ...new Set(
          offers.flatMap(o => o.outbound.segments.map(s => s.airline.name)),
        ),
      ];
      const stops = [
        ...new Set(
          offers.flatMap(o => [o.outbound.stops, o.inbound?.stops || 0]),
        ),
      ];

      const result: FlightSearchResult = {
        sessionId: data.sessionId || `session-${Date.now()}`,
        query: params,
        offers,
        filterStats: {
          minPrice: prices.length > 0 ? Math.min(...prices) : 0,
          maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
          airlines,
          stops: stops.sort(),
          totalResults: offers.length,
        },
        timestamp: new Date().toISOString(),
      };

      return result;
    } catch (error: any) {
      console.error('Flight search error details:', {
        message: error.message,
        code: error.code,
        isAxiosError: axios.isAxiosError(error),
        status: error.response?.status,
        data: error.response?.data,
      });

      if (axios.isAxiosError(error)) {
        if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
          throw new Error(
            'Network connection failed. Please check your internet connection.',
          );
        }
        if (error.response?.status === 401) {
          throw new Error(
            'API key is invalid. Please check your RapidAPI credentials.',
          );
        }
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
      }

      throw new Error('Failed to search flights. Please try again.');
    }
  },

  transformItinerary(leg: any): any {
    if (!leg) return null;

    const segments = (leg.segments || []).map(
      (segment: any, index: number) => ({
        id: segment.id || `segment-${index}`,
        origin: {
          airport: segment.origin?.name || '',
          city: segment.origin?.city || '',
          time: segment.departure || '',
          displayCode: segment.origin?.displayCode || segment.origin?.id || '',
        },
        destination: {
          airport: segment.destination?.name || '',
          city: segment.destination?.city || '',
          time: segment.arrival || '',
          displayCode:
            segment.destination?.displayCode || segment.destination?.id || '',
        },
        departure: segment.departure || '',
        arrival: segment.arrival || '',
        duration: segment.durationInMinutes || 0,
        airline: {
          name:
            segment.marketingCarrier?.name ||
            segment.operatingCarrier?.name ||
            'Unknown',
          code:
            segment.marketingCarrier?.alternateId ||
            segment.marketingCarrier?.id ||
            '',
          logo: segment.marketingCarrier?.logoUrl || '',
        },
        flightNumber: segment.flightNumber || '',
        aircraft: segment.aircraft?.name || '',
        operatingAirline: segment.operatingCarrier?.name || '',
        stops: segment.stops || 0,
        cabinClass: segment.cabinClass || 'economy',
      }),
    );

    return {
      id: leg.id || `itinerary-${Date.now()}`,
      segments,
      totalDuration: leg.durationInMinutes || 0,
      stops: leg.stopCount || 0,
    };
  },

  async getPopularDestinations(): Promise<Airport[]> {
    return [
      {
        code: 'LAX',
        name: 'Los Angeles International',
        city: 'Los Angeles',
        country: 'USA',
      },
      {
        code: 'JFK',
        name: 'John F. Kennedy International',
        city: 'New York',
        country: 'USA',
      },
      { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK' },
      {
        code: 'CDG',
        name: 'Charles de Gaulle',
        city: 'Paris',
        country: 'France',
      },
      {
        code: 'NRT',
        name: 'Narita International',
        city: 'Tokyo',
        country: 'Japan',
      },
      {
        code: 'DXB',
        name: 'Dubai International',
        city: 'Dubai',
        country: 'UAE',
      },
    ];
  },
};
