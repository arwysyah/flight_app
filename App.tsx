import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
import { FlightProvider } from './src/state/flight.state';
import { SignInScreen } from './src/screen/SignIn';
import { SignUpScreen } from './src/screen/SignUp';
import { FlightSearchScreen } from './src/screen/FlightSearch';
import { FlightResultsScreen } from './src/screen/FlightResults';
import { FlightDetailsScreen } from './src/screen/FlightDetails';
import { RootStackParamList } from './src/types/navigation';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppContent: React.FC = React.memo(() => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="FlightSearch" component={FlightSearchScreen} />
          <Stack.Screen name="FlightResults" component={FlightResultsScreen} />
          <Stack.Screen name="FlightDetails" component={FlightDetailsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
});

AppContent.displayName = 'AppContent';

export default function App() {
  return (
    <AuthProvider>
      <FlightProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </FlightProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});
