'use client';

import React from 'react';
import { Dialog } from '../ui/Dialog';
import { Button, LoadingSpinner } from '../ui';

interface CrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  error?: string | null;
}

export const CrudModal: React.FC<CrudModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  onSubmit,
  submitLabel = 'Save Changes',
  isSubmitting = false,
  children,
  size = 'md',
  error,
}) => {
  const footer = (
    <div className="flex gap-4">
      <Button
        variant="outline"
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        className="flex-1 rounded-2xl h-12 font-black uppercase tracking-widest text-xs"
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        type="submit"
        form="crud-form"
        disabled={isSubmitting}
        className="flex-1 rounded-2xl h-12 font-black uppercase tracking-widest text-xs bg-brand-orange text-white shadow-lg shadow-brand-orange/20"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner className="h-4 w-4" />
            <span>Processing...</span>
          </div>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      footer={footer}
      size={size}
    >
      <form id="crud-form" onSubmit={onSubmit} className="space-y-6 py-2">
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
            {error}
          </div>
        )}
        {children}
      </form>
    </Dialog>
  );
};
