import { Pressable, StyleSheet, Text, View } from 'react-native';

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

export function ActionButton({
  label,
  onPress,
  variant = 'primary',
}: ActionButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, !isPrimary && styles.secondaryLabel]}>
        {label}
      </Text>
      <Text aria-hidden style={[styles.arrow, !isPrimary && styles.secondaryLabel]}>
        →
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: '#173F2A',
  },
  secondary: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CED8D0',
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.78,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryLabel: {
    color: '#173F2A',
  },
  arrow: {
    color: '#D7FF78',
    fontSize: 22,
    fontWeight: '700',
  },
});
