'use client';

import { useState } from 'react';
import { Zap, Droplets, Flame, Gauge, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuthStore } from '@/store/auth-store';
import { useEstates, useBuildings, useUnits, useUtilitySummary, useMeters, useCreateMeter, useCreateReading } from '@/lib/hooks';
import { toast } from 'sonner';

const TYPE_META: Record<string, { label: string; unit: string; icon: any; color: string }> = {
  electricity: { label: 'Electricity', unit: 'kWh', icon: Zap, color: 'text-yellow-600 bg-yellow-50' },
  water: { label: 'Water', unit: 'm³', icon: Droplets, color: 'text-blue-600 bg-blue-50' },
  gas: { label: 'Gas', unit: 'm³', icon: Flame, color: 'text-orange-600 bg-orange-50' },
};

function usageLevel(consumption: number, avg: number) {
  if (consumption <= 0) return 'low';
  if (avg <= 0) return 'normal';
  if (consumption > avg * 1.8) return 'critical';
  if (consumption > avg * 1.3) return 'high';
  if (consumption < avg * 0.5) return 'low';
  return 'normal';
}

const statusColors: Record<string, string> = { low: 'success', normal: 'info', high: 'warning', critical: 'destructive' };

export default function UtilitiesPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'super_admin' || user?.role === 'estate_manager';
  const [pickedEstateId, setPickedEstateId] = useState('');
  const { data: estatesData } = useEstates();
  const estates: any[] = estatesData?.data || [];
  const estateId = user?.estateId || pickedEstateId || estates[0]?.id || '';

  const { data: summaryData, isLoading: summaryLoading } = useUtilitySummary(estateId);
  const summary = summaryData?.data?.byType || {};

  const { data: elecData, isLoading: elecLoading } = useMeters(estateId, 'electricity');
  const { data: waterData, isLoading: waterLoading } = useMeters(estateId, 'water');
  const elecMeters: any[] = elecData?.data || [];
  const waterMeters: any[] = waterData?.data || [];

  const [showAddMeter, setShowAddMeter] = useState(false);
  const [meterForm, setMeterForm] = useState({ buildingId: '', unitId: '', type: 'electricity', meterNumber: '' });
  const [readMeter, setReadMeter] = useState<any | null>(null);
  const [readingValue, setReadingValue] = useState('');

  const { data: buildingsData } = useBuildings(meterForm.buildingId ? estateId : '');
  const buildings: any[] = buildingsData?.data || [];
  const { data: unitsData } = useUnits(meterForm.buildingId);
  const units: any[] = unitsData?.data || [];

  const createMeter = useCreateMeter();
  const createReading = useCreateReading();

  const MeterTable = ({ meters, type, loading }: { meters: any[]; type: string; loading: boolean }) => {
    const meta = TYPE_META[type];
    const avg = meters.length ? meters.reduce((s, m) => s + m.consumption, 0) / meters.length : 0;
    const maxCons = Math.max(...meters.map((m) => m.consumption), 1);
    if (loading) return <Card><CardContent className="py-10 flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading meters...</CardContent></Card>;
    return (
      <Card>
        <CardHeader><CardTitle>{meta.label} Meter Readings</CardTitle></CardHeader>
        <CardContent>
          {meters.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No {meta.label.toLowerCase()} meters registered yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead>Meter #</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Current Reading</TableHead>
                  <TableHead>Consumption ({meta.unit})</TableHead>
                  <TableHead>Cost (GH₵)</TableHead>
                  <TableHead>Usage</TableHead>
                  {isAdmin && <TableHead></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {meters.map((m) => {
                  const level = usageLevel(m.consumption, avg);
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.unit?.unitNumber || m.unit?.houseNumber || '—'}</TableCell>
                      <TableCell className="font-mono text-xs">{m.meterNumber}</TableCell>
                      <TableCell>{m.tenant || '—'}</TableCell>
                      <TableCell>{m.currentReading !== null ? Number(m.currentReading).toLocaleString() : '—'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={(m.consumption / maxCons) * 100} className="h-2 w-16" />
                          {m.consumption}
                        </div>
                      </TableCell>
                      <TableCell>GH₵ {m.cost.toLocaleString()}</TableCell>
                      <TableCell><Badge variant={statusColors[level] as any}>{level}</Badge></TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => { setReadMeter(m); setReadingValue(''); }}>
                            <Gauge className="h-3.5 w-3.5 mr-1" /> Record
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Utilities</h1>
          <p className="text-muted-foreground mt-1">Monitor electricity, water, and gas consumption</p>
        </div>
        <div className="flex items-center gap-3">
          {!user?.estateId && (
            <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={pickedEstateId} onChange={(e) => setPickedEstateId(e.target.value)}>
              <option value="">Select estate...</option>
              {estates.map((est: any) => <option key={est.id} value={est.id}>{est.name}</option>)}
            </select>
          )}
          {isAdmin && estateId && (
            <Button className="gap-2" onClick={() => setShowAddMeter(true)}><Plus className="h-4 w-4" /> Add Meter</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(TYPE_META).map(([type, meta]) => {
          const Icon = meta.icon;
          const t = summary[type];
          return (
            <Card key={type}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${meta.color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{meta.label} (MTD)</p>
                    <p className="text-xl font-bold">{summaryLoading ? '…' : `${(t?.consumption ?? 0).toLocaleString()} ${meta.unit}`}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t ? `${t.meterCount} meter${t.meterCount !== 1 ? 's' : ''} · GH₵ ${t.cost.toLocaleString()}` : 'No meters'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="electricity">
        <TabsList>
          <TabsTrigger value="electricity">Electricity</TabsTrigger>
          <TabsTrigger value="water">Water</TabsTrigger>
        </TabsList>
        <TabsContent value="electricity"><MeterTable meters={elecMeters} type="electricity" loading={elecLoading} /></TabsContent>
        <TabsContent value="water"><MeterTable meters={waterMeters} type="water" loading={waterLoading} /></TabsContent>
      </Tabs>

      {/* Add Meter Dialog */}
      <Dialog open={showAddMeter} onOpenChange={setShowAddMeter}>
        <DialogContent>
          <DialogHeader><DialogTitle>Register Meter</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Utility Type</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={meterForm.type} onChange={(e) => setMeterForm({ ...meterForm, type: e.target.value })}>
                <option value="electricity">Electricity</option><option value="water">Water</option><option value="gas">Gas</option><option value="internet">Internet</option><option value="waste_collection">Waste Collection</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Building</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={meterForm.buildingId} onChange={(e) => setMeterForm({ ...meterForm, buildingId: e.target.value, unitId: '' })}>
                  <option value="">Select building...</option>
                  {buildings.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={meterForm.unitId} disabled={!meterForm.buildingId} onChange={(e) => setMeterForm({ ...meterForm, unitId: e.target.value })}>
                  <option value="">{meterForm.buildingId ? 'Select unit...' : 'Select building first'}</option>
                  {units.map((u: any) => <option key={u.id} value={u.id}>{u.unitNumber || u.houseNumber}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2"><Label>Meter Number</Label><Input placeholder="e.g. MTR-00123" value={meterForm.meterNumber} onChange={(e) => setMeterForm({ ...meterForm, meterNumber: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMeter(false)}>Cancel</Button>
            <Button
              disabled={!meterForm.unitId || !meterForm.meterNumber || createMeter.isPending}
              onClick={() => createMeter.mutate(
                { estateId, unitId: meterForm.unitId, type: meterForm.type, meterNumber: meterForm.meterNumber },
                {
                  onSuccess: () => { toast.success('Meter registered'); setMeterForm({ buildingId: '', unitId: '', type: 'electricity', meterNumber: '' }); setShowAddMeter(false); },
                  onError: (e: any) => toast.error(e.message || 'Failed to register meter'),
                },
              )}
            >Add Meter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Reading Dialog */}
      <Dialog open={!!readMeter} onOpenChange={() => setReadMeter(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Reading — {readMeter?.meterNumber}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Unit {readMeter?.unit?.unitNumber || readMeter?.unit?.houseNumber} · Previous: {readMeter?.currentReading ?? 'none'}
            </p>
            <div className="space-y-2">
              <Label>New Reading *</Label>
              <Input type="number" step="0.01" value={readingValue} onChange={(e) => setReadingValue(e.target.value)} placeholder="e.g. 4520.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReadMeter(null)}>Cancel</Button>
            <Button
              disabled={!readingValue || createReading.isPending}
              onClick={() => createReading.mutate(
                { meterId: readMeter.id, reading: parseFloat(readingValue) },
                {
                  onSuccess: () => { toast.success('Reading recorded'); setReadMeter(null); },
                  onError: (e: any) => toast.error(e.message || 'Failed to record reading'),
                },
              )}
            >Save Reading</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
