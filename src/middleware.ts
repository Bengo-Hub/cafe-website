import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth protection is handled client-side in the dashboard layout (useAuth hook +
// useEffect redirect) — the same pattern used by ordering-frontend, pos-ui, treasury-ui,
// and all other services in this platform. A server-side cookie gate here fired before
// the React app could set the session cookie, causing a redirect loop on every login.
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
