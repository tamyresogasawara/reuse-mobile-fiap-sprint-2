import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParams } from '../navigation/types';
import { useApp } from '../state/AppContext';
import { colors, radii } from '../theme';

type Props = NativeStackScreenProps<RootStackParams, 'MyListings'>;

export function MyListingsScreen({ navigation }: Props) {
  const { listings } = useApp();
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Voltar ao perfil" onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.headerTitle}>Meus anúncios</Text><View style={styles.spacer} /></View>
        <Text style={styles.eyebrow}>ITENS LOCAIS</Text><Text style={styles.title}>{listings.length ? `${listings.length} ${listings.length === 1 ? 'item publicado' : 'itens publicados'}` : 'Pronto para desapegar?'}</Text>
        {listings.length ? listings.map((listing) => <View key={listing.id} style={styles.card}>{listing.photoUri ? <Image source={{ uri: listing.photoUri }} style={styles.image} /> : <View style={styles.image} />}<View style={styles.cardCopy}><Text style={styles.status}>ATIVO</Text><Text style={styles.itemTitle}>{listing.title}</Text><Text style={styles.price}>R$ {listing.price}</Text><Text style={styles.saved}>Salvo neste dispositivo</Text></View></View>) : <View style={styles.empty}><Text style={styles.emptyIcon}>+</Text><Text style={styles.emptyTitle}>Seu próximo item pode circular</Text><Text style={styles.emptyCopy}>Crie um anúncio pela aba Anunciar.</Text></View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.paper, flex: 1 }, page: { marginHorizontal: 'auto', maxWidth: 620, paddingBottom: 35, paddingHorizontal: 18, width: '100%' }, header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }, back: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 22, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 }, backText: { color: colors.ink, fontSize: 32, lineHeight: 34 }, headerTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' }, spacer: { width: 44 },
  eyebrow: { color: colors.forest, fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginTop: 12 }, title: { color: colors.ink, fontSize: 28, fontWeight: '900', letterSpacing: -0.7, marginBottom: 20, marginTop: 5 }, card: { backgroundColor: colors.surface, borderRadius: radii.md, flexDirection: 'row', marginBottom: 12, overflow: 'hidden', padding: 10 }, image: { backgroundColor: colors.softGreen, borderRadius: 13, height: 110, width: 110 }, cardCopy: { flex: 1, justifyContent: 'center', paddingLeft: 14 }, status: { color: colors.forest, fontSize: 8, fontWeight: '900', letterSpacing: 1 }, itemTitle: { color: colors.ink, fontSize: 16, fontWeight: '900', marginTop: 5 }, price: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 5 }, saved: { color: colors.muted, fontSize: 9, marginTop: 6 }, empty: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.lg, padding: 38 }, emptyIcon: { color: colors.forest, fontSize: 50 }, emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '900', marginTop: 8 }, emptyCopy: { color: colors.muted, fontSize: 12, marginTop: 5 },
});
