'use client';

import React from 'react';
import { Card } from './Card';
import { Download, FileWarning, FileImage, FileText } from 'lucide-react';

interface DocumentPreviewProps {
  url: string;
  fileName?: string;
  fileType?: string;
  className?: string;
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
const PDF_EXTENSIONS = ['.pdf'];
const BLOCKED_EXTENSIONS = ['.docx', '.doc'];

function getExtension(url: string): string {
  try {
    const pathname = new URL(url, 'https://placeholder.com').pathname;
    const ext = pathname.substring(pathname.lastIndexOf('.')).toLowerCase();
    return ext;
  } catch {
    return '';
  }
}

function isImage(url: string, fileType?: string): boolean {
  if (fileType?.startsWith('image/')) return true;
  return IMAGE_EXTENSIONS.includes(getExtension(url));
}

function isPdf(url: string, fileType?: string): boolean {
  if (fileType === 'application/pdf') return true;
  return PDF_EXTENSIONS.includes(getExtension(url));
}

function isBlocked(url: string, fileType?: string): boolean {
  if (fileType?.includes('openxmlformats') || fileType?.includes('msword')) return true;
  return BLOCKED_EXTENSIONS.includes(getExtension(url));
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  url,
  fileName,
  fileType,
  className = '',
}) => {
  if (!url) {
    return (
      <Card className={`flex items-center justify-center p-6 border border-brand-beige/10 ${className}`}>
        <p className="text-sm text-secondary-brand opacity-60">No document provided</p>
      </Card>
    );
  }

  const displayName = fileName || url.split('/').pop() || 'Document';

  if (isBlocked(url, fileType)) {
    return (
      <Card className={`border border-red-500/20 p-6 ${className}`}>
        <div className="flex flex-col items-center gap-3 text-center">
          <FileWarning className="h-10 w-10 text-red-400" />
          <div>
            <p className="font-bold text-primary-brand text-sm">{displayName}</p>
            <p className="text-xs text-red-500 mt-1">DOCX preview not supported. Please download the file.</p>
          </div>
          <a
            href={url}
            download={displayName}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-4 py-2 text-xs font-bold text-white hover:bg-brand-orange/90 transition-colors"
          >
            <Download className="h-3 w-3" /> Download
          </a>
        </div>
      </Card>
    );
  }

  if (isImage(url, fileType)) {
    return (
      <Card className={`border border-brand-beige/10 overflow-hidden ${className}`}>
        <div className="relative">
          <img
            src={url}
            alt={displayName}
            className="w-full h-auto max-h-[400px] object-contain bg-brand-beige/5"
            loading="lazy"
          />
        </div>
        <div className="flex items-center justify-between p-3 border-t border-brand-beige/10">
          <div className="flex items-center gap-2">
            <FileImage className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-bold text-primary-brand truncate max-w-[200px]">{displayName}</span>
          </div>
          <a
            href={url}
            download={displayName}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-brand-beige/10 text-secondary-brand transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </a>
        </div>
      </Card>
    );
  }

  if (isPdf(url, fileType)) {
    return (
      <Card className={`border border-brand-beige/10 overflow-hidden ${className}`}>
        <iframe
          src={url}
          title={displayName}
          className="w-full h-[400px] border-0"
        />
        <div className="flex items-center justify-between p-3 border-t border-brand-beige/10">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-red-500" />
            <span className="text-xs font-bold text-primary-brand truncate max-w-[200px]">{displayName}</span>
          </div>
          <a
            href={url}
            download={displayName}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-brand-beige/10 text-secondary-brand transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </a>
        </div>
      </Card>
    );
  }

  // Unknown file type - show download link
  return (
    <Card className={`border border-brand-beige/10 p-6 ${className}`}>
      <div className="flex flex-col items-center gap-3 text-center">
        <FileText className="h-10 w-10 text-secondary-brand opacity-40" />
        <p className="font-bold text-primary-brand text-sm">{displayName}</p>
        <a
          href={url}
          download={displayName}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-4 py-2 text-xs font-bold text-white hover:bg-brand-orange/90 transition-colors"
        >
          <Download className="h-3 w-3" /> Download
        </a>
      </div>
    </Card>
  );
};
