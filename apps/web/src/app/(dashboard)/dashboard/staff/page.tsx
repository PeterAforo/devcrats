'use client';

import { useState } from 'react';
import { Plus, Search, Phone, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

const defaultStaffForm = { firstName: '', lastName: '', email: '', phone: '', role: 'security_guard' };
const defaultVendorForm = { name: '', specialty: '', contactName: '', phone: '', email: '', address: '' };

export default function StaffPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const estateId = user?.estateId || '';
  const [activeTab, setActiveTab] = useState('staff');
  const [search, setSearch] = useState('');

  // Staff state
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const [editStaffId, setEditStaffId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState(defaultStaffForm);
  const [deleteStaffId, setDeleteStaffId] = useState<string | null>(null);

  // Vendor state
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [editVendorId, setEditVendorId] = useState<string | null>(null);
  const [vendorForm, setVendorForm] = useState(defaultVendorForm);
  const [deleteVendorId, setDeleteVendorId] = useState<string | null>(null);

  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: ['staff', estateId],
    queryFn: () => api.get(`/staff${estateId ? `?estateId=${estateId}` : ''}`),
  });
  const { data: vendorData, isLoading: vendorLoading } = useQuery({
    queryKey: ['vendors', estateId],
    queryFn: () => api.get(`/vendors${estateId ? `?estateId=${estateId}` : ''}`),
  });

  const staffList: any[] = staffData?.data || [];
  const vendorList: any[] = vendorData?.data || [];

  const filteredStaff = staffList.filter((s: any) => {
    const name = `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.toLowerCase();
    return name.includes(search.toLowerCase()) || (s.user?.phone || '').includes(search);
  });

  // ─── Staff mutations ───
  const staffSave = useMutation({
    mutationFn: (data: any) => editStaffId ? api.put(`/staff/${editStaffId}`, data) : api.post('/staff', { ...data, estateId }),
    onSuccess: () => { toast.success(editStaffId ? 'Staff updated' : 'Staff added'); qc.invalidateQueries({ queryKey: ['staff'] }); closeStaffDialog(); },
    onError: (e: any) => toast.error(e.message || 'Failed'),
  });
  const staffDelete = useMutation({
    mutationFn: (id: string) => api.delete(`/staff/${id}`),
    onSuccess: () => { toast.success('Staff deleted'); qc.invalidateQueries({ queryKey: ['staff'] }); setDeleteStaffId(null); },
    onError: (e: any) => toast.error(e.message || 'Failed'),
  });

  const openAddStaff = () => { setEditStaffId(null); setStaffForm(defaultStaffForm); setShowStaffDialog(true); };
  const openEditStaff = (s: any) => {
    setEditStaffId(s.id);
    setStaffForm({ firstName: s.user?.firstName || '', lastName: s.user?.lastName || '', email: s.user?.email || '', phone: s.user?.phone || '', role: s.role || 'security_guard' });
    setShowStaffDialog(true);
  };
  const closeStaffDialog = () => { setShowStaffDialog(false); setEditStaffId(null); setStaffForm(defaultStaffForm); };

  // ─── Vendor mutations ───
  const vendorSave = useMutation({
    mutationFn: (data: any) => editVendorId ? api.put(`/vendors/${editVendorId}`, data) : api.post('/vendors', { ...data, estateId }),
    onSuccess: () => { toast.success(editVendorId ? 'Vendor updated' : 'Vendor added'); qc.invalidateQueries({ queryKey: ['vendors'] }); closeVendorDialog(); },
    onError: (e: any) => toast.error(e.message || 'Failed'),
  });
  const vendorDelete = useMutation({
    mutationFn: (id: string) => api.delete(`/vendors/${id}`),
    onSuccess: () => { toast.success('Vendor deleted'); qc.invalidateQueries({ queryKey: ['vendors'] }); setDeleteVendorId(null); },
    onError: (e: any) => toast.error(e.message || 'Failed'),
  });

  const openAddVendor = () => { setEditVendorId(null); setVendorForm(defaultVendorForm); setShowVendorDialog(true); };
  const openEditVendor = (v: any) => {
    setEditVendorId(v.id);
    setVendorForm({ name: v.name || '', specialty: v.specialty || '', contactName: v.contactName || '', phone: v.phone || '', email: v.email || '', address: v.address || '' });
    setShowVendorDialog(true);
  };
  const closeVendorDialog = () => { setShowVendorDialog(false); setEditVendorId(null); setVendorForm(defaultVendorForm); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Staff & Vendors</h1>
          <p className="text-muted-foreground mt-1">Manage estate personnel and service providers</p>
        </div>
        <Button className="gap-2" onClick={activeTab === 'staff' ? openAddStaff : openAddVendor}>
          <Plus className="h-4 w-4" /> Add {activeTab === 'staff' ? 'Staff' : 'Vendor'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="staff">Staff ({staffList.length})</TabsTrigger>
          <TabsTrigger value="vendors">Vendors ({vendorList.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Estate Staff</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search staff..." className="pl-9 w-60" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              {staffLoading ? (
                <div className="py-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />Loading...</div>
              ) : filteredStaff.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No staff found. Click &quot;Add Staff&quot; to get started.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.user?.firstName} {s.user?.lastName}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{(s.role || '').replace(/_/g, ' ')}</Badge></TableCell>
                        <TableCell className="text-sm"><span className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.user?.phone || '—'}</span></TableCell>
                        <TableCell className="text-sm">{s.user?.email || '—'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditStaff(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteStaffId(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          {vendorLoading ? (
            <div className="py-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />Loading...</div>
          ) : vendorList.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No vendors found. Click &quot;Add Vendor&quot; to get started.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendorList.map((v: any) => (
                <Card key={v.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{v.name}</h3>
                        <p className="text-sm text-muted-foreground">{v.specialty || '—'}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditVendor(v)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteVendorId(v.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      {v.contactName && <span>Contact: {v.contactName}</span>}
                      {v.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{v.phone}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Staff Add/Edit Dialog */}
      <Dialog open={showStaffDialog} onOpenChange={closeStaffDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editStaffId ? 'Edit' : 'Add'} Staff Member</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>First Name *</Label><Input value={staffForm.firstName} onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Last Name *</Label><Input value={staffForm.lastName} onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email *</Label><Input type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} disabled={!!editStaffId} className={editStaffId ? 'opacity-60' : ''} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}>
                <option value="security_guard">Security Guard</option>
                <option value="security_supervisor">Security Supervisor</option>
                <option value="facility_manager">Facility Manager</option>
                <option value="maintenance_tech">Maintenance Tech</option>
                <option value="cleaner">Cleaner</option>
                <option value="gate_officer">Gate Officer</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeStaffDialog}>Cancel</Button>
            <Button onClick={() => staffSave.mutate(staffForm)} disabled={!staffForm.firstName || !staffForm.lastName || (!editStaffId && !staffForm.email) || staffSave.isPending}>
              {staffSave.isPending ? 'Saving...' : editStaffId ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Staff Delete Dialog */}
      <Dialog open={!!deleteStaffId} onOpenChange={() => setDeleteStaffId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Staff Member?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will remove the staff member from the system.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteStaffId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteStaffId && staffDelete.mutate(deleteStaffId)} disabled={staffDelete.isPending}>
              {staffDelete.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vendor Add/Edit Dialog */}
      <Dialog open={showVendorDialog} onOpenChange={closeVendorDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editVendorId ? 'Edit' : 'Add'} Vendor</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Company Name *</Label><Input value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Specialty</Label><Input value={vendorForm.specialty} onChange={(e) => setVendorForm({ ...vendorForm, specialty: e.target.value })} placeholder="e.g. HVAC" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Contact Person</Label><Input value={vendorForm.contactName} onChange={(e) => setVendorForm({ ...vendorForm, contactName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={vendorForm.phone} onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={vendorForm.email} onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Address</Label><Input value={vendorForm.address} onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeVendorDialog}>Cancel</Button>
            <Button onClick={() => vendorSave.mutate(vendorForm)} disabled={!vendorForm.name || vendorSave.isPending}>
              {vendorSave.isPending ? 'Saving...' : editVendorId ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vendor Delete Dialog */}
      <Dialog open={!!deleteVendorId} onOpenChange={() => setDeleteVendorId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Vendor?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will remove the vendor from the system.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteVendorId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteVendorId && vendorDelete.mutate(deleteVendorId)} disabled={vendorDelete.isPending}>
              {vendorDelete.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
