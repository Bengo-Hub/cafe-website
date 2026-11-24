import { config } from '@/config/env';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ContactFormBody {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function POST(request: NextRequest) {
  let body: ContactFormBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.name || !body.email || !body.subject || !body.message) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const tenantSlug = config.tenant.slug;
  const notificationsUrl = config.services.notifications;

  // The enquiry is saved as the cafe's lead in MarketFlow, which owns leads (one person stays one
  // lead there). Best effort: the email to the cafe goes out either way.
  await saveLead(tenantSlug, body).catch((e) => console.error('marketflow lead not saved:', e));

  try {
    // Resolve tenant contact_email from auth-api public endpoint
    const tenantResp = await fetch(
      `${config.services.auth}/api/v1/tenants/by-slug/${tenantSlug}`,
      { headers: { 'User-Agent': 'cafe-website/1.0' } }
    );

    let recipientEmail = '';
    if (tenantResp.ok) {
      const tenant = await tenantResp.json();
      recipientEmail = tenant.contact_email || '';
    }

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Could not resolve contact recipient' },
        { status: 503 }
      );
    }

    const payload = {
      channel: 'email',
      tenant: tenantSlug,
      template: 'email/cafe/cafe_contact_form',
      to: [recipientEmail],
      data: {
        sender_name: body.name,
        sender_email: body.email,
        subject: body.subject,
        message: body.message,
      },
      metadata: {
        subject: `Contact Form: ${body.subject}`,
        reply_to: body.email,
      },
    };

    const resp = await fetch(
      `${notificationsUrl}/api/v1/${tenantSlug}/notifications/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: 'Unknown error' }));
      console.error('notifications-api error:', resp.status, err);
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 502 }
      );
    }

    const result = await resp.json();
    return NextResponse.json({
      status: 'sent',
      requestId: result.requestId,
    });
  } catch (err) {
    console.error('contact form error:', err);
    return NextResponse.json(
      { error: 'Service temporarily unavailable. Please try again later.' },
      { status: 503 }
    );
  }
}

/** Posts the enquiry to MarketFlow's public lead endpoint for the cafe's tenant. */
async function saveLead(tenantSlug: string, body: ContactFormBody): Promise<void> {
  const parts = body.name.trim().split(/\s+/);
  const resp = await fetch(`${config.services.marketflow}/api/v1/public/leads/${encodeURIComponent(tenantSlug)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'cafe-website/1.0' },
    body: JSON.stringify({
      first_name: parts[0],
      last_name: parts.slice(1).join(' ') || undefined,
      email: body.email,
      interest: `${body.subject}: ${body.message}`.slice(0, 2000),
      source: 'website_contact',
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!resp.ok) throw new Error(`status ${resp.status}`);
}
