import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ExploreScreen } from '../src/screens/ExploreScreen';
import { loadProducts } from '../src/services/products';

jest.mock('../src/services/products', () => ({ loadProducts: jest.fn() }));

const navigation = { goBack: jest.fn() } as never;
const route = { key: 'Explore', name: 'Explore' } as never;
const products = [{
  id: 1,
  title: 'Mochila reutilizável',
  description: 'Produto em ótimo estado',
  price: 89.9,
  category: 'acessórios',
  thumbnail: 'https://example.com/mochila.png',
}];

beforeEach(() => {
  jest.mocked(loadProducts).mockReset();
});

describe('tela Explorar integrada à API', () => {
  it('avisa quando exibe o último cache disponível sem conexão', async () => {
    jest.mocked(loadProducts).mockResolvedValueOnce({ source: 'stale-cache', savedAt: 1_000, products });

    await render(<ExploreScreen navigation={navigation} route={route} />);

    await waitFor(() => screen.getByText('Mochila reutilizável'));
    screen.getByText('Sem conexão — exibindo o último cache disponível');
  });

  it('informa quando os dados vieram do cache local recente', async () => {
    jest.mocked(loadProducts).mockResolvedValueOnce({ source: 'cache', savedAt: 1_000, products });

    await render(<ExploreScreen navigation={navigation} route={route} />);

    await waitFor(() => screen.getByText('Dados carregados do cache local'));
  });

  it('mostra erro sem cache e permite tentar novamente ignorando o TTL', async () => {
    jest.mocked(loadProducts)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ source: 'network', savedAt: 2_000, products });

    await render(<ExploreScreen navigation={navigation} route={route} />);

    await waitFor(() => screen.getByText('Não foi possível carregar os itens. Verifique sua conexão e tente novamente.'));
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));

    await waitFor(() => screen.getByText('Mochila reutilizável'));
    expect(loadProducts).toHaveBeenLastCalledWith({ forceRefresh: true });
  });
});
