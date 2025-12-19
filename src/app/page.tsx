'use client';

import {
    HeroCarousel,
    MenuItemCard,
    ServiceCard,
} from '@/components/sections';
import { Button, Card } from '@/components/ui';
import { dummyEvents, dummyMenuItems, testimonials } from '@/lib/dummy-data';
import { generateLocalBusinessSchema } from '@/lib/utils/schema';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Mail, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import React, { useState } from 'react';

export default function HomePage() {
  const localBusinessSchema = generateLocalBusinessSchema();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubscribing(false);
    setEmail('');
    alert('Thank you for subscribing!');
  };

  const featuredMenuItems = dummyMenuItems.filter((item) => item.featured).slice(0, 3);
  const upcomingEvents = dummyEvents.filter((event) => new Date(event.date) > new Date()).slice(0, 2);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <main className="relative min-h-screen overflow-hidden bg-brand-light dark:bg-brand-dark transition-colors duration-600">
        {/* Magical Background Elements */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-mesh dark:bg-mesh-animated opacity-40 dark:opacity-50 transition-opacity duration-600" />
          <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] bg-glow-orb opacity-20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] bg-glow-orb opacity-20 blur-[120px]" />
        </div>

        {/* Hero Section */}
        <div className="relative z-10">
          <HeroCarousel />
        </div>

      {/* Featured Services */}
      <section className="py-20 md:py-32 relative overflow-hidden z-10 section-border">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-orange/30 dark:via-brand-orange/20 to-transparent" />
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-20 text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-orange/10 dark:bg-brand-orange/10 px-6 py-2 text-[11px] font-black uppercase tracking-[0.4em] text-brand-orange border border-brand-orange/20 dark:border-brand-orange/30 backdrop-blur-md">
              <span>Our Offerings</span>
            </div>
            <h2 className="mb-8 text-5xl font-black text-brand-dark dark:text-brand-light md:text-7xl tracking-tight leading-tight">Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-gold">Urban Loft</span></h2>
            <p className="mx-auto max-w-2xl text-xl text-brand-muted dark:text-brand-beige/80 font-light leading-relaxed">
              BEYOND FOOD — Our complete ecosystem combines premium dining, productive workspaces, and meaningful community experiences. More than café, it's a lifestyle destination.
            </p>
          </motion.div>

          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="electrical-border rounded-3xl"
            >
              <ServiceCard
                title="Urban Loft Café"
                description="Premium café dining with signature meals and a modern ambience. Perfect for families, professionals, and travelers."
                image="/images/services/eat-out.jpg"
                href="/menu"
                features={[
                  'Signature café meals',
                  'Specialty coffee & tea',
                  'Healthy options',
                  'Vegan & vegetarian choices',
                ]}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="electrical-border rounded-3xl"
            >
              <ServiceCard
                title="Business Hub"
                description="Co-working, boardrooms, executive offices, conferencing — designed for productivity with high-speed Wi‑Fi."
                image="/images/services/biz-hub-1.jpg"
                href="/services/hub"
                features={[
                  'High-speed Wi-Fi',
                  'Meeting rooms',
                  'Printing services',
                  'Power outlets everywhere',
                ]}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="electrical-border rounded-3xl"
            >
              <ServiceCard
                title="Events & Catering"
                description="Corporate meetings, private celebrations, and custom catering. We make every occasion special."
                image="/images/services/events.jpg"
                href="/services/events"
                features={[
                  'Corporate events',
                  'Private parties',
                  'Custom catering',
                  'AV equipment available',
                ]}
              />
            </motion.div>
          </div>

          <div className="mt-20 text-center">
            <Link href="/services">
              <Button variant="outline" size="lg" className="group rounded-full border-brand-orange/50 text-brand-orange hover:bg-brand-orange hover:text-white px-12 h-16 text-sm font-black uppercase tracking-widest transition-all backdrop-blur-sm">
                View All Services
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Menu Highlights */}
      <section className="py-20 md:py-32 relative z-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-orange/20 to-transparent" />
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20 text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-6 py-2 text-[11px] font-black uppercase tracking-[0.4em] text-brand-orange border border-brand-orange/20 backdrop-blur-md">
              <span>Chef's Recommendations</span>
            </div>
            <h2 className="mb-8 text-5xl font-black text-brand-dark dark:text-white md:text-7xl tracking-tight">
              Featured Menu <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-gold">Highlights</span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-brand-muted dark:text-brand-beige/80 font-light leading-relaxed">
              Try our most popular items, crafted with care and the finest ingredients
            </p>
          </motion.div>

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {featuredMenuItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="electrical-border rounded-3xl"
              >
                <MenuItemCard item={item} />
              </motion.div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <Link href="/menu">
              <Button variant="primary" size="lg" className="group bg-brand-orange hover:bg-brand-burnt text-white border-none px-14 h-18 rounded-full text-sm font-black uppercase tracking-widest shadow-2xl shadow-brand-orange/30 transition-all hover:scale-105 hover:shadow-brand-orange/50">
                View Full Menu
                <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="py-20 md:py-32 relative overflow-hidden z-10">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-orange/20 to-transparent" />
          <div className="container">
            <div className="mb-20 text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-6 py-2 text-[11px] font-black uppercase tracking-[0.4em] text-brand-orange border border-brand-orange/20 backdrop-blur-md">
                <span>What's Happening</span>
              </div>
              <h2 className="text-5xl font-black text-brand-dark dark:text-white md:text-7xl tracking-tight">Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-gold">Events</span></h2>
            </div>

            <div className="grid gap-12 lg:grid-cols-2">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="electrical-border rounded-[3rem]"
                >
                  <Card className="group overflow-hidden border-none bg-white/5 backdrop-blur-md shadow-2xl shadow-black/50">
                    <div className="flex flex-col md:flex-row">
                      <div className="relative h-72 w-full md:w-2/5">
                        <Image
                          src={event.image}
                          alt={event.name}
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/80 to-transparent md:hidden" />
                      </div>
                      <div className="flex flex-1 flex-col justify-center p-10">
                        <div className="mb-6 flex items-center gap-3 text-brand-orange">
                          <Calendar className="h-6 w-6" />
                          <span className="text-sm font-black uppercase tracking-widest">
                            {new Date(event.date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <h3 className="mb-4 text-3xl font-black text-white group-hover:text-brand-orange transition-colors">{event.name}</h3>
                        <p className="mb-8 text-brand-beige/70 font-light line-clamp-2">{event.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange">
                              {event.availableSlots} spots left
                            </span>
                          </div>
                          <Link href={`/events/${event.id}`}>
                            <Button variant="ghost" className="text-brand-orange hover:text-brand-gold p-0 font-black uppercase tracking-widest text-[10px] group/btn">
                              Event Details
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="mt-20 text-center">
              <Link href="/events">
                <Button variant="outline" size="lg" className="group rounded-full border-brand-orange/50 text-brand-orange hover:bg-brand-orange hover:text-white px-12 h-16 text-sm font-black uppercase tracking-widest transition-all backdrop-blur-sm">
                  View All Events
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="py-20 md:py-32 relative z-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-orange/20 to-transparent" />
        <div className="container">
          <div className="mb-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-6 py-2 text-[11px] font-black uppercase tracking-[0.4em] text-brand-orange border border-brand-orange/20 backdrop-blur-md">
                <span>Community Voices</span>
              </div>
              <h2 className="mb-8 text-5xl font-black text-white md:text-7xl tracking-tight">
                What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-gold">Community</span> Says
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-brand-beige/80 font-light leading-relaxed">
                Don't just take our word for it - hear from the people who make Urban Loft their second home.
              </p>
            </motion.div>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="electrical-border rounded-[2.5rem]"
              >
                <Card className="h-full p-10 border-none bg-white/5 backdrop-blur-md shadow-2xl shadow-black/50">
                  <div className="mb-8 flex gap-1 text-brand-orange">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < testimonial.rating ? 'fill-current' : 'opacity-20'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mb-10 text-xl italic font-light text-brand-beige/90 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center gap-5">
                    <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-brand-orange/30">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-black text-white tracking-tight text-lg">{testimonial.name}</h4>
                      <p className="text-xs font-bold uppercase tracking-widest text-brand-orange/80">{testimonial.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section - Loft Club */}
      <section className="py-24 md:py-48 relative overflow-hidden z-10">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0">
          {/* Animated gradient background */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-brand-dark/50 via-transparent to-brand-dark/50 pointer-events-none" />
          
          {/* Decorative orbs */}
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/4 -left-64 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl opacity-40"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            className="absolute bottom-1/4 -right-64 w-96 h-96 bg-brand-gold/15 rounded-full blur-3xl opacity-40"
          />
          
          {/* Mesh pattern */}
          <div className="absolute inset-0 bg-mesh opacity-15 pointer-events-none" />
        </div>

        {/* Divider line */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-orange/30 to-transparent" />
        
        <div className="container relative z-10">
          <div className="grid gap-12 md:gap-16 lg:grid-cols-2 items-center">
            {/* Left Content - Text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-orange/10 dark:bg-brand-orange/20 px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.4em] text-brand-orange dark:text-brand-orange border border-brand-orange/20 dark:border-brand-orange/30 backdrop-blur-md w-fit">
                <Mail className="h-4 w-4" />
                <span>Exclusive Community</span>
              </div>

              {/* Heading */}
              <div>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-brand-dark dark:text-brand-light tracking-tight leading-tight mb-4">
                  Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-brand-gold to-brand-burnt dark:from-brand-orange dark:via-brand-gold dark:to-brand-burnt">Loft Club</span>
                </h2>
                <div className="w-20 h-1.5 bg-gradient-to-r from-brand-orange to-brand-gold rounded-full" />
              </div>

              {/* Description */}
              <div className="space-y-4">
                <p className="text-lg md:text-xl text-brand-muted dark:text-brand-beige/80 font-light leading-relaxed">
                  Become part of our exclusive community and unlock premium benefits designed for Urban Loft enthusiasts.
                </p>
                
                {/* Benefits List */}
                <ul className="space-y-3 mt-8">
                  {[
                    { icon: '🎁', text: 'Exclusive member-only offers & discounts' },
                    { icon: '🎉', text: 'Early access to new menu items & events' },
                    { icon: '⭐', text: 'VIP table reservations & priority seating' },
                    { icon: '🎂', text: 'Birthday treats & anniversary rewards' },
                  ].map((benefit, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      className="flex items-center gap-4 text-sm md:text-base"
                    >
                      <span className="text-2xl flex-shrink-0">{benefit.icon}</span>
                      <span className="font-bold text-brand-dark dark:text-brand-light tracking-wide">{benefit.text}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Right Content - Form Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 40 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="electrical-border rounded-[3rem] overflow-hidden"
            >
              {/* Card Background with gradient and pattern */}
              <div className="relative backdrop-blur-2xl bg-gradient-to-br from-brand-orange/20 via-brand-gold/10 to-transparent dark:from-brand-orange/30 dark:via-brand-gold/15 dark:to-brand-dark/20 p-8 md:p-12 border border-brand-beige/20 dark:border-brand-orange/20 shadow-2xl dark:shadow-2xl dark:shadow-black/50">
                {/* Decorative elements inside card */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl opacity-30" />
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl opacity-30" />
                
                <div className="relative z-10 space-y-6">
                  {/* Icon */}
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-brand-orange/40 to-brand-gold/30 dark:from-brand-orange/50 dark:to-brand-gold/40 text-brand-orange dark:text-brand-orange border-2 border-brand-orange/60 dark:border-brand-orange/50 shadow-lg shadow-brand-orange/30 dark:shadow-brand-orange/40"
                  >
                    <Mail className="h-10 w-10" />
                  </motion.div>

                  {/* Card Heading */}
                  <div>
                    <h3 className="text-3xl md:text-4xl font-black text-brand-dark dark:text-brand-light tracking-tight">
                      Get Started <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-gold">Today</span>
                    </h3>
                    <p className="text-sm md:text-base text-brand-muted dark:text-brand-beige/70 font-light mt-2 leading-relaxed">
                      Join thousands of Urban Loft lovers enjoying exclusive perks.
                    </p>
                  </div>

                  {/* Newsletter Form */}
                  <form onSubmit={handleNewsletterSubmit} className="space-y-4 pt-4">
                    {/* Email Input */}
                    <motion.div
                      className="relative group"
                      whileFocus={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/0 via-brand-orange/20 to-brand-orange/0 opacity-0 group-focus-within:opacity-100 rounded-2xl blur-lg transition-opacity duration-500 -z-10" />
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="relative w-full h-14 rounded-2xl bg-white/80 dark:bg-white/10 backdrop-blur-md border-2 border-brand-beige/30 dark:border-white/20 px-6 text-brand-dark dark:text-white placeholder:text-brand-muted/40 dark:placeholder:text-brand-beige/30 focus:border-brand-orange dark:focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all duration-300 hover:border-brand-orange/50 dark:hover:border-brand-orange/50 font-medium"
                      />
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubscribing}
                      className="w-full h-14 rounded-2xl bg-gradient-to-r from-brand-orange via-brand-gold to-brand-burnt hover:from-brand-burnt hover:via-brand-burnt hover:to-brand-burnt dark:hover:from-brand-burnt dark:hover:via-brand-orange dark:hover:to-brand-gold px-8 font-black uppercase tracking-widest text-white text-sm shadow-xl shadow-brand-orange/40 dark:shadow-brand-orange/30 hover:shadow-brand-orange/60 dark:hover:shadow-brand-orange/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group transition-all duration-300"
                    >
                      <motion.div
                        animate={isSubscribing ? { x: [0, 5, -5, 0] } : { x: 0 }}
                        transition={{ duration: 0.6, repeat: isSubscribing ? Infinity : 0 }}
                        className="flex items-center justify-center gap-2"
                      >
                        {isSubscribing ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Joining...</span>
                          </>
                        ) : (
                          <>
                            <span>Join Now</span>
                            <motion.span
                              animate={{ x: [0, 4, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="inline-block"
                            >
                              <ArrowRight className="h-5 w-5" />
                            </motion.span>
                          </>
                        )}
                      </motion.div>
                    </motion.button>

                    {/* Privacy Notice */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="text-xs font-bold uppercase tracking-widest text-brand-muted/60 dark:text-brand-beige/40 text-center pt-2"
                    >
                      We respect your privacy. Unsubscribe anytime.
                    </motion.p>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Divider */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-orange/30 to-transparent" />
      </section>
    </main>
    </>
  );
}
