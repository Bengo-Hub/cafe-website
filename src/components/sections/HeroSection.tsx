'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Button } from '../ui';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string; // backward compatibility; if provided, used as single slide
  images?: string[]; // preferred: list of hero images
  intervalMs?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  ctaButtons?: Array<{
    text: string;
    href: string;
    variant?: 'primary' | 'secondary' | 'outline';
  }>;
  height?: 'small' | 'medium' | 'large' | 'full';
}

const DEFAULT_SLIDES = [
  '/images/hero/hero-food.jpg',
  '/images/hero/hero-premium-coffee.jpg',
  '/images/hero/hero-work-hub-1.jpg',
  '/images/hero/hero-events.jpg',
  '/images/hero/hero-accommodation.jpg',
  '/images/hero/hero-signature-meals.jpg',
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  title = 'Urban Loft Cafe',
  subtitle = 'BEYOND FOOD',
  description = 'Eat. Work. Connect. Experience.',
  backgroundImage,
  images,
  intervalMs = 5000,
  showControls = true,
  showIndicators = true,
  ctaButtons = [],
  height = 'large',
}) => {
  const heightClasses = {
    small: 'h-[400px]',
    medium: 'h-[500px]',
    large: 'h-[600px] md:h-[700px]',
    full: 'h-screen',
  };

  const slides = images && images.length > 0 ? images : backgroundImage ? [backgroundImage] : DEFAULT_SLIDES;

  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (slides.length <= 1) return; // no autoplay for single slide
    if (paused) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [slides.length, intervalMs, paused]);

  const goTo = (i: number) => setIndex(((i % slides.length) + slides.length) % slides.length);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  return (
    <section
      className={`relative ${heightClasses[height]} w-full overflow-hidden`}
      aria-roledescription="carousel"
      aria-label="Hero images"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={slides[index]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
            aria-live="polite"
            aria-label={`Slide ${index + 1} of ${slides.length}`}
          >
            <Image
              src={slides[index]}
              alt={`Hero slide ${index + 1}`}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h2 className="mb-2 text-lg font-semibold tracking-widest text-amber-400 md:text-xl">
              {subtitle}
            </h2>
            <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="mb-8 text-xl text-gray-200 md:text-2xl lg:text-3xl">
              {description}
            </p>
          </motion.div>

          {ctaButtons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              {ctaButtons.map((button, index) => (
                <Link key={index} href={button.href}>
                  <Button
                    variant={button.variant || 'primary'}
                    size="lg"
                    className="min-w-[180px]"
                  >
                    {button.text}
                  </Button>
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Controls */}
      {showControls && slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
              className={`h-2 w-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/50 hover:bg-white/80'}`}
            />
          ))}
        </div>
      )}

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-white"
        >
          <svg
            className="h-8 w-8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
};
