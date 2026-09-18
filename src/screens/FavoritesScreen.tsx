import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '../components/ProductCard';
import { items } from '../data/items';
import type { RootStackParams } from '../navigation/types';
import { useApp } from '../state/AppContext';
import { colors, radii } from '../theme';

export function FavoritesScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const { favorites } = useApp();
  const saved = items.filter((item) => favorites.includes(item.id));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.eyebrow}>PARA REVER DEPOIS</Text>
        <Text style={styles.title}>Suas escolhas salvas</Text>
        <Text style={styles.copy}>Tudo o que chamou sua atenção, reunido em um só lugar.</Text>
        {saved.length ? <View style={styles.grid}>{saved.map((item) => <ProductCard key={item.id} item={item} onPress={() => navigation.navigate('Detail', { itemId: item.id })} />)}</View> : <View style={styles.empty}><Text style={styles.heart}>♡</Text><Text style={styles.emptyTitle}>Nenhum favorito ainda</Text><Text style={styles.emptyCopy}>Toque no coração de um item para encontrá-lo aqui.</Text></View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.paper, flex: 1 }, page: { marginHorizontal: 'auto', maxWidth: 620, paddingBottom: 110, paddingHorizontal: 18, paddingTop: 18, width: '100%' },
  eyebrow: { color: colors.forest, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 }, title: { color: colors.ink, fontSize: 30, fontWeight: '900', letterSpacing: -0.8, marginTop: 5 }, copy: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 24 }, empty: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.lg, marginTop: 30, padding: 38 }, heart: { color: colors.forest, fontSize: 52 }, emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '900', marginTop: 10 }, emptyCopy: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6, textAlign: 'center' },
});
