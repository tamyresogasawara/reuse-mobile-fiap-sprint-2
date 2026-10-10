import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParams } from '../navigation/types';
import { authenticate, persistSession } from '../services/auth';
import { useSession } from '../state/SessionContext';
import { colors, radii } from '../theme';

type Props = NativeStackScreenProps<RootStackParams, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError('Preencha usuário e senha.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const session = await authenticate({ username, password });
      await persistSession(session);
      signIn(session);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível entrar.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            {navigation.canGoBack() ? <Pressable accessibilityRole="button" accessibilityLabel="Voltar para a apresentação" onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable> : <View style={styles.spacer} />}
            <Text style={styles.brand}>ReUse</Text>
            <View style={styles.spacer} />
          </View>
          <Text style={styles.eyebrow}>SESSÃO SEGURA</Text>
          <Text style={styles.title}>Entre para explorar a ReUse.</Text>
          <Text style={styles.copy}>A autenticação usa a API pública DummyJSON. A sessão fica salva com SecureStore no celular e armazenamento local na web, por até 60 minutos.</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Usuário</Text>
            <TextInput accessibilityLabel="Usuário" autoCapitalize="none" autoCorrect={false} editable={!loading} onChangeText={setUsername} placeholder="Usuário" placeholderTextColor="#7B877F" style={styles.input} value={username} />
            <Text style={styles.label}>Senha</Text>
            <TextInput accessibilityLabel="Senha" editable={!loading} onChangeText={setPassword} onSubmitEditing={handleLogin} placeholder="Senha" placeholderTextColor="#7B877F" secureTextEntry style={styles.input} value={password} />
            {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
            <Pressable accessibilityRole="button" accessibilityLabel="Entrar" accessibilityState={{ disabled: loading, busy: loading }} disabled={loading} onPress={handleLogin} style={({ pressed }) => [styles.button, (pressed || loading) && styles.pressed]}>
              {loading ? <ActivityIndicator color={colors.leaf} /> : <><Text style={styles.buttonText}>Entrar</Text><Text style={styles.arrow}>→</Text></>}
            </Pressable>
          </View>

          <View style={styles.demo}>
            <Text style={styles.demoTitle}>Conta pública para avaliação</Text>
            <Text style={styles.demoCopy}>Usuário: emilys  ·  Senha: emilyspass</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.paper, flex: 1 }, flex: { flex: 1 },
  page: { marginHorizontal: 'auto', maxWidth: 520, paddingBottom: 32, paddingHorizontal: 22, width: '100%' },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  back: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 22, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 }, backText: { color: colors.ink, fontSize: 32, lineHeight: 34 }, spacer: { width: 44 },
  brand: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  eyebrow: { color: colors.forest, fontSize: 10, fontWeight: '900', letterSpacing: 1.8, marginTop: 22 },
  title: { color: colors.ink, fontSize: 36, fontWeight: '900', letterSpacing: -1.2, lineHeight: 40, marginTop: 8 },
  copy: { color: colors.muted, fontSize: 15, lineHeight: 23, marginTop: 12 },
  card: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radii.lg, borderWidth: 1, marginTop: 24, padding: 20 },
  label: { color: colors.ink, fontSize: 12, fontWeight: '900', marginBottom: 7, marginTop: 10 },
  input: { backgroundColor: colors.paper, borderColor: colors.line, borderRadius: radii.md, borderWidth: 1, color: colors.ink, fontSize: 16, minHeight: 52, paddingHorizontal: 15 },
  error: { color: colors.danger, fontSize: 13, fontWeight: '700', lineHeight: 19, marginTop: 14 },
  button: { alignItems: 'center', backgroundColor: colors.forest, borderRadius: radii.md, flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, minHeight: 58, paddingHorizontal: 20 },
  pressed: { opacity: 0.78 }, buttonText: { color: colors.surface, fontSize: 16, fontWeight: '900' }, arrow: { color: colors.leaf, fontSize: 24 },
  demo: { backgroundColor: colors.softGreen, borderRadius: radii.md, marginTop: 16, padding: 16 },
  demoTitle: { color: colors.forest, fontSize: 12, fontWeight: '900' }, demoCopy: { color: colors.muted, fontSize: 12, marginTop: 4 },
});
