'use client';

import React, { useState, useRef } from 'react';
import { Camera, Loader2, Upload, X } from 'lucide-react';
import { api } from '@/lib/api/client';
import { config } from '@/config/env';

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  required?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ label, value, onChange, required }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Upload to inventory-api (master data source) — media is synced to ordering-backend via events
  const INVENTORY_URL = config.services.inventory;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (JPEG/JPG/PNG only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPEG, JPG and PNG images are allowed');
      return;
    }

    // Validate size (2MB max — matches backend limit)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit. Please compress or resize the image.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Upload to inventory-api media endpoint (master data)
      const result = await api.post<{ url: string }>(
        `${INVENTORY_URL}/api/v1/media/upload`,
        formData
      );
      if (result.data?.url) {
        onChange(result.data.url);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload ${label}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
        {label} {required && '*'}
      </label>
      
      <div 
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
          value 
            ? 'border-brand-orange/50 bg-brand-orange/5 shadow-inner' 
            : 'border-brand-beige/20 bg-brand-beige/5 hover:bg-brand-beige/10'
        } ${uploading ? 'cursor-not-allowed opacity-70' : ''}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-1.5">
            <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-brand opacity-60">Uploading...</span>
          </div>
        ) : value ? (
          <>
            <img 
              src={value} 
              alt={label} 
              className="absolute inset-0 h-full w-full rounded-2xl object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100 rounded-2xl">
              <Upload className="h-5 w-5 text-white" />
            </div>
            <button
              onClick={handleClear}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-orange text-white shadow-md hover:scale-110 transition-transform"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-beige/10 text-brand-orange shadow-sm border border-brand-orange/20">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary-brand">Upload Photo</p>
              <p className="text-[9px] font-medium text-secondary-brand opacity-60">JPEG, JPG, PNG only (MAX 2MB)</p>
            </div>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>
    </div>
  );
};
