'use client';

import { MenuItem } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { Badge, Button } from '../ui';

interface MenuItemModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOrder?: (item: MenuItem) => void;
}

export const MenuItemModal: React.FC<MenuItemModalProps> = ({
  item,
  isOpen,
  onClose,
  onOrder,
}) => {
  if (!item) return null;

  const handleOrder = () => {
    if (onOrder) {
      onOrder(item);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-gray-700 transition-colors hover:bg-white hover:text-gray-900"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>

              {/* Image Section */}
              <div className="relative h-64 w-full bg-brand-cream md:h-80">
                <Image
                  src={item.image || '/images/menu/placeholder-food.svg'}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 672px"
                />
                {item.featured && (
                  <div className="absolute left-4 top-4">
                    <Badge variant="warning" className="bg-brand-orange text-white border-none">
                      Featured
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-6 md:p-8 bg-white dark:bg-brand-dark">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="mb-2 text-3xl font-black text-brand-dark dark:text-brand-cream tracking-tight">{item.name}</h2>
                    <p className="text-sm text-brand-brown/60 dark:text-brand-taupe font-medium uppercase tracking-widest">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-brand-orange">KES {item.price.toLocaleString()}</p>
                  </div>
                </div>

                <p className="mb-6 text-brand-brown dark:text-brand-cream/80 font-light leading-relaxed">{item.description}</p>

                {/* Tags */}
                {item.dietaryTags && item.dietaryTags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-2 text-sm font-semibold text-brand-dark dark:text-brand-cream">Dietary Information</h3>
                    <div className="flex flex-wrap gap-2">
                      {item.dietaryTags.map((tag: string, index: number) => (
                        <Badge key={index} variant="default" className="bg-brand-beige/50 text-brand-brown dark:bg-brand-brown/30 dark:text-brand-taupe border-none">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability */}
                <div className="mb-6">
                  <span
                    className={`inline-flex items-center text-sm font-medium ${
                      item.available ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <span
                      className={`mr-2 h-2 w-2 rounded-full ${
                        item.available ? 'bg-green-600' : 'bg-red-600'
                      }`}
                    />
                    {item.available ? 'Available' : 'Out of Stock'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleOrder}
                    disabled={!item.available}
                    className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white border-none"
                  >
                    {item.available ? 'Order Now' : 'Not Available'}
                  </Button>
                  <Button variant="outline" size="lg" onClick={onClose} className="border-brand-beige text-brand-brown hover:bg-brand-cream dark:border-brand-brown/30 dark:text-brand-taupe dark:hover:bg-brand-brown/10">
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
