import Script from 'next/script';

const VERA_WIDGET_URL = 'https://marketflow.codevertexitsolutions.com/widget/chat.js';
const VERA_API_URL    = 'https://marketflowai.codevertexitsolutions.com';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* Vera AI — Urban Loft Cafe persona, scoped to urban-loft tenant only */}
      <Script
        src={VERA_WIDGET_URL}
        strategy="lazyOnload"
        data-tenant="urban-loft"
        data-mode="tenant"
        data-api-url={VERA_API_URL}
        data-widget-title="Vera"
        data-subtitle="Urban Loft Cafe · AI Assistant"
        data-persona="urban-loft-cafe"
        data-business-type="cafe"
        data-primary-color="#f97316"
        data-accent-color="#dc6b19"
        data-whatsapp="254712345678"
        data-theme="auto"
      />
    </>
  );
}
