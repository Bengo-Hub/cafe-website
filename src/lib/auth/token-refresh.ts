/**
 * Access-token refresh for the cafe website, built on the shared cross-tab-safe refresher
 * (@bengo-hub/shared-ui-lib/auth createSessionRefresher). Before spending the refresh token it
 * picks up a newer session another tab saved, tabs take turns refreshing, and an enrolment-only
 * answer counts as signed out. See the shared module for the full story.
 */

import { createSessionRefresher } from '@bengo-hub/shared-ui-lib/auth';
import { useAuthStore } from '@/lib/store/auth-store';
import { refreshTokens } from '@/lib/auth/sso-api';

/** The persisted store key; also names the cross-tab refresh lock and the storage watcher. */
export const AUTH_STORAGE_KEY = 'cafe-auth-storage';

const refreshSession = createSessionRefresher({
  lockName: AUTH_STORAGE_KEY,
  getSession: () => useAuthStore.getState().session,
  reloadSession: () => useAuthStore.persist.rehydrate(),
  // The store keeps top-level copies of both tokens that the API client reads; keep them in step.
  saveSession: (session) =>
    useAuthStore.setState({
      session,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    }),
  refresh: refreshTokens,
});

/**
 * Returns a usable access token, or null when the session is over (or auth-api could not be
 * reached; callers here treat both the same way). Pass the token the server just rejected
 * when it is known.
 */
export async function refreshAccessToken(failedToken?: string | null): Promise<string | null> {
  const outcome = await refreshSession(failedToken);
  return 'token' in outcome ? outcome.token : null;
}
