'use client';

import { Home, Building2, User, Phone, Mail, Calendar, MapPin, FileText, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/auth-store';

const demoTenantData = {
  id: 'T1',
  idType: 'ghana_card',
  idNumber: 'GHA-012345678-9',
  nationality: 'Ghanaian',
  occupation: 'Software Engineer',
  user: {
    firstName: 'Kwame',
    lastName: 'Asante',
    email: 'tenant@estateiq.com',
    phone: '+233 24 123 4567',
    avatarUrl: null,
  },
  leases: [
    {
      id: 'L1',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2025-12-31',
      rentAmount: 2500,
      unit: {
        id: 'U1',
        unitNumber: '00AC12',
        houseNumber: '00AC12',
        floor: 1,
        bedrooms: 3,
        bathrooms: 2,
        sizeSqft: 1800,
        status: 'occupied',
        building: {
          name: 'Block A',
          estate: {
            name: 'Devtraco Courts Estate',
            address: 'Community 25, Tema',
            city: 'Tema',
          },
          cluster: { name: 'Bellavilla' },
        },
      },
      landlord: {
        user: { firstName: 'Nana', lastName: 'Akufo-Mensah', phone: '+233 20 789 0123' },
      },
    },
  ],
};

export default function MyUnitPage() {
  const { isDemoMode } = useAuthStore();
  const tenant = demoTenantData;
  const lease = tenant.leases[0];
  const unit = lease?.unit;
  const building = unit?.building;
  const landlord = lease?.landlord;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">My Unit</h1>
        <p className="text-muted-foreground">Your property details and lease information</p>
      </div>

      {!lease ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No active lease found</p>
            <p className="text-muted-foreground">Contact your landlord or estate manager.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Unit Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-gold" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">House Number</p>
                  <p className="font-semibold text-lg">{unit.houseNumber || unit.unitNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={unit.status === 'occupied' ? 'default' : 'secondary'}>
                    {unit.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estate</p>
                  <p className="font-medium">{building.estate.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cluster / Block</p>
                  <p className="font-medium">{building.cluster?.name || building.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="font-medium">{building.estate.address}, {building.estate.city}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Floor</p>
                  <p className="font-medium">Floor {unit.floor}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                  <p className="font-semibold text-lg">{unit.bedrooms}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                  <p className="font-semibold text-lg">{unit.bathrooms}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-semibold text-lg">{unit.sizeSqft?.toLocaleString()} sqft</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lease Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gold" />
                Lease Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Lease Status</p>
                  <Badge className="bg-green-100 text-green-800">{lease.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Rent</p>
                  <p className="font-semibold text-lg text-gold">GH₵ {Number(lease.rentAmount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="font-medium">{new Date(lease.startDate).toLocaleDateString('en-GH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="font-medium">{new Date(lease.endDate).toLocaleDateString('en-GH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Landlord</p>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-navy-500 flex items-center justify-center text-white font-bold text-sm">
                    {landlord.user.firstName[0]}{landlord.user.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium">{landlord.user.firstName} {landlord.user.lastName}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {landlord.user.phone}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Info */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gold" />
                Your Information
                {isDemoMode && <Badge variant="outline" className="ml-2 text-xs">Demo Mode</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{tenant.user.firstName} {tenant.user.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="font-medium">{tenant.user.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="font-medium">{tenant.user.phone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID ({tenant.idType === 'ghana_card' ? 'Ghana Card' : 'Passport'})</p>
                  <p className="font-medium">{tenant.idNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nationality</p>
                  <p className="font-medium">{tenant.nationality}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Occupation</p>
                  <p className="font-medium">{tenant.occupation}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                To update your information, please submit a change request. Changes require landlord approval.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
