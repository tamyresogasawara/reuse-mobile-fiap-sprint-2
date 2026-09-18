import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '../components/ProductCard';
import { items } from '../data/items';
import type { RootStackParams } from '../navigation/types';
import { colors, radii } from '../theme';

const categories = ['Todos', 'Casa', 'Acessórios', 'Livros', 'Decoração'];

export function SearchScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  const filtered = useMemo(() => items.filter((item) => {
    const matchesText = `${item.title} ${item.category}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (category === 'Todos' || item.category === category);
  }), [category, query]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>BUSCA CONSCIENTE</Text>
        <Text style={styles.title}>Encontre o que merece continuar</Text>
        <View style={styles.inputWrap}><Text style={styles.searchIcon}>⌕</Text><TextInput accessibilityLabel="Buscar itens" placeholder="O que você procura?" placeholderTextColor="#7B877F" value={query} onChangeText={setQuery} style={styles.input} /></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{categories.map((label) => {
          const selected = category === label;
          return <Pressable key={label} accessibilityRole="button" accessibilityLabel={`Filtrar por ${label}`} accessibilityState={{ selected }} onPress={() => setCategory(label)} style={[styles.chip, selected && styles.chipActive]}><Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text></Pressable>;
        })}</ScrollView>
        <Text style={styles.result}>{filtered.length} {filtered.length === 1 ? 'item encontrado' : 'itens encontrados'}</Text>
        {filtered.length ? <View testID="search-results" style={styles.grid}>{filtered.map((item) => <ProductCard key={item.id} item={item} onPress={() => navigation.navigate('Detail', { itemId: item.id })} />)}</View> : <View style={styles.empty}><Text style={styles.emptyIcon}>⌕</Text><Text style={styles.emptyTitle}>Nenhum item por aqui</Text><Text style={styles.emptyCopy}>Tente outra palavra ou categoria.</Text></View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.paper, flex: 1 }, page: { marginHorizontal: 'auto', maxWidth: 620, paddingBottom: 110, paddingHorizontal: 18, paddingTop: 18, width: '100%' },
  eyebrow: { color: colors.forest, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 }, title: { color: colors.ink, fontSize: 30, fontWeight: '900', letterSpacing: -0.8, lineHeight: 34, marginTop: 5 },
  inputWrap: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radii.md, borderWidth: 1, flexDirection: 'row', marginTop: 22, minHeight: 54, paddingHorizontal: 15 }, searchIcon: { color: colors.forest, fontSize: 24, marginRight: 10 }, input: { color: colors.ink, flex: 1, fontSize: 15, outlineStyle: 'none' } as never,
  filters: { gap: 8, paddingVertical: 15 }, chip: { borderColor: colors.line, borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 }, chipActive: { backgroundColor: colors.forest, borderColor: colors.forest }, chipText: { color: colors.muted, fontSize: 11, fontWeight: '800' }, chipTextActive: { color: colors.surface },
  result: { color: colors.muted, fontSize: 11, fontWeight: '700', marginBottom: 14 }, grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }, empty: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.lg, marginTop: 20, padding: 36 }, emptyIcon: { color: colors.forest, fontSize: 44 }, emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '900', marginTop: 10 }, emptyCopy: { color: colors.muted, fontSize: 13, marginTop: 5 },
});
