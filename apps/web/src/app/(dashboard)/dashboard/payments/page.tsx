'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Download, ArrowUpRight, ArrowDownRight, Plus, Loader2, CreditCard, Smartphone, Building2, Banknote, CheckCircle2, ArrowRight, ArrowLeft, Phone, Wallet, Shield, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { usePayments, useRecordPayment } from '@/lib/hooks';
import { useAuthStore } from '@/store/auth-store';

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
  { id: 'PAY-001', tenant: 'Kwame Asante', unit: 'A-101', type: 'Rent', amount: 3500, method: 'Mobile Money', date: '2026-06-18', status: 'completed' },
  { id: 'PAY-002', tenant: 'Ama Mensah', unit: 'A-203', type: 'EMF', amount: 850, method: 'Bank Transfer', date: '2026-06-17', status: 'completed' },
  { id: 'PAY-003', tenant: 'Kofi Boateng', unit: 'B-102', type: 'Rent', amount: 4200, method: 'Mobile Money', date: '2026-06-16', status: 'completed' },
  { id: 'PAY-004', tenant: 'Abena Owusu', unit: 'A-301', type: 'Rent', amount: 5800, method: 'Bank Transfer', date: '2026-06-15', status: 'pending' },
  { id: 'PAY-005', tenant: 'Yaw Darko', unit: 'B-201', type: 'EMF', amount: 850, method: 'Card', date: '2026-06-14', status: 'completed' },
  { id: 'PAY-006', tenant: 'Akosua Frimpong', unit: 'A-402', type: 'Rent', amount: 3500, method: 'Mobile Money', date: '2026-06-13', status: 'failed' },
  { id: 'PAY-007', tenant: 'Nana Agyemang', unit: 'B-301', type: 'Utility', amount: 320, method: 'Mobile Money', date: '2026-06-12', status: 'completed' },
];

// Demo context for tenant auto-fill
const DEMO_TENANT_CTX = { name: 'Kwame Asante', unit: 'A-101', estate: 'East Legon Hills Estate', rentAmount: 3500, emfAmount: 850 };
// Demo context for landlord auto-fill (multiple units)
const DEMO_LANDLORD_UNITS = [
  { id: 'U1', unitNumber: '00AC12', building: 'Block A - Bellavilla', tenant: 'Kwame Asante', rentAmount: 3500 },
  { id: 'U3', unitNumber: '00CE08', building: 'Block C - Rosavilla', tenant: 'Efua Mensah', rentAmount: 2800 },
];
// Demo tenants for admin/manager selection
const DEMO_TENANTS_LIST = [
  { id: 'T1', name: 'Kwame Asante', unit: 'A-101', estate: 'East Legon Hills', rentAmount: 3500, emfAmount: 850 },
  { id: 'T2', name: 'Ama Mensah', unit: 'A-203', estate: 'East Legon Hills', rentAmount: 4200, emfAmount: 850 },
  { id: 'T3', name: 'Kofi Boateng', unit: 'B-102', estate: 'Cantonments Res.', rentAmount: 4200, emfAmount: 850 },
  { id: 'T4', name: 'Yaw Darko', unit: 'B-201', estate: 'Kumasi Royal Gardens', rentAmount: 2500, emfAmount: 600 },
  { id: 'T5', name: 'Abena Owusu', unit: 'A-301', estate: 'Airport Res. Towers', rentAmount: 5800, emfAmount: 1200 },
];

type PayStep = 'what' | 'how' | 'confirm' | 'processing' | 'success';

const TYPE_AMOUNTS: Record<string, number> = { Rent: 3500, EMF: 850, Utility: 320, Deposit: 3500 };

function detectMomoNetwork(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const prefix = cleaned.startsWith('233') ? cleaned.slice(3, 5) : cleaned.startsWith('0') ? cleaned.slice(1, 3) : cleaned.slice(0, 2);
  if (['24', '54', '55', '59'].includes(prefix)) return 'mtn';
  if (['20', '50'].includes(prefix)) return 'vodafone';
  if (['26', '56', '27', '57'].includes(prefix)) return 'airteltigo';
  return '';
}

export default function PaymentsPage() {
  const [localPayments, setLocalPayments] = useState<Payment[]>(initialPayments);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState<Payment | null>(null);

  // Auth context
  const user = useAuthStore((s) => s.user);
  const isDemoMode = useAuthStore((s) => s.isDemoMode);
  const role = user?.role || 'tenant';
  const isTenant = role === 'tenant';
  const isLandlord = role === 'landlord';
  const isAdmin = role === 'super_admin' || role === 'estate_manager';

  // Multi-step form state
  const [step, setStep] = useState<PayStep>('what');
  const [form, setForm] = useState({
    tenantName: '', unit: '', unitId: '', type: 'Rent', amount: 0, description: '',
    method: '', momoNetwork: '', momoPhone: '', bankReference: '', cashReference: '',
    selectedTenantId: '',
  });

  // Auto-fill on dialog open based on role
  useEffect(() => {
    if (!showAdd) return;
    setStep('what');

    if (isTenant) {
      // Tenant: auto-fill name + unit, suggest rent amount
      setForm((f) => ({
        ...f,
        tenantName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || DEMO_TENANT_CTX.name,
        unit: DEMO_TENANT_CTX.unit,
        amount: DEMO_TENANT_CTX.rentAmount,
        momoPhone: '',
        method: '',
        bankReference: '',
        cashReference: '',
        selectedTenantId: '',
      }));
    } else if (isLandlord) {
      // Landlord: auto-fill name, let them pick unit if multiple
      setForm((f) => ({
        ...f,
        tenantName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        unit: DEMO_LANDLORD_UNITS.length === 1 ? DEMO_LANDLORD_UNITS[0].unitNumber : '',
        unitId: DEMO_LANDLORD_UNITS.length === 1 ? DEMO_LANDLORD_UNITS[0].id : '',
        amount: DEMO_LANDLORD_UNITS.length === 1 ? DEMO_LANDLORD_UNITS[0].rentAmount : 0,
        momoPhone: '',
        method: '',
        bankReference: '',
        cashReference: '',
        selectedTenantId: '',
      }));
    } else {
      // Admin/Manager: blank — they pick tenant
      setForm({
        tenantName: '', unit: '', unitId: '', type: 'Rent', amount: 0, description: '',
        method: '', momoNetwork: '', momoPhone: '', bankReference: '', cashReference: '',
        selectedTenantId: '',
      });
    }
  }, [showAdd, isTenant, isLandlord, user]);

  // Auto-detect MoMo network from phone number
  useEffect(() => {
    if (form.momoPhone.length >= 3) {
      const network = detectMomoNetwork(form.momoPhone);
      if (network) setForm((f) => ({ ...f, momoNetwork: network }));
    }
  }, [form.momoPhone]);

  // Auto-fill amount when type changes
  const handleTypeChange = (type: string) => {
    let amount = TYPE_AMOUNTS[type] || 0;
    if (isTenant) {
      amount = type === 'EMF' ? DEMO_TENANT_CTX.emfAmount : type === 'Rent' ? DEMO_TENANT_CTX.rentAmount : 0;
    } else if (form.selectedTenantId && isAdmin) {
      const t = DEMO_TENANTS_LIST.find((t) => t.id === form.selectedTenantId);
      if (t) amount = type === 'EMF' ? t.emfAmount : type === 'Rent' ? t.rentAmount : 0;
    }
    setForm((f) => ({ ...f, type, amount }));
  };

  // Admin: select tenant → auto-fill unit + amount
  const handleTenantSelect = (tenantId: string) => {
    const t = DEMO_TENANTS_LIST.find((t) => t.id === tenantId);
    if (t) {
      setForm((f) => ({
        ...f,
        selectedTenantId: tenantId,
        tenantName: t.name,
        unit: t.unit,
        amount: f.type === 'EMF' ? t.emfAmount : t.rentAmount,
      }));
    }
  };

  // Landlord: select unit → auto-fill tenant + amount
  const handleLandlordUnitSelect = (unitId: string) => {
    const u = DEMO_LANDLORD_UNITS.find((u) => u.id === unitId);
    if (u) {
      setForm((f) => ({ ...f, unitId, unit: u.unitNumber, tenantName: u.tenant || '', amount: u.rentAmount }));
    }
  };

  const { data: apiData } = usePayments();
  const recordPayment = useRecordPayment();

  const allPayments: Payment[] = apiData?.data
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

  // Role-based payment filtering
  const payments = useMemo(() => {
    if (isTenant) {
      const tenantName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || DEMO_TENANT_CTX.name;
      return allPayments.filter((p) => p.tenant.toLowerCase().includes(tenantName.toLowerCase()));
    }
    if (isLandlord) {
      const landlordUnits = DEMO_LANDLORD_UNITS.map((u) => u.unitNumber);
      return allPayments.filter((p) => landlordUnits.includes(p.unit));
    }
    return allPayments;
  }, [allPayments, isTenant, isLandlord, user]);

  const filtered = payments.filter((p) =>
    p.tenant.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
  );

  // Dynamic stats based on filtered payments
  const totalPaid = filtered.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const pendingAmount = filtered.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const pendingCount = filtered.filter((p) => p.status === 'pending').length;
  const failedAmount = filtered.filter((p) => p.status === 'failed').reduce((s, p) => s + p.amount, 0);
  const failedCount = filtered.filter((p) => p.status === 'failed').length;
  const successRate = filtered.length > 0 ? ((filtered.filter((p) => p.status === 'completed').length / filtered.length) * 100).toFixed(1) : '0';

  const methodLabel = (m: string) => {
    if (m === 'mobile_money') return 'Mobile Money';
    if (m === 'bank_transfer') return 'Bank Transfer';
    if (m === 'card') return 'Debit/Credit Card';
    if (m === 'cash') return 'Cash';
    return m;
  };

  const networkLabel = (n: string) => n === 'mtn' ? 'MTN MoMo' : n === 'vodafone' ? 'Vodafone Cash' : n === 'airteltigo' ? 'AirtelTigo Money' : n;

  const handleConfirmPayment = () => {
    setStep('processing');
    // Simulate payment processing
    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      const payId = `PAY-${String(payments.length + 1).padStart(3, '0')}`;
      const newPayment: Payment = {
        id: payId,
        tenant: form.tenantName,
        unit: form.unit,
        type: form.type,
        amount: form.amount,
        method: methodLabel(form.method),
        date: today,
        status: 'completed',
      };
      recordPayment.mutate(
        { invoiceId: '', amount: form.amount, method: form.method },
        { onError: () => setLocalPayments([newPayment, ...localPayments]) },
      );
      setLocalPayments([newPayment, ...localPayments]);

      // Generate receipt number: DDMMYY-SEQ-UNIT
      const d = new Date();
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yy = String(d.getFullYear()).slice(-2);
      const unitClean = form.unit.replace(/[^a-zA-Z0-9]/g, '');
      const receiptNo = `${dd}${mm}${yy}-${payments.length + 1}-00${unitClean}`;
      setLastReceiptNumber(receiptNo);

      setStep('success');
    }, 2500);
  };

  const canProceedStep1 = form.tenantName && form.unit && form.amount > 0;
  const canProceedStep2 = form.method && (
    form.method !== 'mobile_money' || (form.momoPhone.replace(/\D/g, '').length >= 10 && form.momoNetwork)
  ) && (
    form.method !== 'bank_transfer' || form.bankReference.length > 0
  );

  const [lastReceiptNumber, setLastReceiptNumber] = useState('');

  const closeDialog = () => {
    setShowAdd(false);
    setStep('what');
    setLastReceiptNumber('');
  };

  // ─── Step indicators
  const steps: { key: PayStep; label: string }[] = [
    { key: 'what', label: 'Details' },
    { key: 'how', label: 'Method' },
    { key: 'confirm', label: 'Confirm' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">{isTenant ? 'My Payments' : isLandlord ? 'Property Payments' : 'Payments'}</h1>
          <p className="text-muted-foreground mt-1">{isTenant ? 'View and track your payment history' : isLandlord ? 'Payments for your properties' : 'Track and manage all payment transactions'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" size="sm"><Download className="h-4 w-4" /> <span className="hidden sm:inline">Export</span></Button>
          <Button className="gap-2" size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" /> {isTenant ? 'Make Payment' : isLandlord ? 'Pay for Unit' : 'Record Payment'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">{isTenant ? 'Total Paid' : 'Total Revenue (MTD)'}</p><p className="text-2xl font-bold mt-1">GH₵ {totalPaid.toLocaleString()}</p><div className="flex items-center gap-1 mt-1 text-green-600 text-xs">{filtered.filter((p) => p.status === 'completed').length} completed</div></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold mt-1">GH₵ {pendingAmount.toLocaleString()}</p><div className="flex items-center gap-1 mt-1 text-orange-600 text-xs">{pendingCount} transaction{pendingCount !== 1 ? 's' : ''}</div></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Failed</p><p className="text-2xl font-bold mt-1">GH₵ {failedAmount.toLocaleString()}</p><div className="flex items-center gap-1 mt-1 text-red-600 text-xs">{failedCount} transaction{failedCount !== 1 ? 's' : ''}</div></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Success Rate</p><p className="text-2xl font-bold mt-1">{successRate}%</p><div className="flex items-center gap-1 mt-1 text-green-600 text-xs">{filtered.length} total</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9 w-48 sm:w-60" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                {!isTenant && <TableHead>Tenant</TableHead>}
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
                  {!isTenant && <TableCell className="font-medium">{p.tenant}</TableCell>}
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

      {/* ─── SMART PAYMENT DIALOG (multi-step, role-aware) ─── */}
      <Dialog open={showAdd} onOpenChange={closeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {step === 'success' ? 'Payment Successful' : step === 'processing' ? 'Processing Payment...' : isTenant ? 'Make a Payment' : isLandlord ? 'Pay for Unit' : 'Record Payment'}
            </DialogTitle>
            {step !== 'success' && step !== 'processing' && (
              <DialogDescription>
                {isTenant ? 'Your details are auto-filled from your account.' : isLandlord ? 'Select the unit you are paying for.' : 'Select a tenant to record a payment.'}
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Step indicator */}
          {!['processing', 'success'].includes(step) && (
            <div className="flex items-center gap-2 py-2">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === s.key ? 'bg-gold text-navy-900' : steps.findIndex(x => x.key === step) > i ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>{steps.findIndex(x => x.key === step) > i ? '✓' : i + 1}</div>
                  <span className={`text-xs font-medium ${step === s.key ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
                  {i < steps.length - 1 && <div className="w-8 h-px bg-border" />}
                </div>
              ))}
            </div>
          )}

          {/* ─── STEP 1: WHAT ARE YOU PAYING FOR? ─── */}
          {step === 'what' && (
            <div className="space-y-4 py-2">
              {/* Tenant role: auto-filled, read-only */}
              {isTenant && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Your Account</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-muted-foreground">Name</p><p className="font-semibold">{form.tenantName}</p></div>
                    <div><p className="text-muted-foreground">Unit</p><p className="font-semibold">{form.unit}</p></div>
                  </div>
                </div>
              )}

              {/* Landlord role: auto-filled name, pick unit */}
              {isLandlord && (
                <>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Paying as</p>
                    <p className="font-semibold text-sm">{form.tenantName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Select Unit</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {DEMO_LANDLORD_UNITS.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => handleLandlordUnitSelect(u.id)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                            form.unitId === u.id ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">House {u.unitNumber}</p>
                              <p className="text-xs text-muted-foreground">{u.building}</p>
                            </div>
                            <div className="text-right">
                              {u.tenant && <p className="text-xs text-muted-foreground">Tenant: {u.tenant}</p>}
                              <p className="text-sm font-semibold">GH₵ {u.rentAmount.toLocaleString()}/mo</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Admin/Manager role: select tenant from dropdown */}
              {isAdmin && (
                <div className="space-y-2">
                  <Label>Select Tenant</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.selectedTenantId}
                    onChange={(e) => handleTenantSelect(e.target.value)}
                  >
                    <option value="">Choose a tenant...</option>
                    {DEMO_TENANTS_LIST.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} — Unit {t.unit} ({t.estate})</option>
                    ))}
                  </select>
                  {form.selectedTenantId && (
                    <div className="bg-muted/50 rounded-lg p-3 mt-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><p className="text-muted-foreground">Tenant</p><p className="font-semibold">{form.tenantName}</p></div>
                        <div><p className="text-muted-foreground">Unit</p><p className="font-semibold">{form.unit}</p></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                  >
                    <option value="Rent">Rent</option>
                    <option value="EMF">EMF (Estate Maintenance Fee)</option>
                    <option value="Utility">Utility Bill</option>
                    <option value="Deposit">Security Deposit</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Amount (GH₵)</Label>
                  <Input
                    type="number" min={0} value={form.amount || ''}
                    onChange={(e) => setForm({ ...form, amount: +e.target.value })}
                    placeholder="0.00"
                  />
                  {form.amount > 0 && <p className="text-xs text-muted-foreground">GH₵ {form.amount.toLocaleString()}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={`e.g. ${form.type} payment for ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}`}
                />
              </div>
            </div>
          )}

          {/* ─── STEP 2: HOW DO YOU WANT TO PAY? ─── */}
          {step === 'how' && (
            <div className="space-y-4 py-2">
              <p className="text-sm font-medium">Choose your payment method</p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'mobile_money', label: 'Mobile Money', desc: 'MTN, Vodafone, AirtelTigo', icon: Smartphone, color: 'text-yellow-600 bg-yellow-50' },
                  { id: 'card', label: 'Debit/Credit Card', desc: 'Visa, Mastercard', icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
                  { id: 'bank_transfer', label: 'Bank Transfer', desc: 'Direct bank deposit', icon: Building2, color: 'text-green-600 bg-green-50' },
                  ...( isAdmin ? [{ id: 'cash', label: 'Cash', desc: 'Record cash payment', icon: Banknote, color: 'text-purple-600 bg-purple-50' }] : []),
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setForm({ ...form, method: m.id })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.method === m.id ? 'border-gold bg-gold/5 shadow-sm' : 'border-border hover:border-gold/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${m.color}`}>
                      <m.icon className="h-5 w-5" />
                    </div>
                    <p className="font-semibold text-sm">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Mobile Money fields */}
              {form.method === 'mobile_money' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> Mobile Money Number</Label>
                    <Input
                      placeholder="e.g. 024 123 4567"
                      value={form.momoPhone}
                      onChange={(e) => setForm({ ...form, momoPhone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Network</Label>
                    <div className="flex gap-2">
                      {[
                        { id: 'mtn', label: 'MTN MoMo', color: 'bg-yellow-400 text-black' },
                        { id: 'vodafone', label: 'Vodafone Cash', color: 'bg-red-500 text-white' },
                        { id: 'airteltigo', label: 'AirtelTigo', color: 'bg-blue-600 text-white' },
                      ].map((n) => (
                        <button
                          key={n.id}
                          onClick={() => setForm({ ...form, momoNetwork: n.id })}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                            form.momoNetwork === n.id ? n.color + ' ring-2 ring-offset-2 ring-gold' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {n.label}
                        </button>
                      ))}
                    </div>
                    {form.momoNetwork && <p className="text-xs text-green-600">✓ {networkLabel(form.momoNetwork)} detected</p>}
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    <p className="font-semibold">How it works:</p>
                    <p>A payment prompt will be sent to your phone. Approve the transaction with your MoMo PIN to complete the payment.</p>
                  </div>
                </div>
              )}

              {/* Card fields */}
              {form.method === 'card' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <CreditCard className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <p className="font-semibold text-sm">Secure Card Payment</p>
                    <p className="text-xs text-muted-foreground mt-1">You will be redirected to a secure checkout page powered by Paystack to complete your card payment.</p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <Shield className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-xs text-green-700 font-medium">PCI-DSS Compliant · 256-bit SSL Encryption</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Transfer fields */}
              {form.method === 'bank_transfer' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm space-y-2">
                    <p className="font-semibold text-green-800">Transfer to this account:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><p className="text-muted-foreground">Bank</p><p className="font-bold">GCB Bank</p></div>
                      <div><p className="text-muted-foreground">Account No.</p><p className="font-bold font-mono">1234567890123</p></div>
                      <div><p className="text-muted-foreground">Account Name</p><p className="font-bold">EstateIQ Management Ltd</p></div>
                      <div><p className="text-muted-foreground">Branch</p><p className="font-bold">Accra Main</p></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Transaction Reference / Receipt Number</Label>
                    <Input
                      placeholder="Enter your bank transaction reference"
                      value={form.bankReference}
                      onChange={(e) => setForm({ ...form, bankReference: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">This is the reference number from your bank transfer receipt.</p>
                  </div>
                </div>
              )}

              {/* Cash fields (admin only) */}
              {form.method === 'cash' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="space-y-2">
                    <Label>Cash Receipt Number</Label>
                    <Input
                      placeholder="e.g. CASH-2025-001"
                      value={form.cashReference}
                      onChange={(e) => setForm({ ...form, cashReference: e.target.value })}
                    />
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-800">
                    <p>This will record a cash payment in the system. A receipt will be generated automatically.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 3: CONFIRM ─── */}
          {step === 'confirm' && (
            <div className="space-y-4 py-2">
              <div className="bg-muted/50 rounded-xl p-5 space-y-4">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Payment Summary</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-muted-foreground">Payer</p><p className="font-semibold">{form.tenantName}</p></div>
                  <div><p className="text-muted-foreground">Unit</p><p className="font-semibold">{form.unit}</p></div>
                  <div><p className="text-muted-foreground">Type</p><p className="font-semibold">{form.type}</p></div>
                  <div><p className="text-muted-foreground">Method</p><p className="font-semibold">{methodLabel(form.method)}</p></div>
                  {form.method === 'mobile_money' && (
                    <>
                      <div><p className="text-muted-foreground">MoMo Number</p><p className="font-semibold">{form.momoPhone}</p></div>
                      <div><p className="text-muted-foreground">Network</p><p className="font-semibold">{networkLabel(form.momoNetwork)}</p></div>
                    </>
                  )}
                  {form.method === 'bank_transfer' && (
                    <div className="col-span-2"><p className="text-muted-foreground">Bank Reference</p><p className="font-semibold font-mono">{form.bankReference}</p></div>
                  )}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground font-medium">Total Amount</p>
                  <p className="text-2xl font-bold text-gold">GH₵ {form.amount.toLocaleString()}</p>
                </div>
              </div>

              {form.method === 'mobile_money' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                  <p className="font-semibold">A payment prompt will be sent to {form.momoPhone}.</p>
                  <p>Please approve the transaction on your phone to complete the payment.</p>
                </div>
              )}
              {form.method === 'card' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                  <p>You will be redirected to a secure Paystack checkout to enter your card details.</p>
                </div>
              )}
            </div>
          )}

          {/* ─── PROCESSING ─── */}
          {step === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-gold" />
              <div>
                <p className="font-semibold">Processing your payment...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {form.method === 'mobile_money' ? 'Waiting for MoMo approval on your phone...' :
                   form.method === 'card' ? 'Connecting to secure checkout...' :
                   'Recording payment...'}
                </p>
              </div>
            </div>
          )}

          {/* ─── SUCCESS ─── */}
          {step === 'success' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-lg">Payment Successful!</p>
                <p className="text-sm text-muted-foreground mt-1">GH₵ {form.amount.toLocaleString()} has been recorded.</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-left max-w-xs mx-auto space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Payer</span><span className="font-medium">{form.tenantName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Unit</span><span className="font-medium">{form.unit}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium">{form.type}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="font-medium">{methodLabel(form.method)}</span></div>
                <Separator className="my-1" />
                <div className="flex justify-between font-bold"><span>Amount</span><span className="text-green-600">GH₵ {form.amount.toLocaleString()}</span></div>
              </div>
              {lastReceiptNumber && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-xs mx-auto">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <Receipt className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-semibold text-green-800">Receipt Generated</p>
                  </div>
                  <p className="text-xs font-mono font-bold text-green-700">{lastReceiptNumber}</p>
                  <a href="/dashboard/receipts" className="inline-block mt-2 text-xs text-green-700 underline hover:text-green-900">View in Receipts →</a>
                </div>
              )}
            </div>
          )}

          {/* ─── FOOTER NAVIGATION ─── */}
          {step !== 'processing' && (
            <DialogFooter className="flex-col sm:flex-row gap-2">
              {step === 'success' ? (
                <div className="flex gap-2 w-full">
                  <Button variant="outline" onClick={closeDialog} className="flex-1">Done</Button>
                  <a href="/dashboard/receipts" className="flex-1"><Button className="w-full gap-2"><Receipt className="h-4 w-4" /> View Receipt</Button></a>
                </div>
              ) : (
                <>
                  {step !== 'what' && (
                    <Button variant="outline" onClick={() => setStep(step === 'confirm' ? 'how' : 'what')} className="gap-2">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                  )}
                  {step === 'what' && (
                    <>
                      <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                      <Button onClick={() => setStep('how')} disabled={!canProceedStep1} className="gap-2">
                        Next: Choose Method <ArrowRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {step === 'how' && (
                    <Button onClick={() => setStep('confirm')} disabled={!canProceedStep2} className="gap-2">
                      Next: Review <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                  {step === 'confirm' && (
                    <Button onClick={handleConfirmPayment} className="gap-2 bg-green-600 hover:bg-green-700">
                      <Wallet className="h-4 w-4" /> {form.method === 'card' ? 'Proceed to Checkout' : `Pay GH₵ ${form.amount.toLocaleString()}`}
                    </Button>
                  )}
                </>
              )}
            </DialogFooter>
          )}
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
