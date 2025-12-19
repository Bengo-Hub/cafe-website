'use client';

import { Button, Card, Input } from '@/components/ui';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle2, DollarSign, Globe, HelpCircle, ShieldCheck, Users } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function FranchisingPage() {
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    investment: '',
    experience: '',
  });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStep(formStep + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your interest! Our franchising team will contact you shortly.');
    setFormStep(1);
    setFormData({ name: '', email: '', phone: '', location: '', investment: '', experience: '' });
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero/hero-reception-2.jpg"
            alt="Franchise with Urban Loft Cafe"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-white dark:to-gray-950" />
        </div>
        
        {/* SVG Pattern Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circles" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circles)" />
          </svg>
        </div>

        <div className="container relative flex h-full flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-orange/20 px-4 py-2 text-sm font-bold uppercase tracking-widest text-brand-orange backdrop-blur-md border border-brand-orange/30">
              <Globe className="h-4 w-4" />
              <span>Global Expansion Opportunities</span>
            </div>
            <h1 className="mb-6 text-6xl font-black tracking-tight text-brand-dark dark:text-white md:text-8xl">
              Grow <span className="text-brand-orange">With Us</span>
            </h1>
            <p className="mb-10 text-xl text-brand-muted dark:text-brand-orange md:text-3xl font-light leading-relaxed">
              Partner with East Africa's fastest-growing lifestyle cafe brand. 
              Bring the Urban Loft experience to your community.
            </p>
            <Button 
              size="lg" 
              className="h-16 px-12 text-xl font-bold rounded-2xl shadow-xl shadow-brand-orange/30 bg-brand-orange hover:bg-brand-orange/90 text-white transition-transform hover:scale-105" 
              onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Your Journey
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Why Franchise */}
      <section className="section-blend-cream py-20">
        <div className="container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-black text-primary-brand md:text-5xl tracking-tight">Why Franchise with Urban Loft?</h2>
            <p className="mx-auto max-w-2xl text-lg text-secondary-brand font-light">
              We offer a proven business model that combines gourmet dining, specialty coffee, and professional workspaces.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <ShieldCheck className="h-8 w-8" />,
                title: 'Proven Model',
                description: 'A successful business framework tested and refined in multiple locations.',
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: 'Strong Brand',
                description: 'Leverage our growing reputation for quality, community, and innovation.',
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: 'Full Support',
                description: 'Comprehensive training, marketing support, and operational guidance.',
              },
              {
                icon: <BarChart3 className="h-8 w-8" />,
                title: 'High ROI',
                description: 'Multiple revenue streams from cafe, hub, and event bookings.',
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="electrical-border rounded-[2rem]"
              >
                <div className="h-full rounded-[2rem] border-none p-8 text-center transition-all hover:shadow-2xl bg-white/80 dark:bg-brand-dark/80 backdrop-blur-md group">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange group-hover:scale-110 transition-transform">
                    {benefit.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-black text-primary-brand tracking-tight">{benefit.title}</h3>
                  <p className="text-secondary-brand font-light leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements & Investment */}
      <section className="section-blend-beige py-20">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-8 text-3xl font-black text-primary-brand md:text-5xl tracking-tight">Franchise Requirements</h2>
              <div className="space-y-4">
                {[
                  'Passion for hospitality and community building',
                  'Minimum liquid capital of KES 5,000,000',
                  'Commitment to Urban Loft brand standards',
                  'Previous business management experience preferred',
                  'Prime location (minimum 200 sq meters)',
                ].map((req, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-brand-orange" />
                    <span className="text-lg text-secondary-brand font-light">{req}</span>
                  </div>
                ))}
              </div>

              <div className="mt-12 rounded-[2.5rem] bg-brand-orange p-10 text-white shadow-2xl shadow-brand-orange/20">
                <div className="flex items-center gap-4 mb-6">
                  <DollarSign className="h-12 w-12" />
                  <h3 className="text-3xl font-black tracking-tight">Investment Range</h3>
                </div>
                <p className="text-xl font-light opacity-90 mb-8">
                  Total investment varies based on location size and condition.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md border border-white/20">
                    <p className="text-sm font-bold uppercase tracking-wider opacity-80">Standard Cafe</p>
                    <p className="text-2xl font-black mt-1">KES 10M - 15M</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md border border-white/20">
                    <p className="text-sm font-bold uppercase tracking-wider opacity-80">Cafe + Hub</p>
                    <p className="text-2xl font-black mt-1">KES 18M - 25M</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[600px] overflow-hidden rounded-[3rem] shadow-2xl"
            >
              <Image
                src="/images/hero/hero-food.jpg"
                alt="Urban Loft Interior"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry-form" className="section-blend-cream py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <Card className="overflow-hidden border-none shadow-2xl bg-white/50 dark:bg-brand-dark/50 backdrop-blur-sm rounded-[2.5rem]">
              <div className="bg-brand-orange p-10 text-center text-white">
                <h2 className="text-4xl font-black tracking-tight">Franchise Inquiry</h2>
                <p className="mt-2 font-light opacity-90">Step {formStep} of 2</p>
              </div>
              <div className="p-8 md:p-12">
                {formStep === 1 ? (
                  <form onSubmit={handleNext} className="space-y-8">
                    <div className="grid gap-8 md:grid-cols-2">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-primary-brand uppercase tracking-wider">Full Name</label>
                        <Input 
                          required 
                          placeholder="John Doe" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="bg-white/50 dark:bg-brand-dark/50 border-brand-beige/20 focus:border-brand-orange rounded-xl h-14"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-primary-brand uppercase tracking-wider">Email Address</label>
                        <Input 
                          required 
                          type="email" 
                          placeholder="john@example.com" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="bg-white/50 dark:bg-brand-dark/50 border-brand-beige/20 focus:border-brand-orange rounded-xl h-14"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-primary-brand uppercase tracking-wider">Phone Number</label>
                        <Input 
                          required 
                          placeholder="+254 700 000 000" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="bg-white/50 dark:bg-brand-dark/50 border-brand-beige/20 focus:border-brand-orange rounded-xl h-14"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-primary-brand uppercase tracking-wider">Proposed Location</label>
                        <Input 
                          required 
                          placeholder="City, Neighborhood" 
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          className="bg-white/50 dark:bg-brand-dark/50 border-brand-beige/20 focus:border-brand-orange rounded-xl h-14"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-16 bg-brand-orange hover:bg-brand-orange/90 font-bold rounded-xl text-lg shadow-xl shadow-brand-orange/20">Next Step</Button>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-primary-brand uppercase tracking-wider">Investment Capacity</label>
                      <select 
                        className="w-full rounded-xl border border-brand-beige/20 bg-white/50 px-4 h-14 text-sm font-bold text-primary-brand focus:border-brand-orange focus:outline-none dark:bg-brand-dark/50"
                        value={formData.investment}
                        onChange={(e) => setFormData({...formData, investment: e.target.value})}
                        required
                      >
                        <option value="">Select Range</option>
                        <option value="5-10m">KES 5M - 10M</option>
                        <option value="10-20m">KES 10M - 20M</option>
                        <option value="20m+">KES 20M+</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-primary-brand uppercase tracking-wider">Business Experience</label>
                      <textarea 
                        className="w-full rounded-xl border border-brand-beige/20 bg-white/50 p-6 text-sm font-light text-primary-brand focus:border-brand-orange focus:outline-none dark:bg-brand-dark/50"
                        rows={4}
                        placeholder="Tell us about your previous business or management experience..."
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                        required
                      />
                    </div>
                    <div className="flex gap-6">
                      <Button variant="outline" className="w-1/3 h-16 border-brand-orange text-brand-orange hover:bg-brand-orange/10 rounded-xl font-bold" onClick={() => setFormStep(1)}>Back</Button>
                      <Button type="submit" className="w-2/3 h-16 bg-brand-orange hover:bg-brand-orange/90 font-bold rounded-xl text-lg shadow-xl shadow-brand-orange/20">Submit Inquiry</Button>
                    </div>
                  </form>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-blend-beige py-20">
        <div className="container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-black text-primary-brand md:text-5xl tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="mx-auto max-w-3xl space-y-6">
            {[
              {
                q: 'How long does the franchise process take?',
                a: 'Typically, the process from initial inquiry to grand opening takes 4-8 months, depending on site selection and construction.',
              },
              {
                q: 'Do I need prior restaurant experience?',
                a: 'While helpful, it is not mandatory. We provide comprehensive training for you and your management team.',
              },
              {
                q: 'What is the franchise fee?',
                a: 'Our standard franchise fee is KES 2,000,000, which covers the use of our brand, initial training, and site selection support.',
              },
            ].map((faq, i) => (
              <div key={i} className="electrical-border rounded-3xl">
                <Card className="p-8 border-none bg-white/80 dark:bg-brand-dark/80 backdrop-blur-md rounded-3xl group">
                  <h3 className="mb-3 flex items-center gap-3 text-xl font-black text-primary-brand tracking-tight group-hover:text-brand-orange transition-colors">
                    <HelpCircle className="h-6 w-6 text-brand-orange" />
                    {faq.q}
                  </h3>
                  <p className="text-secondary-brand font-light leading-relaxed">{faq.a}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
