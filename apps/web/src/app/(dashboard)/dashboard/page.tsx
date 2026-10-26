'use client';

import { Building2, Users, Wallet, Wrench, MessageSquareWarning, Home, CreditCard, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth-store';
import { useDashboardStats, useEstates, usePayments, useMaintenanceRequests, useComplaints, useMyLandlordProfile } from '@/lib/hooks';

const fmtMoney = (n: number) => `GH₵ ${Number(n || 0).toLocaleString()}`;

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}><Icon className="h-6 w-6" /></div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── ADMIN / MANAGER DASHBOARD ────────────────────────────────────
function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: apiStats } = useDashboardStats();
  const { data: estatesData } = useEstates();
  const { data: paymentsData } = usePayments(user?.estateId || undefined);
  const { data: maintenanceData } = useMaintenanceRequests(user?.estateId || undefined);
  const { data: complaintsData } = useComplaints(user?.estateId || undefined);
  const s = apiStats?.data;

  const estates = estatesData?.data?.length ?? estatesData?.meta?.total ?? 0;

  const stats = [
    { label: 'Total Estates', value: estates.toString(), icon: Building2, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Units', value: (s?.totalUnits ?? 0).toLocaleString(), icon: Building2, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Occupancy Rate', value: `${s?.occupancyRate ?? 0}%`, icon: Users, color: 'text-green-600 bg-green-50' },
    { label: 'Tenants', value: (s?.totalTenants ?? 0).toString(), icon: Users, color: 'text-cyan-600 bg-cyan-50' },
    { label: 'Landlords', value: (s?.totalLandlords ?? 0).toString(), icon: Home, color: 'text-violet-600 bg-violet-50' },
    { label: 'Revenue', value: fmtMoney(s?.totalRevenue), icon: Wallet, color: 'text-gold bg-gold-50' },
    { label: 'Open Requests', value: (s?.pendingMaintenance ?? 0).toString(), icon: Wrench, color: 'text-orange-600 bg-orange-50' },
    { label: 'Open Complaints', value: (s?.openComplaints ?? 0).toString(), icon: MessageSquareWarning, color: 'text-purple-600 bg-purple-50' },
  ];

  const recentPayments: any[] = (paymentsData?.data || []).slice(0, 4);
  const activeMaintenance: any[] = (maintenanceData?.data || []).filter((r: any) => r.status !== 'completed').slice(0, 4);
  const recentComplaints: any[] = (complaintsData?.data || []).slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform-wide overview of all estates</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} color={stat.color} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Payments</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPayments.length === 0 && <p className="text-sm text-muted-foreground">No payments recorded yet.</p>}
              {recentPayments.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div><p className="text-sm font-medium">{p.tenant?.user ? `${p.tenant.user.firstName} ${p.tenant.user.lastName}` : 'Unknown'}</p><p className="text-xs text-muted-foreground">Unit {p.invoice?.unit?.unitNumber || '—'} — {p.invoice?.type || 'Payment'}</p></div>
                  <span className="text-sm font-semibold text-green-600">{fmtMoney(p.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Active Maintenance</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeMaintenance.length === 0 && <p className="text-sm text-muted-foreground">No open maintenance requests.</p>}
              {activeMaintenance.map((r: any, i: number) => (
                <div key={r.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <div className={`w-2 h-2 rounded-full ${r.priority === 'urgent' || r.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <p className="text-sm">{r.title}{r.unit?.unitNumber ? ` — Unit ${r.unit.unitNumber}` : ''}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Complaints</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentComplaints.length === 0 && <p className="text-sm text-muted-foreground">No complaints filed.</p>}
              {recentComplaints.map((c: any) => (
                <div key={c.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === 'open' ? 'bg-red-100 text-red-700' : c.status === 'investigating' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{c.status?.replace('_', ' ')}</span>
                  <p className="text-sm flex-1">{c.title}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── LANDLORD DASHBOARD ────────────────────────────────────────────
function LandlordDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: apiStats } = useDashboardStats();
  const { data: myLandlord } = useMyLandlordProfile();
  const { data: maintenanceData } = useMaintenanceRequests(user?.estateId || undefined);
  const s = apiStats?.data;

  const leases: any[] = s?.leases || [];
  const totalProperties = myLandlord?.data?.properties?.length ?? s?.units ?? 0;
  const occupied = leases.length;
  const monthlyIncome = leases.reduce((sum: number, l: any) => sum + Number(l.rentAmount || 0), 0);
  const occupancyRate = totalProperties > 0 ? Math.round((occupied / totalProperties) * 1000) / 10 : 0;

  const myUnitIds = new Set((myLandlord?.data?.properties || []).map((p: any) => p.unit?.id));
  const myMaintenance: any[] = (maintenanceData?.data || []).filter((r: any) => myUnitIds.has(r.unitId)).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Landlord Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your property portfolio at a glance</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Home className="h-5 w-5 text-blue-600" /></div><div><p className="text-sm text-muted-foreground">Properties</p><p className="text-xl font-bold">{totalProperties} Units</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><Users className="h-5 w-5 text-green-600" /></div><div><p className="text-sm text-muted-foreground">Occupancy</p><p className="text-xl font-bold">{occupied}/{totalProperties} ({occupancyRate}%)</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center"><CreditCard className="h-5 w-5 text-gold" /></div><div><p className="text-sm text-muted-foreground">Income (Monthly)</p><p className="text-xl font-bold">{fmtMoney(monthlyIncome)}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center"><Wrench className="h-5 w-5 text-orange-600" /></div><div><p className="text-sm text-muted-foreground">Open Maintenance</p><p className="text-xl font-bold">{myMaintenance.length}</p></div></div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">My Tenants</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leases.length === 0 && <p className="text-sm text-muted-foreground">No active tenancies.</p>}
              {leases.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div><p className="text-sm font-medium">{l.tenant?.user ? `${l.tenant.user.firstName} ${l.tenant.user.lastName}` : 'Unknown'}</p><p className="text-xs text-muted-foreground">Unit {l.unit?.unitNumber || '—'}</p></div>
                  <Badge variant="success">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Maintenance on My Units</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myMaintenance.length === 0 && <p className="text-sm text-muted-foreground">No maintenance requests on your units.</p>}
              {myMaintenance.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div><p className="text-sm font-medium">{m.title}</p><p className="text-xs text-muted-foreground">Unit {m.unit?.unitNumber || '—'}</p></div>
                  <Badge variant="outline">{m.status?.replace('_', ' ')}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── TENANT DASHBOARD ──────────────────────────────────────────────
function TenantDashboard() {
  const { data: apiStats } = useDashboardStats();
  const s = apiStats?.data;

  const lease = s?.lease;
  const recentPayments: any[] = s?.recentPayments || [];
  const recentRequests: any[] = s?.recentRequests || [];
  const openRequests = recentRequests.filter((r: any) => r.status !== 'completed').length;
  const unitLabel = lease ? `Unit ${lease.unit?.unitNumber || '—'} — ${lease.unit?.building?.estate?.name || ''}` : 'No active lease';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">My Dashboard</h1>
        <p className="text-muted-foreground mt-1">{unitLabel}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><Home className="h-5 w-5 text-green-600" /></div><div><p className="text-sm text-muted-foreground">Lease Status</p><p className={`text-xl font-bold ${lease ? 'text-green-600' : ''}`}>{lease ? 'Active' : 'None'}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center"><Receipt className="h-5 w-5 text-gold" /></div><div><p className="text-sm text-muted-foreground">Lease Ends</p><p className="text-xl font-bold">{lease?.endDate ? new Date(lease.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Wallet className="h-5 w-5 text-blue-600" /></div><div><p className="text-sm text-muted-foreground">Monthly Rent</p><p className="text-xl font-bold">{lease ? fmtMoney(lease.rentAmount) : '—'}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center"><Wrench className="h-5 w-5 text-orange-600" /></div><div><p className="text-sm text-muted-foreground">Open Requests</p><p className="text-xl font-bold">{openRequests}</p></div></div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Payment History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPayments.length === 0 && <p className="text-sm text-muted-foreground">No payments yet.</p>}
              {recentPayments.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div><p className="text-sm font-medium">{new Date(p.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p><p className="text-xs text-muted-foreground">{p.invoice?.type || 'Payment'}</p></div>
                  <div className="flex items-center gap-2"><span className="text-sm font-semibold">{fmtMoney(p.amount)}</span><Badge variant={p.status === 'completed' ? 'success' : 'warning'}>{p.status}</Badge></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">My Requests</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRequests.length === 0 && <p className="text-sm text-muted-foreground">No service requests yet.</p>}
              {recentRequests.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div><p className="text-sm font-medium">{r.title}</p><p className="text-xs text-muted-foreground">Submitted {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
                  <Badge variant={r.status === 'completed' ? 'success' : 'warning'}>{r.status?.replace('_', ' ')}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD PAGE ───────────────────────────────────────────
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  switch (user?.role) {
    case 'super_admin':
    case 'estate_manager':
      return <AdminDashboard />;
    case 'landlord':
      return <LandlordDashboard />;
    case 'tenant':
      return <TenantDashboard />;
    default:
      return <TenantDashboard />;
  }
}
