import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../state/AppContext';
import { colors, radii } from '../theme';

export function CreateListingScreen() {
  const { draft, updateDraft, publishDraft } = useApp();
  const [feedback, setFeedback] = useState('');

  const choosePhoto = async (source: 'camera' | 'library') => {
    setFeedback('');
    try {
      if (source === 'camera' && Platform.OS !== 'web') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setFeedback('Permita o acesso à câmera para tirar uma foto. Você também pode escolher da galeria.');
          return;
        }
      }
      const options: ImagePicker.ImagePickerOptions = { allowsEditing: true, aspect: [4, 3], quality: 0.8, mediaTypes: ['images'] };
      const result = source === 'camera' && Platform.OS !== 'web'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
      if (!result.canceled && result.assets[0]) {
        let photoUri = result.assets[0].uri;
        if (Platform.OS !== 'web') {
          try {
            const extension = photoUri.match(/\.[a-zA-Z0-9]+(?=([?#]|$))/)?.[0] ?? '.jpg';
            const durablePhoto = new File(Paths.document, `reuse-listing-${Date.now()}${extension}`);
            await new File(photoUri).copy(durablePhoto);
            photoUri = durablePhoto.uri;
          } catch {
            setFeedback('Não foi possível salvar a foto neste dispositivo. Libere espaço e tente novamente.');
            return;
          }
        }
        updateDraft({ photoUri });
        setFeedback(source === 'camera' && Platform.OS === 'web' ? 'No navegador, selecionamos uma imagem do dispositivo como alternativa à câmera.' : 'Foto adicionada. Você pode substituir antes de publicar.');
      }
    } catch {
      setFeedback(source === 'camera'
        ? 'Não foi possível acessar a câmera. Verifique as permissões do aplicativo ou escolha uma foto da galeria.'
        : 'Não foi possível abrir suas fotos. Tente novamente e verifique a permissão de acesso à galeria.');
    }
  };

  const publish = async () => {
    const result = await publishDraft();
    if (result === 'published') setFeedback('Anúncio publicado e salvo neste dispositivo.');
    else if (result === 'storage-error') setFeedback('Não foi possível salvar o anúncio neste dispositivo. Libere espaço e tente novamente.');
    else setFeedback('Adicione uma foto, um título e um valor para publicar.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          <Text style={styles.eyebrow}>NOVO ANÚNCIO</Text>
          <Text style={styles.title}>O que você quer colocar em circulação?</Text>
          <Text style={styles.copy}>Seu rascunho fica salvo automaticamente neste dispositivo.</Text>

          {draft.photoUri ? (
            <View style={styles.previewWrap}>
              <Image accessibilityLabel="Prévia da foto do anúncio" source={{ uri: draft.photoUri }} style={styles.preview} />
              <Pressable accessibilityRole="button" accessibilityLabel="Substituir foto" onPress={() => choosePhoto('library')} style={styles.replace}><Text style={styles.replaceText}>Substituir foto</Text></Pressable>
            </View>
          ) : (
            <View style={styles.photoBox}>
              <Text style={styles.camera}>◉</Text><Text style={styles.photoTitle}>Mostre o estado real do item</Text><Text style={styles.photoCopy}>Use boa luz e um fundo simples.</Text>
              <View style={styles.photoActions}>
                <Pressable accessibilityRole="button" accessibilityLabel="Tirar foto" onPress={() => choosePhoto('camera')} style={styles.primarySmall}><Text style={styles.primarySmallText}>Tirar foto</Text></Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="Escolher da galeria" onPress={() => choosePhoto('library')} style={styles.secondarySmall}><Text style={styles.secondarySmallText}>Galeria</Text></Pressable>
              </View>
            </View>
          )}

          <Text style={styles.label}>TÍTULO</Text>
          <TextInput accessibilityLabel="Título do anúncio" placeholder="Ex.: Luminária de mesa" placeholderTextColor="#879188" value={draft.title} onChangeText={(title) => updateDraft({ title })} style={styles.input} />
          <Text style={styles.label}>VALOR</Text>
          <View style={styles.priceInput}><Text style={styles.currency}>R$</Text><TextInput accessibilityLabel="Valor do anúncio" keyboardType="decimal-pad" placeholder="0,00" placeholderTextColor="#879188" value={draft.price} onChangeText={(price) => updateDraft({ price })} style={styles.priceField} /></View>
          <Text style={styles.label}>DESCRIÇÃO</Text>
          <TextInput accessibilityLabel="Descrição do anúncio" multiline numberOfLines={4} placeholder="Conte sobre o estado, medidas e possibilidades de troca." placeholderTextColor="#879188" value={draft.description} onChangeText={(description) => updateDraft({ description })} style={[styles.input, styles.textarea]} />
          {feedback ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.feedback}>{feedback}</Text> : null}
          <Pressable accessibilityRole="button" accessibilityLabel="Publicar anúncio" onPress={publish} style={styles.publish}><Text style={styles.publishText}>Publicar anúncio</Text><Text style={styles.arrow}>→</Text></Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.paper, flex: 1 }, flex: { flex: 1 }, page: { marginHorizontal: 'auto', maxWidth: 620, paddingBottom: 115, paddingHorizontal: 18, paddingTop: 18, width: '100%' },
  eyebrow: { color: colors.forest, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 }, title: { color: colors.ink, fontSize: 30, fontWeight: '900', letterSpacing: -0.8, lineHeight: 34, marginTop: 5 }, copy: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8 },
  photoBox: { alignItems: 'center', backgroundColor: colors.softGreen, borderColor: '#B9CDBB', borderRadius: radii.lg, borderStyle: 'dashed', borderWidth: 1.5, marginTop: 20, padding: 24 }, camera: { color: colors.forest, fontSize: 38 }, photoTitle: { color: colors.ink, fontSize: 16, fontWeight: '900', marginTop: 8 }, photoCopy: { color: colors.muted, fontSize: 12, marginTop: 4 }, photoActions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  primarySmall: { backgroundColor: colors.forest, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10 }, primarySmallText: { color: colors.surface, fontSize: 12, fontWeight: '900' }, secondarySmall: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10 }, secondarySmallText: { color: colors.forest, fontSize: 12, fontWeight: '900' },
  previewWrap: { marginTop: 20, position: 'relative' }, preview: { backgroundColor: colors.softGreen, borderRadius: radii.lg, height: 240, width: '100%' }, replace: { backgroundColor: colors.surface, borderRadius: 17, bottom: 12, paddingHorizontal: 13, paddingVertical: 9, position: 'absolute', right: 12 }, replaceText: { color: colors.forest, fontSize: 11, fontWeight: '900' },
  label: { color: colors.forest, fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginBottom: 7, marginTop: 18 }, input: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radii.md, borderWidth: 1, color: colors.ink, fontSize: 15, minHeight: 52, outlineStyle: 'none', paddingHorizontal: 15 } as never, textarea: { minHeight: 105, paddingTop: 14, textAlignVertical: 'top' }, priceInput: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: radii.md, borderWidth: 1, flexDirection: 'row', minHeight: 52, paddingHorizontal: 15 }, currency: { color: colors.forest, fontSize: 14, fontWeight: '900', marginRight: 8 }, priceField: { color: colors.ink, flex: 1, fontSize: 15, outlineStyle: 'none' } as never,
  feedback: { color: colors.forest, fontSize: 12, fontWeight: '700', lineHeight: 18, marginTop: 14 }, publish: { alignItems: 'center', backgroundColor: colors.forest, borderRadius: radii.md, flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, minHeight: 58, paddingHorizontal: 20 }, publishText: { color: colors.surface, fontSize: 16, fontWeight: '900' }, arrow: { color: colors.leaf, fontSize: 24 },
});
