'use client';

import { useState } from 'react';
import { DoorOpen, Plus, Search, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useVisitorInvites, useCreateVisitorInvite, useCheckInVisitor } from '@/lib/hooks';

interface Visitor {
  id: string;
  name: string;
  host: string;
  purpose: string;
  vehicle: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

const initialVisitors: Visitor[] = [
  { id: '1', name: 'Mr. Kwaku Antwi', host: 'Kwame Asante (A-101)', purpose: 'Personal Visit', vehicle: 'GR-1234-20', checkIn: '09:30 AM', checkOut: '11:45 AM', status: 'checked_out' },
  { id: '2', name: 'DHL Courier', host: 'Ama Mensah (A-203)', purpose: 'Delivery', vehicle: '—', checkIn: '10:15 AM', checkOut: '10:25 AM', status: 'checked_out' },
  { id: '3', name: 'Mrs. Efua Ansah', host: 'Kofi Boateng (B-102)', purpose: 'Personal Visit', vehicle: 'AS-5678-21', checkIn: '11:00 AM', checkOut: '—', status: 'checked_in' },
  { id: '4', name: 'Plumber — Kwadwo', host: 'Estate Office', purpose: 'Maintenance', vehicle: '—', checkIn: '08:00 AM', checkOut: '—', status: 'checked_in' },
  { id: '5', name: 'Dr. Adwoa Sarpong', host: 'Abena Owusu (A-301)', purpose: 'Medical Visit', vehicle: 'GT-9012-22', checkIn: '02:00 PM', checkOut: '—', status: 'expected' },
  { id: '6', name: 'Food Delivery — Bolt', host: 'Yaw Darko (B-201)', purpose: 'Delivery', vehicle: 'Motorcycle', checkIn: '—', checkOut: '—', status: 'expected' },
];

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  checked_in: { icon: CheckCircle2, color: 'text-green-600', label: 'In Estate' },
  checked_out: { icon: XCircle, color: 'text-muted-foreground', label: 'Left' },
  expected: { icon: Clock, color: 'text-blue-600', label: 'Expected' },
};

export default function VisitorsPage() {
  const [localVisitors, setLocalVisitors] = useState<Visitor[]>(initialVisitors);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState<Visitor | null>(null);
  const [form, setForm] = useState({ name: '', host: '', purpose: 'Personal Visit', vehicle: '' });

  const { data: apiData } = useVisitorInvites();
  const createInvite = useCreateVisitorInvite();
  const checkInVisitor = useCheckInVisitor();

  const visitors: Visitor[] = apiData?.data
    ? apiData.data.map((v: any) => ({
        id: v.id,
        name: v.visitorName,
        host: v.host?.user ? `${v.host.user.firstName} ${v.host.user.lastName}` : v.hostName || '—',
        purpose: v.purpose || 'Visit',
        vehicle: v.vehiclePlate || '—',
        checkIn: v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—',
        checkOut: v.checkOutTime ? new Date(v.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—',
        status: v.status || 'expected',
      }))
    : localVisitors;

  const filtered = visitors.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) || v.host.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    const newVisitor: Visitor = {
      id: Date.now().toString(),
      name: form.name,
      host: form.host,
      purpose: form.purpose,
      vehicle: form.vehicle || '—',
      checkIn: '—',
      checkOut: '—',
      status: 'expected',
    };
    createInvite.mutate(
      { visitorName: form.name, purpose: form.purpose, vehiclePlate: form.vehicle, estateId: '' },
      { onError: () => setLocalVisitors([newVisitor, ...localVisitors]) },
    );
    setForm({ name: '', host: '', purpose: 'Personal Visit', vehicle: '' });
    setShowAdd(false);
  };

  const handleCheckIn = (id: string) => {
    checkInVisitor.mutate(id);
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setLocalVisitors(localVisitors.map((v) => v.id === id ? { ...v, status: 'checked_in', checkIn: now } : v));
    if (showDetail?.id === id) setShowDetail({ ...showDetail, status: 'checked_in', checkIn: now });
  };

  const handleCheckOut = (id: string) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setLocalVisitors(localVisitors.map((v) => v.id === id ? { ...v, status: 'checked_out', checkOut: now } : v));
    if (showDetail?.id === id) setShowDetail({ ...showDetail, status: 'checked_out', checkOut: now });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Visitors</h1>
          <p className="text-muted-foreground mt-1">Gate access and visitor management</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> Pre-register Visitor</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Currently In</p><p className="text-2xl font-bold mt-1 text-green-600">{visitors.filter(v => v.status === 'checked_in').length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Expected</p><p className="text-2xl font-bold mt-1 text-blue-600">{visitors.filter(v => v.status === 'expected').length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Today</p><p className="text-2xl font-bold mt-1">{visitors.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Checked Out</p><p className="text-2xl font-bold mt-1">{visitors.filter(v => v.status === 'checked_out').length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Today&apos;s Log</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search visitors..." className="pl-9 w-60" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visitor</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => {
                const config = statusConfig[v.status];
                const Icon = config.icon;
                return (
                  <TableRow key={v.id} className="cursor-pointer" onClick={() => setShowDetail(v)}>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>{v.host}</TableCell>
                    <TableCell><Badge variant="outline">{v.purpose}</Badge></TableCell>
                    <TableCell>{v.vehicle}</TableCell>
                    <TableCell>{v.checkIn}</TableCell>
                    <TableCell>{v.checkOut}</TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1.5 ${config.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">{config.label}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pre-register Visitor</DialogTitle>
            <DialogDescription>Register an expected visitor for today.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Visitor Name</Label><Input placeholder="e.g. Mr. Kwaku Antwi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Host (Resident)</Label><Input placeholder="e.g. Kwame Asante (A-101)" value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Purpose</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
                  <option>Personal Visit</option><option>Delivery</option><option>Maintenance</option><option>Medical Visit</option><option>Business</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Vehicle (optional)</Label><Input placeholder="e.g. GR-1234-20" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.name || !form.host}>Register</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showDetail?.name}</DialogTitle>
            <DialogDescription>Visiting {showDetail?.host}</DialogDescription>
          </DialogHeader>
          {showDetail && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Purpose</p><p className="font-medium">{showDetail.purpose}</p></div>
                <div><p className="text-muted-foreground">Vehicle</p><p className="font-medium">{showDetail.vehicle}</p></div>
                <div><p className="text-muted-foreground">Check In</p><p className="font-medium">{showDetail.checkIn}</p></div>
                <div><p className="text-muted-foreground">Check Out</p><p className="font-medium">{showDetail.checkOut}</p></div>
              </div>
              <div className="flex gap-2 pt-2">
                {showDetail.status === 'expected' && (
                  <Button size="sm" className="gap-2" onClick={() => handleCheckIn(showDetail.id)}><CheckCircle2 className="h-4 w-4" /> Check In</Button>
                )}
                {showDetail.status === 'checked_in' && (
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => handleCheckOut(showDetail.id)}><XCircle className="h-4 w-4" /> Check Out</Button>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
