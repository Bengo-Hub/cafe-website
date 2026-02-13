'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Card } from '../ui';

interface ServiceCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  image?: string;
  href?: string;
  features?: string[];
  className?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  image,
  href,
  features = [],
  className = '',
}) => {
  const content = (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`${className} electrical-border rounded-[2.5rem]`}
    >
      <Card className="group h-full overflow-hidden transition-all duration-500 border-none bg-white/50 dark:bg-brand-dark/50 backdrop-blur-sm shadow-xl shadow-brand-dark/5 hover:shadow-brand-orange/10">
        {/* Image Section */}
        {image && (
          <div className="relative h-56 w-full overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/20 to-transparent" />
            <div className="absolute bottom-4 left-6">
              <h3 className="text-2xl font-black text-white tracking-tight">
                {title}
              </h3>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="p-8">
          <p className="mb-6 text-secondary-brand font-light leading-relaxed">{description}</p>

          {/* Features List */}
          {features.length > 0 && (
            <ul className="mb-8 space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start text-sm text-primary-brand font-medium">
                  <div className="mr-3 mt-1 h-1.5 w-1.5 rounded-full bg-brand-orange shadow-[0_0_8px_rgba(234,128,34,0.6)]" />
                  {feature}
                </li>
              ))}
            </ul>
          )}

          {/* CTA Link */}
          {href && (
            <div className="inline-flex items-center gap-2 text-brand-orange font-black uppercase tracking-widest text-xs group/link">
              <span>Explore More</span>
              <div className="h-8 w-8 rounded-full bg-brand-orange/10 flex items-center justify-center transition-all group-hover/link:bg-brand-orange group-hover/link:text-white">
                <svg
                  className="h-4 w-4 transition-transform group-hover/link:translate-x-1"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
};
