/**
 * Sends a website form (contact, franchise enquiry, job application) to the cafe's own email
 * through /api/contact, which resolves the tenant's contact email and posts to notifications-api.
 */
export interface Enquiry {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendEnquiry(e: Enquiry): Promise<void> {
  const resp = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(e),
  });
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to send. Please try again.');
  }
}

/** "Label: value" lines for the email body, skipping empty values. */
export function enquiryLines(fields: Record<string, string>): string {
  return Object.entries(fields)
    .filter(([, v]) => v.trim() !== '')
    .map(([k, v]) => `${k}: ${v.trim()}`)
    .join('\n');
}
