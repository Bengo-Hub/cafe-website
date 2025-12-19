'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import { Card } from '../ui';

interface ValueCardProps {
  title: string;
  description: string;
  icon?: string;
  iconSvg?: React.ReactNode;
  className?: string;
}

export const ValueCard: React.FC<ValueCardProps> = ({
  title,
  description,
  icon,
  iconSvg,
  className = '',
}) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="h-full p-10 text-center border-none bg-white/80 dark:bg-brand-dark/80 backdrop-blur-md shadow-2xl rounded-[2.5rem] group">
        {/* Icon Section */}
        <div className="mb-8 flex justify-center">
          {icon && (
            <div className="rounded-3xl bg-brand-orange/10 p-5 text-brand-orange group-hover:scale-110 transition-transform">
              <Image src={icon} alt={title} width={48} height={48} className="object-contain" />
            </div>
          )}
          {iconSvg && (
            <div className="rounded-3xl bg-brand-orange/10 p-5 text-brand-orange group-hover:scale-110 transition-transform">
              {iconSvg}
            </div>
          )}
        </div>

        {/* Content */}
        <h3 className="mb-4 text-2xl font-black text-primary-brand tracking-tight group-hover:text-brand-orange transition-colors">{title}</h3>
        <p className="text-secondary-brand font-light leading-relaxed">{description}</p>
      </Card>
    </motion.div>
  );
};
