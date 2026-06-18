'use client';

import { useState, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Receipt, Search, Plus, Printer, Eye, Download } from 'lucide-react';
import { useReceipts, useCreateReceipt } from '@/lib/hooks';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

interface ReceiptItem {
  id: string;
  number: string;
  receivedFrom: string;
  houseNumber: string;
  cluster: string;
  amount: number;
  method: string;
  description: string;
  date: string;
  period: string;
}

// Receipts correspond 1:1 with completed payments — only completed payments generate receipts
const allMockReceipts: ReceiptItem[] = [
  { id: '1', number: '180626-1-00A101', receivedFrom: 'Kwame Asante', houseNumber: 'A-101', cluster: 'East Legon Hills', amount: 3500, method: 'Mobile Money', description: 'Rent', date: '2026-06-18', period: 'June 2026' },
  { id: '2', number: '170626-2-00A203', receivedFrom: 'Ama Mensah', houseNumber: 'A-203', cluster: 'East Legon Hills', amount: 850, method: 'Bank Transfer', description: 'Estate Management Fee (EMF)', date: '2026-06-17', period: 'June 2026' },
  { id: '3', number: '160626-3-00B102', receivedFrom: 'Kofi Boateng', houseNumber: 'B-102', cluster: 'Cantonments Res.', amount: 4200, method: 'Mobile Money', description: 'Rent', date: '2026-06-16', period: 'June 2026' },
  { id: '4', number: '140626-5-00B201', receivedFrom: 'Yaw Darko', houseNumber: 'B-201', cluster: 'Kumasi Royal Gardens', amount: 850, method: 'Card', description: 'Estate Management Fee (EMF)', date: '2026-06-14', period: 'June 2026' },
  { id: '5', number: '120626-7-00B301', receivedFrom: 'Nana Agyemang', houseNumber: 'B-301', cluster: 'East Legon Hills', amount: 320, method: 'Mobile Money', description: 'Utility', date: '2026-06-12', period: 'June 2026' },
];
// Note: PAY-004 (Abena Owusu, pending) and PAY-006 (Akosua Frimpong, failed) have no receipts

const DEMO_TENANT_NAME = 'Kwame Asante';
const DEMO_LANDLORD_UNITS = ['A-101', 'B-102'];

export default function ReceiptsPage() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showPreview, setShowPreview] = useState<ReceiptItem | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
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

  const user = useAuthStore((s) => s.user);
  const role = user?.role || 'tenant';
  const isTenant = role === 'tenant';
  const isLandlord = role === 'landlord';
  const isAdmin = role === 'super_admin' || role === 'estate_manager';
  const canGenerate = isAdmin || isLandlord;

  const { data: apiData } = useReceipts(1, search || undefined);
  const createReceipt = useCreateReceipt();

  const apiReceipts: ReceiptItem[] = apiData?.data?.data
    ? apiData.data.data.map((r: any) => ({
        id: r.id,
        number: r.number,
        receivedFrom: r.receivedFrom || '—',
        houseNumber: r.houseNumber || '—',
        cluster: r.cluster || '—',
        amount: Number(r.payment?.amount || 0),
        method: r.payment?.method?.replace('_', ' ') || '—',
        description: r.description || r.payment?.type?.replace('_', ' ') || '—',
        date: new Date(r.createdAt).toISOString().split('T')[0],
        period: r.paymentPeriod || '—',
      }))
    : [];

  // Role-based receipt filtering
  const receipts = useMemo(() => {
    const source = apiReceipts.length > 0 ? apiReceipts : allMockReceipts;

    if (isTenant) {
      const tenantName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || DEMO_TENANT_NAME;
      return source.filter((r) => r.receivedFrom.toLowerCase().includes(tenantName.toLowerCase()));
    }
    if (isLandlord) {
      return source.filter((r) => DEMO_LANDLORD_UNITS.includes(r.houseNumber));
    }
    return source;
  }, [apiReceipts, isTenant, isLandlord, user]);

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
    const printWindow = window.open('', '_blank', 'width=600,height=700');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>Receipt ${receipt.number}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 500px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 16px; margin-bottom: 20px; }
        .header h2 { margin: 0; font-size: 20px; }
        .header p { margin: 2px 0; font-size: 11px; color: #666; }
        .title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .title-row h3 { margin: 0; font-size: 16px; }
        .title-row span { font-family: monospace; font-size: 13px; font-weight: bold; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; }
        .grid .label { color: #888; font-size: 11px; }
        .grid .value { font-weight: 600; }
        .amount { border: 2px solid #222; display: inline-block; padding: 12px 24px; border-radius: 6px; font-size: 22px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 12px; display: flex; justify-content: space-between; font-size: 11px; color: #999; }
        @media print { body { padding: 20px; } }
      </style>
      </head><body>
        <div class="header">
          <h2>DEVCRAS</h2>
          <p>Devtraco Courts Residents Association</p>
          <p>No. 2, El Minya Crescent, Horizon, Devtraco Courts</p>
        </div>
        <div class="title-row">
          <h3>OFFICIAL RECEIPT</h3>
          <span>No.: ${receipt.number}</span>
        </div>
        <div class="grid">
          <div><div class="label">Received from</div><div class="value">${receipt.receivedFrom}</div></div>
          <div><div class="label">Date</div><div class="value">${new Date(receipt.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
          <div><div class="label">House No</div><div class="value">${receipt.houseNumber}</div></div>
          <div><div class="label">Cluster</div><div class="value">${receipt.cluster}</div></div>
          <div><div class="label">Being payment of</div><div class="value" style="color:#222;font-weight:700">${receipt.description}</div></div>
          <div><div class="label">Mode of Payment</div><div class="value">${receipt.method}</div></div>
          <div><div class="label">Period</div><div class="value">${receipt.period}</div></div>
        </div>
        <div class="amount">GH&#8373; ${receipt.amount.toFixed(2)}</div>
        <div class="footer">
          <span>Generated by EstateIQ</span>
          <span>Printed: ${new Date().toLocaleDateString('en-GB')}</span>
        </div>
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 300);
  };

  const pageTitle = isTenant ? 'My Receipts' : isLandlord ? 'Property Receipts' : 'Receipts';
  const pageDesc = isTenant
    ? 'View and print receipts for your payments'
    : isLandlord
      ? 'Receipts for payments on your properties'
      : 'Generate and manage payment receipts';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">{pageTitle}</h1>
          <p className="text-muted-foreground mt-1">{pageDesc}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" size="sm"><Download className="h-4 w-4" /> <span className="hidden sm:inline">Export</span></Button>
          {canGenerate && (
            <Button className="gap-2" size="sm" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> <span className="hidden sm:inline">Generate</span> Receipt</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">{isTenant ? 'Your Receipts' : 'Receipts Issued'}</p>
            <p className="text-2xl font-bold mt-1">{totalIssued}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">{isTenant ? 'Total Paid' : 'Total Amount Receipted'}</p>
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
                  {!isTenant && <th className="text-left p-3 font-medium">Received From</th>}
                  <th className="text-left p-3 font-medium">House No.</th>
                  <th className="text-left p-3 font-medium">Cluster</th>
                  <th className="text-left p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Being</th>
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
                    {!isTenant && <td className="p-3 font-medium">{r.receivedFrom}</td>}
                    <td className="p-3"><Badge variant="outline">{r.houseNumber}</Badge></td>
                    <td className="p-3">{r.cluster}</td>
                    <td className="p-3 font-semibold">GH₵ {r.amount.toLocaleString()}</td>
                    <td className="p-3"><Badge variant="secondary" className="text-xs">{r.description}</Badge></td>
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
                  <tr><td colSpan={isTenant ? 9 : 10} className="p-8 text-center text-muted-foreground">No receipts found</td></tr>
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
            <div className="space-y-4 border rounded-lg p-6" ref={printRef}>
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
                <div><span className="text-muted-foreground">Being payment of:</span><p className="font-semibold">{showPreview.description}</p></div>
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

      {/* Create Receipt Dialog — Admin/Landlord only */}
      {canGenerate && (
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Generate Receipt</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>Received From</Label><Input value={form.receivedFrom} onChange={(e) => setForm({ ...form, receivedFrom: e.target.value })} placeholder="Full name" /></div>
                <div><Label>House Number</Label><Input value={form.houseNumber} onChange={(e) => setForm({ ...form, houseNumber: e.target.value })} placeholder="e.g. AC12" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>Cluster</Label><Input value={form.cluster} onChange={(e) => setForm({ ...form, cluster: e.target.value })} placeholder="e.g. Bellavilla" /></div>
                <div><Label>Contact Number</Label><Input value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} placeholder="024xxxxxxx" /></div>
              </div>
              <div><Label>Description (Being)</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Estate Management Fee (EMF) for..." /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      )}
    </div>
  );
}
