import { Button } from '@/components/ui';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4 bg-brand-cream dark:bg-brand-dark transition-colors duration-500">
      <div className="electrical-border rounded-full p-1 mb-8">
        <div className="h-32 w-32 rounded-full bg-brand-orange/10 flex items-center justify-center backdrop-blur-md">
          <span className="text-5xl font-black text-brand-orange">404</span>
        </div>
      </div>
      <h1 className="text-4xl font-black text-primary-brand md:text-6xl tracking-tight">Lost in the <span className="text-brand-orange">Loft?</span></h1>
      <p className="mt-6 text-lg text-secondary-brand font-light max-w-md leading-relaxed">
        The page you're looking for has vanished into thin air. Let's get you back to the warmth of our café.
      </p>
      <div className="mt-10">
        <Link href="/">
          <Button size="lg" className="rounded-full bg-brand-orange px-12 h-16 text-lg font-black text-white shadow-2xl shadow-brand-orange/30 hover:scale-105 transition-all border-none">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
