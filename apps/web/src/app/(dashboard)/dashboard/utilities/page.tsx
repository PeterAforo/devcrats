'use client';

import { Zap, Droplets, Flame, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const electricityData = [
  { unit: 'A-101', tenant: 'Kwame Asante', reading: 4520, prevReading: 4380, consumption: 140, cost: 126, status: 'normal' },
  { unit: 'A-203', tenant: 'Ama Mensah', reading: 3890, prevReading: 3720, consumption: 170, cost: 153, status: 'high' },
  { unit: 'B-102', tenant: 'Kofi Boateng', reading: 2760, prevReading: 2650, consumption: 110, cost: 99, status: 'normal' },
  { unit: 'A-301', tenant: 'Abena Owusu', reading: 5100, prevReading: 4850, consumption: 250, cost: 225, status: 'critical' },
  { unit: 'B-201', tenant: 'Yaw Darko', reading: 1980, prevReading: 1900, consumption: 80, cost: 72, status: 'low' },
];

const waterData = [
  { unit: 'A-101', tenant: 'Kwame Asante', reading: 890, consumption: 45, cost: 45 },
  { unit: 'A-203', tenant: 'Ama Mensah', reading: 1230, consumption: 62, cost: 62 },
  { unit: 'B-102', tenant: 'Kofi Boateng', reading: 780, consumption: 38, cost: 38 },
  { unit: 'A-301', tenant: 'Abena Owusu', reading: 1560, consumption: 78, cost: 78 },
  { unit: 'B-201', tenant: 'Yaw Darko', reading: 650, consumption: 32, cost: 32 },
];

const statusColors: Record<string, string> = { low: 'success', normal: 'info', high: 'warning', critical: 'destructive' };

export default function UtilitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Utilities</h1>
        <p className="text-muted-foreground mt-1">Monitor electricity, water, and gas consumption</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                <Zap className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Electricity (MTD)</p>
                <p className="text-xl font-bold">4,250 kWh</p>
                <div className="flex items-center gap-1 text-xs text-red-600 mt-0.5"><TrendingUp className="h-3 w-3" /> +12% vs last month</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Droplets className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Water (MTD)</p>
                <p className="text-xl font-bold">1,850 m³</p>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-0.5"><TrendingDown className="h-3 w-3" /> -5% vs last month</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gas (MTD)</p>
                <p className="text-xl font-bold">320 m³</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">Stable</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="electricity">
        <TabsList>
          <TabsTrigger value="electricity">Electricity</TabsTrigger>
          <TabsTrigger value="water">Water</TabsTrigger>
        </TabsList>
        <TabsContent value="electricity">
          <Card>
            <CardHeader><CardTitle>Electricity Meter Readings</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Current Reading</TableHead>
                    <TableHead>Consumption (kWh)</TableHead>
                    <TableHead>Cost (GH₵)</TableHead>
                    <TableHead>Usage Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {electricityData.map((d) => (
                    <TableRow key={d.unit}>
                      <TableCell className="font-medium">{d.unit}</TableCell>
                      <TableCell>{d.tenant}</TableCell>
                      <TableCell>{d.reading.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={(d.consumption / 250) * 100} className="h-2 w-16" />
                          {d.consumption}
                        </div>
                      </TableCell>
                      <TableCell>GH₵ {d.cost.toLocaleString()}</TableCell>
                      <TableCell><Badge variant={statusColors[d.status] as any}>{d.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="water">
          <Card>
            <CardHeader><CardTitle>Water Meter Readings</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Reading (m³)</TableHead>
                    <TableHead>Consumption</TableHead>
                    <TableHead>Cost (GH₵)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waterData.map((d) => (
                    <TableRow key={d.unit}>
                      <TableCell className="font-medium">{d.unit}</TableCell>
                      <TableCell>{d.tenant}</TableCell>
                      <TableCell>{d.reading}</TableCell>
                      <TableCell>{d.consumption} m³</TableCell>
                      <TableCell>GH₵ {d.cost.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
