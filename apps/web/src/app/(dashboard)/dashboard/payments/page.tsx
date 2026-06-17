'use client';

import { useState } from 'react';
import { Receipt, Search, Download, ArrowUpRight, ArrowDownRight, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { usePayments, useInvoices, useRecordPayment } from '@/lib/hooks';

interface Payment {
  id: string;
  tenant: string;
  unit: string;
  type: string;
  amount: number;
  method: string;
  date: string;
  status: string;
}

const initialPayments: Payment[] = [
  { id: 'PAY-001', tenant: 'Kwame Asante', unit: 'A-101', type: 'Rent', amount: 3500, method: 'Mobile Money', date: '2025-01-05', status: 'completed' },
  { id: 'PAY-002', tenant: 'Ama Mensah', unit: 'A-203', type: 'EMF', amount: 850, method: 'Bank Transfer', date: '2025-01-04', status: 'completed' },
  { id: 'PAY-003', tenant: 'Kofi Boateng', unit: 'B-102', type: 'Rent', amount: 4200, method: 'Mobile Money', date: '2025-01-03', status: 'completed' },
  { id: 'PAY-004', tenant: 'Abena Owusu', unit: 'A-301', type: 'Rent', amount: 5800, method: 'Bank Transfer', date: '2025-01-02', status: 'pending' },
  { id: 'PAY-005', tenant: 'Yaw Darko', unit: 'B-201', type: 'EMF', amount: 850, method: 'Card', date: '2025-01-01', status: 'completed' },
  { id: 'PAY-006', tenant: 'Akosua Frimpong', unit: 'A-402', type: 'Rent', amount: 3500, method: 'Mobile Money', date: '2024-12-31', status: 'failed' },
  { id: 'PAY-007', tenant: 'Nana Agyemang', unit: 'B-301', type: 'Utility', amount: 320, method: 'Mobile Money', date: '2024-12-30', status: 'completed' },
];

export default function PaymentsPage() {
  const [localPayments, setLocalPayments] = useState<Payment[]>(initialPayments);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState<Payment | null>(null);
  const [form, setForm] = useState({ tenant: '', unit: '', type: 'Rent', amount: 0, method: 'Mobile Money' });

  const { data: apiData } = usePayments();
  const recordPayment = useRecordPayment();

  const payments: Payment[] = apiData?.data
    ? apiData.data.map((p: any) => ({
        id: p.id,
        tenant: p.invoice?.tenant?.user ? `${p.invoice.tenant.user.firstName} ${p.invoice.tenant.user.lastName}` : 'Unknown',
        unit: p.invoice?.unit?.unitNumber || '—',
        type: p.invoice?.type || 'Payment',
        amount: p.amount,
        method: p.method || 'Mobile Money',
        date: new Date(p.createdAt).toISOString().split('T')[0],
        status: p.status || 'completed',
      }))
    : localPayments;

  const filtered = payments.filter((p) =>
    p.tenant.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    const newPayment: Payment = {
      id: `PAY-${String(payments.length + 1).padStart(3, '0')}`,
      tenant: form.tenant,
      unit: form.unit,
      type: form.type,
      amount: form.amount,
      method: form.method,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
    };
    recordPayment.mutate(
      { invoiceId: '', amount: form.amount, method: form.method.toLowerCase().replace(' ', '_') },
      { onError: () => setLocalPayments([newPayment, ...localPayments]) },
    );
    setForm({ tenant: '', unit: '', type: 'Rent', amount: 0, method: 'Mobile Money' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Payments</h1>
          <p className="text-muted-foreground mt-1">Track and manage all payment transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
          <Button className="gap-2" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> Record Payment</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Revenue (MTD)</p><p className="text-2xl font-bold mt-1">GH₵ 458,000</p><div className="flex items-center gap-1 mt-1 text-green-600 text-xs"><ArrowUpRight className="h-3 w-3" /> +8.3% vs last month</div></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold mt-1">GH₵ 32,400</p><div className="flex items-center gap-1 mt-1 text-orange-600 text-xs">12 transactions</div></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Failed</p><p className="text-2xl font-bold mt-1">GH₵ 15,200</p><div className="flex items-center gap-1 mt-1 text-red-600 text-xs"><ArrowDownRight className="h-3 w-3" /> 4 transactions</div></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Success Rate</p><p className="text-2xl font-bold mt-1">96.2%</p><div className="flex items-center gap-1 mt-1 text-green-600 text-xs"><ArrowUpRight className="h-3 w-3" /> +2.1%</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9 w-60" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className="cursor-pointer" onClick={() => setShowDetail(p)}>
                  <TableCell className="font-mono text-xs">{p.id}</TableCell>
                  <TableCell className="font-medium">{p.tenant}</TableCell>
                  <TableCell>{p.unit}</TableCell>
                  <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                  <TableCell className="font-semibold">GH₵ {p.amount.toLocaleString()}</TableCell>
                  <TableCell>{p.method}</TableCell>
                  <TableCell>{p.date}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === 'completed' ? 'success' : p.status === 'pending' ? 'warning' : 'destructive'}>
                      {p.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Enter payment details received from tenant.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tenant Name</Label><Input placeholder="e.g. Kwame Asante" value={form.tenant} onChange={(e) => setForm({ ...form, tenant: e.target.value })} /></div>
              <div className="space-y-2"><Label>Unit</Label><Input placeholder="e.g. A-101" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Amount (GH₵)</Label><Input type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: +e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option>Rent</option><option>EMF</option><option>Utility</option><option>Deposit</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                <option>Mobile Money</option><option>Bank Transfer</option><option>Card</option><option>Cash</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.tenant || !form.unit || form.amount <= 0}>Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment {showDetail?.id}</DialogTitle>
            <DialogDescription>Transaction details</DialogDescription>
          </DialogHeader>
          {showDetail && (
            <div className="space-y-3 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Tenant</p><p className="font-medium">{showDetail.tenant}</p></div>
                <div><p className="text-muted-foreground">Unit</p><p className="font-medium">{showDetail.unit}</p></div>
                <div><p className="text-muted-foreground">Type</p><p className="font-medium">{showDetail.type}</p></div>
                <div><p className="text-muted-foreground">Amount</p><p className="font-semibold text-lg">GH₵ {showDetail.amount.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">Method</p><p className="font-medium">{showDetail.method}</p></div>
                <div><p className="text-muted-foreground">Date</p><p className="font-medium">{showDetail.date}</p></div>
              </div>
              <div><Badge variant={showDetail.status === 'completed' ? 'success' : showDetail.status === 'pending' ? 'warning' : 'destructive'}>{showDetail.status}</Badge></div>
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
