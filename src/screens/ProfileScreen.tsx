import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParams } from '../navigation/types';
import { useApp } from '../state/AppContext';
import { colors, radii } from '../theme';

export function ProfileScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const { favorites, listings } = useApp();
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.eyebrow}>PERFIL</Text><Text style={styles.title}>Seu espaço ReUse</Text>
        <View style={styles.profile}><View style={styles.avatar}><Text style={styles.avatarText}>T</Text></View><View><Text style={styles.name}>Tamy</Text><Text style={styles.location}>Santos, SP · membro desde 2026</Text></View></View>
        <View style={styles.stats}><View style={styles.stat}><Text style={styles.statNumber}>{listings.length}</Text><Text style={styles.statLabel}>anúncios</Text></View><View style={styles.divider} /><View style={styles.stat}><Text style={styles.statNumber}>{favorites.length}</Text><Text style={styles.statLabel}>favoritos</Text></View><View style={styles.divider} /><View style={styles.stat}><Text style={styles.statNumber}>0</Text><Text style={styles.statLabel}>trocas</Text></View></View>
        <Text style={styles.section}>MINHA CONTA</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir meus anúncios" onPress={() => navigation.navigate('MyListings')} style={styles.row}><View style={styles.rowIcon}><Text>▣</Text></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>Meus anúncios</Text><Text style={styles.rowSub}>Gerencie itens publicados neste dispositivo</Text></View><Text style={styles.chevron}>›</Text></Pressable>
        <View style={styles.row}><View style={styles.rowIcon}><Text>♧</Text></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>Meu impacto</Text><Text style={styles.rowSub}>Acompanhe escolhas que evitam descarte</Text></View><Text style={styles.chevron}>›</Text></View>
        <View style={styles.privacy}><Text style={styles.privacyTitle}>Privacidade em primeiro lugar</Text><Text style={styles.privacyCopy}>Esta demonstração não envia dados pessoais. Favoritos, rascunhos e anúncios ficam somente no armazenamento local.</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.paper, flex: 1 }, page: { marginHorizontal: 'auto', maxWidth: 620, paddingBottom: 110, paddingHorizontal: 18, paddingTop: 18, width: '100%' }, eyebrow: { color: colors.forest, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 }, title: { color: colors.ink, fontSize: 30, fontWeight: '900', letterSpacing: -0.8, marginTop: 5 },
  profile: { alignItems: 'center', backgroundColor: colors.forest, borderRadius: radii.lg, flexDirection: 'row', marginTop: 22, padding: 20 }, avatar: { alignItems: 'center', backgroundColor: colors.leaf, borderRadius: 32, height: 64, justifyContent: 'center', marginRight: 15, width: 64 }, avatarText: { color: colors.forest, fontSize: 23, fontWeight: '900' }, name: { color: colors.surface, fontSize: 20, fontWeight: '900' }, location: { color: '#C7D3CB', fontSize: 11, marginTop: 4 },
  stats: { backgroundColor: colors.surface, borderRadius: radii.md, flexDirection: 'row', justifyContent: 'space-around', marginTop: 12, paddingVertical: 18 }, stat: { alignItems: 'center', flex: 1 }, statNumber: { color: colors.ink, fontSize: 22, fontWeight: '900' }, statLabel: { color: colors.muted, fontSize: 10, marginTop: 3 }, divider: { backgroundColor: colors.line, width: 1 }, section: { color: colors.forest, fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginBottom: 7, marginTop: 24 },
  row: { alignItems: 'center', backgroundColor: colors.surface, borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: 'row', minHeight: 72, paddingHorizontal: 14 }, rowIcon: { alignItems: 'center', backgroundColor: colors.softGreen, borderRadius: 17, height: 34, justifyContent: 'center', marginRight: 12, width: 34 }, rowCopy: { flex: 1 }, rowTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' }, rowSub: { color: colors.muted, fontSize: 10, marginTop: 3 }, chevron: { color: colors.forest, fontSize: 24 }, privacy: { backgroundColor: colors.softGreen, borderRadius: radii.md, marginTop: 22, padding: 17 }, privacyTitle: { color: colors.forest, fontSize: 13, fontWeight: '900' }, privacyCopy: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 5 },
});
