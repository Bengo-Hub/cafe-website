/**
 * SSO URL helpers. Main auth flow uses sso-api (PKCE) and auth store.
 */

const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'https://sso.codevertexafrica.com';
const CAFE_WEBSITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theurbanloftcafe.com';
const AUTH_UI_URL = process.env.NEXT_PUBLIC_AUTH_UI_URL || 'https://accounts.codevertexafrica.com';

export const SSO_URLS = {
  authService: AUTH_SERVICE_URL,
  authUi: AUTH_UI_URL,
  siteUrl: CAFE_WEBSITE_URL,
  getLoginUrl: (returnTo?: string) => {
    const loginUrl = new URL('/login', AUTH_UI_URL);
    if (returnTo) loginUrl.searchParams.set('return_to', returnTo);
    const tenant = process.env.NEXT_PUBLIC_TENANT_SLUG;
    if (tenant) loginUrl.searchParams.set('tenant', tenant);
    return loginUrl.toString();
  },
  getLogoutUrl: (returnTo?: string) => {
    const logoutUrl = new URL('/api/v1/auth/logout', AUTH_SERVICE_URL);
    logoutUrl.searchParams.set('post_logout_redirect_uri', returnTo || CAFE_WEBSITE_URL);
    return logoutUrl.toString();
  },
};
