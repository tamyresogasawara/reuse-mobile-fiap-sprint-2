import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';

const FAVORITES_KEY = '@reuse/favorites';
const DRAFT_KEY = '@reuse/draft';
const LISTINGS_KEY = '@reuse/listings';

export type ListingDraft = { title: string; price: string; description: string; photoUri?: string };
export type LocalListing = ListingDraft & { id: string; createdAt: string };
export type PublishResult = 'published' | 'invalid' | 'storage-error';
export type FavoriteResult = 'updated' | 'storage-error';

const emptyDraft: ListingDraft = { title: '', price: '', description: '' };

type AppContextValue = {
  favorites: string[];
  toggleFavorite: (id: string) => Promise<FavoriteResult>;
  draft: ListingDraft;
  updateDraft: (change: Partial<ListingDraft>) => void;
  draftStorageError: boolean;
  listings: LocalListing[];
  publishDraft: () => Promise<PublishResult>;
};

const AppContext = createContext<AppContextValue | null>(null);

function parseStringArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? [...new Set(parsed.filter((item): item is string => typeof item === 'string'))] : [];
  } catch {
    return [];
  }
}

function parseDraft(value: string | null): ListingDraft {
  if (!value) return emptyDraft;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return emptyDraft;
    const candidate = parsed as Partial<ListingDraft>;
    return {
      title: typeof candidate.title === 'string' ? candidate.title : '',
      price: typeof candidate.price === 'string' ? candidate.price : '',
      description: typeof candidate.description === 'string' ? candidate.description : '',
      ...(typeof candidate.photoUri === 'string' ? { photoUri: candidate.photoUri } : {}),
    };
  } catch {
    return emptyDraft;
  }
}

function parseListings(value: string | null): LocalListing[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is LocalListing => Boolean(
      item && typeof item === 'object'
      && typeof item.id === 'string'
      && typeof item.title === 'string'
      && typeof item.price === 'string'
      && typeof item.description === 'string'
      && typeof item.photoUri === 'string'
      && typeof item.createdAt === 'string',
    ));
  } catch {
    return [];
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [draft, setDraft] = useState<ListingDraft>(emptyDraft);
  const [draftStorageError, setDraftStorageError] = useState(false);
  const [listings, setListings] = useState<LocalListing[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const favoritesRef = useRef<string[]>([]);
  const favoriteQueue = useRef<Promise<FavoriteResult>>(Promise.resolve('updated'));
  const draftWriteQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;
    Promise.all([
      AsyncStorage.getItem(FAVORITES_KEY),
      AsyncStorage.getItem(DRAFT_KEY),
      AsyncStorage.getItem(LISTINGS_KEY),
    ]).then(([savedFavorites, savedDraft, savedListings]) => {
      if (!active) return;
      const nextFavorites = parseStringArray(savedFavorites);
      favoritesRef.current = nextFavorites;
      setFavorites(nextFavorites);
      setDraft(parseDraft(savedDraft));
      setListings(parseListings(savedListings));
    }).catch(() => undefined).finally(() => {
      if (active) setHydrated(true);
    });
    return () => { active = false; };
  }, []);

  const toggleFavorite = (id: string): Promise<FavoriteResult> => {
    const operation = favoriteQueue.current.then(async () => {
      const current = favoritesRef.current;
      const next = current.includes(id) ? current.filter((favorite) => favorite !== id) : [...current, id];
      try {
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {
        return 'storage-error' as const;
      }
      favoritesRef.current = next;
      setFavorites(next);
      return 'updated' as const;
    });
    favoriteQueue.current = operation;
    return operation;
  };

  const updateDraft = (change: Partial<ListingDraft>) => {
    setDraft((current) => {
      const next = { ...current, ...change };
      draftWriteQueue.current = draftWriteQueue.current
        .catch(() => undefined)
        .then(() => AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(next)))
        .then(() => setDraftStorageError(false))
        .catch(() => setDraftStorageError(true));
      return next;
    });
  };

  const publishDraft = async (): Promise<PublishResult> => {
    if (!draft.title.trim() || !draft.price.trim() || !draft.photoUri) return 'invalid';
    await draftWriteQueue.current.catch(() => undefined);
    const listing: LocalListing = { ...draft, id: `local-${Date.now()}`, createdAt: new Date().toISOString() };
    const next = [listing, ...listings];
    try {
      await AsyncStorage.multiSet([
        [LISTINGS_KEY, JSON.stringify(next)],
        [DRAFT_KEY, JSON.stringify(emptyDraft)],
      ]);
    } catch {
      return 'storage-error';
    }
    setListings(next);
    setDraft(emptyDraft);
    setDraftStorageError(false);
    return 'published';
  };

  const value = useMemo(() => ({ favorites, toggleFavorite, draft, updateDraft, draftStorageError, listings, publishDraft }), [draft, draftStorageError, favorites, listings]);
  if (!hydrated) {
    return <View accessibilityRole="progressbar" style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}><Text>Carregando dados locais…</Text></View>;
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
