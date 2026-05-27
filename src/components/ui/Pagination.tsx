'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  page: number;
  total: number;
  /** Items per page — also accepted as `pageSize` for dashboard backwards-compat */
  limit?: number;
  /** Alias kept for backwards-compat with dashboard pages */
  pageSize?: number;
  hasMore?: boolean;
  onPageChange: (page: number) => void;
  /** Label for items, e.g. "items", "orders", "events" */
  itemLabel?: string;
  /** Dark background variant — used on the public events page */
  dark?: boolean;
  className?: string;
}

export function Pagination({
  page,
  total,
  limit,
  pageSize,
  hasMore,
  onPageChange,
  itemLabel = 'items',
  dark = false,
  className,
}: PaginationProps) {
  const perPage   = limit ?? pageSize ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (totalPages <= 1) return null;

  const canGoNext = hasMore !== undefined ? hasMore : page < totalPages;
  const start = Math.min((page - 1) * perPage + 1, total);
  const end   = Math.min(page * perPage, total);

  // Visible page numbers — always show first, last, current ±1
  const pages: (number | '…')[] = [];
  const range = new Set([1, totalPages, page - 1, page, page + 1].filter(p => p >= 1 && p <= totalPages));
  let prev = 0;
  for (const p of Array.from(range).sort((a, b) => a - b)) {
    if (p - prev > 1) pages.push('…');
    pages.push(p);
    prev = p;
  }

  if (dark) {
    return (
      <div className={cn('flex items-center justify-between gap-4 pt-6', className)}>
        <p className="text-sm text-white/50 font-light tabular-nums whitespace-nowrap">
          {start}–{end} of {total} {itemLabel}
        </p>
        <div className="flex items-center gap-1">
          <DarkBtn onClick={() => onPageChange(1)} disabled={page === 1} title="First page">
            <ChevronsLeft className="h-3.5 w-3.5" />
          </DarkBtn>
          <DarkBtn onClick={() => onPageChange(page - 1)} disabled={page === 1} title="Previous page">
            <ChevronLeft className="h-3.5 w-3.5" />
          </DarkBtn>
          {pages.map((p, i) =>
            p === '…' ? (
              <span key={`e-${i}`} className="px-1 text-white/40 text-xs select-none">…</span>
            ) : (
              <DarkBtn key={p} onClick={() => onPageChange(p as number)} active={p === page} title={`Page ${p}`}>
                {p}
              </DarkBtn>
            )
          )}
          <DarkBtn onClick={() => onPageChange(page + 1)} disabled={!canGoNext} title="Next page">
            <ChevronRight className="h-3.5 w-3.5" />
          </DarkBtn>
          <DarkBtn onClick={() => onPageChange(totalPages)} disabled={page === totalPages} title="Last page">
            <ChevronsRight className="h-3.5 w-3.5" />
          </DarkBtn>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-between border-t border-brand-beige/10 bg-brand-beige/5 px-6 py-4', className)}>
      <p className="text-xs text-secondary-brand">
        Showing <span className="font-bold text-primary-brand">{start}</span> to{' '}
        <span className="font-bold text-primary-brand">{end}</span> of{' '}
        <span className="font-bold text-primary-brand">{total}</span> {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <LightBtn disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="mr-1 h-3 w-3" /> Previous
        </LightBtn>
        <span className="text-xs font-bold text-primary-brand">{page} / {totalPages}</span>
        <LightBtn disabled={!canGoNext} onClick={() => onPageChange(page + 1)}>
          Next <ChevronRight className="ml-1 h-3 w-3" />
        </LightBtn>
      </div>
    </div>
  );
}

function DarkBtn({ children, onClick, disabled, active, title }: {
  children: React.ReactNode; onClick: () => void;
  disabled?: boolean; active?: boolean; title?: string;
}) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled} title={title}
      className={cn(
        'min-w-[32px] h-8 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center',
        active ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/25'
               : 'text-white/60 hover:text-white hover:bg-white/10',
        disabled && 'opacity-30 cursor-not-allowed pointer-events-none'
      )}
    >
      {children}
    </button>
  );
}

function LightBtn({ children, onClick, disabled }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled}
      className={cn(
        'inline-flex items-center h-8 px-3 rounded-lg border border-brand-beige/10 text-xs font-medium transition-all',
        'text-secondary-brand hover:text-primary-brand hover:bg-brand-beige/10',
        disabled && 'opacity-30 cursor-not-allowed pointer-events-none'
      )}
    >
      {children}
    </button>
  );
}
