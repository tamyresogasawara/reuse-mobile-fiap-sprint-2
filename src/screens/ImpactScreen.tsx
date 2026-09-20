import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { calculateImpact, impactRules } from '../gamification/impact';
import type { RootStackParams } from '../navigation/types';
import { useReducedMotion } from '../motion/useReducedMotion';
import { motionSpecs } from '../motion/specs';
import { useApp } from '../state/AppContext';
import { colors, radii } from '../theme';

type Props = NativeStackScreenProps<RootStackParams, 'Impact'>;

export function ImpactScreen({ navigation }: Props) {
  const { favorites, listings } = useApp();
  const impact = calculateImpact({ favorites: favorites.length, listings: listings.length });
  const reducedMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(reducedMotion ? impact.progress : 0)).current;

  useEffect(() => {
    if (reducedMotion === null) return;
    if (reducedMotion) {
      progress.setValue(impact.progress);
      return;
    }
    const animation = Animated.timing(progress, { toValue: impact.progress, duration: motionSpecs.progressFill.duration, delay: motionSpecs.progressFill.delay, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [impact.progress, progress, reducedMotion]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const nextPoints = impact.level.nextAt === null ? 'Nível máximo desta demonstração' : `${impact.level.nextAt - impact.points} pontos para o próximo nível`;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.toolbar}><Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.brand}>ReUse</Text><View style={styles.backPlaceholder} /></View>
        <Text style={styles.eyebrow}>MEU IMPACTO</Text><Text style={styles.title}>Sua jornada circular</Text><Text style={styles.copy}>Reconhecimento por escolhas reais que mantêm objetos em uso — sem ranking, pressão ou compra obrigatória.</Text>
        <View style={styles.hero}>
          <Text accessibilityRole="header" style={styles.points}>{impact.points} pontos de impacto</Text><Text style={styles.level}>Nível {impact.level.name}</Text>
          <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(impact.progress * 100) }} style={styles.track}><Animated.View style={[styles.fill, { width }]} /></View>
          <Text style={styles.next}>{nextPoints}</Text>
        </View>

        <Text style={styles.section}>MISSÕES COM PROPÓSITO</Text>
        {impact.missions.map((mission) => (
          <View key={mission.title} style={styles.card}>
            <View style={styles.cardTop}><Text style={styles.cardTitle}>{mission.title}</Text><Text style={[styles.status, mission.complete && styles.statusDone]}>{mission.complete ? 'CONCLUÍDA' : `+${mission.points} PTS`}</Text></View>
            <Text style={styles.cardCopy}>{mission.description}</Text><Text style={styles.cardProgress}>{mission.current} de {mission.target}</Text>
          </View>
        ))}

        <Text style={styles.section}>MEDALHAS</Text>
        <View style={styles.badges}>{impact.badges.map((badge) => <View accessibilityState={{ disabled: !badge.unlocked }} key={badge.title} style={[styles.badge, !badge.unlocked && styles.badgeLocked]}><Text style={styles.badgeIcon}>{badge.unlocked ? '◆' : '◇'}</Text><Text style={styles.badgeTitle}>{badge.title}</Text><Text style={styles.badgeCopy}>{badge.description}</Text></View>)}</View>

        <View style={styles.rules}><Text style={styles.rulesTitle}>Como os pontos funcionam</Text><Text style={styles.rulesCopy}>Favorito único: {impactRules.favorite} pontos · anúncio persistido: {impactRules.listing} pontos.</Text><Text style={styles.rulesCopy}>{impactRules.fairness}</Text><Text style={styles.rulesCopy}>Sequência consciente: a constância é apresentada como reflexão semanal, sem punição por pausas. Dados permanecem neste dispositivo.</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.paper, flex: 1 }, page: { marginHorizontal: 'auto', maxWidth: 620, paddingBottom: 40, paddingHorizontal: 18, width: '100%' }, toolbar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }, back: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 22, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 }, backText: { color: colors.ink, fontSize: 32, lineHeight: 34 }, backPlaceholder: { width: 44 }, brand: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  eyebrow: { color: colors.forest, fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginTop: 10 }, title: { color: colors.ink, fontSize: 32, fontWeight: '900', letterSpacing: -0.9, marginTop: 5 }, copy: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 8 },
  hero: { backgroundColor: colors.forest, borderRadius: radii.lg, marginTop: 20, padding: 22 }, points: { color: colors.surface, fontSize: 25, fontWeight: '900' }, level: { color: colors.leaf, fontSize: 12, fontWeight: '900', letterSpacing: 0.8, marginTop: 6 }, track: { backgroundColor: '#31553E', borderRadius: 7, height: 12, marginTop: 20, overflow: 'hidden' }, fill: { backgroundColor: colors.leaf, borderRadius: 7, height: 12 }, next: { color: '#D4DED7', fontSize: 11, marginTop: 8 },
  section: { color: colors.forest, fontSize: 9, fontWeight: '900', letterSpacing: 1.3, marginBottom: 8, marginTop: 24 }, card: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radii.md, borderWidth: 1, marginBottom: 9, padding: 15 }, cardTop: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'space-between' }, cardTitle: { color: colors.ink, flex: 1, fontSize: 14, fontWeight: '900' }, status: { backgroundColor: colors.softGreen, borderRadius: 12, color: colors.forest, fontSize: 8, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 5 }, statusDone: { backgroundColor: colors.leaf }, cardCopy: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 6 }, cardProgress: { color: colors.forest, fontSize: 10, fontWeight: '900', marginTop: 8 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, badge: { backgroundColor: colors.leaf, borderRadius: radii.md, minHeight: 150, padding: 14, width: '48%' }, badgeLocked: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, opacity: 0.62 }, badgeIcon: { color: colors.forest, fontSize: 24 }, badgeTitle: { color: colors.ink, fontSize: 13, fontWeight: '900', marginTop: 8 }, badgeCopy: { color: colors.muted, fontSize: 10, lineHeight: 14, marginTop: 5 },
  rules: { backgroundColor: colors.softGreen, borderRadius: radii.md, marginTop: 24, padding: 17 }, rulesTitle: { color: colors.forest, fontSize: 15, fontWeight: '900' }, rulesCopy: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 7 },
});
