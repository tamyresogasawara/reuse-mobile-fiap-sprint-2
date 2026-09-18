import { fireEvent, render, waitFor, within } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import App from '../App';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('ReUse Sprint 2', () => {
  it('leva a pessoa da apresentação para a descoberta de itens', async () => {
    const { getByRole, getByText } = await render(<App />);

    await waitFor(() => getByText('Dê uma nova história ao que já existe.'));
    fireEvent.press(getByRole('button', { name: 'Começar a explorar' }));

    await waitFor(() => getByText('Descubra boas escolhas'));
    getByText('Cafeteira italiana');
  });

  it('abre detalhes e persiste um item favorito', async () => {
    const { getByRole, getByText } = await render(<App />);

    fireEvent.press(getByRole('button', { name: 'Começar a explorar' }));
    await waitFor(() => getByText('Descubra boas escolhas'));
    fireEvent.press(getByRole('button', { name: 'Ver Cafeteira italiana' }));

    await waitFor(() => getByText('Pronta para uma nova história'));
    fireEvent.press(getByRole('button', { name: 'Adicionar Cafeteira italiana aos favoritos' }));

    await waitFor(async () => {
      expect(await AsyncStorage.getItem('@reuse/favorites')).toBe('["cafeteira"]');
    });
  });

  it('confirma localmente o interesse no item com feedback acessível', async () => {
    const { getByRole, getByText } = await render(<App />);

    fireEvent.press(getByRole('button', { name: 'Começar a explorar' }));
    await waitFor(() => getByText('Descubra boas escolhas'));
    fireEvent.press(getByRole('button', { name: 'Ver Cafeteira italiana' }));
    await waitFor(() => getByText('Pronta para uma nova história'));

    fireEvent.press(getByRole('button', { name: 'Conversar sobre o item' }));

    await waitFor(() => getByRole('alert'));
    getByText('Interesse marcado neste dispositivo. Nenhuma mensagem foi enviada.');
    expect(getByRole('button', { name: 'Interesse registrado' }).props.accessibilityState).toEqual({ disabled: true });
  });

  it('busca itens por texto na navegação principal', async () => {
    const { getByRole, getByText, getByPlaceholderText, getByTestId } = await render(<App />);

    fireEvent.press(getByRole('button', { name: 'Começar a explorar' }));
    await waitFor(() => getByText('Descubra boas escolhas'));
    fireEvent.press(getByRole('button', { name: /Buscar, tab/ }));

    await waitFor(() => getByText('Encontre o que merece continuar'));
    await fireEvent.changeText(getByPlaceholderText('O que você procura?'), 'mochila');
    await waitFor(() => {
      const results = within(getByTestId('search-results'));
      results.getByText('Mochila urbana');
      expect(results.queryByText('Cafeteira italiana')).toBeNull();
    });
  });

  it('filtra os resultados ao selecionar uma categoria', async () => {
    const { getByRole, getByText, getByTestId } = await render(<App />);

    fireEvent.press(getByRole('button', { name: 'Começar a explorar' }));
    await waitFor(() => getByText('Descubra boas escolhas'));
    fireEvent.press(getByRole('button', { name: /Buscar, tab/ }));
    await waitFor(() => getByText('Encontre o que merece continuar'));

    fireEvent.press(getByRole('button', { name: 'Filtrar por Acessórios' }));

    await waitFor(() => {
      const results = within(getByTestId('search-results'));
      results.getByText('Mochila urbana');
      expect(results.queryByText('Cafeteira italiana')).toBeNull();
    });
    expect(getByRole('button', { name: 'Filtrar por Acessórios' }).props.accessibilityState).toEqual({ selected: true });
  });

  it('captura uma foto e persiste um novo anúncio', async () => {
    const { getByRole, getByText, getByLabelText, getByPlaceholderText } = await render(<App />);

    await fireEvent.press(getByRole('button', { name: 'Começar a explorar' }));
    await waitFor(() => getByText('Descubra boas escolhas'));
    await fireEvent.press(getByRole('button', { name: /Anunciar, tab/ }));

    await waitFor(() => getByText('O que você quer colocar em circulação?'));
    await fireEvent.press(getByRole('button', { name: 'Tirar foto' }));
    await waitFor(() => getByLabelText('Prévia da foto do anúncio'));
    await fireEvent.changeText(getByPlaceholderText('Ex.: Luminária de mesa'), 'Luminária retrô');
    await fireEvent.changeText(getByPlaceholderText('0,00'), '120');
    await fireEvent.press(getByRole('button', { name: 'Publicar anúncio' }));

    await waitFor(async () => {
      const listings = await AsyncStorage.getItem('@reuse/listings');
      expect(listings).toContain('Luminária retrô');
      expect(listings).toContain('file:///documents/reuse-listing-');
    });
    expect(File).toHaveBeenCalledWith('file:///reuse-camera.jpg');
  });

  it('não informa sucesso quando o anúncio não pode ser persistido', async () => {
    const { getByRole, getByText, getByLabelText, getByPlaceholderText, queryByText } = await render(<App />);

    fireEvent.press(getByRole('button', { name: 'Começar a explorar' }));
    await waitFor(() => getByText('Descubra boas escolhas'));
    fireEvent.press(getByRole('button', { name: /Anunciar, tab/ }));
    await waitFor(() => getByText('O que você quer colocar em circulação?'));
    fireEvent.press(getByRole('button', { name: 'Tirar foto' }));
    await waitFor(() => getByLabelText('Prévia da foto do anúncio'));
    await fireEvent.changeText(getByPlaceholderText('Ex.: Luminária de mesa'), 'Luminária sem salvar');
    await fireEvent.changeText(getByPlaceholderText('0,00'), '80');
    jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('storage full'));

    await fireEvent.press(getByRole('button', { name: 'Publicar anúncio' }));

    await waitFor(() => getByText('Não foi possível salvar o anúncio neste dispositivo. Libere espaço e tente novamente.'));
    expect(queryByText('Anúncio publicado e salvo neste dispositivo.')).toBeNull();
    expect(await AsyncStorage.getItem('@reuse/listings')).toBeNull();
  });

  it('orienta a pessoa quando o acesso à câmera falha', async () => {
    jest.mocked(ImagePicker.requestCameraPermissionsAsync).mockRejectedValueOnce(new Error('permission service unavailable'));
    const { getByRole, getByText } = await render(<App />);

    fireEvent.press(getByRole('button', { name: 'Começar a explorar' }));
    await waitFor(() => getByText('Descubra boas escolhas'));
    fireEvent.press(getByRole('button', { name: /Anunciar, tab/ }));
    await waitFor(() => getByText('O que você quer colocar em circulação?'));
    fireEvent.press(getByRole('button', { name: 'Tirar foto' }));

    await waitFor(() => getByRole('alert'));
    getByText('Não foi possível acessar a câmera. Verifique as permissões do aplicativo ou escolha uma foto da galeria.');
  });

  it('orienta a pessoa quando a galeria não pode ser aberta', async () => {
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockRejectedValueOnce(new Error('picker unavailable'));
    const { getByRole, getByText } = await render(<App />);

    fireEvent.press(getByRole('button', { name: 'Começar a explorar' }));
    await waitFor(() => getByText('Descubra boas escolhas'));
    fireEvent.press(getByRole('button', { name: /Anunciar, tab/ }));
    await waitFor(() => getByText('O que você quer colocar em circulação?'));
    fireEvent.press(getByRole('button', { name: 'Escolher da galeria' }));

    await waitFor(() => getByRole('alert'));
    getByText('Não foi possível abrir suas fotos. Tente novamente e verifique a permissão de acesso à galeria.');
  });

  it('exibe os itens salvos na área de favoritos', async () => {
    const { getByRole, getByText } = await render(<App />);

    await fireEvent.press(getByRole('button', { name: 'Começar a explorar' }));
    await waitFor(() => getByText('Descubra boas escolhas'));
    await fireEvent.press(getByRole('button', { name: 'Ver Cafeteira italiana' }));
    await waitFor(() => getByText('Pronta para uma nova história'));
    await fireEvent.press(getByRole('button', { name: 'Adicionar Cafeteira italiana aos favoritos' }));
    await fireEvent.press(getByRole('button', { name: 'Voltar' }));
    await fireEvent.press(getByRole('button', { name: /Favoritos, tab/ }));

    await waitFor(() => getByText('Suas escolhas salvas'));
    getByText('Cafeteira italiana');
  });

  it('abre o perfil e os anúncios locais persistidos', async () => {
    await AsyncStorage.setItem('@reuse/listings', JSON.stringify([{ id: 'local-1', title: 'Cadeira restaurada', price: '85', description: 'Madeira', photoUri: 'file:///chair.jpg', createdAt: '2026-09-17T10:00:00.000Z' }]));
    const { getByRole, getByText } = await render(<App />);

    await fireEvent.press(getByRole('button', { name: 'Começar a explorar' }));
    await waitFor(() => getByText('Descubra boas escolhas'));
    await fireEvent.press(getByRole('button', { name: /Perfil, tab/ }));
    await waitFor(() => getByText('Seu espaço ReUse'));
    await fireEvent.press(getByRole('button', { name: 'Abrir meus anúncios' }));

    await waitFor(() => getByText('Meus anúncios'));
    getByText('Cadeira restaurada');
  });
});
