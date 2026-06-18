'use client';

import { useState } from 'react';
import { Users, Plus, Search, Phone, Mail, Home, Trash2, Pencil, UserPlus, Building2, Calendar, Globe, Briefcase, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useTenants, useLandlords, useCreateTenant, useCreateLandlord } from '@/lib/hooks';

type TenantType = 'single' | 'family' | 'company';

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit: string;
  estate: string;
  status: string;
  leaseStart: string;
  leaseEnd: string;
  landlordId: string;
  landlordName: string;
  tenantType: TenantType;
  nationality: string;
  occupants?: number;
  companyName?: string;
  emergencyContact?: string;
  notes?: string;
}

interface Landlord {
  id: string;
  name: string;
  email: string;
  phone: string;
  properties: string[];
  bank: string;
  status: string;
}

const initialLandlords: Landlord[] = [
  { id: 'L1', name: 'Nana Akufo-Mensah', email: 'nana@email.com', phone: '+233 20 789 0123', properties: ['East Legon Hills Estate', 'Tema Community 25', 'Trasacco Valley'], bank: 'GCB Bank', status: 'active' },
  { id: 'L2', name: 'Dr. Kweku Agyemang', email: 'kweku@email.com', phone: '+233 24 890 1234', properties: ['Cantonments Residences', 'Airport Residential Towers'], bank: 'Ecobank Ghana', status: 'active' },
  { id: 'L3', name: 'Mrs. Efua Appiah', email: 'efua@email.com', phone: '+233 27 901 2345', properties: ['Kumasi Royal Gardens'], bank: 'Stanbic Bank', status: 'active' },
];

const initialTenants: Tenant[] = [
  { id: 'T1', name: 'Kwame Asante', email: 'kwame@email.com', phone: '+233 20 123 4567', unit: 'A-101', estate: 'East Legon Hills Estate', status: 'active', leaseStart: '2024-01-01', leaseEnd: '2025-12-31', landlordId: 'L1', landlordName: 'Nana Akufo-Mensah', tenantType: 'family', nationality: 'Ghanaian', occupants: 4 },
  { id: 'T2', name: 'Ama Mensah', email: 'ama@email.com', phone: '+233 24 234 5678', unit: 'A-203', estate: 'East Legon Hills Estate', status: 'active', leaseStart: '2024-06-01', leaseEnd: '2025-06-30', landlordId: 'L1', landlordName: 'Nana Akufo-Mensah', tenantType: 'single', nationality: 'Ghanaian', occupants: 1 },
  { id: 'T3', name: 'Kofi Boateng', email: 'kofi@email.com', phone: '+233 27 345 6789', unit: 'B-102', estate: 'Cantonments Residences', status: 'active', leaseStart: '2024-03-01', leaseEnd: '2026-01-15', landlordId: 'L2', landlordName: 'Dr. Kweku Agyemang', tenantType: 'single', nationality: 'Ghanaian', occupants: 1 },
  { id: 'T4', name: 'TechHub GH Ltd', email: 'info@techhub.gh', phone: '+233 50 456 7890', unit: 'A-301', estate: 'Airport Residential Towers', status: 'active', leaseStart: '2024-01-01', leaseEnd: '2025-03-31', landlordId: 'L2', landlordName: 'Dr. Kweku Agyemang', tenantType: 'company', nationality: 'Ghanaian', companyName: 'TechHub Ghana Limited', occupants: 12 },
  { id: 'T5', name: 'Yaw Darko', email: 'yaw@email.com', phone: '+233 26 567 8901', unit: 'B-201', estate: 'Kumasi Royal Gardens', status: 'active', leaseStart: '2024-09-01', leaseEnd: '2025-09-30', landlordId: 'L3', landlordName: 'Mrs. Efua Appiah', tenantType: 'family', nationality: 'Ghanaian', occupants: 3 },
  { id: 'T6', name: 'Jean-Pierre Mensah', email: 'jp@email.com', phone: '+233 55 678 9012', unit: 'C-101', estate: 'Tema Community 25', status: 'active', leaseStart: '2025-01-01', leaseEnd: '2026-01-01', landlordId: 'L1', landlordName: 'Nana Akufo-Mensah', tenantType: 'family', nationality: 'French-Ghanaian', occupants: 5 },
];

export default function PersonsPage() {
  const [localTenants, setLocalTenants] = useState<Tenant[]>(initialTenants);
  const [localLandlords, setLocalLandlords] = useState<Landlord[]>(initialLandlords);
  const [search, setSearch] = useState('');
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [showAddLandlord, setShowAddLandlord] = useState(false);
  const [showTenantDetail, setShowTenantDetail] = useState<Tenant | null>(null);
  const [showLandlordDetail, setShowLandlordDetail] = useState<Landlord | null>(null);

  const { data: apiTenants } = useTenants();
  const { data: apiLandlords } = useLandlords();
  const createTenantMut = useCreateTenant();
  const createLandlordMut = useCreateLandlord();

  // Use API data if available
  const tenants: Tenant[] = apiTenants?.data
    ? apiTenants.data.map((t: any) => ({
        id: t.id, name: `${t.user?.firstName || ''} ${t.user?.lastName || ''}`.trim(),
        email: t.user?.email || '', phone: t.user?.phone || '',
        unit: t.unit?.unitNumber || '', estate: t.estate?.name || '',
        status: t.user?.isActive ? 'active' : 'inactive',
        leaseStart: t.leases?.[0]?.startDate || '', leaseEnd: t.leases?.[0]?.endDate || '',
        landlordId: t.landlord?.id || '', landlordName: t.landlord?.user ? `${t.landlord.user.firstName} ${t.landlord.user.lastName}` : '',
        tenantType: (t.tenantType || 'single') as TenantType, nationality: t.nationality || 'Ghanaian',
        occupants: t.occupants, companyName: t.companyName,
      }))
    : localTenants;

  const landlords: Landlord[] = apiLandlords?.data
    ? apiLandlords.data.map((l: any) => ({
        id: l.id, name: `${l.user?.firstName || ''} ${l.user?.lastName || ''}`.trim(),
        email: l.user?.email || '', phone: l.user?.phone || '',
        properties: l.units?.map((u: any) => u.building?.estate?.name || '').filter(Boolean) || [],
        bank: l.bankName || '', status: l.user?.isActive ? 'active' : 'inactive',
      }))
    : localLandlords;

  const [tForm, setTForm] = useState({
    name: '', email: '', phone: '', unit: '', estate: '',
    leaseStart: '', leaseEnd: '', landlordId: '', tenantType: 'single' as TenantType,
    nationality: 'Ghanaian', occupants: 1, companyName: '', emergencyContact: '', notes: '',
    idType: '' as string, idNumber: '', occupation: '', dateOfBirth: '',
  });
  const [lForm, setLForm] = useState({ name: '', email: '', phone: '', properties: '', bank: '', idType: '' as string, idNumber: '' });

  const filteredTenants = tenants.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.landlordName.toLowerCase().includes(search.toLowerCase()));
  const filteredLandlords = landlords.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()));

  const handleAddTenant = () => {
    const landlord = landlords.find((l) => l.id === tForm.landlordId);
    const t: Tenant = {
      id: 'T' + Date.now(),
      name: tForm.name, email: tForm.email, phone: tForm.phone,
      unit: tForm.unit, estate: tForm.estate, status: 'active',
      leaseStart: tForm.leaseStart, leaseEnd: tForm.leaseEnd,
      landlordId: tForm.landlordId, landlordName: landlord?.name || '',
      tenantType: tForm.tenantType, nationality: tForm.nationality,
      occupants: tForm.occupants, companyName: tForm.companyName || undefined,
      emergencyContact: tForm.emergencyContact || undefined, notes: tForm.notes || undefined,
    };
    createTenantMut.mutate(
      { firstName: tForm.name.split(' ')[0], lastName: tForm.name.split(' ').slice(1).join(' '), email: tForm.email, phone: tForm.phone, estateId: '', unitId: '', landlordId: tForm.landlordId, leaseStartDate: tForm.leaseStart, leaseEndDate: tForm.leaseEnd },
      { onError: () => setLocalTenants([t, ...localTenants]) },
    );
    setTForm({ name: '', email: '', phone: '', unit: '', estate: '', leaseStart: '', leaseEnd: '', landlordId: '', tenantType: 'single', nationality: 'Ghanaian', occupants: 1, companyName: '', emergencyContact: '', notes: '', idType: '', idNumber: '', occupation: '', dateOfBirth: '' });
    setShowAddTenant(false);
  };

  const handleAddLandlord = () => {
    const l: Landlord = {
      id: 'L' + Date.now(),
      name: lForm.name, email: lForm.email, phone: lForm.phone,
      properties: lForm.properties.split(',').map((p) => p.trim()).filter(Boolean),
      bank: lForm.bank, status: 'active',
    };
    createLandlordMut.mutate(
      { firstName: lForm.name.split(' ')[0], lastName: lForm.name.split(' ').slice(1).join(' '), email: lForm.email, phone: lForm.phone, estateId: '', bankName: lForm.bank },
      { onError: () => setLocalLandlords([l, ...localLandlords]) },
    );
    setLForm({ name: '', email: '', phone: '', properties: '', bank: '', idType: '', idNumber: '' });
    setShowAddLandlord(false);
  };

  const handleDeleteTenant = (id: string) => { setLocalTenants(localTenants.filter((t) => t.id !== id)); setShowTenantDetail(null); };
  const handleDeleteLandlord = (id: string) => { setLocalLandlords(localLandlords.filter((l) => l.id !== id)); setShowLandlordDetail(null); };

  const tenantTypeLabel = (t: TenantType) => t === 'family' ? 'Family' : t === 'company' ? 'Company' : 'Single Person';
  const tenantTypeBadge = (t: TenantType) => t === 'family' ? 'info' : t === 'company' ? 'warning' : 'secondary';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Tenants & Landlords</h1>
          <p className="text-muted-foreground mt-1">Manage property owners and their tenants</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowAddLandlord(true)}><Plus className="h-4 w-4" /> Add Landlord</Button>
          <Button className="gap-2" onClick={() => setShowAddTenant(true)}><UserPlus className="h-4 w-4" /> Register Tenant</Button>
        </div>
      </div>

      <Tabs defaultValue="tenants">
        <TabsList>
          <TabsTrigger value="tenants">Tenants ({tenants.length})</TabsTrigger>
          <TabsTrigger value="landlords">Landlords ({landlords.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by tenant or landlord name..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Property / Unit</TableHead>
                  <TableHead>Landlord</TableHead>
                  <TableHead>Tenancy Period</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((t) => (
                  <TableRow key={t.id} className="cursor-pointer" onClick={() => setShowTenantDetail(t)}>
                    <TableCell>
                      <div><p className="font-medium">{t.name}</p><p className="text-xs text-muted-foreground">{t.phone}</p></div>
                    </TableCell>
                    <TableCell><Badge variant={tenantTypeBadge(t.tenantType) as any}>{tenantTypeLabel(t.tenantType)}</Badge></TableCell>
                    <TableCell>
                      <div className="text-sm"><p className="font-medium">{t.estate}</p><p className="text-xs text-muted-foreground">Unit {t.unit}</p></div>
                    </TableCell>
                    <TableCell className="text-sm">{t.landlordName}</TableCell>
                    <TableCell className="text-xs">{t.leaseStart} → {t.leaseEnd}</TableCell>
                    <TableCell><Badge variant={t.status === 'active' ? 'success' : 'warning'}>{t.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="landlords" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Landlord</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Properties</TableHead>
                  <TableHead>Tenants</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLandlords.map((l) => {
                  const tenantCount = tenants.filter((t) => t.landlordId === l.id).length;
                  return (
                    <TableRow key={l.id} className="cursor-pointer" onClick={() => setShowLandlordDetail(l)}>
                      <TableCell>
                        <div><p className="font-medium">{l.name}</p><p className="text-xs text-muted-foreground">{l.phone}</p></div>
                      </TableCell>
                      <TableCell className="text-xs">{l.email}</TableCell>
                      <TableCell><Badge variant="outline">{l.properties.length} properties</Badge></TableCell>
                      <TableCell><Badge variant="info">{tenantCount} tenants</Badge></TableCell>
                      <TableCell className="text-sm">{l.bank}</TableCell>
                      <TableCell><Badge variant="success">{l.status}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── ADD TENANT DIALOG (comprehensive) ─── */}
      <Dialog open={showAddTenant} onOpenChange={setShowAddTenant}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Register New Tenant</DialogTitle>
            <DialogDescription>The landlord registers a tenant before they can access the platform. Fill in all required details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div>
              <h4 className="text-sm font-semibold mb-3">Tenant Type</h4>
              <div className="flex gap-3">
                {(['single', 'family', 'company'] as TenantType[]).map((type) => (
                  <Button key={type} type="button" variant={tForm.tenantType === type ? 'default' : 'outline'} size="sm" onClick={() => setTForm({ ...tForm, tenantType: type })} className="capitalize">
                    {type === 'single' ? 'Single Person' : type === 'family' ? 'Family' : 'Company'}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-semibold mb-3">Personal / Company Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{tForm.tenantType === 'company' ? 'Contact Person' : 'Full Name'}</Label>
                  <Input placeholder="e.g. Kwame Asante" value={tForm.name} onChange={(e) => setTForm({ ...tForm, name: e.target.value })} />
                </div>
                {tForm.tenantType === 'company' && (
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input placeholder="e.g. TechHub Ghana Ltd" value={tForm.companyName} onChange={(e) => setTForm({ ...tForm, companyName: e.target.value })} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="kwame@email.com" value={tForm.email} onChange={(e) => setTForm({ ...tForm, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="+233 20 123 4567" value={tForm.phone} onChange={(e) => setTForm({ ...tForm, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Nationality</Label>
                  <Input placeholder="e.g. Ghanaian" value={tForm.nationality} onChange={(e) => setTForm({ ...tForm, nationality: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Occupation</Label>
                  <Input placeholder="e.g. Software Engineer" value={tForm.occupation} onChange={(e) => setTForm({ ...tForm, occupation: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" value={tForm.dateOfBirth} onChange={(e) => setTForm({ ...tForm, dateOfBirth: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{tForm.tenantType === 'company' ? 'Number of Staff' : 'Number of Occupants'}</Label>
                  <Input type="number" min={1} value={tForm.occupants} onChange={(e) => setTForm({ ...tForm, occupants: +e.target.value })} />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-semibold mb-3">ID Verification (Ghana Card / Passport)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ID Type</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={tForm.idType} onChange={(e) => setTForm({ ...tForm, idType: e.target.value })}>
                    <option value="">Select ID Type...</option>
                    <option value="ghana_card">Ghana Card</option>
                    <option value="passport">Passport</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>ID Number</Label>
                  <Input placeholder={tForm.idType === 'passport' ? 'G0123456' : 'GHA-123456789-0'} value={tForm.idNumber} onChange={(e) => setTForm({ ...tForm, idNumber: e.target.value })} />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-semibold mb-3">Property & Tenancy</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assign to Landlord</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={tForm.landlordId} onChange={(e) => setTForm({ ...tForm, landlordId: e.target.value })}>
                    <option value="">Select Landlord...</option>
                    {landlords.map((l) => (<option key={l.id} value={l.id}>{l.name}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Property / Estate</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={tForm.estate} onChange={(e) => setTForm({ ...tForm, estate: e.target.value })}>
                    <option value="">Select Property...</option>
                    {tForm.landlordId && landlords.find((l) => l.id === tForm.landlordId)?.properties.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Unit / House Number</Label>
                  <Input placeholder="e.g. A-101 or House 5" value={tForm.unit} onChange={(e) => setTForm({ ...tForm, unit: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Emergency Contact</Label>
                  <Input placeholder="+233 xx xxx xxxx" value={tForm.emergencyContact} onChange={(e) => setTForm({ ...tForm, emergencyContact: e.target.value })} />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-semibold mb-3">Lease / Rent Duration</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={tForm.leaseStart} onChange={(e) => setTForm({ ...tForm, leaseStart: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" value={tForm.leaseEnd} onChange={(e) => setTForm({ ...tForm, leaseEnd: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea placeholder="Any additional notes about this tenant..." value={tForm.notes} onChange={(e) => setTForm({ ...tForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTenant(false)}>Cancel</Button>
            <Button onClick={handleAddTenant} disabled={!tForm.name || !tForm.landlordId || !tForm.unit || !tForm.leaseEnd}>Register Tenant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── ADD LANDLORD DIALOG ─── */}
      <Dialog open={showAddLandlord} onOpenChange={setShowAddLandlord}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Landlord / Property Owner</DialogTitle>
            <DialogDescription>Register a new property owner on the platform.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Full Name</Label><Input placeholder="e.g. Nana Akufo-Mensah" value={lForm.name} onChange={(e) => setLForm({ ...lForm, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="nana@email.com" value={lForm.email} onChange={(e) => setLForm({ ...lForm, email: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Phone</Label><Input placeholder="+233 20 789 0123" value={lForm.phone} onChange={(e) => setLForm({ ...lForm, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Bank</Label><Input placeholder="e.g. GCB Bank" value={lForm.bank} onChange={(e) => setLForm({ ...lForm, bank: e.target.value })} /></div>
            </div>
            <Separator />
            <h4 className="text-sm font-semibold">ID Verification</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ID Type</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={lForm.idType} onChange={(e) => setLForm({ ...lForm, idType: e.target.value })}>
                  <option value="">Select ID Type...</option>
                  <option value="ghana_card">Ghana Card</option>
                  <option value="passport">Passport</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>ID Number</Label>
                <Input placeholder={lForm.idType === 'passport' ? 'G0123456' : 'GHA-123456789-0'} value={lForm.idNumber} onChange={(e) => setLForm({ ...lForm, idNumber: e.target.value })} />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Properties (comma-separated)</Label>
              <Input placeholder="e.g. East Legon Hills, Tema Comm 25" value={lForm.properties} onChange={(e) => setLForm({ ...lForm, properties: e.target.value })} />
              <p className="text-xs text-muted-foreground">List the properties/estates this landlord owns</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLandlord(false)}>Cancel</Button>
            <Button onClick={handleAddLandlord} disabled={!lForm.name || !lForm.phone}>Add Landlord</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── TENANT DETAIL DIALOG ─── */}
      <Dialog open={!!showTenantDetail} onOpenChange={() => setShowTenantDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{showTenantDetail?.name}</DialogTitle>
            <DialogDescription>
              <Badge variant={tenantTypeBadge(showTenantDetail?.tenantType || 'single') as any} className="mr-2">
                {tenantTypeLabel(showTenantDetail?.tenantType || 'single')}
              </Badge>
              Tenant Details
            </DialogDescription>
          </DialogHeader>
          {showTenantDetail && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Email</p><p className="font-medium">{showTenantDetail.email}</p></div>
                <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{showTenantDetail.phone}</p></div>
                <div><p className="text-muted-foreground">Nationality</p><p className="font-medium flex items-center gap-1"><Globe className="h-3 w-3" />{showTenantDetail.nationality}</p></div>
                <div><p className="text-muted-foreground">Occupants</p><p className="font-medium">{showTenantDetail.occupants} {showTenantDetail.tenantType === 'company' ? 'staff' : 'person(s)'}</p></div>
                {showTenantDetail.companyName && <div className="col-span-2"><p className="text-muted-foreground">Company</p><p className="font-medium flex items-center gap-1"><Briefcase className="h-3 w-3" />{showTenantDetail.companyName}</p></div>}
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Property</p><p className="font-medium flex items-center gap-1"><Building2 className="h-3 w-3" />{showTenantDetail.estate}</p></div>
                <div><p className="text-muted-foreground">Unit</p><p className="font-medium flex items-center gap-1"><Home className="h-3 w-3" />{showTenantDetail.unit}</p></div>
                <div><p className="text-muted-foreground">Landlord</p><p className="font-medium">{showTenantDetail.landlordName}</p></div>
                <div><p className="text-muted-foreground">Status</p><Badge variant="success">{showTenantDetail.status}</Badge></div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Lease Start</p><p className="font-medium flex items-center gap-1"><Calendar className="h-3 w-3" />{showTenantDetail.leaseStart}</p></div>
                <div><p className="text-muted-foreground">Lease End</p><p className="font-medium flex items-center gap-1"><Calendar className="h-3 w-3" />{showTenantDetail.leaseEnd}</p></div>
              </div>
              {showTenantDetail.emergencyContact && <div className="text-sm"><p className="text-muted-foreground">Emergency Contact</p><p className="font-medium">{showTenantDetail.emergencyContact}</p></div>}
              {showTenantDetail.notes && <div className="text-sm"><p className="text-muted-foreground">Notes</p><p className="text-sm">{showTenantDetail.notes}</p></div>}
            </div>
          )}
          <DialogFooter>
            <Button variant="destructive" size="sm" onClick={() => showTenantDetail && handleDeleteTenant(showTenantDetail.id)}>Remove Tenant</Button>
            <Button variant="outline" onClick={() => setShowTenantDetail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── LANDLORD DETAIL DIALOG ─── */}
      <Dialog open={!!showLandlordDetail} onOpenChange={() => setShowLandlordDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{showLandlordDetail?.name}</DialogTitle>
            <DialogDescription>Landlord / Property Owner</DialogDescription>
          </DialogHeader>
          {showLandlordDetail && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Email</p><p className="font-medium">{showLandlordDetail.email}</p></div>
                <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{showLandlordDetail.phone}</p></div>
                <div><p className="text-muted-foreground">Bank</p><p className="font-medium">{showLandlordDetail.bank}</p></div>
                <div><p className="text-muted-foreground">Status</p><Badge variant="success">{showLandlordDetail.status}</Badge></div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Properties ({showLandlordDetail.properties.length})</p>
                <div className="flex flex-wrap gap-2">
                  {showLandlordDetail.properties.map((p) => (<Badge key={p} variant="outline">{p}</Badge>))}
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Tenants in Properties</p>
                <div className="space-y-2">
                  {tenants.filter((t) => t.landlordId === showLandlordDetail.id).map((t) => (
                    <div key={t.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                      <div><p className="text-sm font-medium">{t.name}</p><p className="text-xs text-muted-foreground">{t.estate} — Unit {t.unit}</p></div>
                      <Badge variant={tenantTypeBadge(t.tenantType) as any} className="text-[10px]">{tenantTypeLabel(t.tenantType)}</Badge>
                    </div>
                  ))}
                  {tenants.filter((t) => t.landlordId === showLandlordDetail.id).length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No tenants registered yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="destructive" size="sm" onClick={() => showLandlordDetail && handleDeleteLandlord(showLandlordDetail.id)}>Remove Landlord</Button>
            <Button variant="outline" onClick={() => setShowLandlordDetail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
