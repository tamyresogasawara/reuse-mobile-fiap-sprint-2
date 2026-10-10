import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadProducts, PRODUCTS_CACHE_TTL_MS } from '../src/services/products';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const products = [
  {
    id: 1,
    title: 'Mochila reutilizável',
    description: 'Produto em ótimo estado',
    price: 89.9,
    category: 'acessórios',
    thumbnail: 'https://example.com/mochila.png',
  },
];

function successfulFetcher() {
  return jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ products }),
  });
}

describe('cache da API de produtos', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('busca a API e salva os produtos com horário de atualização', async () => {
    const fetcher = successfulFetcher();

    const result = await loadProducts({ fetcher, now: () => 1_000 });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ products, source: 'network', savedAt: 1_000 });
    expect(JSON.parse((await AsyncStorage.getItem('@reuse/products-v1'))!)).toEqual({
      products,
      savedAt: 1_000,
    });
  });

  it('reutiliza o cache recente sem chamar a API', async () => {
    await AsyncStorage.setItem('@reuse/products-v1', JSON.stringify({ products, savedAt: 1_000 }));
    const fetcher = jest.fn();

    const result = await loadProducts({
      fetcher,
      now: () => 1_000 + PRODUCTS_CACHE_TTL_MS - 1,
    });

    expect(result.source).toBe('cache');
    expect(result.products).toEqual(products);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('usa o cache expirado como fallback quando a rede falha', async () => {
    await AsyncStorage.setItem('@reuse/products-v1', JSON.stringify({ products, savedAt: 1_000 }));
    const fetcher = jest.fn().mockRejectedValue(new Error('offline'));

    const result = await loadProducts({
      fetcher,
      now: () => 1_000 + PRODUCTS_CACHE_TTL_MS + 1,
    });

    expect(result.source).toBe('stale-cache');
    expect(result.products).toEqual(products);
  });

  it('continua pela rede quando a leitura do cache falha', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('storage unavailable'));
    const fetcher = successfulFetcher();

    const result = await loadProducts({ fetcher, now: () => 1_000 });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ products, source: 'network', savedAt: 1_000 });
  });

  it('entrega produtos frescos mesmo quando a gravação do cache falha', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('storage full'));
    const fetcher = successfulFetcher();

    const result = await loadProducts({ fetcher, now: () => 1_000 });

    expect(result).toEqual({ products, source: 'network', savedAt: 1_000 });
  });

  it('não trata como recente um cache com horário no futuro', async () => {
    await AsyncStorage.setItem('@reuse/products-v1', JSON.stringify({ products, savedAt: 2_000 }));
    const fetcher = successfulFetcher();

    const result = await loadProducts({ fetcher, now: () => 1_000 });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result.source).toBe('network');
  });
});
