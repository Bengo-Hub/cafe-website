'use client';

import React from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Badge, Button } from '@/components/ui';
import { DocumentPreview } from '@/components/ui/DocumentPreview';
import type { FleetMember } from '@/lib/api/riders';
import {
  Check,
  IdCard,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Star,
  Truck,
  User,
  X,
} from 'lucide-react';

interface RiderKycReviewModalProps {
  rider: FleetMember | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (riderId: string) => void;
  isApproving?: boolean;
}

export const RiderKycReviewModal: React.FC<RiderKycReviewModalProps> = ({
  rider,
  isOpen,
  onClose,
  onApprove,
  isApproving = false,
}) => {
  if (!rider) return null;

  const vehicle = rider.edges?.vehicles?.[0];
  const fullName = `${rider.first_name} ${rider.last_name}`.trim();

  const kycDocuments: { label: string; url?: string; type: string }[] = [
    { label: 'ID / Passport', url: rider.id_passport_attachment, type: 'image' },
    { label: 'Rider Photo', url: rider.rider_photo, type: 'image' },
    { label: 'Vehicle License Plate', url: vehicle?.image_license_plate, type: 'image' },
    { label: 'Vehicle Side View', url: vehicle?.image_side_view, type: 'image' },
  ];

  const hasAllDocs = kycDocuments.filter((d) => d.url).length >= 2; // At minimum: ID + photo

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="KYC Review"
      description={`Reviewing rider ${rider.driver_code || rider.user_id.slice(0, 8)}`}
      size="xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="rounded-xl bg-green-500 text-white hover:bg-green-600"
            onClick={() => onApprove(rider.id)}
            disabled={isApproving || !hasAllDocs}
          >
            {isApproving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Approve Rider
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Rider Info Section */}
        <section className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-secondary-brand opacity-60">
            Rider Information
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <InfoRow icon={User} label="Name" value={fullName || rider.driver_code || 'N/A'} />
            <InfoRow icon={Mail} label="Email" value={rider.email || 'N/A'} />
            <InfoRow icon={Phone} label="Phone" value={rider.phone || 'N/A'} />
            <InfoRow icon={IdCard} label="ID / Passport" value={rider.id_passport_number || 'Not provided'} />
            <InfoRow icon={IdCard} label="License No." value={rider.driver_code || 'Not provided'} />
            <InfoRow icon={MapPin} label="Driver Code" value={rider.driver_code || 'Auto-generated'} />
          </div>
        </section>

        {/* Vehicle Info Section */}
        <section className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-secondary-brand opacity-60">
            Vehicle Details
          </h3>

          {vehicle ? (
            <div className="grid grid-cols-2 gap-4">
              <InfoRow icon={Truck} label="Vehicle Type" value={vehicle.vehicle_type || 'N/A'} />
              <InfoRow icon={IdCard} label="License Plate" value={vehicle.license_plate || 'N/A'} />
              <InfoRow
                icon={Check}
                label="Compliance"
                value={vehicle.compliance_status || 'Pending'}
                badge
                badgeColor={vehicle.compliance_status === 'approved' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}
              />
            </div>
          ) : (
            <p className="text-sm text-secondary-brand opacity-60">No vehicle details provided</p>
          )}
        </section>

        {/* Rating & Stats */}
        {(rider.average_rating !== undefined && rider.average_rating > 0) && (
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-secondary-brand opacity-60">
              Performance
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                <span className="text-lg font-black text-primary-brand">{rider.average_rating.toFixed(1)}</span>
                <span className="text-xs text-secondary-brand">({rider.total_ratings} ratings)</span>
              </div>
            </div>
          </section>
        )}

        {/* KYC Documents Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-secondary-brand opacity-60">
              KYC Documents
            </h3>
            <Badge className={hasAllDocs ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}>
              {kycDocuments.filter((d) => d.url).length} / {kycDocuments.length} uploaded
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kycDocuments.map((doc) => (
              <div key={doc.label} className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
                  {doc.label}
                </label>
                {doc.url ? (
                  <DocumentPreview
                    url={doc.url}
                    fileName={doc.label}
                  />
                ) : (
                  <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-brand-beige/20 bg-brand-beige/5 p-8">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <X className="h-6 w-6 text-red-400" />
                      <p className="text-xs font-bold text-red-500">Not uploaded</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Specializations */}
        {rider.specialization_tags && rider.specialization_tags.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-secondary-brand opacity-60">
              Specializations
            </h3>
            <div className="flex flex-wrap gap-2">
              {rider.specialization_tags.map((tag) => (
                <Badge key={tag} className="bg-brand-beige/10 text-secondary-brand capitalize">
                  {tag.replace(/_/g, ' ')}
                </Badge>
              ))}
              {rider.has_cold_storage && (
                <Badge className="bg-blue-500/10 text-blue-600">Cold Storage</Badge>
              )}
            </div>
          </section>
        )}
      </div>
    </Dialog>
  );
};

function InfoRow({
  icon: Icon,
  label,
  value,
  badge,
  badgeColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  badge?: boolean;
  badgeColor?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-beige/5 border border-brand-beige/10">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-orange/10">
        <Icon className="h-4 w-4 text-brand-orange" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-secondary-brand opacity-60">{label}</p>
        {badge ? (
          <Badge className={badgeColor}>{value}</Badge>
        ) : (
          <p className="text-sm font-bold text-primary-brand">{value}</p>
        )}
      </div>
    </div>
  );
}
