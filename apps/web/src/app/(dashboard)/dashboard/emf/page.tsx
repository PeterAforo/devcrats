'use client';

import { Wallet, Plus, Calculator, PieChart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const feeComponents = [
  { id: '1', name: '24/7 Security Service', category: 'Security', amount: 250, frequency: 'Monthly', landlordSplit: 30, tenantSplit: 70, status: 'active' },
  { id: '2', name: 'Common Area Cleaning', category: 'Cleaning', amount: 150, frequency: 'Monthly', landlordSplit: 30, tenantSplit: 70, status: 'active' },
  { id: '3', name: 'Generator & Backup Power', category: 'Utility', amount: 200, frequency: 'Monthly', landlordSplit: 20, tenantSplit: 80, status: 'active' },
  { id: '4', name: 'Maintenance Reserve Fund', category: 'Reserve', amount: 100, frequency: 'Monthly', landlordSplit: 50, tenantSplit: 50, status: 'active' },
  { id: '5', name: 'Landscaping & Gardens', category: 'Maintenance', amount: 80, frequency: 'Monthly', landlordSplit: 40, tenantSplit: 60, status: 'active' },
  { id: '6', name: 'Waste Management', category: 'Utility', amount: 50, frequency: 'Monthly', landlordSplit: 30, tenantSplit: 70, status: 'active' },
];

const totalMonthly = feeComponents.reduce((sum, f) => sum + f.amount, 0);

export default function EMFPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Estate Management Fee</h1>
          <p className="text-muted-foreground mt-1">Transparent fee breakdown and collection</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Fee Component
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Monthly</p>
                <p className="text-xl font-bold">GH₵ {totalMonthly.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <p className="text-xl font-bold">91.3%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <PieChart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Components</p>
                <p className="text-xl font-bold">{feeComponents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Calculator className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Annual Total</p>
                <p className="text-xl font-bold">GH₵ {(totalMonthly * 12).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Components — 2024 Schedule</CardTitle>
          <CardDescription>Active fee schedule for East Legon Hills Estate</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Landlord / Tenant Split</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeComponents.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell className="font-medium">{fee.name}</TableCell>
                  <TableCell><Badge variant="outline">{fee.category}</Badge></TableCell>
                  <TableCell>GH₵ {fee.amount.toLocaleString()}</TableCell>
                  <TableCell>{fee.frequency}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={fee.landlordSplit} className="h-2 w-20" />
                      <span className="text-xs text-muted-foreground">{fee.landlordSplit}/{fee.tenantSplit}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="success">{fee.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
