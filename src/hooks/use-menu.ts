'use client';

import { dummyMenuItems } from '@/lib/dummy-data';
import { MenuItem } from '@/types';
import { useQuery } from '@tanstack/react-query';

// In a real app, this would fetch from the ordering-service API
const fetchMenuItems = async (): Promise<MenuItem[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return dummyMenuItems;
};

export const useMenu = (category?: string) => {
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['menu', category],
    queryFn: fetchMenuItems,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const filteredItems = category && category !== 'All Items'
    ? items.filter(item => item.category === category)
    : items;

  return {
    items: filteredItems,
    isLoading,
    error,
    categories: ['All Items', ...Array.from(new Set(items.map(item => item.category)))],
  };
};
