import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { items } from '../data/items';
import type { RootStackParams } from '../navigation/types';
import { useApp } from '../state/AppContext';
import { colors, radii } from '../theme';

type Props = NativeStackScreenProps<RootStackParams, 'Detail'>;

export function DetailScreen({ navigation, route }: Props) {
  const item = items.find((candidate) => candidate.id === route.params.itemId) ?? items[0];
  const { favorites, toggleFavorite } = useApp();
  const [interested, setInterested] = useState(false);
  const isFavorite = favorites.includes(item.id);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.toolbar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => navigation.goBack()} style={styles.iconButton}><Text style={styles.icon}>‹</Text></Pressable>
          <Text style={styles.brand}>ReUse</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={`${isFavorite ? 'Remover' : 'Adicionar'} ${item.title} ${isFavorite ? 'dos' : 'aos'} favoritos`} onPress={() => toggleFavorite(item.id)} style={[styles.iconButton, isFavorite && styles.favorite]}><Text style={styles.heart}>{isFavorite ? '♥' : '♡'}</Text></Pressable>
        </View>
        <View style={[styles.hero, { backgroundColor: item.accent }]}><Text style={styles.emoji}>{item.emoji}</Text><View style={styles.condition}><Text style={styles.conditionText}>{item.condition}</Text></View></View>
        <Text style={styles.eyebrow}>Pronta para uma nova história</Text>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.priceRow}><Text style={styles.price}>R$ {item.price}</Text><Text style={styles.swap}>ACEITA TROCA</Text></View>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.meta}><Text style={styles.metaIcon}>⌖</Text><View><Text style={styles.metaLabel}>LOCALIZAÇÃO</Text><Text style={styles.metaValue}>{item.city}</Text></View></View>
        <View style={styles.owner}><View style={styles.avatar}><Text style={styles.avatarText}>M</Text></View><View><Text style={styles.metaLabel}>ANUNCIADO POR</Text><Text style={styles.ownerName}>Marina · 4,9 ★</Text></View></View>
        {interested ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.interestFeedback}>Interesse marcado neste dispositivo. Nenhuma mensagem foi enviada.</Text> : null}
        <Pressable accessibilityRole="button" accessibilityLabel={interested ? 'Interesse registrado' : 'Conversar sobre o item'} accessibilityState={{ disabled: interested }} disabled={interested} onPress={() => setInterested(true)} style={[styles.cta, interested && styles.ctaDisabled]}><Text style={styles.ctaText}>{interested ? 'Interesse registrado' : 'Tenho interesse'}</Text><Text style={styles.ctaArrow}>{interested ? '✓' : '→'}</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.paper, flex: 1 }, page: { marginHorizontal: 'auto', maxWidth: 620, paddingBottom: 28, paddingHorizontal: 18, width: '100%' },
  toolbar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  iconButton: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 22, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 },
  favorite: { backgroundColor: colors.leaf, borderColor: colors.forest }, icon: { color: colors.ink, fontSize: 32, lineHeight: 34 }, heart: { color: colors.forest, fontSize: 24 },
  brand: { color: colors.ink, fontSize: 20, fontWeight: '900' }, hero: { alignItems: 'center', borderRadius: 28, height: 330, justifyContent: 'center', marginTop: 4, position: 'relative' }, emoji: { fontSize: 112 },
  condition: { backgroundColor: colors.surface, borderRadius: 18, bottom: 14, left: 14, paddingHorizontal: 12, paddingVertical: 7, position: 'absolute' }, conditionText: { color: colors.forest, fontSize: 10, fontWeight: '900' },
  eyebrow: { color: colors.forest, fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginTop: 22 }, title: { color: colors.ink, fontSize: 30, fontWeight: '900', letterSpacing: -0.8, marginTop: 6 },
  priceRow: { alignItems: 'center', flexDirection: 'row', marginTop: 9 }, price: { color: colors.ink, fontSize: 24, fontWeight: '900' }, swap: { backgroundColor: colors.softGreen, borderRadius: 14, color: colors.forest, fontSize: 9, fontWeight: '900', marginLeft: 12, paddingHorizontal: 9, paddingVertical: 6 },
  description: { color: colors.muted, fontSize: 15, lineHeight: 23, marginTop: 16 }, meta: { alignItems: 'center', borderTopColor: colors.line, borderTopWidth: 1, flexDirection: 'row', marginTop: 20, paddingTop: 16 }, metaIcon: { color: colors.forest, fontSize: 26, marginRight: 12 }, metaLabel: { color: colors.muted, fontSize: 8, fontWeight: '900', letterSpacing: 1.1 }, metaValue: { color: colors.ink, fontSize: 14, fontWeight: '800', marginTop: 3 },
  owner: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, flexDirection: 'row', marginTop: 16, padding: 14 }, avatar: { alignItems: 'center', backgroundColor: colors.leaf, borderRadius: 22, height: 44, justifyContent: 'center', marginRight: 12, width: 44 }, avatarText: { color: colors.forest, fontWeight: '900' }, ownerName: { color: colors.ink, fontSize: 14, fontWeight: '800', marginTop: 3 },
  interestFeedback: { color: colors.forest, fontSize: 12, fontWeight: '700', lineHeight: 18, marginTop: 18 }, cta: { alignItems: 'center', backgroundColor: colors.forest, borderRadius: radii.md, flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, minHeight: 58, paddingHorizontal: 20 }, ctaDisabled: { opacity: 0.8 }, ctaText: { color: colors.surface, fontSize: 16, fontWeight: '900' }, ctaArrow: { color: colors.leaf, fontSize: 24 },
});
