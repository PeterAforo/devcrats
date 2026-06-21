'use client';

import { useState } from 'react';
import { Home, Building2, Users, Plus, MapPin, UserPlus, DollarSign, Calendar, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/auth-store';
import { useEstates } from '@/lib/hooks';

const demoProperties = [
  {
    id: 'P1',
    occupancyType: 'rented',
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
        estate: { name: 'Devtraco Courts Estate', address: 'Community 25, Tema', city: 'Tema' },
        cluster: { name: 'Bellavilla' },
      },
    },
    tenant: {
      firstName: 'Kwame',
      lastName: 'Asante',
      phone: '+233 24 123 4567',
      avatarUrl: null,
      leaseStart: '2024-01-01',
      leaseEnd: '2025-12-31',
      familyMembers: [
        { id: 'FM1', firstName: 'Ama', lastName: 'Asante', relationship: 'Spouse' },
        { id: 'FM2', firstName: 'Kofi', lastName: 'Asante', relationship: 'Son' },
      ],
    },
    rentAmount: 2500,
  },
  {
    id: 'P2',
    occupancyType: 'self_occupied',
    unit: {
      id: 'U2',
      unitNumber: '00BD05',
      houseNumber: '00BD05',
      floor: 2,
      bedrooms: 4,
      bathrooms: 3,
      sizeSqft: 2400,
      status: 'occupied',
      building: {
        name: 'Block B',
        estate: { name: 'East Legon Hills', address: 'East Legon', city: 'Accra' },
        cluster: null,
      },
    },
    tenant: null,
    rentAmount: null,
  },
  {
    id: 'P3',
    occupancyType: 'rented',
    unit: {
      id: 'U3',
      unitNumber: '00CE08',
      houseNumber: '00CE08',
      floor: 1,
      bedrooms: 2,
      bathrooms: 1,
      sizeSqft: 1200,
      status: 'occupied',
      building: {
        name: 'Block C',
        estate: { name: 'Devtraco Courts Estate', address: 'Community 25, Tema', city: 'Tema' },
        cluster: { name: 'Rosavilla' },
      },
    },
    tenant: {
      firstName: 'Efua',
      lastName: 'Mensah',
      phone: '+233 50 321 7654',
      avatarUrl: null,
      leaseStart: '2024-06-01',
      leaseEnd: '2026-05-31',
      familyMembers: [],
    },
    rentAmount: 1800,
  },
];

export default function MyPropertiesPage() {
  const { isDemoMode } = useAuthStore();
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [detailProperty, setDetailProperty] = useState<typeof demoProperties[0] | null>(null);
  const [propForm, setPropForm] = useState({ houseNumber: '', estateId: '', clusterId: '', bedrooms: '3', bathrooms: '2', sizeSqft: '', floor: '1', occupancyType: 'rented' });
  const [localProperties, setLocalProperties] = useState(demoProperties);
  const properties = localProperties;

  const { data: estatesData } = useEstates();
  const estates: any[] = estatesData?.data || [
    { id: 'e1', name: 'Devtraco Courts Estate', city: 'Tema', clusters: [{ id: 'c1', name: 'Bellavilla' }, { id: 'c2', name: 'Rosavilla' }] },
    { id: 'e2', name: 'East Legon Hills', city: 'Accra', clusters: [{ id: 'c3', name: 'Phase 1' }, { id: 'c4', name: 'Phase 2' }] },
  ];
  const selectedEstate = estates.find((e: any) => e.id === propForm.estateId);
  const clusters: any[] = selectedEstate?.clusters || [];

  const totalRentalIncome = properties
    .filter((p) => p.occupancyType === 'rented' && p.rentAmount)
    .reduce((sum, p) => sum + (p.rentAmount || 0), 0);

  const rentedCount = properties.filter((p) => p.occupancyType === 'rented').length;
  const selfOccupied = properties.filter((p) => p.occupancyType === 'self_occupied').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">My Properties</h1>
          <p className="text-muted-foreground">Manage your properties, tenants, and occupancy</p>
        </div>
        <Button className="bg-gold hover:bg-gold/90 text-navy-900" onClick={() => setShowAddProperty(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Home className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Properties</p>
                <p className="text-2xl font-bold">{properties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><Users className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Rented Out</p>
                <p className="text-2xl font-bold">{rentedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg"><Home className="h-5 w-5 text-purple-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Self Occupied</p>
                <p className="text-2xl font-bold">{selfOccupied}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg"><DollarSign className="h-5 w-5 text-amber-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Income</p>
                <p className="text-2xl font-bold text-gold">GH₵ {totalRentalIncome.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties List */}
      <div className="space-y-4">
        {properties.map((prop) => (
          <Card key={prop.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setDetailProperty(prop)}>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Property Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-gold" />
                    <h3 className="font-semibold text-lg">House {prop.unit.houseNumber}</h3>
                    <Badge variant={prop.occupancyType === 'rented' ? 'default' : 'secondary'}>
                      {prop.occupancyType === 'rented' ? 'Rented' : 'Self Occupied'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-3.5 w-3.5" />
                    {prop.unit.building.estate.name} - {prop.unit.building.cluster?.name || prop.unit.building.name}, {prop.unit.building.estate.city}
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{prop.unit.bedrooms} bed</span>
                    <span>{prop.unit.bathrooms} bath</span>
                    <span>{prop.unit.sizeSqft?.toLocaleString()} sqft</span>
                    <span>Floor {prop.unit.floor}</span>
                  </div>
                </div>

                {/* Tenant or Self */}
                <div className="md:text-right">
                  {prop.occupancyType === 'rented' && prop.tenant ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 md:justify-end">
                        <div className="text-right">
                          <p className="font-medium">{prop.tenant.firstName} {prop.tenant.lastName}</p>
                          <p className="text-sm text-muted-foreground">{prop.tenant.phone}</p>
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-navy-500 text-white">
                            {prop.tenant.firstName[0]}{prop.tenant.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <p className="text-lg font-bold text-gold">GH₵ {prop.rentAmount?.toLocaleString()}/mo</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground md:justify-end">
                        <Calendar className="h-3 w-3" />
                        {new Date(prop.tenant.leaseStart).toLocaleDateString('en-GH', { month: 'short', year: 'numeric' })} - {new Date(prop.tenant.leaseEnd).toLocaleDateString('en-GH', { month: 'short', year: 'numeric' })}
                      </div>
                      {prop.tenant.familyMembers && prop.tenant.familyMembers.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <Users className="inline h-3 w-3 mr-1" />
                          {prop.tenant.familyMembers.length} family member{prop.tenant.familyMembers.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  ) : prop.occupancyType === 'rented' ? (
                    <Button
                      size="sm"
                      className="bg-gold hover:bg-gold/90 text-navy-900"
                      onClick={() => { setSelectedProperty(prop.id); setShowAddTenant(true); }}
                    >
                      <UserPlus className="mr-1 h-4 w-4" />
                      Add Tenant
                    </Button>
                  ) : (
                    <Badge className="bg-purple-100 text-purple-800">You live here</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Property Dialog */}
      <Dialog open={showAddProperty} onOpenChange={setShowAddProperty}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Property</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Estate *</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={propForm.estateId} onChange={(e) => setPropForm({ ...propForm, estateId: e.target.value, clusterId: '' })}>
                  <option value="">Select Estate...</option>
                  {estates.map((est: any) => <option key={est.id} value={est.id}>{est.name}</option>)}
                </select>
              </div>
              <div>
                <Label>City</Label>
                <Input value={selectedEstate?.city || ''} disabled className="opacity-60" />
                <p className="text-xs text-muted-foreground mt-0.5">Auto-derived from estate</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Block / Cluster *</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={propForm.clusterId} onChange={(e) => setPropForm({ ...propForm, clusterId: e.target.value })} disabled={!propForm.estateId}>
                  <option value="">{propForm.estateId ? 'Select Block/Cluster...' : 'Select estate first'}</option>
                  {clusters.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label>House / Unit Number *</Label>
                <Input placeholder="e.g. 00AC12" value={propForm.houseNumber} onChange={(e) => setPropForm({ ...propForm, houseNumber: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div><Label>Bedrooms</Label><Input type="number" value={propForm.bedrooms} onChange={(e) => setPropForm({ ...propForm, bedrooms: e.target.value })} /></div>
              <div><Label>Bathrooms</Label><Input type="number" value={propForm.bathrooms} onChange={(e) => setPropForm({ ...propForm, bathrooms: e.target.value })} /></div>
              <div><Label>Size (sqft)</Label><Input type="number" value={propForm.sizeSqft} onChange={(e) => setPropForm({ ...propForm, sizeSqft: e.target.value })} /></div>
              <div><Label>Floor</Label><Input type="number" value={propForm.floor} onChange={(e) => setPropForm({ ...propForm, floor: e.target.value })} /></div>
            </div>
            <div>
              <Label>Occupancy Type</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={propForm.occupancyType} onChange={(e) => setPropForm({ ...propForm, occupancyType: e.target.value })}>
                <option value="rented">Rented Out</option>
                <option value="self_occupied">Self Occupied</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProperty(false)}>Cancel</Button>
            <Button className="bg-gold hover:bg-gold/90 text-navy-900" disabled={!propForm.houseNumber || !propForm.estateId} onClick={() => {
              const cluster = clusters.find((c: any) => c.id === propForm.clusterId);
              const newProp = {
                id: 'P' + Date.now(),
                occupancyType: propForm.occupancyType,
                unit: {
                  id: 'U' + Date.now(),
                  unitNumber: propForm.houseNumber,
                  houseNumber: propForm.houseNumber,
                  floor: Number(propForm.floor) || 1,
                  bedrooms: Number(propForm.bedrooms) || 3,
                  bathrooms: Number(propForm.bathrooms) || 2,
                  sizeSqft: Number(propForm.sizeSqft) || 0,
                  status: 'vacant' as const,
                  building: {
                    name: cluster?.name || 'Main',
                    estate: { name: selectedEstate?.name || '', address: selectedEstate?.address || '', city: selectedEstate?.city || '' },
                    cluster: cluster ? { name: cluster.name } : null,
                  },
                },
                tenant: null,
                rentAmount: null,
              };
              setLocalProperties([newProp, ...localProperties]);
              setPropForm({ houseNumber: '', estateId: '', clusterId: '', bedrooms: '3', bathrooms: '2', sizeSqft: '', floor: '1', occupancyType: 'rented' });
              setShowAddProperty(false);
            }}>
              Add Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Property Detail Dialog */}
      <Dialog open={!!detailProperty} onOpenChange={() => setDetailProperty(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-gold" /> House {detailProperty?.unit.houseNumber}</DialogTitle>
          </DialogHeader>
          {detailProperty && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Estate</p><p className="font-medium">{detailProperty.unit.building.estate.name}</p></div>
                <div><p className="text-muted-foreground">Block / Cluster</p><p className="font-medium">{detailProperty.unit.building.cluster?.name || detailProperty.unit.building.name}</p></div>
                <div><p className="text-muted-foreground">City</p><p className="font-medium">{detailProperty.unit.building.estate.city || '—'}</p></div>
                <div><p className="text-muted-foreground">Floor</p><p className="font-medium">{detailProperty.unit.floor}</p></div>
                <div><p className="text-muted-foreground">Bedrooms</p><p className="font-medium">{detailProperty.unit.bedrooms}</p></div>
                <div><p className="text-muted-foreground">Bathrooms</p><p className="font-medium">{detailProperty.unit.bathrooms}</p></div>
                <div><p className="text-muted-foreground">Size</p><p className="font-medium">{detailProperty.unit.sizeSqft?.toLocaleString() || '—'} sqft</p></div>
                <div><p className="text-muted-foreground">Status</p><Badge variant={detailProperty.occupancyType === 'rented' ? 'default' : 'secondary'}>{detailProperty.occupancyType === 'rented' ? 'Rented' : 'Self Occupied'}</Badge></div>
              </div>
              <Separator />
              {detailProperty.occupancyType === 'rented' && detailProperty.tenant ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Tenant</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-muted-foreground">Name</p><p className="font-medium">{detailProperty.tenant.firstName} {detailProperty.tenant.lastName}</p></div>
                    <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{detailProperty.tenant.phone}</p></div>
                    <div><p className="text-muted-foreground">Lease</p><p className="font-medium text-xs">{new Date(detailProperty.tenant.leaseStart).toLocaleDateString()} — {new Date(detailProperty.tenant.leaseEnd).toLocaleDateString()}</p></div>
                    <div><p className="text-muted-foreground">Rent</p><p className="font-medium text-gold">GH₵ {detailProperty.rentAmount?.toLocaleString()}/mo</p></div>
                  </div>
                  {detailProperty.tenant.familyMembers && detailProperty.tenant.familyMembers.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mt-2 mb-1">Family Members ({detailProperty.tenant.familyMembers.length})</p>
                      {detailProperty.tenant.familyMembers.map((fm) => (
                        <div key={fm.id} className="flex justify-between text-sm py-1 border-b last:border-0">
                          <span>{fm.firstName} {fm.lastName}</span>
                          <Badge variant="outline" className="text-[10px]">{fm.relationship}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : detailProperty.occupancyType === 'rented' ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">No tenant assigned yet</p>
                  <Button size="sm" className="bg-gold hover:bg-gold/90 text-navy-900" onClick={() => { setSelectedProperty(detailProperty.id); setDetailProperty(null); setShowAddTenant(true); }}>
                    <UserPlus className="mr-1 h-4 w-4" /> Add Tenant
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">This property is self-occupied.</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="destructive" size="sm" onClick={() => {
              if (detailProperty) {
                setLocalProperties(localProperties.filter(p => p.id !== detailProperty.id));
                setDetailProperty(null);
              }
            }}>Remove Property</Button>
            <Button variant="outline" onClick={() => setDetailProperty(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tenant Dialog (placeholder) */}
      <Dialog open={showAddTenant} onOpenChange={setShowAddTenant}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Tenant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input placeholder="e.g. Kwame" />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input placeholder="e.g. Asante" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="e.g. kwame@email.com" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input placeholder="+233 24 123 4567" />
              </div>
              <div>
                <Label>ID Type</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select ID type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ghana_card">Ghana Card</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>ID Number</Label>
                <Input placeholder="GHA-123456789-0" />
              </div>
              <div>
                <Label>Occupation</Label>
                <Input placeholder="e.g. Software Engineer" />
              </div>
              <div>
                <Label>Nationality</Label>
                <Input placeholder="Ghanaian" defaultValue="Ghanaian" />
              </div>
              <div>
                <Label>Lease Start Date</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Lease End Date</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Monthly Rent (GH₵)</Label>
                <Input type="number" placeholder="2500" />
              </div>
              <div>
                <Label>Security Deposit (GH₵)</Label>
                <Input type="number" placeholder="5000" />
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Emergency Contact</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contact Name</Label>
                  <Input placeholder="e.g. Ama Owusu" />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input placeholder="+233 20 555 1234" />
                </div>
              </div>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">
              Login credentials will be auto-generated and can be sent to the tenant via SMS and/or email.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTenant(false)}>Cancel</Button>
            <Button className="bg-gold hover:bg-gold/90 text-navy-900">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Tenant & Send Credentials
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
