'use client';

import { MenuItem } from '@/types';
import { motion } from 'framer-motion';
import { Eye, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { Badge, Card } from '../ui';

interface MenuItemCardProps {
  item: MenuItem;
  onClick?: () => void;
  className?: string;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onClick, className = '' }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`${className} electrical-border rounded-[2rem]`}
      onClick={onClick}
    >
      <Card className="group relative h-full cursor-pointer overflow-hidden border-none bg-white/80 shadow-xl transition-all duration-500 hover:shadow-brand-orange/10 dark:bg-brand-dark/80 backdrop-blur-sm">
        {/* Image Section */}
        <div className="relative h-60 w-full overflow-hidden">
          <Image
            src={item.image || '/images/menu/placeholder-food.svg'}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90" />

          {/* Featured Badge */}
          {item.featured && (
            <div className="absolute left-4 top-4 z-10">
              <Badge variant="warning" className="bg-brand-orange px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl border-none">
                Chef's Choice
              </Badge>
            </div>
          )}

          {/* Availability Overlay */}
          {!item.available && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-brand-dark/80 backdrop-blur-[4px]">
              <span className="rounded-full border border-white/20 bg-white/10 px-6 py-2 text-xs font-black uppercase tracking-[0.3em] text-white">
                Sold Out
              </span>
            </div>
          )}

          {/* Hover Actions */}
          <div className="absolute bottom-6 left-0 right-0 z-10 flex translate-y-10 justify-center gap-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-orange shadow-2xl transition-all hover:scale-110 hover:bg-brand-orange hover:text-white">
              <ShoppingCart className="h-5 w-5" />
            </button>
            <button className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange text-white shadow-2xl transition-all hover:scale-110 hover:bg-brand-burnt">
              <Eye className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange">
              {item.category}
            </span>
            <div className="flex gap-1.5">
              {item.dietaryTags?.slice(0, 2).map((tag: string, index: number) => (
                <div key={index} className="h-1.5 w-1.5 rounded-full bg-brand-orange/40" title={tag} />
              ))}
            </div>
          </div>

          <h3 className="mb-3 text-xl font-black text-primary-brand tracking-tight transition-colors group-hover:text-brand-orange">
            {item.name}
          </h3>

          <p className="mb-6 line-clamp-2 text-sm font-light leading-relaxed text-secondary-brand">
            {item.description}
          </p>

          <div className="flex items-center justify-between border-t border-brand-beige/20 pt-5">
            <span className="text-2xl font-black text-brand-orange tracking-tight">
              <span className="text-xs font-medium text-secondary-brand mr-1">KES</span> {item.price.toLocaleString()}
            </span>
            
            <div className="flex gap-2">
              {item.dietaryTags?.slice(0, 2).map((tag: string, index: number) => (
                <span key={index} className="text-[9px] font-bold uppercase tracking-widest text-brand-taupe">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
