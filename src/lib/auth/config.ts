import { NextAuthConfig } from "next-auth";
import { JWT } from "next-auth/jwt";

// SSO URLs - production defaults
const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "https://sso.codevertexitsolutions.com";
const CAFE_WEBSITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theurbanloftcafe.com";

// Export SSO URLs for use in logout and redirect functions
export const SSO_URLS = {
  authService: AUTH_SERVICE_URL,
  siteUrl: CAFE_WEBSITE_URL,
  // SSO login URL with return_to parameter for post-login redirect
  getLoginUrl: (returnTo?: string) => {
    const loginUrl = new URL("/login", `${AUTH_SERVICE_URL.replace('/api/v1', '')}`);
    if (returnTo) {
      loginUrl.searchParams.set("return_to", returnTo);
    }
    return loginUrl.toString();
  },
  // SSO logout URL for proper session cleanup
  getLogoutUrl: (returnTo?: string) => {
    const logoutUrl = new URL("/api/v1/auth/logout", AUTH_SERVICE_URL);
    logoutUrl.searchParams.set("post_logout_redirect_uri", returnTo || CAFE_WEBSITE_URL);
    return logoutUrl.toString();
  },
};

export const authConfig: NextAuthConfig = {
  providers: [
    {
      id: "bengobox-auth",
      name: "BengoBox SSO",
      type: "oidc",
      issuer: AUTH_SERVICE_URL,
      clientId: process.env.AUTH_CLIENT_ID,
      clientSecret: process.env.AUTH_CLIENT_SECRET,
      authorization: {
        params: { scope: "openid profile email offline_access" },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: profile.role || "customer",
          tenantId: profile.tenant_id,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
          user: {
            ...user,
          },
        } as any;
      }
      
      // Return previous token if the access token has not expired yet
      if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000) {
        return token;
      }

      // If the access token has expired, try to refresh it
      return refreshAccessToken(token) as any;
    },
    async session({ session, token }) {
      session.user = token.user as any;
      session.accessToken = token.accessToken as string;
      session.error = token.error as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

async function refreshAccessToken(token: JWT) {
  try {
    const url = `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/token`;
    const response = await fetch(url, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.AUTH_CLIENT_ID!,
        client_secret: process.env.AUTH_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      }),
      method: "POST",
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
