'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  /** Label for items, e.g. "items", "orders", "recipes" */
  itemLabel?: string;
}

export function Pagination({ page, pageSize, total, onPageChange, itemLabel = 'items' }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between border-t border-brand-beige/10 bg-brand-beige/5 px-6 py-4">
      <p className="text-xs text-secondary-brand">
        Showing <span className="font-bold text-primary-brand">{start}</span> to{' '}
        <span className="font-bold text-primary-brand">{end}</span> of{' '}
        <span className="font-bold text-primary-brand">{total}</span> {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="h-8 rounded-lg border-brand-beige/10 text-xs"
        >
          <ChevronLeft className="mr-1 h-3 w-3" /> Previous
        </Button>
        <span className="text-xs font-bold text-primary-brand">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-8 rounded-lg border-brand-beige/10 text-xs"
        >
          Next <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
