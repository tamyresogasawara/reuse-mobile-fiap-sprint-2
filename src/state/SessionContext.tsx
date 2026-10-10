import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { clearSession, restoreSession, type Session } from '../services/auth';
import { colors } from '../theme';

type SessionContextValue = {
  session: Session | null;
  signIn: (session: Session) => void;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  // undefined = restauração em andamento; null = sem sessão válida.
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    restoreSession()
      .then((restored) => { if (active) setSession(restored); })
      .catch(() => { if (active) setSession(null); });
    return () => { active = false; };
  }, []);

  const value = useMemo<SessionContextValue>(() => ({
    session: session ?? null,
    signIn: setSession,
    signOut: async () => {
      try {
        await clearSession();
      } finally {
        setSession(null);
      }
    },
  }), [session]);

  if (session === undefined) {
    return (
      <View accessibilityRole="progressbar" style={{ alignItems: 'center', backgroundColor: colors.paper, flex: 1, gap: 12, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.forest} size="large" />
        <Text style={{ color: colors.muted }}>Restaurando sessão…</Text>
      </View>
    );
  }
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used inside SessionProvider');
  return context;
}

