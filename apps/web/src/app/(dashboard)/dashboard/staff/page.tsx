'use client';

import { UserCog, Plus, Search, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const staff = [
  { id: '1', name: 'Kwadwo Mensah', role: 'Head of Security', department: 'Security', phone: '+233 20 111 2222', shift: 'Day', status: 'on_duty' },
  { id: '2', name: 'Akua Baffoe', role: 'Facility Manager', department: 'Operations', phone: '+233 24 222 3333', shift: 'Day', status: 'on_duty' },
  { id: '3', name: 'Yaw Adjei', role: 'Security Guard', department: 'Security', phone: '+233 27 333 4444', shift: 'Night', status: 'off_duty' },
  { id: '4', name: 'Esi Tetteh', role: 'Cleaner Supervisor', department: 'Cleaning', phone: '+233 50 444 5555', shift: 'Day', status: 'on_duty' },
  { id: '5', name: 'Kweku Ansah', role: 'Electrician', department: 'Maintenance', phone: '+233 26 555 6666', shift: 'Day', status: 'on_leave' },
];

const vendors = [
  { id: '1', name: 'CoolAir Ghana Ltd', service: 'HVAC & Air Conditioning', contact: 'Mr. Ofori', phone: '+233 20 701 2222', rating: 4.8, jobs: 24 },
  { id: '2', name: 'PaintMaster GH', service: 'Painting & Decoration', contact: 'Mrs. Amponsah', phone: '+233 24 702 3333', rating: 4.5, jobs: 18 },
  { id: '3', name: 'GlassFit Accra', service: 'Glass & Windows', contact: 'Mr. Danquah', phone: '+233 27 703 4444', rating: 4.2, jobs: 9 },
  { id: '4', name: 'SafeGuard Systems GH', service: 'Security Systems', contact: 'Cpt. Appiah', phone: '+233 50 704 5555', rating: 4.9, jobs: 6 },
];

const statusColors: Record<string, string> = { on_duty: 'success', off_duty: 'secondary', on_leave: 'warning' };

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Staff & Vendors</h1>
          <p className="text-muted-foreground mt-1">Manage estate personnel and service providers</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Staff</Button>
      </div>

      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff">Staff ({staff.length})</TabsTrigger>
          <TabsTrigger value="vendors">Vendors ({vendors.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Estate Staff</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search staff..." className="pl-9 w-60" />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.role}</TableCell>
                      <TableCell><Badge variant="outline">{s.department}</Badge></TableCell>
                      <TableCell className="flex items-center gap-1 text-sm"><Phone className="h-3 w-3" />{s.phone}</TableCell>
                      <TableCell>{s.shift}</TableCell>
                      <TableCell><Badge variant={statusColors[s.status] as any}>{s.status.replace('_', ' ')}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendors.map((v) => (
              <Card key={v.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{v.name}</h3>
                      <p className="text-sm text-muted-foreground">{v.service}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm font-medium">⭐ {v.rating}</div>
                      <p className="text-xs text-muted-foreground">{v.jobs} jobs</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Contact: {v.contact}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{v.phone}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
