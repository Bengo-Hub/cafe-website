'use client';

import { Button, Card } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'framer-motion';
import { Award, CheckCircle2, Gift, Star, Trophy, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const TIERS = [
  {
    name: 'Bronze',
    points: '0 - 500',
    color: 'text-brand-orange',
    bgColor: 'bg-brand-orange/5',
    borderColor: 'border-brand-orange/20',
    benefits: ['Earn 1 point per KES 100', 'Birthday treat', 'Member-only newsletters'],
  },
  {
    name: 'Silver',
    points: '501 - 2000',
    color: 'text-brand-taupe',
    bgColor: 'bg-brand-taupe/5',
    borderColor: 'border-brand-taupe/20',
    benefits: ['Earn 1.2 points per KES 100', 'Free coffee on every 10th visit', 'Priority booking for events'],
  },
  {
    name: 'Gold',
    points: '2001 - 5000',
    color: 'text-brand-beige',
    bgColor: 'bg-brand-beige/5',
    borderColor: 'border-brand-beige/20',
    benefits: ['Earn 1.5 points per KES 100', '10% discount on all meals', 'Free Business Hub access (2hrs/week)'],
  },
  {
    name: 'Platinum',
    points: '5000+',
    color: 'text-brand-cream',
    bgColor: 'bg-brand-cream/5',
    borderColor: 'border-brand-cream/20',
    benefits: ['Earn 2 points per KES 100', '20% discount on all meals', 'Unlimited Business Hub access', 'VIP event invites'],
  },
];

const REWARDS = [
  { name: 'Free Specialty Coffee', points: 100, image: '/images/menu/cappuccino.jpg' },
  { name: 'Urban Loft Burger', points: 500, image: '/images/menu/burger.jpg' },
  { name: 'Business Hub Day Pass', points: 1000, image: '/images/services/biz-hub-1.jpg' },
  { name: 'Dinner for Two', points: 2500, image: '/images/menu/main-course-1.jpg' },
];

export default function LoyaltyPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <main className="relative min-h-screen overflow-hidden section-blend-cream">
      {/* Magical Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-mesh opacity-40" />
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] bg-glow-orb opacity-20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] bg-glow-orb opacity-20 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[600px] w-full overflow-hidden z-10">
        <div className="absolute inset-0">
          <Image
            src="/images/hero/hero-team.jpg"
            alt="Urban Loft Loyalty"
            fill
            className="object-cover scale-110 opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/40 to-brand-dark" />
        </div>

        <div className="container relative flex h-full flex-col items-center justify-center text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-6 py-2 text-[11px] font-black uppercase tracking-[0.4em] text-brand-orange border border-brand-orange/20 backdrop-blur-md">
              <Star className="h-4 w-4 fill-current" />
              <span>Exclusive Membership</span>
            </div>
            <h1 className="mb-6 text-6xl font-black text-primary-brand md:text-9xl tracking-tighter leading-tight">
              Urban Loft <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-gold">Rewards</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl font-light text-secondary-brand leading-relaxed">
              Join our community of regulars and get rewarded for every bite, sip, and workspace booking.
            </p>
            {!isAuthenticated && (
              <div className="mt-12 flex flex-wrap justify-center gap-6">
                <Link href="/signup">
                  <Button size="lg" className="h-16 px-12 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-brand-orange/30 bg-brand-orange hover:bg-brand-orange/90 text-white transition-all hover:scale-[1.05]">
                    Join Now
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="h-16 px-12 rounded-2xl text-lg font-black uppercase tracking-widest bg-white/5 text-white hover:bg-white/10 backdrop-blur-md border-white/10 shadow-2xl transition-all hover:scale-[1.05]">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* User Status (If Logged In) */}
      {isAuthenticated && (
        <section className="py-12 relative z-10 -mt-20">
          <div className="container">
            <div className="electrical-border rounded-[3rem]">
              <Card className="overflow-hidden border-none shadow-2xl bg-white/5 backdrop-blur-2xl">
                <div className="grid md:grid-cols-3">
                  <div className="bg-brand-orange p-10 text-white md:col-span-1 flex flex-col justify-center">
                    <h2 className="mb-2 text-xs font-black uppercase tracking-[0.3em] opacity-80">Welcome back,</h2>
                    <p className="mb-6 text-4xl font-black tracking-tighter">{user?.name}</p>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/20">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                        <Trophy className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Current Tier</p>
                        <p className="text-xl font-black">Bronze Member</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-10 md:col-span-2 flex flex-col justify-center">
                    <div className="mb-8 flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-beige/40">Available Points</p>
                        <p className="text-5xl font-black text-brand-orange tracking-tighter">350 <span className="text-xl uppercase tracking-widest opacity-40">pts</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-beige/40">Next Tier: Silver</p>
                        <p className="font-black text-white">150 pts to go</p>
                      </div>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '70%' }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full bg-brand-orange shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                      />
                    </div>
                    <div className="mt-10 flex flex-wrap gap-4">
                      <Button variant="outline" className="h-12 px-8 rounded-xl border-white/10 bg-white/5 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">View History</Button>
                      <Button className="h-12 px-8 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-orange/20 transition-all">Redeem Points</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-24 md:py-32 relative z-10">
        <div className="container">
          <div className="mb-20 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-6 py-2 text-[11px] font-black uppercase tracking-[0.4em] text-brand-orange border border-brand-orange/20 backdrop-blur-md">
              <span>The Process</span>
            </div>
            <h2 className="text-4xl font-black text-white md:text-7xl tracking-tight">How It <span className="text-brand-orange">Works</span></h2>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {[
              {
                icon: <Zap className="h-8 w-8" />,
                title: 'Earn Points',
                description: 'Get points for every KES 100 spent on food, drinks, or workspace bookings.',
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: 'Level Up',
                description: 'Accumulate points to unlock higher tiers with better benefits and discounts.',
              },
              {
                icon: <Gift className="h-8 w-8" />,
                title: 'Redeem Rewards',
                description: 'Use your points to get free coffee, meals, or exclusive Urban Loft merchandise.',
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="electrical-border rounded-[2.5rem]"
              >
                <div className="h-full p-12 text-center rounded-[2.5rem] magical-card border-none">
                  <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
                    {step.icon}
                  </div>
                  <h3 className="mb-6 text-2xl font-black text-primary-brand tracking-tight">{step.title}</h3>
                  <p className="text-lg font-light text-secondary-brand leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-24 md:py-32 relative z-10">
        <div className="container">
          <div className="mb-20 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-6 py-2 text-[11px] font-black uppercase tracking-[0.4em] text-brand-orange border border-brand-orange/20 backdrop-blur-md">
              <span>Tier Benefits</span>
            </div>
            <h2 className="text-4xl font-black text-white md:text-7xl tracking-tight">Membership <span className="text-brand-orange">Tiers</span></h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="electrical-border rounded-[3rem]"
              >
                <Card className={`h-full overflow-hidden border-none magical-card p-10 flex flex-col`}>
                  <div className="mb-8">
                    <h3 className={`text-4xl font-black tracking-tighter ${tier.color}`}>{tier.name}</h3>
                    <p className="text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40">{tier.points} pts</p>
                  </div>
                  <ul className="mb-10 space-y-5 flex-grow">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-4 text-sm font-light text-secondary-brand">
                        <CheckCircle2 className={`h-5 w-5 shrink-0 ${tier.color}`} />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs ${tier.name === 'Bronze' ? 'bg-brand-orange text-white' : 'bg-white/5 text-primary-brand border border-white/10 hover:bg-white/10'}`}>
                    {tier.name === 'Bronze' ? 'Current Tier' : 'Learn More'}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section className="py-24 md:py-32 relative z-10">
        <div className="container">
          <div className="mb-20 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-6 py-2 text-[11px] font-black uppercase tracking-[0.4em] text-brand-orange border border-brand-orange/20 backdrop-blur-md">
              <span>Redeem Points</span>
            </div>
            <h2 className="text-4xl font-black text-white md:text-7xl tracking-tight">Exclusive <span className="text-brand-orange">Rewards</span></h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {REWARDS.map((reward, index) => (
              <motion.div
                key={reward.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-[2.5rem] bg-white/5 backdrop-blur-md border border-white/10 p-5 transition-all hover:bg-white/10"
              >
                <div className="relative mb-8 aspect-square overflow-hidden rounded-[2rem]">
                  <Image
                    src={reward.image}
                    alt={reward.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-white tracking-tight">{reward.name}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-brand-orange">
                    <Zap className="h-5 w-5 fill-current" />
                    <span className="text-lg font-bold">{reward.points} pts</span>
                  </div>
                  <Button size="sm" variant="ghost" className="text-xs font-black uppercase tracking-widest text-brand-orange hover:bg-brand-orange/10">
                    Redeem
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
