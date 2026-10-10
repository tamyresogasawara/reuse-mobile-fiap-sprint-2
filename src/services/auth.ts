import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const AUTH_URL = 'https://dummyjson.com/auth/login';
export const SESSION_KEY = 'reuse-session-v1';
export const SESSION_DURATION_MS = 60 * 60 * 1000;

export type Session = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: {
    id: number;
    username: string;
    name: string;
  };
};

type FetchResponse = {
  ok: boolean;
  status?: number;
  json: () => Promise<unknown>;
};

type AuthenticateOptions = {
  username: string;
  password: string;
  fetcher?: (url: string, init: RequestInit) => Promise<FetchResponse>;
  now?: () => number;
};

function normalizeSession(payload: unknown, expiresAt: number): Session {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Resposta de autenticação inválida');
  }
  const item = payload as Record<string, unknown>;
  if (
    typeof item.accessToken !== 'string' ||
    typeof item.refreshToken !== 'string' ||
    typeof item.id !== 'number' ||
    typeof item.username !== 'string' ||
    typeof item.firstName !== 'string' ||
    typeof item.lastName !== 'string'
  ) {
    throw new Error('Resposta de autenticação incompleta');
  }
  return {
    accessToken: item.accessToken,
    refreshToken: item.refreshToken,
    expiresAt,
    user: {
      id: item.id,
      username: item.username,
      name: `${item.firstName} ${item.lastName}`.trim(),
    },
  };
}

function parseStoredSession(payload: unknown): Session {
  if (!payload || typeof payload !== 'object') throw new Error('Sessão inválida');
  const item = payload as Record<string, unknown>;
  const user = item.user as Record<string, unknown> | undefined;
  if (
    typeof item.accessToken !== 'string' ||
    typeof item.refreshToken !== 'string' ||
    typeof item.expiresAt !== 'number' ||
    !user ||
    typeof user.id !== 'number' ||
    typeof user.username !== 'string' ||
    typeof user.name !== 'string'
  ) {
    throw new Error('Sessão incompleta');
  }
  return {
    accessToken: item.accessToken,
    refreshToken: item.refreshToken,
    expiresAt: item.expiresAt,
    user: { id: user.id, username: user.username, name: user.name },
  };
}

export async function authenticate({
  username,
  password,
  fetcher = fetch,
  now = Date.now,
}: AuthenticateOptions): Promise<Session> {
  const response = await fetcher(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.trim(), password, expiresInMins: 60 }),
  });
  if (!response.ok) {
    throw new Error(response.status === 400 ? 'Usuário ou senha inválidos' : 'Não foi possível entrar');
  }
  return normalizeSession(await response.json(), now() + SESSION_DURATION_MS);
}

async function setStoredValue(value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(SESSION_KEY, value);
  } else {
    await SecureStore.setItemAsync(SESSION_KEY, value);
  }
}

async function getStoredValue(): Promise<string | null> {
  if (Platform.OS === 'web') return AsyncStorage.getItem(SESSION_KEY);
  return SecureStore.getItemAsync(SESSION_KEY);
}

async function deleteStoredValue(): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(SESSION_KEY);
  } else {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
}

export async function persistSession(session: Session): Promise<void> {
  await setStoredValue(JSON.stringify(session));
}

export async function restoreSession(now: () => number = Date.now): Promise<Session | null> {
  const raw = await getStoredValue();
  if (!raw) return null;
  try {
    const session = parseStoredSession(JSON.parse(raw));
    if (session.expiresAt <= now()) {
      await deleteStoredValue();
      return null;
    }
    return session;
  } catch {
    await deleteStoredValue();
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await deleteStoredValue();
}
