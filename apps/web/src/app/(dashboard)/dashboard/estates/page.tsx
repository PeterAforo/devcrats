'use client';

import { useState } from 'react';
import { Building2, Plus, Search, MapPin, Users, Home, X, Pencil, Trash2, Eye, Navigation, Loader2, Upload, ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useEstates, useCreateEstate, useUploadEstateLogo } from '@/lib/hooks';

interface Estate {
  id: string;
  name: string;
  address: string;
  units: number;
  occupancy: number;
  buildings: number;
  status: string;
  lat?: number;
  lng?: number;
  owner?: string;
  logoUrl?: string;
}

const initialEstates: Estate[] = [
  { id: '1', name: 'East Legon Hills Estate', address: '14 Boundary Road, East Legon, Accra', units: 32, occupancy: 94, buildings: 2, status: 'active', lat: 5.6364, lng: -0.1572, owner: 'Nana Akufo-Mensah' },
  { id: '2', name: 'Cantonments Residences', address: '7 Switchback Lane, Cantonments, Accra', units: 48, occupancy: 88, buildings: 3, status: 'active', lat: 5.5780, lng: -0.1780, owner: 'Dr. Kweku Agyemang' },
  { id: '3', name: 'Kumasi Royal Gardens', address: '23 Harper Road, Ahodwo, Kumasi', units: 64, occupancy: 76, buildings: 4, status: 'active', lat: 6.6885, lng: -1.6244, owner: 'Mrs. Efua Appiah' },
  { id: '4', name: 'Tema Community 25', address: 'Plot 12, Comm. 25, Tema', units: 24, occupancy: 92, buildings: 2, status: 'active', lat: 5.6698, lng: -0.0166, owner: 'Nana Akufo-Mensah' },
  { id: '5', name: 'Airport Residential Towers', address: '3 Aviation Road, Airport Residential, Accra', units: 20, occupancy: 100, buildings: 1, status: 'active', lat: 5.6052, lng: -0.1715, owner: 'Dr. Kweku Agyemang' },
  { id: '6', name: 'Trasacco Valley Estate', address: '1 Trasacco Drive, East Legon, Accra', units: 16, occupancy: 87, buildings: 1, status: 'maintenance', lat: 5.6350, lng: -0.1450, owner: 'Nana Akufo-Mensah' },
];

export default function EstatesPage() {
  const [localEstates, setLocalEstates] = useState<Estate[]>(initialEstates);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState<Estate | null>(null);
  const [editEstate, setEditEstate] = useState<Estate | null>(null);
  const [form, setForm] = useState({ name: '', address: '', buildings: 1, units: 0, lat: 0, lng: 0, owner: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const { data: apiData } = useEstates();
  const createEstate = useCreateEstate();
  const uploadLogo = useUploadEstateLogo();

  // API data takes priority over local mock
  const estates: Estate[] = apiData?.data
    ? apiData.data.map((e: any) => ({
        id: e.id,
        name: e.name,
        address: e.address || '',
        units: e._count?.units || 0,
        occupancy: e.occupancyRate || 0,
        buildings: e._count?.buildings || 0,
        status: e.deletedAt ? 'maintenance' : 'active',
        lat: e.latitude,
        lng: e.longitude,
        owner: e.createdByUser?.firstName ? `${e.createdByUser.firstName} ${e.createdByUser.lastName}` : undefined,
        logoUrl: e.logoUrl,
      }))
    : localEstates;

  const captureGPS = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm({ ...form, lat: +pos.coords.latitude.toFixed(6), lng: +pos.coords.longitude.toFixed(6) });
        setGpsLoading(false);
      },
      (err) => { alert('Could not get location: ' + err.message); setGpsLoading(false); },
      { enableHighAccuracy: true }
    );
  };

  const filtered = estates.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) || e.address.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    const newEstate: Estate = {
      id: Date.now().toString(),
      name: form.name,
      address: form.address,
      buildings: form.buildings,
      units: form.units,
      occupancy: 0,
      status: 'active',
      lat: form.lat || undefined,
      lng: form.lng || undefined,
      owner: form.owner || undefined,
    };
    createEstate.mutate(
      { name: form.name, address: form.address, latitude: form.lat, longitude: form.lng },
      {
        onSuccess: (data: any) => {
          if (logoFile && data?.data?.id) {
            uploadLogo.mutate({ id: data.data.id, file: logoFile });
          }
        },
        onError: () => setLocalEstates([newEstate, ...localEstates]),
      },
    );
    setForm({ name: '', address: '', buildings: 1, units: 0, lat: 0, lng: 0, owner: '' });
    setLogoFile(null);
    setShowAdd(false);
  };

  const handleEdit = () => {
    if (!editEstate) return;
    setLocalEstates(localEstates.map((e) => (e.id === editEstate.id ? { ...editEstate, ...form } : e)));
    setEditEstate(null);
    setForm({ name: '', address: '', buildings: 1, units: 0, lat: 0, lng: 0, owner: '' });
  };

  const handleDelete = (id: string) => {
    setLocalEstates(localEstates.filter((e) => e.id !== id));
    setShowDetail(null);
  };

  const openEdit = (estate: Estate) => {
    setForm({ name: estate.name, address: estate.address, buildings: estate.buildings, units: estate.units, lat: estate.lat || 0, lng: estate.lng || 0, owner: estate.owner || '' });
    setEditEstate(estate);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Estates</h1>
          <p className="text-muted-foreground mt-1">Manage your estate portfolio</p>
        </div>
        <Button className="gap-2" onClick={() => { setForm({ name: '', address: '', buildings: 1, units: 0, lat: 0, lng: 0, owner: '' }); setLogoFile(null); setShowAdd(true); }}>
          <Plus className="h-4 w-4" /> Add Estate
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search estates..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((estate) => (
          <Card key={estate.id} className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => setShowDetail(estate)}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-navy-500/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    <Building2 className="h-5 w-5 text-navy-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{estate.name}</CardTitle>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {estate.address}
                    </div>
                  </div>
                </div>
                <Badge variant={estate.status === 'active' ? 'success' : 'warning'}>
                  {estate.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    {estate.buildings}
                  </div>
                  <p className="text-xs text-muted-foreground">Buildings</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                    <Home className="h-3.5 w-3.5 text-muted-foreground" />
                    {estate.units}
                  </div>
                  <p className="text-xs text-muted-foreground">Units</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    {estate.occupancy}%
                  </div>
                  <p className="text-xs text-muted-foreground">Occupancy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Estate</DialogTitle>
            <DialogDescription>Enter the details for the new estate property.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Estate / Property Name</Label>
              <Input placeholder="e.g. East Legon Hills" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input placeholder="e.g. 14 Boundary Road, East Legon, Accra" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Owner / Landlord</Label>
              <Input placeholder="e.g. Nana Akufo-Mensah" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Estate Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden bg-muted/50">
                  {logoFile ? (
                    <img src={URL.createObjectURL(logoFile)} alt="Logo preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border cursor-pointer hover:bg-muted transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    {logoFile ? logoFile.name : 'Upload Logo'}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setLogoFile(file);
                      }}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">Optional: Used on receipts and documents</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Buildings</Label>
                <Input type="number" min={1} value={form.buildings} onChange={(e) => setForm({ ...form, buildings: +e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Units</Label>
                <Input type="number" min={0} value={form.units} onChange={(e) => setForm({ ...form, units: +e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>GPS Coordinates</Label>
              <div className="flex gap-2">
                <Input placeholder="Latitude" value={form.lat || ''} onChange={(e) => setForm({ ...form, lat: +e.target.value })} className="flex-1" />
                <Input placeholder="Longitude" value={form.lng || ''} onChange={(e) => setForm({ ...form, lng: +e.target.value })} className="flex-1" />
                <Button type="button" variant="outline" className="gap-2 shrink-0" onClick={captureGPS} disabled={gpsLoading}>
                  {gpsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                  {gpsLoading ? 'Getting...' : 'Get GPS'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Click "Get GPS" to auto-capture your current location coordinates</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.name || !form.address}>Create Estate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editEstate} onOpenChange={() => setEditEstate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Estate</DialogTitle>
            <DialogDescription>Update the estate details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Estate Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Buildings</Label>
                <Input type="number" min={1} value={form.buildings} onChange={(e) => setForm({ ...form, buildings: +e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Units</Label>
                <Input type="number" min={0} value={form.units} onChange={(e) => setForm({ ...form, units: +e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEstate(null)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{showDetail?.name}</DialogTitle>
            <DialogDescription className="flex items-center gap-1"><MapPin className="h-3 w-3" />{showDetail?.address}</DialogDescription>
          </DialogHeader>
          {showDetail && (
            <div className="space-y-4 py-4">
              {/* Estate Logo */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden bg-muted/50">
                  {showDetail.logoUrl ? (
                    <img src={showDetail.logoUrl} alt="Estate logo" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Estate Logo</p>
                  <p className="text-xs text-muted-foreground mb-2">Used on receipts and documents</p>
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border cursor-pointer hover:bg-muted transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    {uploadLogo.isPending ? 'Uploading...' : 'Upload Logo'}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      disabled={uploadLogo.isPending}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && showDetail) {
                          uploadLogo.mutate({ id: showDetail.id, file });
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{showDetail.buildings}</p><p className="text-xs text-muted-foreground">Buildings</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{showDetail.units}</p><p className="text-xs text-muted-foreground">Units</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{showDetail.occupancy}%</p><p className="text-xs text-muted-foreground">Occupancy</p></CardContent></Card>
              </div>
              {showDetail.owner && (
                <div className="text-sm"><p className="text-muted-foreground">Owner / Landlord</p><p className="font-medium">{showDetail.owner}</p></div>
              )}
              {showDetail.lat && showDetail.lng && (
                <div className="text-sm">
                  <p className="text-muted-foreground">GPS Location</p>
                  <div className="flex items-center gap-2">
                    <Navigation className="h-3.5 w-3.5 text-blue-600" />
                    <a href={`https://www.google.com/maps?q=${showDetail.lat},${showDetail.lng}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono text-xs">
                      {showDetail.lat}, {showDetail.lng}
                    </a>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <Badge variant={showDetail.status === 'active' ? 'success' : 'warning'}>{showDetail.status}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="gap-2" onClick={() => { if (showDetail) openEdit(showDetail); setShowDetail(null); }}><Pencil className="h-4 w-4" /> Edit</Button>
            <Button variant="destructive" className="gap-2" onClick={() => showDetail && handleDelete(showDetail.id)}><Trash2 className="h-4 w-4" /> Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
