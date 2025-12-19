'use client';

import { ServiceCard } from '@/components/sections';
import { Button } from '@/components/ui';
import { motion } from 'framer-motion';
import {
    Briefcase,
    GraduationCap,
    Hotel,
    Music,
    Star,
    Utensils
} from 'lucide-react';
import Image from 'next/image';

export default function ServicesPage() {
  const services = [
    {
      title: 'The Café',
      description: 'Premium dining with urban boho ambience, perfect for families, professionals, and travelers.',
      icon: <Utensils className="h-8 w-8" />,
      image: '/images/services/food-ordering.jpg',
      link: '/menu',
      features: ['Signature meals', 'Specialty coffee', 'Fresh juices', 'Weekly specials'],
    },
    {
      title: 'Business Hub',
      description: 'Modern facilities including co-working spaces, boardrooms, and executive offices.',
      icon: <Briefcase className="h-8 w-8" />,
      image: '/images/services/biz-hub-1.jpg',
      link: '/services/hub',
      features: ['Co-working spaces', 'Boardrooms', 'Executive offices', 'High-speed Wi-Fi'],
    },
    {
      title: 'Service Training Center',
      description: 'Focused on hospitality and service teams, offering customer service and F&B skills training.',
      icon: <GraduationCap className="h-8 w-8" />,
      image: '/images/hero/hero-team.jpg',
      link: '/contact',
      features: ['Customer service', 'F&B service skills', 'Café operations', 'Team building'],
    },
    {
      title: 'Executive Accommodation',
      description: 'Premium executive rooms designed for comfort and productivity during your stay.',
      icon: <Hotel className="h-8 w-8" />,
      image: '/images/services/accommodation-1.jpg',
      link: '/contact',
      features: ['Premium rooms', 'Quiet environment', 'Room service', 'Workspace in room'],
    },
    {
      title: 'Themed Days & Events',
      description: 'Join us for Pizza Fridays, Couples Nights, and other exciting community gatherings.',
      icon: <Music className="h-8 w-8" />,
      image: '/images/services/events.jpg',
      link: '/events',
      features: ['Pizza Friday', 'Couples Night', 'Live music', 'Networking events'],
    },
    {
      title: 'Loyalty Program',
      description: 'Earn points on every purchase and enjoy exclusive rewards and member-only offers.',
      icon: <Star className="h-8 w-8" />,
      image: '/images/hero/hero-team.jpg',
      link: '/contact',
      features: ['Point accumulation', 'Exclusive discounts', 'Birthday rewards', 'Early access'],
    },
  ];

  return (
      <main className="relative min-h-screen overflow-hidden bg-brand-dark">
        {/* Magical Background Elements */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-mesh opacity-40" />
          <div className="absolute top-[-10%] right-[-10%] h-[40%] w-[40%] bg-glow-orb opacity-20 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] h-[40%] w-[40%] bg-glow-orb opacity-20 blur-[120px]" />
        </div>

        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[600px] w-full overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/hero/hero-reception.jpg"
              alt="Our Services"
              fill
              className="object-cover scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/90 via-brand-dark/40 to-brand-dark" />
            <div className="absolute inset-0 bg-mesh opacity-20" />
          </div>

          <div className="container relative z-10 flex h-full flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-orange/20 backdrop-blur-md px-6 py-2 text-xs font-black uppercase tracking-[0.4em] text-brand-orange border border-brand-orange/30">
                <Star className="h-4 w-4" />
                <span>Premium Offerings</span>
              </div>
              <h1 className="mb-6 text-7xl font-black text-white md:text-9xl tracking-tighter leading-none">
                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-gold">Services</span>
              </h1>
              <p className="mx-auto max-w-2xl text-xl font-light text-brand-beige/80 leading-relaxed md:text-2xl">
                Everything you need to eat, work, and connect in one modern space.
                Discover our ecosystem designed for your lifestyle.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 md:py-32 relative z-10">
          <div className="container">
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ServiceCard
                    title={service.title}
                    description={service.description}
                    icon={service.icon}
                    image={service.image}
                    href={service.link}
                    features={service.features}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-blend-dark py-24 md:py-32 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-orange/10 rounded-full blur-[120px] -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-brown/20 rounded-full blur-[120px] translate-y-1/2" />
          
          <div className="container relative z-10">
            <div className="mx-auto max-w-4xl electrical-border rounded-[3rem]">
              <div className="overflow-hidden rounded-[3rem] bg-brand-dark/40 backdrop-blur-xl p-10 md:p-20 text-center shadow-2xl border border-white/10">
                <h2 className="mb-6 text-4xl font-black text-white md:text-6xl tracking-tight">Need a <span className="text-brand-orange">Custom Solution?</span></h2>
                <p className="mb-10 text-xl font-light text-brand-beige/60 leading-relaxed">
                  Whether it's a large corporate event, a long-term office rental, or a special catering request, we're here to help.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a href="/contact">
                    <Button className="h-16 rounded-full bg-brand-orange px-10 font-black uppercase tracking-widest text-white hover:bg-brand-burnt shadow-xl shadow-brand-orange/20 transition-all hover:scale-105">
                      Contact Our Team
                    </Button>
                  </a>
                  <a href="/menu">
                    <Button variant="outline" className="h-16 rounded-full border-white/20 text-white hover:bg-white/10 px-10 font-black uppercase tracking-widest transition-all">
                      Explore Menu
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
  );
}
