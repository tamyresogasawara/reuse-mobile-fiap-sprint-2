import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Item } from '../data/items';
import { colors, radii } from '../theme';

type Props = { item: Item; onPress: () => void };

export function ProductCard({ item, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver ${item.title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.image, { backgroundColor: item.accent }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
        <View style={styles.tag}><Text style={styles.tagText}>{item.condition}</Text></View>
      </View>
      <Text style={styles.category}>{item.category.toUpperCase()}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.price}>R$ {item.price}</Text>
      <Text style={styles.city}>{item.city}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: '48%', marginBottom: 18 },
  pressed: { opacity: 0.74 },
  image: { alignItems: 'center', borderRadius: radii.md, height: 142, justifyContent: 'center', marginBottom: 10, overflow: 'hidden' },
  emoji: { fontSize: 54 },
  tag: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, bottom: 8, left: 8, paddingHorizontal: 8, paddingVertical: 4, position: 'absolute' },
  tagText: { color: colors.forest, fontSize: 9, fontWeight: '800' },
  category: { color: colors.forest, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  title: { color: colors.ink, fontSize: 15, fontWeight: '800', marginTop: 4 },
  price: { color: colors.ink, fontSize: 16, fontWeight: '900', marginTop: 5 },
  city: { color: colors.muted, fontSize: 11, marginTop: 3 },
});
