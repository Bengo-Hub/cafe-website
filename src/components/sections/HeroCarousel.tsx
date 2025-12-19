'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui';

interface SlideContent {
  subtitle: string;
  title: string;
  description: string;
  image: string;
  primaryBtn: { text: string; href: string };
  secondaryBtn?: { text: string; href: string };
}

const SLIDES: SlideContent[] = [
  {
    subtitle: 'BEYOND FOOD',
    title: 'Urban Loft Cafe',
    description: 'Eat. Work. Connect. Experience.',
    image: '/images/hero/hero-food.jpg',
    primaryBtn: { text: 'Explore Menu', href: '/menu' },
    secondaryBtn: { text: 'Our Story', href: '/about' },
  },
  {
    subtitle: 'PREMIUM COFFEE',
    title: 'Artisan Brews',
    description: 'Sourced from the finest beans in East Africa.',
    image: '/images/hero/hero-premium-coffee.jpg',
    primaryBtn: { text: 'View Coffee Menu', href: '/menu?category=Coffee' },
    secondaryBtn: { text: 'Learn More', href: '/about#coffee' },
  },
  {
    subtitle: 'BUSINESS HUB',
    title: 'Work Productively',
    description: 'Modern co-working spaces with high-speed Wi-Fi.',
    image: '/images/hero/her-work-hub-1.jpg',
    primaryBtn: { text: 'Book a Space', href: '/services/hub' },
    secondaryBtn: { text: 'View Amenities', href: '/services/hub#amenities' },
  },
  {
    subtitle: 'COMMUNITY EVENTS',
    title: 'Gather Together',
    description: 'Join us for themed nights and special celebrations.',
    image: '/images/hero/hero-events.jpg',
    primaryBtn: { text: 'Upcoming Events', href: '/events' },
    secondaryBtn: { text: 'Host an Event', href: '/services/events' },
  },
  {
    subtitle: 'EXECUTIVE STAY',
    title: 'Comfort & Privacy',
    description: 'Tailored accommodation for the modern business traveler.',
    image: '/images/hero/hero-accommodation.jpg',
    primaryBtn: { text: 'Book a Stay', href: '/services/accommodation' },
    secondaryBtn: { text: 'View Rooms', href: '/services/accommodation#rooms' },
  },
  {
    subtitle: 'SIGNATURE MEALS',
    title: 'Elevated Dining',
    description: 'A fusion of comfort, creativity, and freshness.',
    image: '/images/hero/hero-signature-meals.jpg',
    primaryBtn: { text: 'Order Now', href: '/menu' },
    secondaryBtn: { text: 'Table Reservation', href: '/contact#reserve' },
  },
];

export const HeroCarousel: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [index]);

  const nextSlide = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const variants = {
    enter: (_direction: number) => ({
      opacity: 0,
      scale: 1.2,
      filter: 'blur(10px)',
    }),
    center: {
      zIndex: 1,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
    },
    exit: (_direction: number) => ({
      zIndex: 0,
      opacity: 0,
      scale: 0.9,
      filter: 'blur(10px)',
    }),
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.5 + i * 0.1,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <div className="relative h-[85vh] md:h-[95vh] w-full overflow-hidden bg-brand-dark">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={index}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            opacity: { duration: 1.2, ease: "easeInOut" },
            scale: { duration: 1.5, ease: "easeOut" },
            filter: { duration: 1.2 },
          }}
          className="absolute inset-0"
        >
          <Image
            src={SLIDES[index].image}
            alt={SLIDES[index].title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Magical Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/70 via-brand-dark/40 to-brand-dark" />
          <div className="absolute inset-0 bg-mesh opacity-30" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="max-w-5xl text-center">
          <AnimatePresence mode="wait">
            <motion.div key={index} initial="hidden" animate="visible" exit="hidden">
              <motion.h2
                custom={0}
                variants={textVariants}
                className="mb-6 text-xs font-black uppercase tracking-[0.5em] text-brand-orange border-b border-brand-orange/30 pb-2 inline-block"
              >
                {SLIDES[index].subtitle}
              </motion.h2>
              <motion.h1
                custom={1}
                variants={textVariants}
                className="mb-8 text-6xl font-black text-white md:text-9xl tracking-tighter leading-none"
              >
                {SLIDES[index].title.split(' ').map((word, i) => (
                  <span key={i} className={i === 1 ? "text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-gold" : ""}>
                    {word}{' '}
                  </span>
                ))}
              </motion.h1>
              <motion.p
                custom={2}
                variants={textVariants}
                className="mx-auto mb-12 max-w-2xl text-xl font-light text-brand-beige/80 md:text-2xl leading-relaxed"
              >
                {SLIDES[index].description}
              </motion.p>
              <motion.div
                custom={3}
                variants={textVariants}
                className="flex flex-wrap items-center justify-center gap-6"
              >
                <Link href={SLIDES[index].primaryBtn.href}>
                  <Button size="lg" className="h-16 min-w-[200px] rounded-full bg-brand-orange px-12 text-sm font-black uppercase tracking-widest text-white hover:bg-brand-burnt transition-all shadow-2xl shadow-brand-orange/30 hover:scale-105">
                    {SLIDES[index].primaryBtn.text}
                  </Button>
                </Link>
                {SLIDES[index].secondaryBtn && (
                  <Link href={SLIDES[index].secondaryBtn.href}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-16 min-w-[200px] rounded-full border-white/30 px-12 text-sm font-black uppercase tracking-widest text-white hover:bg-white hover:text-brand-dark transition-all backdrop-blur-md"
                    >
                      {SLIDES[index].secondaryBtn.text}
                    </Button>
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-8 top-1/2 z-20 -translate-y-1/2 rounded-2xl bg-white/5 p-5 text-white backdrop-blur-xl transition-all hover:bg-brand-orange hover:text-white border border-white/10 hover:border-brand-orange/50 group"
        aria-label="Previous slide"
      >
        <svg className="h-6 w-6 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-8 top-1/2 z-20 -translate-y-1/2 rounded-2xl bg-white/5 p-5 text-white backdrop-blur-xl transition-all hover:bg-brand-orange hover:text-white border border-white/10 hover:border-brand-orange/50 group"
        aria-label="Next slide"
      >
        <svg className="h-6 w-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-12 left-1/2 z-20 flex -translate-x-1/2 gap-4">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
            className={`h-1.5 transition-all duration-500 ${
              i === index ? 'w-12 bg-brand-orange' : 'w-6 bg-white/20 hover:bg-white/40'
            } rounded-full`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
