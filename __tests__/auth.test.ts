import * as SecureStore from 'expo-secure-store';
import {
  authenticate,
  clearSession,
  persistSession,
  restoreSession,
  SESSION_KEY,
} from '../src/services/auth';

const apiSession = {
  accessToken: 'token-123',
  refreshToken: 'refresh-123',
  id: 1,
  username: 'emilys',
  firstName: 'Emily',
  lastName: 'Johnson',
};

const normalizedSession = {
  accessToken: 'token-123',
  refreshToken: 'refresh-123',
  expiresAt: 10_000,
  user: { id: 1, username: 'emilys', name: 'Emily Johnson' },
};

describe('autenticação externa', () => {
  it('envia as credenciais à API e retorna uma sessão normalizada com expiração', async () => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => apiSession,
    });

    const result = await authenticate({
      username: 'emilys',
      password: 'emilyspass',
      fetcher,
      now: () => 1_000,
    });

    expect(fetcher).toHaveBeenCalledWith(
      'https://dummyjson.com/auth/login',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result).toEqual({
      accessToken: 'token-123',
      refreshToken: 'refresh-123',
      expiresAt: 3_601_000,
      user: { id: 1, username: 'emilys', name: 'Emily Johnson' },
    });
  });

  it('persiste, restaura e encerra a sessão no armazenamento seguro', async () => {
    await persistSession(normalizedSession);

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      SESSION_KEY,
      expect.stringContaining('token-123'),
    );
    await expect(restoreSession(() => 9_999)).resolves.toEqual(normalizedSession);

    await clearSession();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(SESSION_KEY);
    await expect(restoreSession()).resolves.toBeNull();
  });

  it('descarta uma sessão expirada antes de liberar o aplicativo', async () => {
    await persistSession(normalizedSession);

    await expect(restoreSession(() => 10_000)).resolves.toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(SESSION_KEY);
  });
});
