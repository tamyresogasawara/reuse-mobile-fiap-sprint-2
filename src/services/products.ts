import AsyncStorage from '@react-native-async-storage/async-storage';

export const PRODUCTS_URL =
  'https://dummyjson.com/products?limit=12&select=id,title,description,price,category,thumbnail';
export const PRODUCTS_CACHE_KEY = '@reuse/products-v1';
export const PRODUCTS_CACHE_TTL_MS = 15 * 60 * 1000;

export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
};

export type ProductsResult = {
  products: Product[];
  source: 'network' | 'cache' | 'stale-cache';
  savedAt: number;
};

type FetchResponse = {
  ok: boolean;
  status?: number;
  json: () => Promise<unknown>;
};

type LoadProductsOptions = {
  fetcher?: (url: string) => Promise<FetchResponse>;
  now?: () => number;
  forceRefresh?: boolean;
};

type ProductsCache = {
  products: Product[];
  savedAt: number;
};

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'number' &&
    typeof item.title === 'string' &&
    typeof item.description === 'string' &&
    typeof item.price === 'number' &&
    typeof item.category === 'string' &&
    typeof item.thumbnail === 'string'
  );
}

function parseCache(raw: string | null): ProductsCache | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (
      typeof parsed.savedAt !== 'number' ||
      !Array.isArray(parsed.products) ||
      !parsed.products.every(isProduct)
    ) {
      return null;
    }
    return { savedAt: parsed.savedAt, products: parsed.products };
  } catch {
    return null;
  }
}

export async function loadProducts({
  fetcher = fetch,
  now = Date.now,
  forceRefresh = false,
}: LoadProductsOptions = {}): Promise<ProductsResult> {
  let cached: ProductsCache | null = null;
  try {
    cached = parseCache(await AsyncStorage.getItem(PRODUCTS_CACHE_KEY));
  } catch {
    // Storage is an optimization: a read failure must not prevent a network request.
  }
  const currentTime = now();
  const cacheAge = cached ? currentTime - cached.savedAt : null;

  if (
    cached &&
    !forceRefresh &&
    cacheAge !== null &&
    cacheAge >= 0 &&
    cacheAge < PRODUCTS_CACHE_TTL_MS
  ) {
    return { ...cached, source: 'cache' };
  }

  try {
    const response = await fetcher(PRODUCTS_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status ?? 'error'}`);
    const payload = (await response.json()) as { products?: unknown };
    if (!Array.isArray(payload.products) || !payload.products.every(isProduct)) {
      throw new Error('Resposta de produtos inválida');
    }
    const nextCache = { products: payload.products, savedAt: currentTime };
    try {
      await AsyncStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(nextCache));
    } catch {
      // Fresh network data remains usable even when local persistence is unavailable.
    }
    return { ...nextCache, source: 'network' };
  } catch (error) {
    if (cached) return { ...cached, source: 'stale-cache' };
    throw error;
  }
}
