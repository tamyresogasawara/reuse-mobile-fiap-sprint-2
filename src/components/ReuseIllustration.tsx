import { StyleSheet, Text, View } from 'react-native';

export function ReuseIllustration() {
  return (
    <View accessibilityLabel="Ilustração de um item ganhando uma nova vida" style={styles.canvas}>
      <View style={styles.sun} />
      <View style={styles.product}>
        <View style={styles.productTop} />
        <View style={styles.productBody}>
          <Text style={styles.productMark}>R</Text>
        </View>
      </View>
      <View style={styles.loop}>
        <Text style={styles.loopText}>↻</Text>
      </View>
      <View style={styles.ground} />
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    alignItems: 'center',
    backgroundColor: '#D7FF78',
    borderRadius: 26,
    height: 238,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  sun: {
    backgroundColor: '#F4FFD7',
    borderRadius: 70,
    height: 140,
    position: 'absolute',
    right: -28,
    top: -34,
    width: 140,
  },
  product: {
    alignItems: 'center',
    marginTop: 10,
    zIndex: 2,
  },
  productTop: {
    backgroundColor: '#173F2A',
    borderRadius: 5,
    height: 16,
    marginBottom: 4,
    width: 68,
  },
  productBody: {
    alignItems: 'center',
    backgroundColor: '#F8FAF5',
    borderColor: '#173F2A',
    borderRadius: 14,
    borderWidth: 4,
    height: 112,
    justifyContent: 'center',
    width: 96,
  },
  productMark: {
    color: '#173F2A',
    fontSize: 38,
    fontWeight: '900',
  },
  loop: {
    alignItems: 'center',
    backgroundColor: '#173F2A',
    borderRadius: 25,
    bottom: 43,
    height: 50,
    justifyContent: 'center',
    position: 'absolute',
    right: 48,
    width: 50,
    zIndex: 3,
  },
  loopText: {
    color: '#D7FF78',
    fontSize: 28,
    fontWeight: '700',
  },
  ground: {
    backgroundColor: '#A8CD52',
    bottom: 26,
    borderRadius: 20,
    height: 12,
    position: 'absolute',
    width: '68%',
  },
});
