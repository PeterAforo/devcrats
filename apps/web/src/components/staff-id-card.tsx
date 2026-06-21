'use client';

import { useRef } from 'react';
import { Printer, Building2, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StaffIdCardProps {
  staff: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
    };
    role: string;
    estate?: {
      name: string;
      logoUrl?: string;
    };
    photoUrl?: string;
    hireDate: string;
  };
  onClose?: () => void;
}

export function StaffIdCard({ staff, onClose }: StaffIdCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = cardRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Staff ID Card - ${staff.user.firstName} ${staff.user.lastName}</title>
          <style>
            @page {
              size: 85.6mm 53.98mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f0f0f0;
            }
            .id-card {
              width: 85.6mm;
              height: 53.98mm;
              background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
              border-radius: 12px;
              padding: 12px;
              color: white;
              font-family: Arial, sans-serif;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              position: relative;
              overflow: hidden;
            }
            .id-card::before {
              content: '';
              position: absolute;
              top: -50%;
              right: -50%;
              width: 100%;
              height: 100%;
              background: radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%);
            }
            .card-header {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 8px;
              position: relative;
              z-index: 1;
            }
            .estate-logo {
              width: 32px;
              height: 32px;
              border-radius: 6px;
              background: white;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #1e3a5f;
              font-weight: bold;
              font-size: 10px;
            }
            .estate-name {
              font-size: 10px;
              font-weight: 600;
              opacity: 0.9;
            }
            .card-body {
              display: flex;
              gap: 10px;
              position: relative;
              z-index: 1;
            }
            .photo-container {
              width: 60px;
              height: 70px;
              border-radius: 8px;
              background: rgba(255,255,255,0.2);
              overflow: hidden;
              border: 2px solid rgba(255,215,0,0.3);
            }
            .photo-container img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .photo-placeholder {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: rgba(255,255,255,0.5);
            }
            .info {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            .name {
              font-size: 12px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .role {
              font-size: 9px;
              background: rgba(255,215,0,0.2);
              padding: 2px 6px;
              border-radius: 4px;
              display: inline-block;
              margin-bottom: 6px;
              text-transform: uppercase;
            }
            .detail {
              font-size: 8px;
              opacity: 0.8;
              margin-bottom: 2px;
            }
            .card-footer {
              position: absolute;
              bottom: 8px;
              left: 12px;
              right: 12px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 7px;
              opacity: 0.7;
              z-index: 1;
            }
            .id-number {
              font-family: monospace;
              letter-spacing: 1px;
            }
          </style>
        </head>
        <body>
          <div class="id-card">
            <div class="card-header">
              <div class="estate-logo">
                ${staff.estate?.logoUrl 
                  ? `<img src="${staff.estate.logoUrl}" alt="Logo" style="width:100%;height:100%;object-fit:contain;border-radius:6px;" />` 
                  : 'EQ'}
              </div>
              <div class="estate-name">${staff.estate?.name || 'EstateIQ'}</div>
            </div>
            <div class="card-body">
              <div class="photo-container">
                ${staff.photoUrl 
                  ? `<img src="${staff.photoUrl}" alt="Staff Photo" />` 
                  : '<div class="photo-placeholder"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 20c0-4.4-3.6-8-8-8s-8 3.6-8 8"/></svg></div>'}
              </div>
              <div class="info">
                <div class="name">${staff.user.firstName} ${staff.user.lastName}</div>
                <div class="role">${staff.role.replace(/_/g, ' ')}</div>
                <div class="detail">ID: ${staff.id.slice(0, 8).toUpperCase()}</div>
                ${staff.user.phone ? `<div class="detail">${staff.user.phone}</div>` : ''}
              </div>
            </div>
            <div class="card-footer">
              <div class="id-number">EST-${staff.id.slice(0, 6).toUpperCase()}</div>
              <div>Valid: 2024-2025</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={cardRef}
        className="w-[323px] h-[204px] bg-gradient-to-br from-navy-600 to-navy-800 rounded-xl p-5 text-white relative overflow-hidden shadow-xl"
      >
        {/* Background pattern */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle,rgba(255,215,0,0.1)_0%,transparent_70%)]" />
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-navy-900 font-bold text-xs">
            {staff.estate?.logoUrl ? (
              <img src={staff.estate.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-md" />
            ) : (
              'EQ'
            )}
          </div>
          <div className="text-xs font-semibold opacity-90">{staff.estate?.name || 'EstateIQ'}</div>
        </div>

        {/* Body */}
        <div className="flex gap-3 relative z-10">
          <div className="w-[60px] h-[70px] rounded-lg bg-white/20 overflow-hidden border-2 border-gold/30">
            {staff.photoUrl ? (
              <img src={staff.photoUrl} alt="Staff Photo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50">
                <User className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-sm font-bold mb-1">{staff.user.firstName} {staff.user.lastName}</div>
            <div className="text-[9px] bg-gold/20 px-2 py-0.5 rounded inline-block mb-2 uppercase">
              {staff.role.replace(/_/g, ' ')}
            </div>
            <div className="text-[8px] opacity-80">ID: {staff.id.slice(0, 8).toUpperCase()}</div>
            {staff.user.phone && <div className="text-[8px] opacity-80">{staff.user.phone}</div>}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-2 left-5 right-5 flex justify-between items-center text-[7px] opacity-70 z-10">
          <div className="font-mono tracking-wider">EST-{staff.id.slice(0, 6).toUpperCase()}</div>
          <div>Valid: 2024-2025</div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print ID Card
        </Button>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
    </div>
  );
}
