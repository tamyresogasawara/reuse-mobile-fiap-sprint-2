import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParams } from '../navigation/types';
import { loadProducts, type Product, type ProductsResult } from '../services/products';
import { colors, radii } from '../theme';

type Props = NativeStackScreenProps<RootStackParams, 'Explore'>;

const sourceCopy: Record<ProductsResult['source'], string> = {
  network: 'Dados atualizados pela API',
  cache: 'Dados carregados do cache local',
  'stale-cache': 'Sem conexão — exibindo o último cache disponível',
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
}

export function ExploreScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [source, setSource] = useState<ProductsResult['source'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCatalog = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError('');
    try {
      const result = await loadProducts({ forceRefresh });
      setProducts(result.products);
      setSource(result.source);
    } catch {
      setError('Não foi possível carregar os itens. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Voltar para o início" onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.headerTitle}>Catálogo online</Text><View style={styles.spacer} /></View>
        <Text style={styles.eyebrow}>API + CACHE LOCAL</Text>
        <Text style={styles.title}>Itens disponíveis agora.</Text>
        <Text style={styles.copy}>Produtos recebidos da API pública DummyJSON e adaptados para o catálogo ReUse.</Text>
        {source ? <Text accessibilityLiveRegion="polite" style={[styles.source, source === 'stale-cache' && styles.sourceOffline]}>{sourceCopy[source]}</Text> : null}

        {loading ? (
          <View style={styles.state}><ActivityIndicator color={colors.forest} size="large" /><Text style={styles.stateText}>Carregando catálogo…</Text></View>
        ) : error ? (
          <View style={styles.state}>
            <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Tentar novamente" onPress={() => loadCatalog(true)} style={styles.button}><Text style={styles.buttonText}>Tentar novamente</Text><Text style={styles.arrow}>↻</Text></Pressable>
          </View>
        ) : (
          <View testID="api-products" style={styles.list}>
            {products.map((product) => (
              <View key={product.id} testID="api-product-card" style={styles.card}>
                {product.thumbnail ? <Image accessibilityIgnoresInvertColors source={{ uri: product.thumbnail }} style={styles.image} /> : <View style={styles.image} />}
                <View style={styles.cardCopy}>
                  <Text style={styles.category}>{product.category.toUpperCase()}</Text>
                  <Text style={styles.itemTitle}>{product.title}</Text>
                  <Text numberOfLines={2} style={styles.description}>{product.description}</Text>
                  <Text style={styles.price}>{formatPrice(product.price)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {!error ? <Pressable accessibilityRole="button" accessibilityLabel="Atualizar catálogo" accessibilityState={{ disabled: loading }} disabled={loading} onPress={() => loadCatalog(true)} style={[styles.button, styles.refresh, loading && styles.disabled]}><Text style={styles.buttonText}>Atualizar catálogo</Text><Text style={styles.arrow}>↻</Text></Pressable> : null}
        <Text style={styles.footer}>API DUMMYJSON · CACHE LOCAL DE 15 MINUTOS</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.paper, flex: 1 }, page: { marginHorizontal: 'auto', maxWidth: 620, paddingBottom: 35, paddingHorizontal: 18, width: '100%' },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }, back: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 22, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 }, backText: { color: colors.ink, fontSize: 32, lineHeight: 34 }, headerTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' }, spacer: { width: 44 },
  eyebrow: { color: colors.forest, fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginTop: 12 }, title: { color: colors.ink, fontSize: 28, fontWeight: '900', letterSpacing: -0.7, marginTop: 5 }, copy: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  source: { alignSelf: 'flex-start', backgroundColor: colors.softGreen, borderRadius: 16, color: colors.forest, fontSize: 11, fontWeight: '800', marginTop: 14, overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 7 }, sourceOffline: { backgroundColor: '#FBEBD7', color: '#7A4A12' },
  state: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.lg, gap: 14, marginTop: 20, padding: 30 }, stateText: { color: colors.muted, fontSize: 13 }, error: { color: colors.danger, fontSize: 14, fontWeight: '700', lineHeight: 21, textAlign: 'center' },
  list: { marginTop: 20 }, card: { backgroundColor: colors.surface, borderRadius: radii.md, flexDirection: 'row', marginBottom: 12, overflow: 'hidden', padding: 10 }, image: { backgroundColor: colors.softGreen, borderRadius: 13, height: 96, width: 96 }, cardCopy: { flex: 1, justifyContent: 'center', paddingLeft: 14 },
  category: { color: colors.forest, fontSize: 8, fontWeight: '900', letterSpacing: 1 }, itemTitle: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 4 }, description: { color: colors.muted, fontSize: 11, lineHeight: 15, marginTop: 4 }, price: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 6 },
  button: { alignItems: 'center', alignSelf: 'stretch', backgroundColor: colors.forest, borderRadius: radii.md, flexDirection: 'row', justifyContent: 'space-between', minHeight: 54, paddingHorizontal: 20 }, refresh: { marginTop: 10 }, disabled: { opacity: 0.6 }, buttonText: { color: colors.surface, fontSize: 15, fontWeight: '900' }, arrow: { color: colors.leaf, fontSize: 20 },
  footer: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.2, marginTop: 26, textAlign: 'center' },
});
