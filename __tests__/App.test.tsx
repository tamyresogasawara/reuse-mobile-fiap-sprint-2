import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import App from '../App';
import { authenticate, clearSession, restoreSession } from '../src/services/auth';
import { loadProducts } from '../src/services/products';

const mockSession = {
  accessToken: 'token-123',
  refreshToken: 'refresh-123',
  expiresAt: 3_601_000,
  user: { id: 1, username: 'emilys', name: 'Emily Johnson' },
};

const mockProducts = [{
  id: 1,
  title: 'Mochila reutilizável',
  description: 'Produto em ótimo estado',
  price: 89.9,
  category: 'acessórios',
  thumbnail: 'https://example.com/mochila.png',
}];

jest.mock('../src/services/auth', () => ({
  restoreSession: jest.fn(async () => null),
  clearSession: jest.fn(async () => undefined),
  persistSession: jest.fn(async () => undefined),
  authenticate: jest.fn(async () => mockSession),
}));

jest.mock('../src/services/products', () => ({
  loadProducts: jest.fn(async () => ({ source: 'network', savedAt: 1_000, products: mockProducts })),
}));

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.mocked(authenticate).mockClear();
  jest.mocked(clearSession).mockClear();
  jest.mocked(loadProducts).mockClear();
});

async function renderApp() {
  const result = await render(<App />);
  await waitFor(() => result.getByText('Dê uma nova história ao que já existe.'));
  return result;
}

async function signIn() {
  await fireEvent.press(screen.getByRole('button', { name: 'Começar a explorar' }));
  await waitFor(() => screen.getByText('Entre para explorar a ReUse.'));
  await fireEvent.changeText(screen.getByPlaceholderText('Usuário'), 'emilys');
  await fireEvent.changeText(screen.getByPlaceholderText('Senha'), 'emilyspass');
  await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
  await waitFor(() => screen.getByText('Descubra boas escolhas'));
}

describe('ReUse Sprint 2', () => {
  it('leva a pessoa da apresentação para a descoberta de itens', async () => {
    const { getByText } = await renderApp();

    await waitFor(() => getByText('Dê uma nova história ao que já existe.'));
    await signIn();

    getByText('OLÁ, EMILY');
    getByText('Cafeteira italiana');
  });

  it('abre detalhes e persiste um item favorito', async () => {
    const { getByRole, getByText } = await renderApp();

    await signIn();
    fireEvent.press(getByRole('button', { name: 'Ver Cafeteira italiana' }));

    await waitFor(() => getByText('Pronta para uma nova história'));
    fireEvent.press(getByRole('button', { name: 'Adicionar Cafeteira italiana aos favoritos' }));

    await waitFor(async () => {
      expect(await AsyncStorage.getItem('@reuse/favorites')).toBe('["cafeteira"]');
    });
    await waitFor(() => getByText('Favorito adicionado · +10 pontos de impacto.'));
  });

  it('não concede pontos de favorito quando o armazenamento falha', async () => {
    const { getByRole, getByText, queryByText } = await renderApp();

    await signIn();
    fireEvent.press(getByRole('button', { name: 'Ver Cafeteira italiana' }));
    await waitFor(() => getByText('Pronta para uma nova história'));
    jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('storage full'));
    fireEvent.press(getByRole('button', { name: 'Adicionar Cafeteira italiana aos favoritos' }));

    await waitFor(() => getByText('Não foi possível salvar o favorito. Libere espaço e tente novamente.'));
    expect(queryByText('Favorito adicionado · +10 pontos de impacto.')).toBeNull();
    expect(await AsyncStorage.getItem('@reuse/favorites')).toBeNull();
  });

  it('confirma localmente o interesse no item com feedback acessível', async () => {
    const { getByRole, getByText } = await renderApp();

    await signIn();
    fireEvent.press(getByRole('button', { name: 'Ver Cafeteira italiana' }));
    await waitFor(() => getByText('Pronta para uma nova história'));

    fireEvent.press(getByRole('button', { name: 'Conversar sobre o item' }));

    await waitFor(() => getByRole('alert'));
    getByText('Interesse marcado neste dispositivo. Nenhuma mensagem foi enviada.');
    expect(getByRole('button', { name: 'Interesse registrado' }).props.accessibilityState).toEqual({ disabled: true });
  });

  it('busca itens por texto na navegação principal', async () => {
    const { getByRole, getByText, getByPlaceholderText, getByTestId } = await renderApp();

    await signIn();
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
    const { getByRole, getByText, getByTestId } = await renderApp();

    await signIn();
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
    const { getByRole, getByText, getByLabelText, getByPlaceholderText, queryByText } = await renderApp();

    await signIn();
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
    getByText('+100 pontos de impacto por colocar um item em circulação.');

    await fireEvent.press(getByRole('button', { name: 'Publicar anúncio' }));
    await waitFor(() => getByText('Adicione uma foto, um título e um valor para publicar.'));
    expect(queryByText('+100 pontos de impacto por colocar um item em circulação.')).toBeNull();
  });

  it('avisa quando o rascunho não pode ser salvo', async () => {
    const { getByRole, getByText, getByPlaceholderText } = await renderApp();

    await signIn();
    fireEvent.press(getByRole('button', { name: /Anunciar, tab/ }));
    await waitFor(() => getByText('O que você quer colocar em circulação?'));
    jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('storage full'));

    fireEvent.changeText(getByPlaceholderText('Ex.: Luminária de mesa'), 'Rascunho local');

    await waitFor(() => getByText('Não foi possível salvar o rascunho. Mantenha esta tela aberta e tente editar novamente.'));
  });

  it('usa feedback neutro após a missão da primeira publicação', async () => {
    await AsyncStorage.setItem('@reuse/listings', JSON.stringify([{ id: 'local-1', title: 'Cadeira restaurada', price: '85', description: 'Madeira', photoUri: 'file:///chair.jpg', createdAt: '2026-09-17T10:00:00.000Z' }]));
    const { getByRole, getByText, getByLabelText, getByPlaceholderText, queryByText } = await renderApp();

    await signIn();
    fireEvent.press(getByRole('button', { name: /Anunciar, tab/ }));
    await waitFor(() => getByText('O que você quer colocar em circulação?'));
    fireEvent.press(getByRole('button', { name: 'Tirar foto' }));
    await waitFor(() => getByLabelText('Prévia da foto do anúncio'));
    await fireEvent.changeText(getByPlaceholderText('Ex.: Luminária de mesa'), 'Mesa lateral');
    await fireEvent.changeText(getByPlaceholderText('0,00'), '70');

    await fireEvent.press(getByRole('button', { name: 'Publicar anúncio' }));

    await waitFor(() => getByText('Novo impacto registrado'));
    expect(queryByText('Missão concluída')).toBeNull();
    getByText('+100 pontos de impacto por colocar um item em circulação.');
  });

  it('não informa sucesso quando o anúncio não pode ser persistido', async () => {
    const { getByRole, getByText, getByLabelText, getByPlaceholderText, queryByText } = await renderApp();

    await signIn();
    fireEvent.press(getByRole('button', { name: /Anunciar, tab/ }));
    await waitFor(() => getByText('O que você quer colocar em circulação?'));
    fireEvent.press(getByRole('button', { name: 'Tirar foto' }));
    await waitFor(() => getByLabelText('Prévia da foto do anúncio'));
    await fireEvent.changeText(getByPlaceholderText('Ex.: Luminária de mesa'), 'Luminária sem salvar');
    await fireEvent.changeText(getByPlaceholderText('0,00'), '80');
    jest.mocked(AsyncStorage.multiSet).mockRejectedValueOnce(new Error('storage full'));

    await fireEvent.press(getByRole('button', { name: 'Publicar anúncio' }));

    await waitFor(() => getByText('Não foi possível salvar o anúncio neste dispositivo. Libere espaço e tente novamente.'));
    expect(queryByText('Anúncio publicado e salvo neste dispositivo.')).toBeNull();
    expect(await AsyncStorage.getItem('@reuse/listings')).toBeNull();
  });

  it('orienta a pessoa quando o acesso à câmera falha', async () => {
    jest.mocked(ImagePicker.requestCameraPermissionsAsync).mockRejectedValueOnce(new Error('permission service unavailable'));
    const { getByRole, getByText } = await renderApp();

    await signIn();
    fireEvent.press(getByRole('button', { name: /Anunciar, tab/ }));
    await waitFor(() => getByText('O que você quer colocar em circulação?'));
    fireEvent.press(getByRole('button', { name: 'Tirar foto' }));

    await waitFor(() => getByRole('alert'));
    getByText('Não foi possível acessar a câmera. Verifique as permissões do aplicativo ou escolha uma foto da galeria.');
  });

  it('orienta a pessoa quando a galeria não pode ser aberta', async () => {
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockRejectedValueOnce(new Error('picker unavailable'));
    const { getByRole, getByText } = await renderApp();

    await signIn();
    fireEvent.press(getByRole('button', { name: /Anunciar, tab/ }));
    await waitFor(() => getByText('O que você quer colocar em circulação?'));
    fireEvent.press(getByRole('button', { name: 'Escolher da galeria' }));

    await waitFor(() => getByRole('alert'));
    getByText('Não foi possível abrir suas fotos. Tente novamente e verifique a permissão de acesso à galeria.');
  });

  it('exibe os itens salvos na área de favoritos', async () => {
    const { getByRole, getByText } = await renderApp();

    await signIn();
    await fireEvent.press(getByRole('button', { name: 'Ver Cafeteira italiana' }));
    await waitFor(() => getByText('Pronta para uma nova história'));
    await fireEvent.press(getByRole('button', { name: 'Adicionar Cafeteira italiana aos favoritos' }));
    await fireEvent.press(getByRole('button', { name: 'Voltar' }));
    await fireEvent.press(getByRole('button', { name: /Favoritos, tab/ }));

    await waitFor(() => getByText('Suas escolhas salvas'));
    getByText('Cafeteira italiana');
  });

  it('abre o perfil e apresenta a jornada de impacto sustentável', async () => {
    await AsyncStorage.setItem('@reuse/favorites', JSON.stringify(['cafeteira', 'mochila']));
    await AsyncStorage.setItem('@reuse/listings', JSON.stringify([{ id: 'local-1', title: 'Cadeira restaurada', price: '85', description: 'Madeira', photoUri: 'file:///chair.jpg', createdAt: '2026-09-17T10:00:00.000Z' }]));
    const { getByRole, getByText } = await renderApp();

    await signIn();
    fireEvent.press(getByRole('button', { name: /Perfil, tab/ }));
    await waitFor(() => getByText('Seu espaço ReUse'));
    fireEvent.press(getByRole('button', { name: 'Abrir meu impacto' }));

    await waitFor(() => getByText('Sua jornada circular'));
    getByText('120 pontos de impacto');
    getByText('Nível Broto');
    getByText('Compartilhe para circular');
    getByText('Olhar consciente');
    getByText('Como os pontos funcionam');
  });

  it('não multiplica pontos ao hidratar anúncios duplicados', async () => {
    const listing = { id: 'local-duplicado', title: 'Cadeira restaurada', price: '85', description: 'Madeira', photoUri: 'file:///chair.jpg', createdAt: '2026-09-17T10:00:00.000Z' };
    await AsyncStorage.setItem('@reuse/listings', JSON.stringify([listing, { ...listing }]));
    const { getByRole, getByText, queryByText } = await renderApp();

    await signIn();
    fireEvent.press(getByRole('button', { name: /Perfil, tab/ }));
    await waitFor(() => getByText('Seu espaço ReUse'));
    fireEvent.press(getByRole('button', { name: 'Abrir meu impacto' }));

    await waitFor(() => getByText('100 pontos de impacto'));
    expect(queryByText('200 pontos de impacto')).toBeNull();
  });

  it('abre o perfil e os anúncios locais persistidos', async () => {
    await AsyncStorage.setItem('@reuse/listings', JSON.stringify([{ id: 'local-1', title: 'Cadeira restaurada', price: '85', description: 'Madeira', photoUri: 'file:///chair.jpg', createdAt: '2026-09-17T10:00:00.000Z' }]));
    const { getByRole, getByText } = await renderApp();

    await signIn();
    await fireEvent.press(getByRole('button', { name: /Perfil, tab/ }));
    await waitFor(() => getByText('Seu espaço ReUse'));
    await fireEvent.press(getByRole('button', { name: 'Abrir meus anúncios' }));

    await waitFor(() => getByText('Meus anúncios'));
    getByText('Cadeira restaurada');
  });
});

describe('ReUse — autenticação, sessão e API', () => {
  it('restaura a sessão salva e abre direto a navegação autenticada', async () => {
    jest.mocked(restoreSession).mockResolvedValueOnce(mockSession);
    const { getByText, queryByText } = await render(<App />);

    await waitFor(() => getByText('Descubra boas escolhas'));
    getByText('OLÁ, EMILY');
    expect(queryByText('Dê uma nova história ao que já existe.')).toBeNull();
  });

  it('valida os campos antes de chamar a API de login', async () => {
    await renderApp();
    await fireEvent.press(screen.getByRole('button', { name: 'Começar a explorar' }));
    await waitFor(() => screen.getByText('Entre para explorar a ReUse.'));

    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => screen.getByText('Preencha usuário e senha.'));
    expect(authenticate).not.toHaveBeenCalled();
  });

  it('mantém a pessoa no acesso quando a API recusa as credenciais', async () => {
    jest.mocked(authenticate).mockRejectedValueOnce(new Error('Usuário ou senha inválidos'));
    await renderApp();
    await fireEvent.press(screen.getByRole('button', { name: 'Começar a explorar' }));
    await waitFor(() => screen.getByText('Entre para explorar a ReUse.'));
    await fireEvent.changeText(screen.getByPlaceholderText('Usuário'), 'emilys');
    await fireEvent.changeText(screen.getByPlaceholderText('Senha'), 'errada');

    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => screen.getByText('Usuário ou senha inválidos'));
    expect(screen.queryByText('Descubra boas escolhas')).toBeNull();
  });

  it('abre o catálogo online da API a partir do início e volta', async () => {
    await renderApp();
    await signIn();

    await fireEvent.press(screen.getByRole('button', { name: 'Abrir catálogo online' }));

    await waitFor(() => screen.getByText('Mochila reutilizável'));
    screen.getByText('Itens disponíveis agora.');
    screen.getByText('R$ 89,90');
    screen.getByText('Dados atualizados pela API');
    expect(screen.getAllByTestId('api-product-card')).toHaveLength(1);

    await fireEvent.press(screen.getByRole('button', { name: 'Atualizar catálogo' }));
    await waitFor(() => expect(loadProducts).toHaveBeenLastCalledWith({ forceRefresh: true }));

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar para o início' }));
    await waitFor(() => screen.getByText('Descubra boas escolhas'));
  });

  it('encerra a sessão pelo perfil e retorna à apresentação', async () => {
    await renderApp();
    await signIn();
    await fireEvent.press(screen.getByRole('button', { name: /Perfil, tab/ }));
    await waitFor(() => screen.getByText('Emily Johnson'));
    screen.getByText('Sessão ativa como @emilys');

    await fireEvent.press(screen.getByRole('button', { name: 'Sair' }));

    await waitFor(() => screen.getByText('Dê uma nova história ao que já existe.'));
    expect(clearSession).toHaveBeenCalled();
  });
});
