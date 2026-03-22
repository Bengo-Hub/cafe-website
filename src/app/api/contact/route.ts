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
