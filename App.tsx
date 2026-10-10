import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MainTabs } from './src/navigation/MainTabs';
import { DetailScreen } from './src/screens/DetailScreen';
import { MyListingsScreen } from './src/screens/MyListingsScreen';
import type { RootStackParams } from './src/navigation/types';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { AppProvider } from './src/state/AppContext';
import { SessionProvider, useSession } from './src/state/SessionContext';
import { colors } from './src/theme';
import { ImpactScreen } from './src/screens/ImpactScreen';
import { useReducedMotion } from './src/motion/useReducedMotion';
import { motionSpecs } from './src/motion/specs';

const Stack = createNativeStackNavigator<RootStackParams>();

function RootNavigator() {
  const reducedMotion = useReducedMotion();
  const { session } = useSession();
  return (
    <Stack.Navigator screenOptions={{ animation: reducedMotion === false ? 'fade_from_bottom' : 'none', animationDuration: reducedMotion === false ? motionSpecs.navigationTransition.durationIOS : 0, headerShown: false, contentStyle: { backgroundColor: colors.paper } }}>
      {session ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Detail" component={DetailScreen} />
          <Stack.Screen name="Explore" component={ExploreScreen} />
          <Stack.Screen name="MyListings" component={MyListingsScreen} />
          <Stack.Screen name="Impact" component={ImpactScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <AppProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AppProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}
