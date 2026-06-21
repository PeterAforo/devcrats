'use client';

import { useState } from 'react';
import { Wallet, Plus, Calculator, PieChart, TrendingUp, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

const defaultForm = { name: '', category: 'utility', amount: '', frequency: 'monthly', landlordSplit: '30', tenantSplit: '70', description: '' };

export default function EMFPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const estateId = user?.estateId || '';

  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: apiData, isLoading } = useQuery({
    queryKey: ['emf-components', estateId],
    queryFn: async () => {
      const url = `/emf/components${estateId ? `?estateId=${estateId}` : ''}`;
      console.log('EMF Query - Fetching:', { url, estateId });
      const result = await api.get(url);
      console.log('EMF Query - Response:', result);
      return result;
    },
  });

  const feeComponents: any[] = apiData?.data || [];
  console.log('EMF Render State:', { estateId, apiData, feeComponents, count: feeComponents.length, isLoading });
  const totalMonthly = feeComponents.reduce((sum: number, f: any) => sum + Number(f.amount || 0), 0);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editId ? `/emf/components/${editId}` : '/emf/components';
      const payload = editId ? data : { ...data, estateId };
      console.log('EMF Save - Request:', { url, payload, editId, estateId });
      const result = editId ? await api.put(url, data) : await api.post('/emf/components', { ...data, estateId });
      console.log('EMF Save - Response:', result);
      return result;
    },
    onSuccess: (result) => {
      console.log('EMF Save - Success:', result);
      toast.success(editId ? 'Component updated' : 'Component added');
      qc.invalidateQueries({ queryKey: ['emf-components', estateId] });
      qc.refetchQueries({ queryKey: ['emf-components', estateId] });
      closeDialog();
    },
    onError: (err: any) => {
      console.error('EMF Save - Error:', err);
      toast.error(err.message || 'Failed to save');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/emf/components/${id}`),
    onSuccess: () => {
      toast.success('Component deleted');
      qc.invalidateQueries({ queryKey: ['emf-components', estateId] });
      setDeleteId(null);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete'),
  });

  const openAdd = () => { setEditId(null); setForm(defaultForm); setShowDialog(true); };
  const openEdit = (fee: any) => {
    setEditId(fee.id);
    setForm({
      name: fee.name || '',
      category: fee.category || 'utility',
      amount: String(fee.amount || ''),
      frequency: fee.frequency || 'monthly',
      landlordSplit: String(fee.landlordSplit ?? 30),
      tenantSplit: String(fee.tenantSplit ?? 70),
      description: fee.description || '',
    });
    setShowDialog(true);
  };
  const closeDialog = () => { setShowDialog(false); setEditId(null); setForm(defaultForm); };

  const handleSave = () => {
    saveMutation.mutate({
      name: form.name,
      category: form.category,
      amount: parseFloat(form.amount),
      frequency: form.frequency,
      landlordSplit: parseFloat(form.landlordSplit),
      tenantSplit: parseFloat(form.tenantSplit),
      description: form.description || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Estate Management Fee</h1>
          <p className="text-muted-foreground mt-1">Transparent fee breakdown and collection</p>
        </div>
        <Button className="gap-2" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Fee Component
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center"><Wallet className="h-5 w-5 text-gold" /></div><div><p className="text-sm text-muted-foreground">Total Monthly</p><p className="text-xl font-bold">GH₵ {totalMonthly.toLocaleString()}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-green-600" /></div><div><p className="text-sm text-muted-foreground">Collection Rate</p><p className="text-xl font-bold">—</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><PieChart className="h-5 w-5 text-blue-600" /></div><div><p className="text-sm text-muted-foreground">Components</p><p className="text-xl font-bold">{feeComponents.length}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><Calculator className="h-5 w-5 text-purple-600" /></div><div><p className="text-sm text-muted-foreground">Annual Total</p><p className="text-xl font-bold">GH₵ {(totalMonthly * 12).toLocaleString()}</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Components</CardTitle>
          <CardDescription>Active fee schedule</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />Loading...</div>
          ) : feeComponents.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No fee components yet. Click &quot;Add Fee Component&quot; to get started.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Landlord / Tenant Split</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeComponents.map((fee: any) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{fee.name}</TableCell>
                    <TableCell><Badge variant="outline">{fee.category}</Badge></TableCell>
                    <TableCell>GH₵ {Number(fee.amount).toLocaleString()}</TableCell>
                    <TableCell className="capitalize">{fee.frequency}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={Number(fee.landlordSplit)} className="h-2 w-20" />
                        <span className="text-xs text-muted-foreground">{Number(fee.landlordSplit)}/{Number(fee.tenantSplit)}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={fee.isActive !== false ? 'default' : 'secondary'}>{fee.isActive !== false ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(fee)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(fee.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit' : 'Add'} Fee Component</DialogTitle>
            <DialogDescription>
              {editId ? 'Update the fee component details below.' : 'Add a new fee component to the estate management fee schedule.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. 24/7 Security Service" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="utility">Utility</option><option value="security">Security</option><option value="cleaning">Cleaning</option>
                  <option value="maintenance">Maintenance</option><option value="reserve">Reserve</option><option value="admin">Admin</option><option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Amount (GH₵) *</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="250" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
                  <option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annually">Annually</option><option value="one_time">One-time</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Landlord Split (%)</Label><Input type="number" value={form.landlordSplit} onChange={(e) => setForm({ ...form, landlordSplit: e.target.value, tenantSplit: String(100 - Number(e.target.value)) })} /></div>
              <div className="space-y-2"><Label>Tenant Split (%)</Label><Input type="number" value={form.tenantSplit} onChange={(e) => setForm({ ...form, tenantSplit: e.target.value, landlordSplit: String(100 - Number(e.target.value)) })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.amount || saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editId ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Fee Component?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The fee component will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
