import { StyleSheet, Text, View } from 'react-native';

type BenefitCardProps = {
  index: string;
  title: string;
  description: string;
};

export function BenefitCard({ index, title, description }: BenefitCardProps) {
  return (
    <View testID="benefit-card" style={styles.card}>
      <Text style={styles.index}>{index}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DFE6E0',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    minHeight: 150,
    padding: 16,
  },
  index: {
    color: '#4B6B58',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 24,
  },
  title: {
    color: '#101713',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  description: {
    color: '#5E6962',
    fontSize: 13,
    lineHeight: 19,
  },
});
