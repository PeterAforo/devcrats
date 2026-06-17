'use client';

import { useState } from 'react';
import { MessageSquareWarning, Plus, Search, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useComplaints, useCreateComplaint } from '@/lib/hooks';

interface Complaint {
  id: string;
  title: string;
  category: string;
  urgency: string;
  status: string;
  reporter: string;
  date: string;
  description?: string;
}

const initialComplaints: Complaint[] = [
  { id: 'CMP-001', title: 'Excessive noise from unit A-302', category: 'Noise', urgency: 'high', status: 'investigating', reporter: 'Kwame Asante', date: '2025-01-05', description: 'Loud music past midnight on weekdays repeatedly.' },
  { id: 'CMP-002', title: 'Parking space dispute', category: 'Parking', urgency: 'medium', status: 'open', reporter: 'Ama Mensah', date: '2025-01-04' },
  { id: 'CMP-003', title: 'Low water pressure — Block B', category: 'Utility', urgency: 'high', status: 'action_taken', reporter: 'Kofi Boateng', date: '2025-01-03' },
  { id: 'CMP-004', title: 'Security guard sleeping on duty', category: 'Security', urgency: 'urgent', status: 'open', reporter: 'Abena Owusu', date: '2025-01-02' },
  { id: 'CMP-005', title: 'Unkempt garden area', category: 'Environment', urgency: 'low', status: 'resolved', reporter: 'Yaw Darko', date: '2024-12-28' },
  { id: 'CMP-006', title: 'Gate barrier malfunction', category: 'Infrastructure', urgency: 'medium', status: 'investigating', reporter: 'Akosua Frimpong', date: '2025-01-01' },
];

const statusColors: Record<string, string> = { open: 'destructive', investigating: 'warning', action_taken: 'info', resolved: 'success' };
const urgencyColors: Record<string, string> = { urgent: 'destructive', high: 'warning', medium: 'info', low: 'secondary' };

export default function ComplaintsPage() {
  const [localComplaints, setLocalComplaints] = useState<Complaint[]>(initialComplaints);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState<Complaint | null>(null);
  const [form, setForm] = useState({ title: '', category: 'Noise', urgency: 'medium', reporter: '', description: '' });

  const { data: apiData } = useComplaints();
  const createComplaint = useCreateComplaint();

  const complaints: Complaint[] = apiData?.data
    ? apiData.data.map((c: any) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        urgency: c.urgency || 'medium',
        status: c.status,
        reporter: c.reporter?.user ? `${c.reporter.user.firstName} ${c.reporter.user.lastName}` : 'Anonymous',
        date: new Date(c.createdAt).toISOString().split('T')[0],
        description: c.description,
      }))
    : localComplaints;

  const filtered = complaints.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) || c.reporter.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    const newComplaint: Complaint = {
      id: `CMP-${String(complaints.length + 1).padStart(3, '0')}`,
      title: form.title,
      category: form.category,
      urgency: form.urgency,
      status: 'open',
      reporter: form.reporter,
      date: new Date().toISOString().split('T')[0],
      description: form.description,
    };
    createComplaint.mutate(
      { title: form.title, category: form.category.toLowerCase(), urgency: form.urgency as any, description: form.description, estateId: '' },
      { onError: () => setLocalComplaints([newComplaint, ...localComplaints]) },
    );
    setForm({ title: '', category: 'Noise', urgency: 'medium', reporter: '', description: '' });
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setLocalComplaints(localComplaints.filter((c) => c.id !== id));
    setShowDetail(null);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setLocalComplaints(localComplaints.map((c) => c.id === id ? { ...c, status: newStatus } : c));
    if (showDetail?.id === id) setShowDetail({ ...showDetail, status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Complaints</h1>
          <p className="text-muted-foreground mt-1">Manage and resolve resident complaints</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> File Complaint</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Open</p><p className="text-2xl font-bold mt-1 text-red-600">{complaints.filter(c => c.status === 'open').length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Investigating</p><p className="text-2xl font-bold mt-1 text-yellow-600">{complaints.filter(c => c.status === 'investigating').length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Action Taken</p><p className="text-2xl font-bold mt-1 text-blue-600">{complaints.filter(c => c.status === 'action_taken').length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Resolved</p><p className="text-2xl font-bold mt-1 text-green-600">{complaints.filter(c => c.status === 'resolved').length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Complaints</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search complaints..." className="pl-9 w-60" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="cursor-pointer" onClick={() => setShowDetail(c)}>
                  <TableCell className="font-mono text-xs">{c.id}</TableCell>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell><Badge variant="outline">{c.category}</Badge></TableCell>
                  <TableCell><Badge variant={urgencyColors[c.urgency] as any}>{c.urgency}</Badge></TableCell>
                  <TableCell>{c.reporter}</TableCell>
                  <TableCell>{c.date}</TableCell>
                  <TableCell><Badge variant={statusColors[c.status] as any}>{c.status.replace('_', ' ')}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>File Complaint</DialogTitle>
            <DialogDescription>Report a new issue or concern.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Title</Label><Input placeholder="Brief description of complaint" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Reporter</Label><Input placeholder="Your name" value={form.reporter} onChange={(e) => setForm({ ...form, reporter: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option>Noise</option><option>Parking</option><option>Security</option><option>Utility</option><option>Environment</option><option>Infrastructure</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Urgency</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-2"><Label>Description</Label><Input placeholder="Provide more details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.title || !form.reporter}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showDetail?.title}</DialogTitle>
            <DialogDescription>{showDetail?.id} — Filed by {showDetail?.reporter} on {showDetail?.date}</DialogDescription>
          </DialogHeader>
          {showDetail && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Category</p><Badge variant="outline">{showDetail.category}</Badge></div>
                <div><p className="text-muted-foreground">Urgency</p><Badge variant={urgencyColors[showDetail.urgency] as any}>{showDetail.urgency}</Badge></div>
              </div>
              {showDetail.description && <div className="text-sm"><p className="text-muted-foreground">Description</p><p>{showDetail.description}</p></div>}
              <div className="flex gap-2 pt-2 flex-wrap">
                <Label className="text-xs text-muted-foreground self-center">Status:</Label>
                {['open', 'investigating', 'action_taken', 'resolved'].map((s) => (
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
