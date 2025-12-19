'use client';

import { Button, Input } from '@/components/ui';
import { motion } from 'framer-motion';
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
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
            src="/images/contact/contact-1.jpg"
            alt="Contact Urban Loft"
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
              <Mail className="h-4 w-4" />
              <span>Get In Touch</span>
            </div>
            <h1 className="mb-6 text-7xl font-black text-brand-dark dark:text-white md:text-9xl tracking-tighter leading-none">
              Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-gold">Us</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl font-light text-brand-muted dark:text-brand-beige/80 leading-relaxed md:text-2xl">
              Have a question or just want to say hello? We're here to help and listen.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="container relative z-10 -mt-24 pb-20">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { icon: Phone, title: "Call Us", details: ["+254 700 000 000", "+254 711 111 111"], color: "bg-brand-brown" },
            { icon: Mail, title: "Email Us", details: ["hello@urbanloftcafe.com", "events@urbanloftcafe.com"], color: "bg-brand-orange" },
            { icon: Clock, title: "Visit Us", details: ["Mon - Fri: 7AM - 9PM", "Sat - Sun: 8AM - 8PM"], color: "bg-brand-dark" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="electrical-border rounded-[2.5rem]"
            >
              <div className="group h-full rounded-[2.5rem] bg-brand-dark/40 p-8 shadow-xl backdrop-blur-xl border border-white/10 transition-all duration-300">
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${item.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-black text-brand-orange tracking-tight uppercase tracking-widest text-xs opacity-60">{item.title}</h3>
                {item.details.map((detail, i) => (
                  <p key={i} className="text-lg font-black text-white">{detail}</p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 md:py-32 relative z-10">
        <div className="container">
          <div className="grid gap-16 lg:grid-cols-5">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="electrical-border rounded-[3rem]">
                <div className="rounded-[3rem] bg-brand-dark/40 backdrop-blur-xl p-8 md:p-12 border border-white/10">
                  <h2 className="mb-8 text-4xl font-black text-white tracking-tight">Send a <span className="text-brand-orange">Message</span></h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-brand-orange/60 ml-4">Name</label>
                        <Input
                          name="name"
                          placeholder="Your Name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="h-14 rounded-2xl border-none bg-white/5 px-6 text-white focus:ring-2 focus:ring-brand-orange/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-brand-orange/60 ml-4">Email</label>
                        <Input
                          name="email"
                          type="email"
                          placeholder="Your Email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="h-14 rounded-2xl border-none bg-white/5 px-6 text-white focus:ring-2 focus:ring-brand-orange/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-brand-orange/60 ml-4">Subject</label>
                      <Input
                        name="subject"
                        placeholder="How can we help?"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="h-14 rounded-2xl border-none bg-white/5 px-6 text-white focus:ring-2 focus:ring-brand-orange/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-brand-orange/60 ml-4">Message</label>
                      <textarea
                        name="message"
                        placeholder="Your Message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full rounded-3xl border-none bg-white/5 p-6 text-white focus:ring-2 focus:ring-brand-orange/50 transition-all"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="h-16 w-full rounded-full bg-brand-orange text-sm font-black uppercase tracking-widest text-white hover:bg-brand-burnt shadow-xl shadow-brand-orange/20 transition-all hover:scale-[1.02]"
                    >
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            {/* Map/Location Info */}
            <div className="lg:col-span-2 space-y-8">
              <div className="electrical-border rounded-[3rem] h-full">
                <div className="rounded-[3rem] bg-brand-dark/40 backdrop-blur-xl p-8 md:p-12 border border-white/10 h-full flex flex-col">
                  <h2 className="mb-8 text-4xl font-black text-white tracking-tight">Our <span className="text-brand-orange">Location</span></h2>
                  
                  {/* Google Map Embed */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative flex-1 min-h-[300px] md:min-h-[400px] rounded-[2rem] overflow-hidden border-2 border-brand-orange/30 shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/40 transition-all duration-500 group"
                  >
                    {/* Map Container */}
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.6927520153863!2d34.124710474474604!3d0.45457156380033154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177fa1fa9904e015%3A0x596a9eb86b54c451!2sThe%20Urban%20Loft%20Cafe%20Busia!5e0!3m2!1sen!2ske!4v1766102160363!5m2!1sen!2ske"
                      width="100%"
                      height="100%"
                      style={{ border: 0, minHeight: "300px" }}
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full group-hover:saturate-150 transition-all duration-500"
                    />
                    
                    {/* Overlay gradient for better visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </motion.div>

                  {/* Address Info */}
                  <div className="mt-8 space-y-4 pt-6 border-t border-white/10">
                    <div className="flex items-start gap-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="mt-1 rounded-full bg-brand-orange/20 p-2 flex-shrink-0"
                      >
                        <MapPin className="h-5 w-5 text-brand-orange" />
                      </motion.div>
                      <div>
                        <h4 className="font-black text-brand-orange uppercase tracking-widest text-xs mb-1">Address</h4>
                        <p className="text-brand-beige/80 font-light leading-relaxed">
                          The Urban Loft Café<br />
                          Busia, Kenya<br />
                          East Africa
                        </p>
                      </div>
                    </div>
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      href="https://maps.google.com/?q=The+Urban+Loft+Cafe+Busia,+Kenya"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-brand-orange hover:text-brand-gold font-bold text-sm uppercase tracking-widest mt-4 group/link"
                    >
                      Get Directions
                      <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                    </motion.a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

