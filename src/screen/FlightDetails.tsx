import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useFlightState } from '../state/flight.state';
import { FlightSegment } from '../types/flight';
import { wp, fs, spacing } from '../utils/responsive';

type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  FlightSearch: undefined;
  FlightResults: undefined;
  FlightDetails: { offerId: string };
};

type FlightDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'FlightDetails'
>;

type FlightDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'FlightDetails'
>;

interface FlightDetailsScreenProps {
  navigation: FlightDetailsScreenNavigationProp;
  route: FlightDetailsScreenRouteProp;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

// const formatDate = (dateString: string): string => {
//   const date = new Date(dateString);
//   return date.toLocaleDateString('en-US', {
//     weekday: 'short',
//     month: 'short',
//     day: 'numeric',
//   });
// };

const SegmentCard: React.FC<{ segment: FlightSegment; isLast: boolean }> = ({
  segment,
  isLast,
}) => {
  return (
    <View style={styles.segmentCard}>
      <View style={styles.segmentHeader}>
        <View>
          <Text style={styles.airlineName}>{segment.airline.name}</Text>
          <Text style={styles.flightNumber}>Flight {segment.flightNumber}</Text>
        </View>
        <Text style={styles.segmentDuration}>
          {formatDuration(segment.duration)}
        </Text>
      </View>

      <View style={styles.segmentRoute}>
        <View style={styles.segmentPoint}>
          <Text style={styles.segmentTime}>
            {formatTime(segment.departure)}
          </Text>
          <Text style={styles.segmentAirport}>{segment.origin.airport}</Text>
          <Text style={styles.segmentCode}>{segment.origin.displayCode}</Text>
        </View>

        <View style={styles.segmentLine}>
          <View style={styles.dot} />
          <View style={styles.line} />
          <View style={styles.dot} />
        </View>

        <View style={styles.segmentPoint}>
          <Text style={styles.segmentTime}>{formatTime(segment.arrival)}</Text>
          <Text style={styles.segmentAirport}>
            {segment.destination.airport}
          </Text>
          <Text style={styles.segmentCode}>
            {segment.destination.displayCode}
          </Text>
        </View>
      </View>

      {segment.aircraft && (
        <Text style={styles.aircraftInfo}>Aircraft: {segment.aircraft}</Text>
      )}

      <Text style={styles.cabinClass}>Cabin: {segment.cabinClass}</Text>

      {!isLast && segment.stops > 0 && (
        <View style={styles.layover}>
          <Text style={styles.layoverText}>Layover</Text>
        </View>
      )}
    </View>
  );
};

export const FlightDetailsScreen: React.FC<FlightDetailsScreenProps> = ({
  navigation,
}) => {
  const { selectedOffer } = useFlightState();

  if (!selectedOffer) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Flight details not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBookFlight = async () => {
    if (selectedOffer.deepLink) {
      try {
        await Linking.openURL(selectedOffer.deepLink);
      } catch (error) {
        console.error('Failed to open booking link:', error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonSmall}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Flight Details</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceLabel}>Total Price</Text>
                <Text style={styles.price}>
                  {selectedOffer.price.formatted}
                </Text>
              </View>
              {selectedOffer.agent && (
                <View style={styles.agentInfo}>
                  <Text style={styles.agentLabel}>Booking via</Text>
                  <Text style={styles.agentName}>
                    {selectedOffer.agent.name}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Outbound Flight</Text>
            <View style={styles.sectionContent}>
              {selectedOffer.outbound.segments.map((segment, index) => (
                <SegmentCard
                  key={segment.id}
                  segment={segment}
                  isLast={index === selectedOffer.outbound.segments.length - 1}
                />
              ))}
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Duration</Text>
              <Text style={styles.summaryValue}>
                {formatDuration(selectedOffer.outbound.totalDuration)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Stops</Text>
              <Text style={styles.summaryValue}>
                {selectedOffer.outbound.stops === 0
                  ? 'Nonstop'
                  : `${selectedOffer.outbound.stops} stop${
                      selectedOffer.outbound.stops > 1 ? 's' : ''
                    }`}
              </Text>
            </View>
          </View>

          {selectedOffer.inbound && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Return Flight</Text>
              <View style={styles.sectionContent}>
                {selectedOffer.inbound.segments.map((segment, index) => (
                  <SegmentCard
                    key={segment.id}
                    segment={segment}
                    isLast={
                      index === selectedOffer.inbound!.segments.length - 1
                    }
                  />
                ))}
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Duration</Text>
                <Text style={styles.summaryValue}>
                  {formatDuration(selectedOffer.inbound.totalDuration)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Stops</Text>
                <Text style={styles.summaryValue}>
                  {selectedOffer.inbound.stops === 0
                    ? 'Nonstop'
                    : `${selectedOffer.inbound.stops} stop${
                        selectedOffer.inbound.stops > 1 ? 's' : ''
                      }`}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.footer} />
        </ScrollView>

        <View style={styles.bookingBar}>
          <View>
            <Text style={styles.bookingLabel}>Total</Text>
            <Text style={styles.bookingPrice}>
              {selectedOffer.price.formatted}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookFlight}
          >
            <Text style={styles.bookButtonText}>Book Flight</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButtonSmall: {
    marginRight: spacing.sm + spacing.xs,
  },
  backIcon: {
    fontSize: fs(24),
    color: '#1a73e8',
  },
  headerTitle: {
    fontSize: fs(20),
    fontWeight: 'bold',
    color: '#202124',
  },
  scrollView: {
    flex: 1,
  },
  priceCard: {
    margin: spacing.md,
    padding: spacing.lg,
    backgroundColor: '#fff',
    borderRadius: wp(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: fs(14),
    color: '#5f6368',
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: fs(32),
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  agentInfo: {
    alignItems: 'flex-end',
  },
  agentLabel: {
    fontSize: fs(12),
    color: '#5f6368',
    marginBottom: spacing.xs,
  },
  agentName: {
    fontSize: fs(14),
    fontWeight: '600',
    color: '#202124',
  },
  section: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fs(18),
    fontWeight: 'bold',
    color: '#202124',
    marginBottom: spacing.sm + spacing.xs,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: wp(12),
    padding: spacing.md,
  },
  segmentCard: {
    marginBottom: spacing.lg,
  },
  segmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  airlineName: {
    fontSize: fs(16),
    fontWeight: 'bold',
    color: '#202124',
  },
  flightNumber: {
    fontSize: fs(12),
    color: '#5f6368',
    marginTop: spacing.xs / 2,
  },
  segmentDuration: {
    fontSize: fs(14),
    fontWeight: '600',
    color: '#5f6368',
  },
  segmentRoute: {
    flexDirection: 'row',
    marginBottom: spacing.sm + spacing.xs,
  },
  segmentPoint: {
    flex: 1,
  },
  segmentTime: {
    fontSize: fs(20),
    fontWeight: 'bold',
    color: '#202124',
    marginBottom: spacing.xs,
  },
  segmentAirport: {
    fontSize: fs(14),
    color: '#5f6368',
    marginBottom: spacing.xs / 2,
  },
  segmentCode: {
    fontSize: fs(16),
    fontWeight: '600',
    color: '#1a73e8',
  },
  segmentLine: {
    width: wp(60),
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  dot: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: '#1a73e8',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: '#dadce0',
    marginVertical: spacing.xs,
  },
  aircraftInfo: {
    fontSize: fs(12),
    color: '#5f6368',
    marginBottom: spacing.xs,
  },
  cabinClass: {
    fontSize: fs(12),
    color: '#5f6368',
    textTransform: 'capitalize',
  },
  layover: {
    marginTop: spacing.sm + spacing.xs,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: '#fef7e0',
    borderRadius: wp(4),
  },
  layoverText: {
    fontSize: fs(12),
    fontWeight: '600',
    color: '#f9ab00',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#f8f9fa',
    marginTop: spacing.sm,
    borderRadius: wp(8),
  },
  summaryLabel: {
    fontSize: fs(14),
    color: '#5f6368',
  },
  summaryValue: {
    fontSize: fs(14),
    fontWeight: '600',
    color: '#202124',
  },
  bookingBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  bookingLabel: {
    fontSize: fs(14),
    color: '#5f6368',
    marginBottom: spacing.xs,
  },
  bookingPrice: {
    fontSize: fs(24),
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  bookButton: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: wp(8),
  },
  bookButtonText: {
    color: '#fff',
    fontSize: fs(16),
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: fs(18),
    color: '#c5221f',
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + spacing.xs,
    borderRadius: wp(8),
  },
  backButtonText: {
    color: '#fff',
    fontSize: fs(16),
    fontWeight: '600',
  },
  footer: {
    height: spacing.xl,
  },
});
