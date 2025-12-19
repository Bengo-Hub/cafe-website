'use client';

import { Button, Card, Input } from '@/components/ui';
import { dummyJobs, Job } from '@/lib/dummy-data/jobs';
import { AnimatePresence, motion } from 'framer-motion';
import { Briefcase, ChevronRight, Filter, MapPin, Search, Users } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function CareersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const departments = ['All', ...Array.from(new Set(dummyJobs.map((job) => job.department)))];

  const filteredJobs = dummyJobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDepartment === 'All' || job.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-dark">
      {/* Magical Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-mesh opacity-40" />
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] bg-glow-orb opacity-20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] bg-glow-orb opacity-20 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[500px] w-full overflow-hidden z-10">
        <div className="absolute inset-0">
          <Image
            src="/images/hero/hero-team.jpg"
            alt="Join the Urban Loft Team"
            fill
            className="object-cover scale-110 opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/40 to-brand-dark" />
        </div>

        <div className="container relative flex h-full flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-6 py-2 text-[11px] font-black uppercase tracking-[0.4em] text-brand-orange border border-brand-orange/20 backdrop-blur-md">
              <Users className="h-4 w-4" />
              <span>Join Our Growing Family</span>
            </div>
            <h1 className="mb-6 text-6xl font-black text-white md:text-9xl tracking-tighter leading-tight">
              Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-gold">Future</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl font-light text-brand-beige/60 leading-relaxed">
              Discover exciting career opportunities at Urban Loft Cafe and grow with us.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="py-24 md:py-32 relative z-10">
        <div className="container">
          <div className="grid items-center gap-20 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="mb-8 text-4xl font-black text-white md:text-6xl tracking-tight">
                Why Work <span className="text-brand-orange">With Us?</span>
              </h2>
              <p className="mb-10 text-xl text-brand-beige/70 font-light leading-relaxed">
                At Urban Loft, we believe our people are our greatest asset. We're more than just a cafe; 
                we're a community of passionate individuals dedicated to excellence, creativity, and 
                exceptional hospitality.
              </p>
              <div className="space-y-8">
                {[
                  {
                    icon: <Users className="h-6 w-6" />,
                    title: 'Inclusive Culture',
                    description: 'We celebrate diversity and foster an environment where everyone feels welcome.',
                  },
                  {
                    icon: <Briefcase className="h-6 w-6" />,
                    title: 'Growth Opportunities',
                    description: 'We invest in our team through training and clear paths for career advancement.',
                  },
                  {
                    icon: <Filter className="h-6 w-6" />,
                    title: 'Work-Life Balance',
                    description: 'We offer flexible scheduling to help you maintain a healthy personal life.',
                  },
                ].map((benefit, index) => (
                  <div key={index} className="flex gap-6 group">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange border border-brand-orange/20 group-hover:bg-brand-orange group-hover:text-white transition-all duration-500">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight mb-2">{benefit.title}</h3>
                      <p className="text-brand-beige/60 font-light leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-[600px] overflow-hidden rounded-[3rem] electrical-border"
            >
              <Image
                src="/images/hero/hero-reception.jpg"
                alt="Urban Loft Team Culture"
                fill
                className="object-cover opacity-80 hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-24 md:py-32 relative z-10">
        <div className="container">
          <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-4xl font-black text-white md:text-6xl tracking-tight mb-4">Open <span className="text-brand-orange">Positions</span></h2>
              <p className="text-brand-beige/60 font-light text-lg">Find your place in our team and start your journey.</p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-orange" />
                <Input
                  placeholder="Search jobs..."
                  className="pl-12 h-14 w-full sm:w-64 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-brand-orange rounded-2xl backdrop-blur-xl transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="h-14 rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-bold text-white focus:border-brand-orange focus:outline-none backdrop-blur-xl appearance-none cursor-pointer"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept} className="bg-brand-dark text-white">
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-8">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="electrical-border rounded-[2rem]">
                    <Card className="p-8 md:p-10 transition-all border-none bg-white/5 backdrop-blur-xl rounded-[2rem] group overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Briefcase className="h-24 w-24 text-brand-orange" />
                      </div>
                      <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
                        <div className="flex-1">
                          <div className="mb-4 flex items-center gap-3">
                            <span className="rounded-full bg-brand-orange/10 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-brand-orange border border-brand-orange/20">
                              {job.department}
                            </span>
                            <span className="text-xs text-brand-beige/40 font-bold uppercase tracking-widest">{job.type}</span>
                          </div>
                          <h3 className="text-3xl font-black text-white tracking-tight group-hover:text-brand-orange transition-colors mb-4">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-6 text-sm text-brand-beige/60 font-light">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-brand-orange" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-1 w-1 rounded-full bg-brand-orange" />
                              <span>Posted: {job.postedDate}</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setSelectedJob(job)} 
                          className="bg-brand-orange hover:bg-brand-gold text-white font-black rounded-2xl px-10 h-14 shadow-xl shadow-brand-orange/20 transition-all hover:scale-105 active:scale-95"
                        >
                          View Details
                          <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </Card>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-32 text-center electrical-border rounded-[3rem] bg-white/5 backdrop-blur-xl">
                <p className="text-2xl text-brand-beige/40 font-light">No positions found matching your criteria.</p>
                <Button 
                  variant="ghost" 
                  onClick={() => { setSearchTerm(''); setSelectedDepartment('All'); }} 
                  className="text-brand-orange hover:bg-brand-orange/10 mt-6 font-black uppercase tracking-widest"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Job Detail Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="absolute inset-0 bg-brand-dark/90 backdrop-blur-2xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[3rem] bg-brand-dark p-8 md:p-12 shadow-2xl border border-white/10 electrical-border"
            >
              <div className="mb-12 flex items-start justify-between">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="rounded-full bg-brand-orange/10 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-brand-orange border border-brand-orange/20">
                      {selectedJob.department}
                    </span>
                    <span className="text-xs text-brand-beige/40 font-bold uppercase tracking-widest">{selectedJob.type}</span>
                  </div>
                  <h2 className="text-4xl font-black text-white md:text-5xl tracking-tighter leading-tight">{selectedJob.title}</h2>
                  <p className="text-brand-beige/60 font-light mt-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-orange" />
                    {selectedJob.location}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="rounded-2xl p-4 bg-white/5 hover:bg-brand-orange/20 text-brand-orange transition-all border border-white/10"
                >
                  <ChevronRight className="h-6 w-6 rotate-180" />
                </button>
              </div>

              <div className="space-y-12">
                <div className="grid gap-12 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-12">
                    <div>
                      <h3 className="mb-6 text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <div className="h-8 w-1 bg-brand-orange rounded-full" />
                        Description
                      </h3>
                      <p className="text-brand-beige/60 font-light text-lg leading-relaxed">{selectedJob.description}</p>
                    </div>

                    <div>
                      <h3 className="mb-6 text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <div className="h-8 w-1 bg-brand-orange rounded-full" />
                        Responsibilities
                      </h3>
                      <ul className="grid gap-4 sm:grid-cols-2">
                        {selectedJob.responsibilities.map((res, i) => (
                          <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-brand-orange/30 transition-colors">
                            <div className="h-2 w-2 rounded-full bg-brand-orange mt-2 shrink-0 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                            <span className="text-brand-beige/70 font-light">{res}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="p-8 rounded-[2rem] bg-brand-orange/5 border border-brand-orange/20">
                      <h3 className="text-xl font-black text-white mb-6">Quick Apply</h3>
                      <p className="text-brand-beige/60 text-sm mb-8 leading-relaxed">
                        Ready to join the team? Send your CV and a brief cover letter to our recruitment team.
                      </p>
                      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Application submitted!'); setSelectedJob(null); }}>
                        <Input placeholder="Full Name" required className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-brand-orange rounded-xl h-12" />
                        <Input placeholder="Email Address" type="email" required className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-brand-orange rounded-xl h-12" />
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em]">Upload CV (PDF)</label>
                          <Input type="file" accept=".pdf" required className="bg-white/5 border-white/10 text-white file:bg-brand-orange/10 file:text-brand-orange file:border-0 file:rounded-lg file:px-4 file:py-1 file:mr-4 file:text-xs file:font-black rounded-xl h-12" />
                        </div>
                        <Button type="submit" className="w-full h-14 bg-brand-orange hover:bg-brand-gold text-white font-black rounded-xl shadow-xl shadow-brand-orange/20 transition-all">
                          Submit Application
                        </Button>
                      </form>
                    </div>
                    
                    <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
                      <h3 className="text-xl font-black text-white mb-4">Share Job</h3>
                      <div className="flex gap-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-orange/10 hover:text-brand-orange transition-all cursor-pointer">
                            <Users className="h-5 w-5" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
