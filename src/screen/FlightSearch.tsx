import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { useFlightDispatch } from '../state/flight.state';
import { flightService } from '../services/flight.service';
import { Airport, CabinClass, FlightSearchParams } from '../types/flight';
import { DatePicker } from '../components/DatePicker';
import { wp, hp, fs, spacing, isSmallDevice } from '../utils/responsive';

type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  FlightSearch: undefined;
  FlightResults: undefined;
  FlightDetails: { offerId: string };
};

type FlightSearchScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'FlightSearch'
>;

interface FlightSearchScreenProps {
  navigation: FlightSearchScreenNavigationProp;
}

export const FlightSearchScreen: React.FC<FlightSearchScreenProps> = ({
  navigation,
}) => {
  const { user, signOut } = useAuth();
  const dispatch = useFlightDispatch();

  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>(
    'round-trip',
  );
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [departDate, setDepartDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState<CabinClass>('economy');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [originQuery, setOriginQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<Airport[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<
    Airport[]
  >([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] =
    useState(false);

  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);
  const searchAirports = useCallback(
    async (query: string, isOrigin: boolean) => {
      const trimmedQuery = query.trim();

      if (trimmedQuery.length < 2) {
        if (isOrigin) {
          setOriginSuggestions([]);
          setShowOriginSuggestions(false);
          setIsSearchingOrigin(false);
        } else {
          setDestinationSuggestions([]);
          setShowDestinationSuggestions(false);
          setIsSearchingDestination(false);
        }
        return;
      }

      if (isOrigin) {
        setIsSearchingOrigin(true);
      } else {
        setIsSearchingDestination(true);
      }

      try {
        const results = await flightService.searchAirport(trimmedQuery);
        if (isOrigin) {
          setOriginSuggestions(results);
          setShowOriginSuggestions(true);
        } else {
          setDestinationSuggestions(results);
          setShowDestinationSuggestions(true);
        }
      } catch (err) {
        console.error('Airport search error:', err);
        if (isOrigin) {
          setOriginSuggestions([]);
        } else {
          setDestinationSuggestions([]);
        }
      } finally {
        if (isOrigin) {
          setIsSearchingOrigin(false);
        } else {
          setIsSearchingDestination(false);
        }
      }
    },
    [],
  );

  const handleOriginChange = useCallback(
    (text: string) => {
      setOriginQuery(text);
      setOrigin(null);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        searchAirports(text, true);
      }, 500);
    },
    [searchAirports],
  );

  const handleDestinationChange = useCallback(
    (text: string) => {
      setDestinationQuery(text);
      setDestination(null);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        searchAirports(text, false);
      }, 500);
    },
    [searchAirports],
  );

  const handleOriginSubmit = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchAirports(originQuery, true);
  }, [originQuery, searchAirports]);

  const handleDestinationSubmit = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchAirports(destinationQuery, false);
  }, [destinationQuery, searchAirports]);

  const selectOrigin = useCallback((airport: Airport) => {
    setOrigin(airport);
    setOriginQuery(`${airport.name} (${airport.code})`);
    setShowOriginSuggestions(false);
    setOriginSuggestions([]);
  }, []);

  const selectDestination = useCallback((airport: Airport) => {
    setDestination(airport);
    setDestinationQuery(`${airport.name} (${airport.code})`);
    setShowDestinationSuggestions(false);
    setDestinationSuggestions([]);
  }, []);

  const clearOrigin = useCallback(() => {
    setOrigin(null);
    setOriginQuery('');
    setOriginSuggestions([]);
    setShowOriginSuggestions(false);
  }, []);

  const clearDestination = useCallback(() => {
    setDestination(null);
    setDestinationQuery('');
    setDestinationSuggestions([]);
    setShowDestinationSuggestions(false);
  }, []);

  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSearch = useCallback(async () => {
    if (!origin || !destination || !departDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (tripType === 'round-trip' && !returnDate) {
      setError('Please select a return date');
      return;
    }

    setError(null);
    setIsSearching(true);

    try {
      const searchParams: FlightSearchParams = {
        originSkyId: origin.code,
        destinationSkyId: destination.code,
        originEntityId: origin.country,
        destinationEntityId: destination.country,
        date: formatDateForAPI(departDate),
        returnDate:
          tripType === 'round-trip' && returnDate
            ? formatDateForAPI(returnDate)
            : undefined,
        cabinClass,
        adults: passengers,
        sortBy: 'best',
        currency: 'USD',
        market: 'en-US',
        locale: 'en-US',
      };

      dispatch({ type: 'SEARCH_START', payload: searchParams });
      const results = await flightService.searchFlights(searchParams);
      dispatch({ type: 'SEARCH_SUCCESS', payload: results });

      navigation.navigate('FlightResults');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setError(message);
      dispatch({ type: 'SEARCH_FAILURE', payload: message });
    } finally {
      setIsSearching(false);
    }
  }, [
    origin,
    destination,
    departDate,
    returnDate,
    tripType,
    cabinClass,
    passengers,
    dispatch,
    navigation,
  ]);

  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1a73e8" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerGradient}>
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Hello, {user?.name}! ✈️</Text>
                <Text style={styles.subtitle}>Where would you like to go?</Text>
              </View>
              <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
                <Text style={styles.signOutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchCard}>
            <View style={styles.tripTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.tripTypeButton,
                  tripType === 'round-trip' && styles.tripTypeButtonActive,
                ]}
                onPress={() => setTripType('round-trip')}
                activeOpacity={0.7}
                disabled={isSearching}
              >
                <Text
                  style={[
                    styles.tripTypeText,
                    tripType === 'round-trip' && styles.tripTypeTextActive,
                  ]}
                >
                  🔄 Round-trip
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tripTypeButton,
                  tripType === 'one-way' && styles.tripTypeButtonActive,
                ]}
                onPress={() => setTripType('one-way')}
                activeOpacity={0.7}
                disabled={isSearching}
              >
                <Text
                  style={[
                    styles.tripTypeText,
                    tripType === 'one-way' && styles.tripTypeTextActive,
                  ]}
                >
                  ➡️ One-way
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>🛫 From</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter city or airport"
                  placeholderTextColor="#9aa0a6"
                  value={originQuery}
                  onChangeText={handleOriginChange}
                  onSubmitEditing={handleOriginSubmit}
                  onFocus={() =>
                    originQuery.length >= 2 && setShowOriginSuggestions(true)
                  }
                  onBlur={() =>
                    setTimeout(() => setShowOriginSuggestions(false), 200)
                  }
                  editable={!isSearching}
                  returnKeyType="search"
                />
                {originQuery.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearOrigin}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.clearButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {isSearchingOrigin && (
                <View style={styles.searchingIndicator}>
                  <ActivityIndicator size="small" color="#1a73e8" />
                  <Text style={styles.searchingText}>
                    Searching airports...
                  </Text>
                </View>
              )}
              {showOriginSuggestions && originSuggestions.length > 0 && (
                <View style={styles.suggestions}>
                  {originSuggestions.map((airport, index) => (
                    <TouchableOpacity
                      key={`${airport.code}-${index}`}
                      style={styles.suggestionItem}
                      onPress={() => selectOrigin(airport)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.suggestionLeft}>
                        <View style={styles.airportCodeBadge}>
                          <Text style={styles.suggestionCode}>
                            {airport.code}
                          </Text>
                        </View>
                        <View style={styles.suggestionTextContainer}>
                          <Text style={styles.suggestionName}>
                            {airport.name}
                          </Text>
                          <Text style={styles.suggestionCity}>
                            📍 {airport.city}, {airport.country}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {showOriginSuggestions &&
                originSuggestions.length === 0 &&
                originQuery.length >= 2 &&
                !isSearchingOrigin && (
                  <View style={styles.noResults}>
                    <Text style={styles.noResultsText}>
                      No airports found. Try a different search.
                    </Text>
                  </View>
                )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>🛬 To</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter city or airport"
                  placeholderTextColor="#9aa0a6"
                  value={destinationQuery}
                  onChangeText={handleDestinationChange}
                  onSubmitEditing={handleDestinationSubmit}
                  onFocus={() =>
                    destinationQuery.length >= 2 &&
                    setShowDestinationSuggestions(true)
                  }
                  onBlur={() =>
                    setTimeout(() => setShowDestinationSuggestions(false), 200)
                  }
                  editable={!isSearching}
                  returnKeyType="search"
                />
                {destinationQuery.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearDestination}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.clearButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {isSearchingDestination && (
                <View style={styles.searchingIndicator}>
                  <ActivityIndicator size="small" color="#1a73e8" />
                  <Text style={styles.searchingText}>
                    Searching airports...
                  </Text>
                </View>
              )}
              {showDestinationSuggestions &&
                destinationSuggestions.length > 0 && (
                  <View style={styles.suggestions}>
                    {destinationSuggestions.map((airport, index) => (
                      <TouchableOpacity
                        key={`${airport.code}-${index}`}
                        style={styles.suggestionItem}
                        onPress={() => selectDestination(airport)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.suggestionLeft}>
                          <View style={styles.airportCodeBadge}>
                            <Text style={styles.suggestionCode}>
                              {airport.code}
                            </Text>
                          </View>
                          <View style={styles.suggestionTextContainer}>
                            <Text style={styles.suggestionName}>
                              {airport.name}
                            </Text>
                            <Text style={styles.suggestionCity}>
                              📍 {airport.city}, {airport.country}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              {showDestinationSuggestions &&
                destinationSuggestions.length === 0 &&
                destinationQuery.length >= 2 &&
                !isSearchingDestination && (
                  <View style={styles.noResults}>
                    <Text style={styles.noResultsText}>
                      No airports found. Try a different search.
                    </Text>
                  </View>
                )}
            </View>

            <View style={styles.dateRow}>
              <View style={[styles.inputGroup, styles.dateInput]}>
                <DatePicker
                  label="Depart"
                  value={departDate}
                  onChange={setDepartDate}
                  minimumDate={new Date()}
                />
              </View>

              {tripType === 'round-trip' && (
                <View style={[styles.inputGroup, styles.dateInput]}>
                  <DatePicker
                    label="Return"
                    value={returnDate}
                    onChange={setReturnDate}
                    minimumDate={departDate || new Date()}
                  />
                </View>
              )}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}> Passengers</Text>
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => setPassengers(Math.max(1, passengers - 1))}
                    activeOpacity={0.7}
                    disabled={isSearching}
                  >
                    <Text style={styles.counterButtonText}>−</Text>
                  </TouchableOpacity>
                  <View style={styles.counterValueContainer}>
                    <Text style={styles.counterValue}>{passengers}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => setPassengers(Math.min(9, passengers + 1))}
                    activeOpacity={0.7}
                    disabled={isSearching}
                  >
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}> Class</Text>
                <View style={styles.classContainer}>
                  {(['economy', 'business'] as CabinClass[]).map(cls => (
                    <TouchableOpacity
                      key={cls}
                      style={[
                        styles.classButton,
                        cabinClass === cls && styles.classButtonActive,
                      ]}
                      onPress={() => setCabinClass(cls)}
                      activeOpacity={0.7}
                      disabled={isSearching}
                    >
                      <Text
                        style={[
                          styles.classText,
                          cabinClass === cls && styles.classTextActive,
                        ]}
                      >
                        {cls === 'economy' ? 'Economy' : 'Business'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.searchButton,
                isSearching && styles.searchButtonDisabled,
              ]}
              onPress={handleSearch}
              disabled={isSearching}
              activeOpacity={0.8}
            >
              <View style={styles.searchButtonContent}>
                {!isSearching && (
                  <Text style={styles.searchButtonIcon}>🔍</Text>
                )}
                <Text style={styles.searchButtonText}>
                  {isSearching ? 'Searching...' : 'Search Flights'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
            <View style={styles.tipItem}>
              <Text style={styles.tipDot}>•</Text>
              <Text style={styles.tipText}>
                Book 2-3 months in advance for best prices
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipDot}>•</Text>
              <Text style={styles.tipText}>Flexible dates? Save up to 30%</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipDot}>•</Text>
              <Text style={styles.tipText}>
                Compare airlines for best deals
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isSearching && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={isSearching}
          onRequestClose={() => {}}
        >
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#1a73e8" />
              <Text style={styles.loadingTitle}>Searching Flights</Text>
              <Text style={styles.loadingSubtitle}>
                Finding the best deals for you...
              </Text>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a73e8',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  headerGradient: {
    backgroundColor: '#1a73e8',
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: wp(24),
    borderBottomRightRadius: wp(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  greeting: {
    fontSize: fs(26),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    fontSize: fs(15),
    color: 'rgba(255, 255, 255, 0.9)',
  },
  signOutButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: wp(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  signOutText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: fs(13),
  },
  searchCard: {
    marginHorizontal: spacing.lg,
    marginTop: -spacing.lg - spacing.md,
    padding: spacing.lg,
    backgroundColor: '#ffffff',
    borderRadius: wp(20),
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  tripTypeContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    backgroundColor: '#f0f4ff',
    borderRadius: wp(12),
    padding: wp(4),
  },
  tripTypeButton: {
    flex: 1,
    paddingVertical: hp(14),
    alignItems: 'center',
    borderRadius: wp(10),
  },
  tripTypeButtonActive: {
    backgroundColor: '#1a73e8',
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tripTypeText: {
    fontSize: fs(15),
    fontWeight: '600',
    color: '#5f6368',
  },
  tripTypeTextActive: {
    color: '#ffffff',
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fs(15),
    fontWeight: '700',
    color: '#202124',
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 2,
    borderColor: '#e8eaed',
    borderRadius: wp(12),
    padding: spacing.md,
    paddingRight: spacing.xl,
    fontSize: fs(16),
    backgroundColor: '#fafbfc',
    color: '#202124',
  },
  clearButton: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    width: wp(24),
    height: wp(24),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dadce0',
    borderRadius: wp(12),
  },
  clearButtonText: {
    fontSize: fs(12),
    color: '#5f6368',
    fontWeight: 'bold',
  },
  searchingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  searchingText: {
    marginLeft: spacing.sm,
    fontSize: fs(14),
    color: '#5f6368',
  },
  suggestions: {
    marginTop: spacing.sm,
    backgroundColor: '#fff',
    borderRadius: wp(12),
    borderWidth: 1,
    borderColor: '#e8eaed',
    maxHeight: hp(220),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  suggestionItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  suggestionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + spacing.xs,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  airportCodeBadge: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: spacing.sm + spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: wp(8),
    minWidth: wp(60),
    alignItems: 'center',
  },
  suggestionCode: {
    fontSize: fs(16),
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  suggestionName: {
    fontSize: fs(14),
    fontWeight: '600',
    color: '#202124',
  },
  suggestionCity: {
    fontSize: fs(12),
    color: '#5f6368',
    marginTop: spacing.xs / 2,
  },
  noResults: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: '#f8f9fa',
    borderRadius: wp(12),
    borderWidth: 1,
    borderColor: '#e8eaed',
  },
  noResultsText: {
    fontSize: fs(14),
    color: '#5f6368',
    textAlign: 'center',
  },
  dateRow: {
    flexDirection: isSmallDevice() ? 'column' : 'row',
    gap: spacing.sm + spacing.xs,
  },
  dateInput: {
    flex: 1,
  },
  row: {
    flexDirection: isSmallDevice() ? 'column' : 'row',
    gap: spacing.sm + spacing.xs,
  },
  halfWidth: {
    flex: 1,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#e8eaed',
    borderRadius: wp(12),
    padding: spacing.xs,
    backgroundColor: '#fafbfc',
  },
  counterButton: {
    width: wp(26),
    height: wp(26),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a73e8',
    borderRadius: wp(20),
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  counterButtonText: {
    fontSize: fs(22),
    fontWeight: 'bold',
    color: '#ffffff',
  },
  counterValueContainer: {
    minWidth: wp(40),
    alignItems: 'center',
  },
  counterValue: {
    fontSize: fs(20),
    fontWeight: 'bold',
    color: '#202124',
  },
  classContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  classButton: {
    flex: 1,
    paddingVertical: hp(8),
    alignItems: 'center',
    borderRadius: wp(12),
    borderWidth: 2,
    borderColor: '#e8eaed',
    backgroundColor: '#fafbfc',
  },
  classButtonActive: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8',
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  classText: {
    fontSize: fs(14),
    fontWeight: '600',
    color: '#5f6368',
  },
  classTextActive: {
    color: '#ffffff',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef7e0',
    padding: spacing.md,
    borderRadius: wp(12),
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#f9ab00',
  },
  errorIcon: {
    fontSize: fs(20),
    marginRight: spacing.sm,
  },
  errorText: {
    flex: 1,
    color: '#ea8600',
    fontSize: fs(14),
    fontWeight: '500',
  },
  searchButton: {
    backgroundColor: '#1a73e8',
    paddingVertical: hp(10),
    borderRadius: wp(8),
    alignItems: 'center',
    marginTop: spacing.md,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  searchButtonDisabled: {
    backgroundColor: '#a8c7fa',
    opacity: 0.6,
  },
  searchButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchButtonIcon: {
    fontSize: fs(18),
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: fs(17),
    fontWeight: 'bold',
  },
  tipsSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: '#e8f0fe',
    borderRadius: wp(16),
    borderWidth: 1,
    borderColor: '#d2e3fc',
  },
  tipsTitle: {
    fontSize: fs(16),
    fontWeight: 'bold',
    color: '#1a73e8',
    marginBottom: spacing.sm + spacing.xs,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  tipDot: {
    fontSize: fs(16),
    color: '#1a73e8',
    marginRight: spacing.sm,
    fontWeight: 'bold',
  },
  tipText: {
    flex: 1,
    fontSize: fs(14),
    color: '#174ea6',
    lineHeight: fs(20),
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: '#ffffff',
    borderRadius: wp(20),
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: wp(280),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  loadingTitle: {
    fontSize: fs(20),
    fontWeight: 'bold',
    color: '#202124',
    marginTop: spacing.md,
  },
  loadingSubtitle: {
    fontSize: fs(14),
    color: '#5f6368',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
