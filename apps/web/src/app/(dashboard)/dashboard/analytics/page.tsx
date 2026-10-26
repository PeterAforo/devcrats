'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Wallet, Building2, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/auth-store';
import { useDashboardAnalytics, useEstates } from '@/lib/hooks';

export default function AnalyticsPage() {
  const user = useAuthStore((s) => s.user);
  const [pickedEstateId, setPickedEstateId] = useState('');
  const { data: estatesData } = useEstates();
  const estates: any[] = estatesData?.data || [];
  const estateId = user?.estateId || pickedEstateId || undefined;

  const { data, isLoading } = useDashboardAnalytics(estateId);
  const a = data?.data;
  const kpis = a?.kpis;
  const monthlyRevenue: any[] = a?.monthlyRevenue || [];
  const occupancyByEstate: any[] = a?.occupancyByEstate || [];
  const maintenanceByCategory: any[] = a?.maintenanceByCategory || [];

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.amount), 1);

  const cards = [
    { label: 'Annual Revenue', value: `GH₵ ${((kpis?.annualRevenue || 0) / 1000).toFixed(0)}K`, icon: Wallet },
    { label: 'Avg Occupancy', value: `${kpis?.avgOccupancy ?? 0}%`, icon: Building2 },
    { label: 'Total Tenants', value: `${kpis?.totalTenants ?? 0}`, icon: Users },
    { label: 'Outstanding Balance', value: `GH₵ ${((kpis?.outstanding || 0) / 1000).toFixed(1)}K`, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Insights and performance metrics</p>
        </div>
        {!user?.estateId && (
          <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={pickedEstateId} onChange={(e) => setPickedEstateId(e.target.value)}>
            <option value="">All estates</option>
            {estates.map((est: any) => <option key={est.id} value={est.id}>{est.name}</option>)}
          </select>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading analytics...</div>
      )}

      {!isLoading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => (
              <Card key={c.label}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm text-muted-foreground">{c.label}</p><p className="text-2xl font-bold">{c.value}</p></div>
                    <c.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="revenue">
            <TabsList>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue">
              <Card>
                <CardHeader><CardTitle>Monthly Revenue (6 months)</CardTitle></CardHeader>
                <CardContent>
                  {monthlyRevenue.every((m) => m.amount === 0) ? (
                    <p className="text-sm text-muted-foreground py-4">No completed payments in the last 6 months.</p>
                  ) : (
                    <div className="space-y-4">
                      {monthlyRevenue.map((m) => (
                        <div key={m.month} className="flex items-center gap-4">
                          <span className="w-10 text-sm font-medium text-muted-foreground">{m.month}</span>
                          <div className="flex-1">
                            <Progress value={(m.amount / maxRevenue) * 100} className="h-6" />
                          </div>
                          <span className="text-sm font-semibold w-24 text-right">GH₵ {(m.amount / 1000).toFixed(1)}K</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="occupancy">
              <Card>
                <CardHeader><CardTitle>Occupancy by Estate</CardTitle></CardHeader>
                <CardContent>
                  {occupancyByEstate.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No estates found.</p>
                  ) : (
                    <div className="space-y-4">
                      {occupancyByEstate.map((e) => (
                        <div key={e.name} className="flex items-center gap-4">
                          <span className="w-32 text-sm font-medium truncate">{e.name}</span>
                          <div className="flex-1">
                            <Progress value={e.occupancy} className="h-4" />
                          </div>
                          <span className="text-sm font-semibold w-16 text-right">{e.occupancy}%</span>
                          <span className="text-xs text-muted-foreground w-16 text-right">{e.units} units</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance">
              <Card>
                <CardHeader><CardTitle>Maintenance Requests by Category</CardTitle></CardHeader>
                <CardContent>
                  {maintenanceByCategory.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No maintenance requests recorded.</p>
                  ) : (
                    <div className="space-y-4">
                      {maintenanceByCategory.map((s) => (
                        <div key={s.category} className="flex items-center gap-4">
                          <span className="w-24 text-sm font-medium capitalize">{s.category}</span>
                          <div className="flex-1">
                            <Progress value={s.pct * 3} className="h-4" />
                          </div>
                          <span className="text-sm font-semibold w-12 text-right">{s.count}</span>
                          <span className="text-xs text-muted-foreground w-10 text-right">{s.pct}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
