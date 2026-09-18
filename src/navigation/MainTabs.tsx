import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { CreateListingScreen } from '../screens/CreateListingScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { colors } from '../theme';

export type MainTabParams = { Início: undefined; Buscar: undefined; Anunciar: undefined; Favoritos: undefined; Perfil: undefined };
const Tab = createBottomTabNavigator<MainTabParams>();
const icons: Record<keyof MainTabParams, string> = { Início: '⌂', Buscar: '⌕', Anunciar: '+', Favoritos: '♡', Perfil: '○' };

export function MainTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.forest,
      tabBarInactiveTintColor: '#7D8A81',
      tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 23 }}>{icons[route.name]}</Text>,
      tabBarLabelStyle: { fontSize: 10, fontWeight: '800' },
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line, height: 70, paddingBottom: 10, paddingTop: 7 },
    })}>
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Buscar" component={SearchScreen} />
      <Tab.Screen name="Anunciar" component={CreateListingScreen} />
      <Tab.Screen name="Favoritos" component={FavoritesScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
