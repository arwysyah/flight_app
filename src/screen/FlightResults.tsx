import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFlightState, useFlightDispatch } from '../state/flight.state';
import { FlightOffer } from '../types/flight';
import { wp, fs, spacing } from '../utils/responsive';

type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  FlightSearch: undefined;
  FlightResults: undefined;
  FlightDetails: { offerId: string };
};

type FlightResultsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'FlightResults'
>;

interface FlightResultsScreenProps {
  navigation: FlightResultsScreenNavigationProp;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const FlightCard: React.FC<{ offer: FlightOffer; onPress: () => void }> = ({ offer, onPress }) => {
  const outbound = offer.outbound;
  const firstSegment = outbound.segments[0];
  const lastSegment = outbound.segments[outbound.segments.length - 1];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Badges Row */}
      {(offer.isBestValue || offer.isCheapest || offer.isFastest) && (
        <View style={styles.badges}>
          {offer.isBestValue && (
            <View style={styles.badgeBest}>
              <Text style={styles.badgeTextBest}>⭐ Best Value</Text>
            </View>
          )}
          {offer.isCheapest && (
            <View style={styles.badgeCheap}>
              <Text style={styles.badgeTextCheap}>💰 Cheapest</Text>
            </View>
          )}
          {offer.isFastest && (
            <View style={styles.badgeFast}>
              <Text style={styles.badgeTextFast}>⚡ Fastest</Text>
            </View>
          )}
        </View>
      )}

      {/* Price */}
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{offer.price.formatted}</Text>
        <Text style={styles.priceLabel}>per person</Text>
      </View>

      {/* Outbound Flight */}
      <View style={styles.flightInfo}>
        <Text style={styles.flightLabel}>🛫 Outbound</Text>
        <View style={styles.flightRoute}>
          <View style={styles.timeInfo}>
            <Text style={styles.time}>{formatTime(firstSegment.departure)}</Text>
            <Text style={styles.airport}>{firstSegment.origin.displayCode}</Text>
          </View>

          <View style={styles.routeLine}>
            <Text style={styles.duration}>{formatDuration(outbound.totalDuration)}</Text>
            <View style={styles.lineContainer}>
              <View style={styles.lineDot} />
              <View style={styles.line} />
              <View style={styles.lineDot} />
            </View>
            <View style={styles.stopsContainer}>
              <Text style={styles.stops}>
                {outbound.stops === 0 ? '✓ Nonstop' : `${outbound.stops} stop${outbound.stops > 1 ? 's' : ''}`}
              </Text>
            </View>
          </View>

          <View style={styles.timeInfo}>
            <Text style={styles.time}>{formatTime(lastSegment.arrival)}</Text>
            <Text style={styles.airport}>{lastSegment.destination.displayCode}</Text>
          </View>
        </View>

        <View style={styles.airlineInfo}>
          <Text style={styles.airlineIcon}>✈️</Text>
          <Text style={styles.airlineName}>{firstSegment.airline.name}</Text>
          {outbound.segments.length > 1 && (
            <Text style={styles.airlineNote}>+ {outbound.segments.length - 1} more</Text>
          )}
        </View>
      </View>

      {/* Return Flight (if exists) */}
      {offer.inbound && (
        <>
          <View style={styles.divider} />
          <View style={styles.flightInfo}>
            <Text style={styles.flightLabel}>🛬 Return</Text>
            <View style={styles.flightRoute}>
              <View style={styles.timeInfo}>
                <Text style={styles.time}>{formatTime(offer.inbound.segments[0].departure)}</Text>
                <Text style={styles.airport}>{offer.inbound.segments[0].origin.displayCode}</Text>
              </View>

              <View style={styles.routeLine}>
                <Text style={styles.duration}>{formatDuration(offer.inbound.totalDuration)}</Text>
                <View style={styles.lineContainer}>
                  <View style={styles.lineDot} />
                  <View style={styles.line} />
                  <View style={styles.lineDot} />
                </View>
                <View style={styles.stopsContainer}>
                  <Text style={styles.stops}>
                    {offer.inbound.stops === 0 ? '✓ Nonstop' : `${offer.inbound.stops} stop${offer.inbound.stops > 1 ? 's' : ''}`}
                  </Text>
                </View>
              </View>

              <View style={styles.timeInfo}>
                <Text style={styles.time}>{formatTime(offer.inbound.segments[offer.inbound.segments.length - 1].arrival)}</Text>
                <Text style={styles.airport}>{offer.inbound.segments[offer.inbound.segments.length - 1].destination.displayCode}</Text>
              </View>
            </View>

            <View style={styles.airlineInfo}>
              <Text style={styles.airlineIcon}>✈️</Text>
              <Text style={styles.airlineName}>{offer.inbound.segments[0].airline.name}</Text>
              {offer.inbound.segments.length > 1 && (
                <Text style={styles.airlineNote}>+ {offer.inbound.segments.length - 1} more</Text>
              )}
            </View>
          </View>
        </>
      )}

      {/* View Details Button */}
      <View style={styles.detailsButtonContainer}>
        <Text style={styles.detailsButtonText}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );
};

export const FlightResultsScreen: React.FC<FlightResultsScreenProps> = ({ navigation }) => {
  const { searchResults, isLoading, error } = useFlightState();
  const dispatch = useFlightDispatch();

  const sortedOffers = useMemo(() => {
    if (!searchResults?.offers) return [];
    return [...searchResults.offers].sort((a, b) => {
      if (a.isBestValue) return -1;
      if (b.isBestValue) return 1;
      return a.price.amount - b.price.amount;
    });
  }, [searchResults]);

  const handleSelectOffer = (offer: FlightOffer) => {
    dispatch({ type: 'SELECT_OFFER', payload: offer });
    navigation.navigate('FlightDetails', { offerId: offer.id });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#1a73e8" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>✈️ Searching flights...</Text>
          <Text style={styles.loadingSubtext}>Finding the best deals for you</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#1a73e8" />
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Search Failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Back to Search</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!searchResults || sortedOffers.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#1a73e8" />
        <View style={styles.centerContainer}>
          <Text style={styles.noResultsIcon}>😔</Text>
          <Text style={styles.noResultsTitle}>No Flights Found</Text>
          <Text style={styles.noResultsMessage}>Try adjusting your search criteria or dates</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Back to Search</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1a73e8" />
      <View style={styles.container}>
        {/* Modern Header */}
        <View style={styles.headerGradient}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButtonSmall}
              activeOpacity={0.7}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>
                {searchResults.query.originSkyId} ✈️ {searchResults.query.destinationSkyId}
              </Text>
              <Text style={styles.headerSubtitle}>
                {formatDate(searchResults.query.date)} • {searchResults.query.adults} passenger{searchResults.query.adults > 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          {/* Results Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryIcon}>✅</Text>
              <View>
                <Text style={styles.summaryText}>
                  {sortedOffers.length} Flight{sortedOffers.length > 1 ? 's' : ''} Found
                </Text>
                {searchResults.filterStats && (
                  <Text style={styles.priceRange}>
                    Starting from {searchResults.query.currency} {searchResults.filterStats.minPrice}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

      {/* Flight List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {sortedOffers.map((offer) => (
          <FlightCard
            key={offer.id}
            offer={offer}
            onPress={() => handleSelectOffer(offer)}
          />
        ))}
        <View style={styles.footer} />
      </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a73e8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    padding: spacing.xl,
  },
  headerGradient: {
    backgroundColor: '#1a73e8',
    paddingBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButtonSmall: {
    marginRight: spacing.sm + spacing.xs,
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: fs(24),
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: fs(19),
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: fs(13),
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs / 2,
  },
  summary: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + spacing.xs,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryIcon: {
    fontSize: fs(24),
  },
  summaryText: {
    fontSize: fs(16),
    fontWeight: 'bold',
    color: '#ffffff',
  },
  priceRange: {
    fontSize: fs(13),
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs / 2,
  },
  scrollView: {
    flex: 1,
    paddingTop: spacing.md,
  },
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: '#ffffff',
    borderRadius: wp(16),
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm + spacing.xs,
  },
  badgeBest: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: spacing.sm + spacing.xs,
    paddingVertical: spacing.xs + 2,
    borderRadius: wp(12),
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  badgeCheap: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: spacing.sm + spacing.xs,
    paddingVertical: spacing.xs + 2,
    borderRadius: wp(12),
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  badgeFast: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: spacing.sm + spacing.xs,
    paddingVertical: spacing.xs + 2,
    borderRadius: wp(12),
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  badgeTextBest: {
    fontSize: fs(11),
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  badgeTextCheap: {
    fontSize: fs(11),
    fontWeight: 'bold',
    color: '#1565c0',
  },
  badgeTextFast: {
    fontSize: fs(11),
    fontWeight: 'bold',
    color: '#e65100',
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#f0f4ff',
    borderRadius: wp(12),
  },
  price: {
    fontSize: fs(28),
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  priceLabel: {
    fontSize: fs(12),
    color: '#5f6368',
    marginTop: spacing.xs / 2,
  },
  flightInfo: {
    marginBottom: spacing.md,
  },
  flightLabel: {
    fontSize: fs(13),
    fontWeight: 'bold',
    color: '#1a73e8',
    marginBottom: spacing.sm,
  },
  flightRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm + spacing.xs,
  },
  timeInfo: {
    alignItems: 'center',
  },
  time: {
    fontSize: fs(20),
    fontWeight: 'bold',
    color: '#202124',
  },
  airport: {
    fontSize: fs(13),
    fontWeight: '600',
    color: '#1a73e8',
    marginTop: spacing.xs,
  },
  routeLine: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.sm + spacing.xs,
  },
  duration: {
    fontSize: fs(12),
    fontWeight: '600',
    color: '#5f6368',
    marginBottom: spacing.xs / 2,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: '#1a73e8',
  },
  lineDot: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: '#1a73e8',
  },
  stopsContainer: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: wp(8),
    marginTop: spacing.xs,
  },
  stops: {
    fontSize: fs(11),
    fontWeight: '600',
    color: '#174ea6',
  },
  airlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafbfc',
    padding: spacing.sm,
    borderRadius: wp(8),
  },
  airlineIcon: {
    fontSize: fs(16),
    marginRight: spacing.sm,
  },
  airlineName: {
    fontSize: fs(14),
    fontWeight: '500',
    color: '#202124',
    flex: 1,
  },
  airlineNote: {
    fontSize: fs(12),
    color: '#5f6368',
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#e8eaed',
    marginVertical: spacing.md,
  },
  detailsButtonContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#e8eaed',
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: fs(14),
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fs(18),
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  loadingSubtext: {
    marginTop: spacing.sm,
    fontSize: fs(14),
    color: '#5f6368',
  },
  errorIcon: {
    fontSize: fs(64),
    marginBottom: spacing.md,
  },
  errorTitle: {
    fontSize: fs(24),
    fontWeight: 'bold',
    color: '#c5221f',
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: fs(15),
    color: '#5f6368',
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  noResultsIcon: {
    fontSize: fs(64),
    marginBottom: spacing.md,
  },
  noResultsTitle: {
    fontSize: fs(24),
    fontWeight: 'bold',
    color: '#202124',
    marginBottom: spacing.sm,
  },
  noResultsMessage: {
    fontSize: fs(15),
    color: '#5f6368',
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  backButton: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: wp(12),
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: fs(16),
    fontWeight: 'bold',
  },
  footer: {
    height: spacing.xl,
  },
});
