import React from 'react';
import { FlightState, FlightAction } from '../types/flight';
import { storageService } from '../services/storage.service';

const flightReducer = (
  state: FlightState,
  action: FlightAction,
): FlightState => {
  switch (action.type) {
    case 'SEARCH_START':
      return {
        ...state,
        searchParams: action.payload,
        isLoading: true,
        error: null,
      };

    case 'SEARCH_SUCCESS':
      return {
        ...state,
        searchResults: action.payload,
        isLoading: false,
        error: null,
      };

    case 'SEARCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'SELECT_OFFER':
      return {
        ...state,
        selectedOffer: action.payload,
      };

    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {},
      };

    case 'ADD_RECENT_SEARCH':
      const updatedSearches = [
        action.payload,
        ...state.recentSearches.filter(s => s.id !== action.payload.id),
      ].slice(0, 10);

      storageService.addRecentSearch(action.payload);

      return {
        ...state,
        recentSearches: updatedSearches,
      };

    case 'CLEAR_SEARCH':
      return {
        ...state,
        searchParams: null,
        searchResults: null,
        selectedOffer: null,
        error: null,
        filters: {},
      };

    default:
      return state;
  }
};

const initialState: FlightState = {
  searchParams: null,
  searchResults: null,
  selectedOffer: null,
  isLoading: false,
  error: null,
  filters: {},
  recentSearches: [],
};

const FlightStateContext = React.createContext<FlightState | undefined>(
  undefined,
);
const FlightDispatchContext = React.createContext<
  React.Dispatch<FlightAction> | undefined
>(undefined);

export const FlightProvider: React.FC<{ children: React.ReactNode }> =
  React.memo(({ children }) => {
    const [state, dispatch] = React.useReducer(flightReducer, initialState);

    React.useEffect(() => {
      const loadRecentSearches = async () => {
        const searches = await storageService.getRecentSearches<any>();
        if (searches.length > 0) {
          searches.forEach((search: any) => {
            dispatch({ type: 'ADD_RECENT_SEARCH', payload: search });
          });
        }
      };

      loadRecentSearches();
    }, []);

    return (
      <FlightStateContext.Provider value={state}>
        <FlightDispatchContext.Provider value={dispatch}>
          {children}
        </FlightDispatchContext.Provider>
      </FlightStateContext.Provider>
    );
  });

FlightProvider.displayName = 'FlightProvider';

export const useFlightState = () => {
  const context = React.useContext(FlightStateContext);
  if (context === undefined) {
    throw new Error('useFlightState must be used within a FlightProvider');
  }
  return context;
};

export const useFlightDispatch = () => {
  const context = React.useContext(FlightDispatchContext);
  if (context === undefined) {
    throw new Error('useFlightDispatch must be used within a FlightProvider');
  }
  return context;
};
