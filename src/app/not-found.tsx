import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
      <p className="text-[15px] text-ink-soft">Page not found</p>
      <h1 className="font-display mt-3 max-w-2xl text-5xl leading-[0.95] text-ink md:text-6xl">This page is not on the menu</h1>
      <p className="mt-5 max-w-lg text-lg text-ink-soft">The link may be old, or the address mistyped. These will get you back on track.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="inline-flex h-12 items-center rounded-md bg-loft px-5 text-[15px] font-semibold text-white hover:bg-loft-deep">
          Home page
        </Link>
        <Link href="/reserve" className="inline-flex h-12 items-center rounded-md border border-ink/25 px-5 text-[15px] font-semibold text-ink hover:border-ink">
          Book a table
        </Link>
        <Link href="/contact" className="inline-flex h-12 items-center rounded-md border border-ink/25 px-5 text-[15px] font-semibold text-ink hover:border-ink">
          Contact us
        </Link>
      </div>
    </section>
  );
}
