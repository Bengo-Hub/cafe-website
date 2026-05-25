import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/session
 * Sets the access_token cookie server-side (via Set-Cookie header).
 * Called by the SSO callback after a successful token exchange to ensure
 * the cookie is reliably available for the Next.js edge middleware on the
 * very next navigation to /dashboard.
 */
export async function POST(req: NextRequest) {
  const { accessToken, expiresIn } = await req.json();

  if (!accessToken || typeof accessToken !== 'string') {
    return NextResponse.json({ error: 'missing_token' }, { status: 400 });
  }

  const maxAge = typeof expiresIn === 'number' && expiresIn > 0 ? expiresIn : 3600;

  const res = NextResponse.json({ ok: true });
  res.cookies.set('access_token', accessToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
  return res;
}

/**
 * DELETE /api/auth/session
 * Clears the access_token cookie (called on logout).
 */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('access_token', '', { path: '/', maxAge: 0 });
  return res;
}
