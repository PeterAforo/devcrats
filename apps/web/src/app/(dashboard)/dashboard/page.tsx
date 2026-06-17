'use client';

import { Building2, Users, Wallet, Wrench, MessageSquareWarning, DoorOpen, TrendingUp, TrendingDown, Home, CreditCard, Receipt, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth-store';
import { useDashboardStats } from '@/lib/hooks';

// ─── ADMIN / MANAGER DASHBOARD ────────────────────────────────────
function AdminDashboard() {
  const { data: apiStats } = useDashboardStats();
  const s = apiStats?.data;

  const stats = [
    { label: 'Total Estates', value: s?.totalEstates?.toString() || '12', change: '+2', trend: 'up', icon: Building2, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Units', value: s?.totalUnits ? s.totalUnits.toLocaleString() : '1,248', change: '+48', trend: 'up', icon: Building2, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Occupancy Rate', value: s?.occupancyRate ? `${s.occupancyRate}%` : '94.2%', change: '+1.2%', trend: 'up', icon: Users, color: 'text-green-600 bg-green-50' },
    { label: 'Revenue (MTD)', value: s?.revenue ? `GH₵ ${(s.revenue / 1000).toFixed(0)}K` : 'GH₵ 458K', change: '+8.3%', trend: 'up', icon: Wallet, color: 'text-gold bg-gold-50' },
    { label: 'Outstanding', value: s?.outstanding ? `GH₵ ${(s.outstanding / 1000).toFixed(0)}K` : 'GH₵ 32K', change: '-12%', trend: 'down', icon: Wallet, color: 'text-red-600 bg-red-50' },
    { label: 'Open Requests', value: s?.openRequests?.toString() || '23', change: '+5', trend: 'up', icon: Wrench, color: 'text-orange-600 bg-orange-50' },
    { label: 'Open Complaints', value: s?.openComplaints?.toString() || '7', change: '-3', trend: 'down', icon: MessageSquareWarning, color: 'text-purple-600 bg-purple-50' },
    { label: 'Visitors Today', value: s?.visitorsToday?.toString() || '34', change: '+12', trend: 'up', icon: DoorOpen, color: 'text-teal-600 bg-teal-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform-wide overview of all estates</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === 'up' ? <TrendingUp className="h-3 w-3 text-green-600" /> : <TrendingDown className="h-3 w-3 text-red-600" />}
                    <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>{stat.change}</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}><stat.icon className="h-6 w-6" /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Payments</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[{ unit: 'A-101', name: 'Kwame Asante', amt: '3,500' }, { unit: 'A-203', name: 'Ama Mensah', amt: '850' }, { unit: 'B-102', name: 'Kofi Boateng', amt: '3,500' }, { unit: 'A-301', name: 'Abena Owusu', amt: '2,800' }].map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">Unit {p.unit} — Rent</p></div>
                  <span className="text-sm font-semibold text-green-600">GH₵ {p.amt}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Active Maintenance</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Plumbing fix — Unit B-302', 'Electrical issue — Unit A-105', 'HVAC repair — Block C', 'Lock replacement — Unit D-201'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Complaints</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[{ text: 'Noise complaint — Floor 3', s: 'Open' }, { text: 'Parking dispute — Block A', s: 'Investigating' }, { text: 'Water pressure — Unit C-401', s: 'Action Taken' }].map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.s === 'Open' ? 'bg-red-100 text-red-700' : item.s === 'Investigating' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{item.s}</span>
                  <p className="text-sm flex-1">{item.text}</p>
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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Landlord Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your property portfolio at a glance</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Home className="h-5 w-5 text-blue-600" /></div><div><p className="text-sm text-muted-foreground">Properties</p><p className="text-xl font-bold">8 Units</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><Users className="h-5 w-5 text-green-600" /></div><div><p className="text-sm text-muted-foreground">Occupancy</p><p className="text-xl font-bold">7/8 (87.5%)</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center"><CreditCard className="h-5 w-5 text-gold" /></div><div><p className="text-sm text-muted-foreground">Income (MTD)</p><p className="text-xl font-bold">GH₵ 24,500</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-red-600" /></div><div><p className="text-sm text-muted-foreground">Overdue</p><p className="text-xl font-bold">GH₵ 3,500</p></div></div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">My Tenants</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[{ name: 'Kwame Asante', unit: 'A-101', status: 'Paid' }, { name: 'Ama Mensah', unit: 'A-203', status: 'Paid' }, { name: 'Kofi Boateng', unit: 'B-102', status: 'Paid' }, { name: 'Abena Owusu', unit: 'A-301', status: 'Overdue' }, { name: 'Yaw Darko', unit: 'B-201', status: 'Paid' }].map((t, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div><p className="text-sm font-medium">{t.name}</p><p className="text-xs text-muted-foreground">Unit {t.unit}</p></div>
                  <Badge variant={t.status === 'Paid' ? 'success' : 'destructive'}>{t.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Maintenance on My Units</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[{ title: 'Kitchen sink leaking', unit: 'A-101', status: 'In Progress' }, { title: 'Paint peeling', unit: 'B-201', status: 'Completed' }].map((m, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div><p className="text-sm font-medium">{m.title}</p><p className="text-xs text-muted-foreground">Unit {m.unit}</p></div>
                  <Badge variant="outline">{m.status}</Badge>
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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">My Dashboard</h1>
        <p className="text-muted-foreground mt-1">Unit A-101 — East Legon Hills Estate</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><Home className="h-5 w-5 text-green-600" /></div><div><p className="text-sm text-muted-foreground">Lease Status</p><p className="text-xl font-bold text-green-600">Active</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center"><Receipt className="h-5 w-5 text-gold" /></div><div><p className="text-sm text-muted-foreground">Next Rent Due</p><p className="text-xl font-bold">1 Feb 2025</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Wallet className="h-5 w-5 text-blue-600" /></div><div><p className="text-sm text-muted-foreground">Monthly Rent</p><p className="text-xl font-bold">GH₵ 3,500</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center"><Wrench className="h-5 w-5 text-orange-600" /></div><div><p className="text-sm text-muted-foreground">Open Requests</p><p className="text-xl font-bold">1</p></div></div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Payment History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[{ month: 'Jan 2025', amt: '3,500', status: 'Paid' }, { month: 'Dec 2024', amt: '3,500', status: 'Paid' }, { month: 'Nov 2024', amt: '3,500', status: 'Paid' }, { month: 'Oct 2024', amt: '3,500', status: 'Paid' }].map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div><p className="text-sm font-medium">{p.month}</p><p className="text-xs text-muted-foreground">Rent Payment</p></div>
                  <div className="flex items-center gap-2"><span className="text-sm font-semibold">GH₵ {p.amt}</span><Badge variant="success">{p.status}</Badge></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">My Requests</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <div><p className="text-sm font-medium">Kitchen sink leaking</p><p className="text-xs text-muted-foreground">Submitted 5 Jan 2025</p></div>
                <Badge variant="warning">In Progress</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <div><p className="text-sm font-medium">Light fixture replacement</p><p className="text-xs text-muted-foreground">Completed 20 Dec 2024</p></div>
                <Badge variant="success">Completed</Badge>
              </div>
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
