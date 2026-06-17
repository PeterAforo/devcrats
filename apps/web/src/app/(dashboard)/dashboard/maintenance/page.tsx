'use client';

import { useState } from 'react';
import { Wrench, Plus, Search, Clock, CheckCircle2, AlertTriangle, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useMaintenanceRequests, useCreateMaintenanceRequest, useDeleteMaintenanceRequest } from '@/lib/hooks';

interface ServiceRequest {
  id: string;
  title: string;
  unit: string;
  category: string;
  priority: string;
  status: string;
  assignee: string;
  date: string;
  tenant: string;
  description?: string;
}

const initialRequests: ServiceRequest[] = [
  { id: 'SR-001', title: 'Kitchen sink leaking', unit: 'A-101', category: 'Plumbing', priority: 'high', status: 'assigned', assignee: 'Kwadwo Plumbing', date: '2025-01-05', tenant: 'Kwame Asante', description: 'Water dripping under the kitchen cabinet for 2 days.' },
  { id: 'SR-002', title: 'Lobby light fixtures flickering', unit: 'Common', category: 'Electrical', priority: 'normal', status: 'submitted', assignee: '—', date: '2025-01-04', tenant: 'Estate Manager' },
  { id: 'SR-003', title: 'Air conditioning not cooling', unit: 'B-203', category: 'HVAC', priority: 'high', status: 'in_progress', assignee: 'CoolAir Ghana', date: '2025-01-03', tenant: 'Kofi Boateng' },
  { id: 'SR-004', title: 'Lock replacement needed', unit: 'A-302', category: 'Carpentry', priority: 'urgent', status: 'submitted', assignee: '—', date: '2025-01-03', tenant: 'Ama Mensah' },
  { id: 'SR-005', title: 'Paint peeling in bathroom', unit: 'B-101', category: 'Painting', priority: 'low', status: 'completed', assignee: 'PaintMaster GH', date: '2024-12-28', tenant: 'Yaw Darko' },
  { id: 'SR-006', title: 'Broken window pane', unit: 'A-405', category: 'General', priority: 'normal', status: 'in_progress', assignee: 'GlassFit Accra', date: '2025-01-01', tenant: 'Abena Owusu' },
];

const priorityColor: Record<string, string> = { urgent: 'destructive', high: 'warning', normal: 'info', low: 'secondary' };
const statusIcon: Record<string, any> = { submitted: Clock, assigned: AlertTriangle, in_progress: Wrench, completed: CheckCircle2 };

export default function MaintenancePage() {
  const [localRequests, setLocalRequests] = useState<ServiceRequest[]>(initialRequests);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState<ServiceRequest | null>(null);
  const [form, setForm] = useState({ title: '', unit: '', category: 'Plumbing', priority: 'normal', tenant: '', description: '' });

  const { data: apiData } = useMaintenanceRequests();
  const createRequest = useCreateMaintenanceRequest();
  const deleteRequest = useDeleteMaintenanceRequest();

  // Use API data if available, otherwise local mock
  const requests: ServiceRequest[] = apiData?.data
    ? apiData.data.map((r: any) => ({
        id: r.id,
        title: r.title,
        unit: r.unit?.unitNumber || 'Common',
        category: r.category,
        priority: r.priority,
        status: r.status,
        assignee: r.assignedTo || '—',
        date: new Date(r.createdAt).toISOString().split('T')[0],
        tenant: r.tenant?.user?.firstName ? `${r.tenant.user.firstName} ${r.tenant.user.lastName}` : 'Unknown',
        description: r.description,
      }))
    : localRequests;

  const filtered = requests.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) || r.tenant.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    const newReq: ServiceRequest = {
      id: `SR-${String(requests.length + 1).padStart(3, '0')}`,
      title: form.title,
      unit: form.unit,
      category: form.category,
      priority: form.priority,
      status: 'submitted',
      assignee: '—',
      date: new Date().toISOString().split('T')[0],
      tenant: form.tenant,
      description: form.description,
    };
    // Try API first
    createRequest.mutate(
      { title: form.title, category: form.category.toLowerCase(), priority: form.priority, description: form.description, estateId: '' },
      { onError: () => setLocalRequests([newReq, ...localRequests]) },
    );
    setForm({ title: '', unit: '', category: 'Plumbing', priority: 'normal', tenant: '', description: '' });
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    deleteRequest.mutate(id, { onError: () => {} });
    setLocalRequests(localRequests.filter((r) => r.id !== id));
    setShowDetail(null);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setLocalRequests(localRequests.map((r) => r.id === id ? { ...r, status: newStatus } : r));
    if (showDetail?.id === id) setShowDetail({ ...showDetail, status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Maintenance</h1>
          <p className="text-muted-foreground mt-1">Track service requests and work orders</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> New Request</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Open</p><p className="text-2xl font-bold mt-1">{requests.filter(r => r.status === 'submitted').length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">In Progress</p><p className="text-2xl font-bold mt-1">{requests.filter(r => r.status === 'in_progress' || r.status === 'assigned').length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Completed</p><p className="text-2xl font-bold mt-1">{requests.filter(r => r.status === 'completed').length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Avg Resolution</p><p className="text-2xl font-bold mt-1">2.3 days</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Service Requests</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search requests..." className="pl-9 w-60" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => {
                const StatusIcon = statusIcon[r.status] || Clock;
                return (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => setShowDetail(r)}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell>{r.unit}</TableCell>
                    <TableCell><Badge variant="outline">{r.category}</Badge></TableCell>
                    <TableCell><Badge variant={priorityColor[r.priority] as any}>{r.priority}</Badge></TableCell>
                    <TableCell>{r.assignee}</TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <StatusIcon className="h-3.5 w-3.5" />
                        <span className="text-xs capitalize">{r.status.replace('_', ' ')}</span>
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
            <DialogTitle>New Service Request</DialogTitle>
            <DialogDescription>Submit a new maintenance request.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Title</Label><Input placeholder="e.g. Kitchen sink leaking" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Unit</Label><Input placeholder="e.g. A-101" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
              <div className="space-y-2"><Label>Reported By</Label><Input placeholder="Tenant name" value={form.tenant} onChange={(e) => setForm({ ...form, tenant: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option>Plumbing</option><option>Electrical</option><option>HVAC</option><option>Carpentry</option><option>Painting</option><option>General</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Input placeholder="Describe the issue..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.title || !form.unit}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showDetail?.title}</DialogTitle>
            <DialogDescription>{showDetail?.id} — Submitted by {showDetail?.tenant}</DialogDescription>
          </DialogHeader>
          {showDetail && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Unit</p><p className="font-medium">{showDetail.unit}</p></div>
                <div><p className="text-muted-foreground">Category</p><Badge variant="outline">{showDetail.category}</Badge></div>
                <div><p className="text-muted-foreground">Priority</p><Badge variant={priorityColor[showDetail.priority] as any}>{showDetail.priority}</Badge></div>
                <div><p className="text-muted-foreground">Assignee</p><p className="font-medium">{showDetail.assignee}</p></div>
                <div><p className="text-muted-foreground">Date</p><p className="font-medium">{showDetail.date}</p></div>
                <div><p className="text-muted-foreground">Status</p><p className="font-medium capitalize">{showDetail.status.replace('_', ' ')}</p></div>
              </div>
              {showDetail.description && <div className="text-sm"><p className="text-muted-foreground">Description</p><p>{showDetail.description}</p></div>}
              <div className="flex gap-2 pt-2">
                <Label className="text-xs text-muted-foreground self-center">Update status:</Label>
                {['submitted', 'assigned', 'in_progress', 'completed'].map((s) => (
                  <Button key={s} size="sm" variant={showDetail.status === s ? 'default' : 'outline'} className="text-xs capitalize" onClick={() => handleStatusChange(showDetail.id, s)}>
                    {s.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="destructive" size="sm" onClick={() => showDetail && handleDelete(showDetail.id)}>Delete</Button>
            <Button variant="outline" onClick={() => setShowDetail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
