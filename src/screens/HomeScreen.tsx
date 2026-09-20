import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '../components/ProductCard';
import { items } from '../data/items';
import type { RootStackParams } from '../navigation/types';
import { colors } from '../theme';
import { useReducedMotion } from '../motion/useReducedMotion';
import { motionSpecs } from '../motion/specs';

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParams>>();
  const reducedMotion = useReducedMotion();
  const reveal = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reducedMotion === null) return;
    if (reducedMotion) reveal.setValue(1);
    else {
      const animation = Animated.timing(reveal, { toValue: 1, duration: motionSpecs.homeReveal.duration, delay: motionSpecs.homeReveal.delay, easing: Easing.out(Easing.cubic), useNativeDriver: true });
      animation.start();
      return () => animation.stop();
    }
  }, [reducedMotion, reveal]);
  const revealStyle = { opacity: reveal.interpolate({ inputRange: [0, 0.75, 1], outputRange: [motionSpecs.homeReveal.from.opacity, motionSpecs.homeReveal.midpoint.opacity, motionSpecs.homeReveal.to.opacity] }), transform: [{ translateY: reveal.interpolate({ inputRange: [0, 0.75, 1], outputRange: [motionSpecs.homeReveal.from.translateY, motionSpecs.homeReveal.midpoint.translateY, motionSpecs.homeReveal.to.translateY] }) }] };
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.top}><View><Text style={styles.greeting}>OLÁ, TAMY</Text><Text style={styles.title}>Descubra boas escolhas</Text></View><View style={styles.avatar}><Text style={styles.avatarText}>T</Text></View></View>
        <Animated.View style={[styles.impact, revealStyle]}><View><Text style={styles.impactLabel}>IMPACTO COLETIVO</Text><Text style={styles.impactNumber}>12.480</Text><Text style={styles.impactCopy}>itens ganharam uma nova história</Text></View><Text style={styles.impactMark}>↻</Text></Animated.View>
        <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Perto de você</Text><Text style={styles.link}>Ver todos</Text></View>
        <Animated.View style={[styles.grid, revealStyle]}>{items.map((item) => <ProductCard key={item.id} item={item} onPress={() => navigation.navigate('Detail', { itemId: item.id })} />)}</Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.paper, flex: 1 },
  page: { marginHorizontal: 'auto', maxWidth: 620, paddingBottom: 100, paddingHorizontal: 18, paddingTop: 16, width: '100%' },
  top: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  greeting: { color: colors.forest, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: colors.ink, fontSize: 28, fontWeight: '900', letterSpacing: -0.8, marginTop: 3 },
  avatar: { alignItems: 'center', backgroundColor: colors.leaf, borderRadius: 23, height: 46, justifyContent: 'center', width: 46 },
  avatarText: { color: colors.forest, fontSize: 16, fontWeight: '900' },
  impact: { backgroundColor: colors.forest, borderRadius: 24, flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, overflow: 'hidden', padding: 20 },
  impactLabel: { color: colors.leaf, fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  impactNumber: { color: colors.surface, fontSize: 32, fontWeight: '900', marginTop: 8 },
  impactCopy: { color: '#C9D7CE', fontSize: 12, marginTop: 2 },
  impactMark: { color: colors.leaf, fontSize: 70, opacity: 0.5 },
  sectionRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, marginTop: 26 },
  sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: '900' },
  link: { color: colors.forest, fontSize: 12, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
