import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

const FAVORITES_KEY = '@reuse/favorites';
const DRAFT_KEY = '@reuse/draft';
const LISTINGS_KEY = '@reuse/listings';

export type ListingDraft = { title: string; price: string; description: string; photoUri?: string };
export type LocalListing = ListingDraft & { id: string; createdAt: string };
export type PublishResult = 'published' | 'invalid' | 'storage-error';

const emptyDraft: ListingDraft = { title: '', price: '', description: '' };

type AppContextValue = {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  draft: ListingDraft;
  updateDraft: (change: Partial<ListingDraft>) => void;
  listings: LocalListing[];
  publishDraft: () => Promise<PublishResult>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [draft, setDraft] = useState<ListingDraft>(emptyDraft);
  const [listings, setListings] = useState<LocalListing[]>([]);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(FAVORITES_KEY),
      AsyncStorage.getItem(DRAFT_KEY),
      AsyncStorage.getItem(LISTINGS_KEY),
    ]).then(([savedFavorites, savedDraft, savedListings]) => {
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      if (savedDraft) setDraft(JSON.parse(savedDraft));
      if (savedListings) setListings(JSON.parse(savedListings));
    }).catch(() => undefined);
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((favorite) => favorite !== id) : [...current, id];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  };

  const updateDraft = (change: Partial<ListingDraft>) => {
    setDraft((current) => {
      const next = { ...current, ...change };
      AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  };

  const publishDraft = async (): Promise<PublishResult> => {
    if (!draft.title.trim() || !draft.price.trim() || !draft.photoUri) return 'invalid';
    const listing: LocalListing = { ...draft, id: `local-${Date.now()}`, createdAt: new Date().toISOString() };
    const next = [listing, ...listings];
    try {
      await AsyncStorage.setItem(LISTINGS_KEY, JSON.stringify(next));
    } catch {
      return 'storage-error';
    }
    setListings(next);
    setDraft(emptyDraft);
    AsyncStorage.removeItem(DRAFT_KEY).catch(() => undefined);
    return 'published';
  };

  const value = useMemo(() => ({ favorites, toggleFavorite, draft, updateDraft, listings, publishDraft }), [draft, favorites, listings]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
