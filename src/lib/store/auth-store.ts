import {
    consumeVerifier,
    generateCodeChallenge,
    generateCodeVerifier,
    generateState,
    storeState,
    storeVerifier,
} from '@/lib/auth/pkce';
import { buildAuthorizeUrl, buildLogoutUrl, exchangeCodeForTokens, fetchProfile } from '@/lib/auth/sso-api';
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
  /** Tenant UUID from auth-api /me (use for X-Tenant-ID header). */
  tenant_id?: string;
  /** Tenant slug from auth-api /me (use for X-Tenant-Slug header). */
  tenant_slug?: string;
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

  /** Timestamp (ms) when status last became 'authenticated'. Transient — not persisted. */
  lastAuthenticatedAt: number | null;

  /** Subscription info fetched lazily after login (undefined = not started, null = loading). */
  subscriptionInfo: Record<string, unknown> | null | undefined;
  setSubscriptionInfo: (info: Record<string, unknown> | null) => void;

  redirectToSSO: (returnTo?: string) => Promise<void>;
  handleSSOCallback: (code: string, callbackUrl: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      lastAuthenticatedAt: null,
      subscriptionInfo: undefined,
      setSubscriptionInfo: (info: Record<string, unknown> | null) => set({ subscriptionInfo: info }),
      // Start as 'loading' so dashboard layout waits for hydration before redirect check.
      // Once Zustand hydrates from localStorage, onRehydrateStorage sets the correct status.
      status: 'loading' as AuthState['status'],
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

          // Fetch user profile (retry up to 5 times)
          let profile: UserProfile | null = null;
          let attempts = 0;
          while (attempts < 5 && !profile) {
            try {
              const user = await fetchProfile(session.accessToken);
              profile = {
                id: user.id ?? user.sub,
                email: user.email,
                name: user.name ?? user.fullName,
                fullName: user.fullName ?? user.name,
                roles: user.roles ?? [],
                role: (user.roles as string[])?.[0] ?? user.role,
                permissions: user.permissions ?? [],
                tenant_id: user.tenant_id,
                tenant_slug: user.tenant_slug,
                ...user,
              };
            } catch {
              attempts++;
              await new Promise((r) => setTimeout(r, 1500));
            }
          }

          // Always store profile first (even if subscription check follows)
          if (profile) {
            set({ user: profile });
          }

          set({ status: 'authenticated', lastAuthenticatedAt: Date.now() });

          // Set a cookie so the middleware can gate /dashboard/* server-side
          if (typeof document !== 'undefined') {
            const maxAge = tokens.expires_in || 3600;
            document.cookie = `access_token=${tokens.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
          }
        } catch (error) {
          set({ status: 'error', error: (error as Error).message || 'Sign-in failed' });
        }
      },

      logout: async () => {
        set({ status: 'idle', user: null, session: null, accessToken: null, refreshToken: null, subscriptionInfo: undefined, lastAuthenticatedAt: null });
        if (typeof window !== 'undefined') {
          // Clear the middleware auth cookie
          try { document.cookie = 'access_token=; path=/; max-age=0'; } catch { /* no-op */ }
          try { localStorage.removeItem('cafe-auth-storage'); } catch { /* no-op */ }
          try { localStorage.removeItem('tenantId'); } catch { /* no-op */ }
          try { localStorage.removeItem('tenantSlug'); } catch { /* no-op */ }
          try { sessionStorage.clear(); } catch { /* no-op */ }
          // Redirect to SSO logout → clears session cookie → accounts login page
          window.location.href = buildLogoutUrl('https://accounts.codevertexitsolutions.com');
        }
      },

      initialize: async () => {
        const { session, user: existingUser } = get();
        if (!session) {
          set({ status: 'idle' });
          return;
        }
        // If we already have a user from a previous hydration or callback, mark as
        // authenticated immediately — profile refresh happens in background.
        if (existingUser) {
          set({ status: 'authenticated' });
        } else {
          set({ status: 'loading' });
        }
        try {
          const user = await fetchProfile(session.accessToken);
          const profile: UserProfile = {
            id: user.id ?? user.sub,
            email: user.email,
            name: user.name ?? user.fullName,
            roles: user.roles ?? [],
            permissions: user.permissions ?? [],
            tenant_id: user.tenant_id,
            tenant_slug: user.tenant_slug,
            ...user,
          };
          set({ user: profile, status: 'authenticated', lastAuthenticatedAt: Date.now() });
        } catch {
          // If profile fetch fails but we have a valid session, keep the session
          // and mark authenticated with existing user data (graceful degradation).
          const current = get();
          if (current.user) {
            set({ status: 'authenticated', lastAuthenticatedAt: Date.now() });
          } else {
            set({ status: 'idle', session: null, user: null, accessToken: null, refreshToken: null });
          }
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
      onRehydrateStorage: () => (state) => {
        // Called after Zustand hydrates from localStorage.
        if (state?.session?.accessToken && state?.user) {
          // Session + user found in localStorage — mark authenticated immediately.
          // Profile refresh happens lazily via Providers initialize() — no blocking.
          useAuthStore.setState({ status: 'authenticated' });
        } else if (state?.session?.accessToken) {
          // Session but no user — need to fetch profile
          useAuthStore.setState({ status: 'loading' });
          state.initialize();
        } else {
          // No saved session — mark as idle so dashboard redirects to login
          useAuthStore.setState({ status: 'idle' });
        }
      },
    }
  )
);
