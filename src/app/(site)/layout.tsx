import { VeraScript } from '@/components/vera/VeraScript';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <VeraScript />
    </>
  );
}
