'use client';

import { BarChart3, TrendingUp, Users, Wallet, Building2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const monthlyRevenue = [
  { month: 'Aug', amount: 382000 },
  { month: 'Sep', amount: 401000 },
  { month: 'Oct', amount: 415000 },
  { month: 'Nov', amount: 432000 },
  { month: 'Dec', amount: 428000 },
  { month: 'Jan', amount: 458000 },
];

const occupancyByEstate = [
  { name: 'East Legon Hills', occupancy: 94, units: 32 },
  { name: 'Cantonments Res.', occupancy: 88, units: 48 },
  { name: 'Kumasi Royal', occupancy: 76, units: 64 },
  { name: 'Tema Comm. 25', occupancy: 92, units: 24 },
  { name: 'Airport Res.', occupancy: 100, units: 20 },
];

const maintenanceStats = [
  { category: 'Plumbing', count: 34, pct: 28 },
  { category: 'Electrical', count: 28, pct: 23 },
  { category: 'HVAC', count: 20, pct: 16 },
  { category: 'Carpentry', count: 16, pct: 13 },
  { category: 'Painting', count: 14, pct: 12 },
  { category: 'Other', count: 10, pct: 8 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Insights and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Portfolio Value</p><p className="text-2xl font-bold">GH₵ 125M</p></div>
              <div className="flex items-center gap-1 text-green-600 text-xs"><ArrowUpRight className="h-3 w-3" /> +15%</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Annual Revenue</p><p className="text-2xl font-bold">GH₵ 5.5M</p></div>
              <div className="flex items-center gap-1 text-green-600 text-xs"><ArrowUpRight className="h-3 w-3" /> +8.3%</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Avg Occupancy</p><p className="text-2xl font-bold">90.0%</p></div>
              <div className="flex items-center gap-1 text-green-600 text-xs"><ArrowUpRight className="h-3 w-3" /> +2.1%</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Tenant Satisfaction</p><p className="text-2xl font-bold">4.6/5</p></div>
              <div className="flex items-center gap-1 text-red-600 text-xs"><ArrowDownRight className="h-3 w-3" /> -0.1</div>
            </div>
          </CardContent>
        </Card>
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
              <div className="space-y-4">
                {monthlyRevenue.map((m) => (
                  <div key={m.month} className="flex items-center gap-4">
                    <span className="w-10 text-sm font-medium text-muted-foreground">{m.month}</span>
                    <div className="flex-1">
                      <Progress value={(m.amount / 500000) * 100} className="h-6" />
                    </div>
                    <span className="text-sm font-semibold w-24 text-right">GH₵ {(m.amount / 1000).toFixed(0)}K</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy">
          <Card>
            <CardHeader><CardTitle>Occupancy by Estate</CardTitle></CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader><CardTitle>Maintenance Requests by Category</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceStats.map((s) => (
                  <div key={s.category} className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium">{s.category}</span>
                    <div className="flex-1">
                      <Progress value={s.pct * 3} className="h-4" />
                    </div>
                    <span className="text-sm font-semibold w-12 text-right">{s.count}</span>
                    <span className="text-xs text-muted-foreground w-10 text-right">{s.pct}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
