'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Receipt, Search, Plus, Printer, Eye, Download } from 'lucide-react';
import { useReceipts, useCreateReceipt } from '@/lib/hooks';
import { toast } from 'sonner';

interface ReceiptItem {
  id: string;
  number: string;
  receivedFrom: string;
  houseNumber: string;
  cluster: string;
  amount: number;
  method: string;
  date: string;
  period: string;
}

const mockReceipts: ReceiptItem[] = [
  { id: '1', number: '301025-1-00AC12', receivedFrom: 'Sarah Adwoa Mansa Ackah-Ayensu', houseNumber: 'AC12', cluster: 'Bellavilla', amount: 300, method: 'Bank Transfer', date: '2025-10-30', period: 'January 2026' },
  { id: '2', number: '281025-2-00BD05', receivedFrom: 'Kwame Asante', houseNumber: 'BD05', cluster: 'Horizon', amount: 450, method: 'Mobile Money', date: '2025-10-28', period: 'January 2026' },
  { id: '3', number: '271025-1-00AC03', receivedFrom: 'Ama Mensah', houseNumber: 'AC03', cluster: 'Bellavilla', amount: 300, method: 'Bank Transfer', date: '2025-10-27', period: 'December 2025' },
  { id: '4', number: '251025-3-00HR08', receivedFrom: 'Kofi Boateng', houseNumber: 'HR08', cluster: 'Horizon', amount: 600, method: 'Mobile Money', date: '2025-10-25', period: 'Jan-Feb 2026' },
  { id: '5', number: '201025-1-00BV14', receivedFrom: 'Abena Owusu', houseNumber: 'BV14', cluster: 'Bellavista', amount: 300, method: 'Card', date: '2025-10-20', period: 'January 2026' },
  { id: '6', number: '181025-2-00AC22', receivedFrom: 'Yaw Darko', houseNumber: 'AC22', cluster: 'Bellavilla', amount: 300, method: 'Bank Transfer', date: '2025-10-18', period: 'January 2026' },
];

export default function ReceiptsPage() {
  const [localReceipts] = useState<ReceiptItem[]>(mockReceipts);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showPreview, setShowPreview] = useState<ReceiptItem | null>(null);
  const [form, setForm] = useState({
    paymentId: '',
    receivedFrom: '',
    houseNumber: '',
    cluster: '',
    contactNumber: '',
    description: '',
    paymentPeriod: '',
    balanceDue: 0,
  });

  const { data: apiData } = useReceipts(1, search || undefined);
  const createReceipt = useCreateReceipt();

  const receipts: ReceiptItem[] = apiData?.data?.data
    ? apiData.data.data.map((r: any) => ({
        id: r.id,
        number: r.number,
        receivedFrom: r.receivedFrom || '—',
        houseNumber: r.houseNumber || '—',
        cluster: r.cluster || '—',
        amount: Number(r.payment?.amount || 0),
        method: r.payment?.method?.replace('_', ' ') || '—',
        date: new Date(r.createdAt).toISOString().split('T')[0],
        period: r.paymentPeriod || '—',
      }))
    : localReceipts;

  const filtered = receipts.filter((r) =>
    r.receivedFrom.toLowerCase().includes(search.toLowerCase()) ||
    r.number.toLowerCase().includes(search.toLowerCase()) ||
    r.houseNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.cluster.toLowerCase().includes(search.toLowerCase())
  );

  const totalIssued = filtered.length;
  const totalAmount = filtered.reduce((sum, r) => sum + r.amount, 0);

  const handleCreate = () => {
    createReceipt.mutate(form, {
      onSuccess: () => {
        toast.success('Receipt generated successfully');
        setShowCreate(false);
        setForm({ paymentId: '', receivedFrom: '', houseNumber: '', cluster: '', contactNumber: '', description: '', paymentPeriod: '', balanceDue: 0 });
      },
      onError: () => toast.error('Failed to generate receipt'),
    });
  };

  const handlePrint = (receipt: ReceiptItem) => {
    const printUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/receipts/${receipt.id}/print`;
    window.open(printUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Receipts</h1>
          <p className="text-muted-foreground mt-1">Generate and manage payment receipts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
          <Button className="gap-2" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> Generate Receipt</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Receipts Issued</p>
            <p className="text-2xl font-bold mt-1">{totalIssued}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Amount Receipted</p>
            <p className="text-2xl font-bold mt-1">GH₵ {totalAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold mt-1">{filtered.filter(r => r.date.startsWith(new Date().toISOString().slice(0, 7))).length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, receipt no, house no, or cluster..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Receipt No.</th>
                  <th className="text-left p-3 font-medium">Received From</th>
                  <th className="text-left p-3 font-medium">House No.</th>
                  <th className="text-left p-3 font-medium">Cluster</th>
                  <th className="text-left p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Method</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Period</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-xs">{r.number}</td>
                    <td className="p-3 font-medium">{r.receivedFrom}</td>
                    <td className="p-3"><Badge variant="outline">{r.houseNumber}</Badge></td>
                    <td className="p-3">{r.cluster}</td>
                    <td className="p-3 font-semibold">GH₵ {r.amount.toLocaleString()}</td>
                    <td className="p-3 capitalize">{r.method}</td>
                    <td className="p-3 text-muted-foreground">{r.date}</td>
                    <td className="p-3">{r.period}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowPreview(r)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePrint(r)}>
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">No receipts found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!showPreview} onOpenChange={() => setShowPreview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> Receipt Preview</DialogTitle>
          </DialogHeader>
          {showPreview && (
            <div className="space-y-4 border rounded-lg p-6">
              <div className="text-center border-b pb-4">
                <h3 className="font-bold text-lg text-primary">DEVCRAS</h3>
                <p className="text-xs text-muted-foreground">Devtraco Courts Residents Association</p>
                <p className="text-xs text-muted-foreground">No. 2, El Minya Crescent, Horizon, Devtraco Courts</p>
              </div>
              <div className="flex justify-between items-center">
                <h4 className="font-bold">OFFICIAL RECEIPT</h4>
                <span className="font-mono text-sm font-bold">No.: {showPreview.number}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Received from:</span><p className="font-medium">{showPreview.receivedFrom}</p></div>
                <div><span className="text-muted-foreground">Date:</span><p className="font-medium">{new Date(showPreview.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
                <div><span className="text-muted-foreground">House No:</span><p className="font-medium">{showPreview.houseNumber}</p></div>
                <div><span className="text-muted-foreground">Cluster:</span><p className="font-medium">{showPreview.cluster}</p></div>
                <div><span className="text-muted-foreground">Mode of Payment:</span><p className="font-medium capitalize">{showPreview.method}</p></div>
                <div><span className="text-muted-foreground">Period:</span><p className="font-medium">{showPreview.period}</p></div>
              </div>
              <div className="border-2 border-primary inline-block px-6 py-3 rounded font-bold text-xl">
                GH₵ {showPreview.amount.toFixed(2)}
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => handlePrint(showPreview)}>
                  <Printer className="h-4 w-4" /> Print
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Receipt Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate Receipt</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Received From</Label><Input value={form.receivedFrom} onChange={(e) => setForm({ ...form, receivedFrom: e.target.value })} placeholder="Full name" /></div>
              <div><Label>House Number</Label><Input value={form.houseNumber} onChange={(e) => setForm({ ...form, houseNumber: e.target.value })} placeholder="e.g. AC12" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Cluster</Label><Input value={form.cluster} onChange={(e) => setForm({ ...form, cluster: e.target.value })} placeholder="e.g. Bellavilla" /></div>
              <div><Label>Contact Number</Label><Input value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} placeholder="024xxxxxxx" /></div>
            </div>
            <div><Label>Description (Being)</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Estate Management Fee (EMF) for..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Payment Period</Label><Input value={form.paymentPeriod} onChange={(e) => setForm({ ...form, paymentPeriod: e.target.value })} placeholder="e.g. January 2026" /></div>
              <div><Label>Balance Due (GH₵)</Label><Input type="number" value={form.balanceDue} onChange={(e) => setForm({ ...form, balanceDue: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <div><Label>Payment ID (from system)</Label><Input value={form.paymentId} onChange={(e) => setForm({ ...form, paymentId: e.target.value })} placeholder="Payment UUID" /></div>
            <Button onClick={handleCreate} disabled={!form.receivedFrom || !form.houseNumber} className="gap-2">
              <Receipt className="h-4 w-4" /> Generate Receipt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
