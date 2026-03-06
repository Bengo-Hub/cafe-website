import { buildAuthorizeUrl, buildLogoutUrl, exchangeCodeForTokens, fetchProfile } from '@/lib/auth/sso-api';
import {
  consumeVerifier,
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
  storeState,
  storeVerifier,
} from '@/lib/auth/pkce';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  fullName?: string;
  roles?: string[];
  role?: string;
  permissions?: string[];
  profile?: Record<string, unknown>;
  [key: string]: unknown;
}

interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

interface AuthState {
  status: 'idle' | 'loading' | 'authenticated' | 'error' | 'syncing';
  user: UserProfile | null;
  session: Session | null;
  error: string | null;
  /** Top-level for backward compat with api client and use-me */
  accessToken: string | null;
  refreshToken: string | null;

  redirectToSSO: (returnTo?: string) => Promise<void>;
  handleSSOCallback: (code: string, callbackUrl: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      user: null,
      session: null,
      error: null,
      accessToken: null,
      refreshToken: null,

      redirectToSSO: async (returnTo?: string) => {
        set({ status: 'loading', error: null });
        try {
          const verifier = generateCodeVerifier();
          const challenge = await generateCodeChallenge(verifier);
          const state = generateState();

          storeVerifier(verifier);
          storeState(state);

          if (returnTo && typeof window !== 'undefined') {
            sessionStorage.setItem('sso_return_to', returnTo);
          }

          const callbackUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback`
            : '';
          const authorizeUrl = buildAuthorizeUrl({
            codeChallenge: challenge,
            state,
            redirectUri: callbackUrl,
          });

          window.location.href = authorizeUrl;
        } catch (error) {
          set({ status: 'error', error: 'Failed to start sign-in' });
          throw error;
        }
      },

      handleSSOCallback: async (code: string, callbackUrl: string) => {
        set({ status: 'syncing', error: null });
        const verifier = consumeVerifier();

        if (!verifier) {
          set({ status: 'error', error: 'Session expired' });
          return;
        }

        try {
          const tokens = await exchangeCodeForTokens({
            code,
            codeVerifier: verifier,
            redirectUri: callbackUrl,
          });

          const session: Session = {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || '',
            expiresAt: new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString(),
          };

          set({
            session,
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
          });

          let attempts = 0;
          while (attempts < 5) {
            try {
              const user = await fetchProfile(session.accessToken);
              const profile: UserProfile = {
                id: user.id ?? user.sub,
                email: user.email,
                name: user.name ?? user.fullName,
                fullName: user.fullName ?? user.name,
                roles: user.roles ?? [],
                role: (user.roles as string[])?.[0] ?? user.role,
                permissions: user.permissions ?? [],
                ...user,
              };
              set({ user: profile, status: 'authenticated' });
              return;
            } catch {
              attempts++;
              await new Promise((r) => setTimeout(r, 1500));
            }
          }

          set({ status: 'authenticated' });
        } catch (error) {
          set({ status: 'error', error: (error as Error).message || 'Sign-in failed' });
        }
      },

      logout: async () => {
        set({ status: 'idle', user: null, session: null, accessToken: null, refreshToken: null });
        const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
        window.location.href = buildLogoutUrl(siteUrl);
      },

      initialize: async () => {
        const { session } = get();
        if (!session) {
          set({ status: 'idle' });
          return;
        }
        set({ status: 'loading' });
        try {
          const user = await fetchProfile(session.accessToken);
          const profile: UserProfile = {
            id: user.id ?? user.sub,
            email: user.email,
            name: user.name ?? user.fullName,
            roles: user.roles ?? [],
            permissions: user.permissions ?? [],
            ...user,
          };
          set({ user: profile, status: 'authenticated' });
        } catch {
          set({ status: 'idle', session: null, user: null, accessToken: null, refreshToken: null });
        }
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'cafe-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        session: state.session,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => () => {},
    }
  )
);
