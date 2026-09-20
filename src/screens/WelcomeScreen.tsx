import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii } from '../theme';
import type { RootStackParams } from '../navigation/types';
import { useReducedMotion } from '../motion/useReducedMotion';
import { motionSpecs } from '../motion/specs';

type Props = NativeStackScreenProps<RootStackParams, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const reducedMotion = useReducedMotion();
  const reveal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducedMotion === null) return;
    if (reducedMotion) reveal.setValue(1);
    else {
      const animation = Animated.timing(reveal, { toValue: 1, duration: motionSpecs.welcomeReveal.duration, delay: motionSpecs.welcomeReveal.delay, easing: Easing.out(Easing.cubic), useNativeDriver: true });
      animation.start();
      return () => animation.stop();
    }
  }, [reducedMotion, reveal]);

  const revealStyle = { opacity: reveal.interpolate({ inputRange: [0, 0.7, 1], outputRange: [motionSpecs.welcomeReveal.from.opacity, motionSpecs.welcomeReveal.midpoint.opacity, motionSpecs.welcomeReveal.to.opacity] }), transform: [{ translateY: reveal.interpolate({ inputRange: [0, 0.7, 1], outputRange: [motionSpecs.welcomeReveal.from.translateY, motionSpecs.welcomeReveal.midpoint.translateY, motionSpecs.welcomeReveal.to.translateY] }) }] };
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.paper} />
      <View style={styles.page}>
        <View style={styles.brandRow}><View style={styles.dot} /><Text style={styles.brand}>ReUse</Text><Text style={styles.sprint}>SPRINT 02</Text></View>
        <Animated.View style={[styles.art, revealStyle]} accessibilityLabel="Objetos circulando para um novo uso">
          <View style={styles.orbit}><Text style={styles.artEmoji}>↻</Text></View>
          <View style={styles.itemA}><Text style={styles.smallEmoji}>☕</Text></View>
          <View style={styles.itemB}><Text style={styles.smallEmoji}>🎒</Text></View>
          <View style={styles.itemC}><Text style={styles.smallEmoji}>📚</Text></View>
        </Animated.View>
        <Animated.View style={revealStyle}>
          <Text style={styles.eyebrow}>CONSUMO QUE CIRCULA</Text>
          <Text style={styles.title}>Dê uma nova história ao que já existe.</Text>
          <Text style={styles.copy}>Compre, venda ou troque itens com pessoas perto de você. Menos descarte, mais escolhas conscientes.</Text>
        </Animated.View>
        <Pressable accessibilityRole="button" accessibilityLabel="Começar a explorar" onPress={() => navigation.replace('Main')} style={styles.button}>
          <Text style={styles.buttonText}>Começar a explorar</Text><Text style={styles.arrow}>→</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.paper, flex: 1 },
  page: { flex: 1, justifyContent: 'space-between', marginHorizontal: 'auto', maxWidth: 520, paddingBottom: 24, paddingHorizontal: 22, paddingTop: 18, width: '100%' },
  brandRow: { alignItems: 'center', flexDirection: 'row' },
  dot: { backgroundColor: colors.leaf, borderColor: colors.forest, borderRadius: 9, borderWidth: 4, height: 18, marginRight: 9, width: 18 },
  brand: { color: colors.ink, fontSize: 25, fontWeight: '900', letterSpacing: -1 },
  sprint: { borderColor: colors.line, borderRadius: 18, borderWidth: 1, color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 6 },
  art: { alignItems: 'center', alignSelf: 'center', height: 260, justifyContent: 'center', position: 'relative', width: 290 },
  orbit: { alignItems: 'center', backgroundColor: colors.forest, borderRadius: 80, height: 150, justifyContent: 'center', width: 150 },
  artEmoji: { color: colors.leaf, fontSize: 74, fontWeight: '200' },
  itemA: { alignItems: 'center', backgroundColor: colors.leaf, borderRadius: 24, height: 65, justifyContent: 'center', left: 6, position: 'absolute', top: 30, transform: [{ rotate: '-8deg' }], width: 65 },
  itemB: { alignItems: 'center', backgroundColor: '#E7DED2', borderRadius: 24, bottom: 18, height: 70, justifyContent: 'center', position: 'absolute', right: 4, transform: [{ rotate: '9deg' }], width: 70 },
  itemC: { alignItems: 'center', backgroundColor: '#D8E5EC', borderRadius: 20, height: 56, justifyContent: 'center', position: 'absolute', right: 3, top: 20, width: 56 },
  smallEmoji: { fontSize: 28 },
  eyebrow: { color: colors.forest, fontSize: 10, fontWeight: '900', letterSpacing: 1.8, marginBottom: 12 },
  title: { color: colors.ink, fontSize: 40, fontWeight: '900', letterSpacing: -1.4, lineHeight: 44 },
  copy: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 14 },
  button: { alignItems: 'center', backgroundColor: colors.forest, borderRadius: radii.md, flexDirection: 'row', justifyContent: 'space-between', minHeight: 58, paddingHorizontal: 20 },
  buttonText: { color: colors.surface, fontSize: 16, fontWeight: '900' },
  arrow: { color: colors.leaf, fontSize: 25 },
});
