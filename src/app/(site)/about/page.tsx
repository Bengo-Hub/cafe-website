'use client';

import { TeamMemberCard, ValueCard } from '@/components/sections';
import { useERPStaff } from '@/hooks/use-erp-staff';
import { TeamMember } from '@/hooks/use-team';
import { motion } from 'framer-motion';
import { Award, Handshake, Heart, History, Target, TrendingUp, Users } from 'lucide-react';
import Image from 'next/image';
import Script from 'next/script';

export default function AboutPage() {
  const { data: erpStaff = [], isLoading: teamLoading } = useERPStaff();

  // Map active ERP employees to the TeamMember shape expected by TeamMemberCard
  const teamMembers: TeamMember[] = erpStaff
    .filter((e) => e.status === 'active')
    .map((e) => ({
      id: e.id,
      tenant_id: '',
      name: e.full_name,
      role: e.job_title?.name ?? e.department?.name ?? 'Team Member',
      bio: null,
      image_url: null,
      email: e.email ?? null,
      linkedin_url: null,
      twitter_url: null,
      display_order: 0,
    }));

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Urban Loft Cafe',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://theurbanloftcafe.com',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://theurbanloftcafe.com'}/images/logo/logo.jpeg`,
    foundingDate: '2023',
    founders: teamMembers.map((member) => ({
      '@type': 'Person',
      name: member.name,
      jobTitle: member.role,
    })),
    description:
      'Urban Loft Cafe - More than just a coffee shop. We create spaces where people can eat, work, connect, and experience community.',
  };

  const values = [
    {
      title: 'Excellence',
      description:
        'We strive for excellence in everything we do, from our coffee to our service.',
      icon: <Award className="h-12 w-12" />,
    },
    {
      title: 'Gratitude',
      description:
        'We appreciate our customers, team, and community, and show it every day.',
      icon: <Heart className="h-12 w-12" />,
    },
    {
      title: 'Respect',
      description: 'We treat everyone with dignity and respect, creating an inclusive space.',
      icon: <Users className="h-12 w-12" />,
    },
    {
      title: 'Growth',
      description:
        'We believe in continuous improvement and personal/professional development.',
      icon: <TrendingUp className="h-12 w-12" />,
    },
    {
      title: 'Partnership',
      description:
        'We build lasting relationships with our community, suppliers, and stakeholders.',
      icon: <Handshake className="h-12 w-12" />,
    },
    {
      title: 'Purpose',
      description:
        'We exist to create meaningful experiences and bring people together.',
      icon: <Target className="h-12 w-12" />,
    },
  ];

  const timeline = [
    {
      year: '2023',
      title: 'The Beginning',
      location: 'Busia',
      description:
        'Urban Loft Cafe opened its doors in Busia, bringing a fresh concept of cafe meets workspace to the community.',
    },
    {
      year: '2024',
      title: 'Growth',
      location: 'Busia',
      description:
        'Building on our success, we expanded our offerings and cemented Busia as our flagship location for coffee, workspace, and community.',
    },
    {
      year: '2025',
      title: 'Growing Stronger',
      location: 'Multiple Locations',
      description:
        'Today, Urban Loft serves hundreds of customers daily, hosting events, supporting remote workers, and building community.',
    },
  ];

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

    <main className="relative min-h-screen overflow-hidden bg-brand-light dark:bg-brand-dark transition-colors duration-600">
        {/* Magical Background Elements */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-mesh opacity-40" />
          <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] bg-glow-orb opacity-20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] bg-glow-orb opacity-20 blur-[120px]" />
        </div>

        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[600px] w-full overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/hero/hero-team.jpg"
              alt="About Urban Loft"
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
                <History className="h-4 w-4" />
                <span>Our Journey</span>
              </div>
              <h1 className="mb-6 text-7xl font-black text-white md:text-9xl tracking-tighter leading-none">
                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-gold">Story</span>
              </h1>
              <p className="mx-auto max-w-2xl text-xl font-light text-brand-beige/70 dark:text-brand-beige/80 leading-relaxed md:text-2xl">
                More than just a café. We are a community-driven ecosystem designed to inspire,
                connect, and nourish the modern urban lifestyle.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 md:py-32 relative z-10">
          <div className="container">
            <div className="grid gap-16 lg:grid-cols-2 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange">
                  <span>Our Purpose</span>
                </div>
                <h2 className="mb-8 text-4xl font-black text-brand-dark dark:text-white md:text-6xl tracking-tight">
                  Crafting <span className="text-brand-orange">Meaningful</span> Experiences
                </h2>
                <p className="mb-8 text-xl font-light text-brand-muted dark:text-brand-beige/60 leading-relaxed">
                  Urban Loft was born from a simple idea: that a café should be more than just a place to grab a coffee. 
                  It should be a sanctuary for productivity, a hub for connection, and a home for community.
                </p>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="p-6 rounded-3xl bg-brand-light/40 dark:bg-brand-dark/40 backdrop-blur-xl border border-brand-beige/20 dark:border-white/10">
                    <h4 className="mb-2 font-black text-brand-brown dark:text-brand-orange uppercase tracking-widest text-xs">Our Mission</h4>
                    <p className="text-sm font-light text-brand-muted dark:text-brand-beige/60">To provide a premium ecosystem where people can eat, work, and connect seamlessly.</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-brand-light/40 dark:bg-brand-dark/40 backdrop-blur-xl border border-brand-beige/20 dark:border-white/10">
                    <h4 className="mb-2 font-black text-brand-brown dark:text-brand-orange uppercase tracking-widest text-xs">Our Vision</h4>
                    <p className="text-sm font-light text-brand-muted dark:text-brand-beige/60">To be the leading urban lifestyle hub across East Africa, fostering innovation and community.</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative aspect-square electrical-border rounded-[3rem]"
              >
                <Image
                  src="/images/hero/hero-food.jpg"
                  alt="Urban Loft Experience"
                  fill
                  className="object-cover rounded-[3rem]"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="section-blend-beige py-20 md:py-32 relative">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-brand-cream dark:from-brand-dark to-transparent opacity-50" />
          <div className="container">
            <div className="mb-16 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange">
                <span>What We Stand For</span>
              </div>
              <h2 className="text-4xl font-black text-primary-brand md:text-6xl tracking-tight">Our Core <span className="text-brand-orange">Values</span></h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="electrical-border rounded-[2.5rem]"
                >
                  <ValueCard
                    title={value.title}
                    description={value.description}
                    iconSvg={value.icon}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 md:py-32 relative z-10">
          <div className="container">
            <div className="mb-16 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange">
                <span>Our Growth</span>
              </div>
              <h2 className="text-4xl font-black text-brand-dark dark:text-white md:text-6xl tracking-tight">The <span className="text-brand-orange">Journey</span></h2>
            </div>

            <div className="relative mx-auto max-w-4xl">
              {/* Vertical Line */}
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-brand-orange via-brand-orange/20 to-transparent hidden md:block" />
              
              <div className="space-y-16">
                {timeline.map((item, index) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`relative flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                  >
                    {/* Year Circle */}
                    <div className="absolute left-1/2 top-0 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-brand-orange text-white font-black shadow-xl shadow-brand-orange/20 hidden md:flex">
                      {item.year.slice(2)}
                    </div>
                    
                    <div className="flex-1 w-full">
                      <div className="electrical-border rounded-[2.5rem]">
                        <div className="rounded-[2.5rem] bg-brand-light/40 dark:bg-brand-dark/40 backdrop-blur-xl p-8 border border-brand-beige/20 dark:border-white/10">
                          <div className="mb-4 flex items-center justify-between">
                            <span className="text-2xl font-black text-brand-brown dark:text-brand-orange">{item.year}</span>
                            <span className="text-xs font-black uppercase tracking-widest text-brand-brown/60 dark:text-brand-orange/60">{item.location}</span>
                          </div>
                          <h3 className="mb-4 text-2xl font-black text-brand-dark dark:text-white tracking-tight">{item.title}</h3>
                          <p className="text-brand-muted dark:text-brand-beige/60 font-light leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 hidden md:block" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 md:py-32 relative z-10">
          <div className="container">
            <div className="mb-16 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange">
                <span>The People Behind the Magic</span>
              </div>
              <h2 className="text-4xl font-black text-brand-dark dark:text-white md:text-6xl tracking-tight">Our <span className="text-brand-orange">Team</span></h2>
            </div>

            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {teamLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="electrical-border rounded-[3rem] animate-pulse">
                      <div className="rounded-[3rem] bg-brand-beige/10 h-80" />
                    </div>
                  ))
                : teamMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="electrical-border rounded-[3rem]"
                    >
                      <TeamMemberCard member={member} />
                    </motion.div>
                  ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
