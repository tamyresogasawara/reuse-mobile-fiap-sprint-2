import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MainTabs } from './src/navigation/MainTabs';
import { DetailScreen } from './src/screens/DetailScreen';
import { MyListingsScreen } from './src/screens/MyListingsScreen';
import type { RootStackParams } from './src/navigation/types';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { AppProvider } from './src/state/AppContext';
import { colors } from './src/theme';
import { ImpactScreen } from './src/screens/ImpactScreen';
import { useReducedMotion } from './src/motion/useReducedMotion';
import { motionSpecs } from './src/motion/specs';

const Stack = createNativeStackNavigator<RootStackParams>();

export default function App() {
  const reducedMotion = useReducedMotion();
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Welcome" screenOptions={{ animation: reducedMotion === false ? 'fade_from_bottom' : 'none', animationDuration: reducedMotion === false ? motionSpecs.navigationTransition.durationIOS : 0, headerShown: false, contentStyle: { backgroundColor: colors.paper } }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Detail" component={DetailScreen} />
            <Stack.Screen name="MyListings" component={MyListingsScreen} />
            <Stack.Screen name="Impact" component={ImpactScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
