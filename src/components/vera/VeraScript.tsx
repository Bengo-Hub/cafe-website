'use client';

import { useEffect } from 'react';

const VERA_WIDGET_URL = 'https://marketflow.codevertexitsolutions.com/widget/chat.js';
const VERA_API_URL    = 'https://marketflowai.codevertexitsolutions.com';

// Loads the Vera AI widget for the Urban Loft public site.
// Uses useEffect so document.currentScript is properly set when chat.js
// runs — next/script lazyOnload injects via its own scheduler and breaks
// document.currentScript, so we inject manually like VeraWidget does.
export function VeraScript() {
  useEffect(() => {
    if ((window as unknown as Record<string, unknown>).__veraLoaded) return;

    const script = document.createElement('script');
    script.src   = VERA_WIDGET_URL;
    script.async = true;
    script.setAttribute('data-tenant',        'urban-loft');
    script.setAttribute('data-mode',          'tenant');
    script.setAttribute('data-api-url',       VERA_API_URL);
    script.setAttribute('data-widget-title',  'Vera');
    script.setAttribute('data-subtitle',      'Urban Loft Cafe · AI Assistant');
    script.setAttribute('data-persona',       'urban-loft-cafe');
    script.setAttribute('data-business-type', 'cafe');
    script.setAttribute('data-primary-color', '#f97316');
    script.setAttribute('data-accent-color',  '#dc6b19');
    script.setAttribute('data-whatsapp',      '254712345678');
    script.setAttribute('data-theme',         'auto');
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
      delete (window as unknown as Record<string, unknown>).__veraLoaded;
    };
  }, []);

  return null;
}
