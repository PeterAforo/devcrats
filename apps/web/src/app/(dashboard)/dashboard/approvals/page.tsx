'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Clock, FileText, User, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth-store';

const demoChangeRequests = [
  {
    id: 'CR1',
    field: 'phone',
    oldValue: '+233 24 123 4567',
    newValue: '+233 50 987 6543',
    reason: 'Changed my phone number',
    status: 'pending',
    createdAt: '2024-12-15T10:30:00Z',
    tenant: { user: { firstName: 'Kwame', lastName: 'Asante', email: 'kwame@email.com' } },
  },
  {
    id: 'CR2',
    field: 'emergencyContact',
    oldValue: 'Yaw Mensah',
    newValue: 'Ama Boateng',
    reason: 'Updated emergency contact',
    status: 'pending',
    createdAt: '2024-12-14T15:00:00Z',
    tenant: { user: { firstName: 'Efua', lastName: 'Mensah', email: 'efua@email.com' } },
  },
  {
    id: 'CR3',
    field: 'employerName',
    oldValue: 'MTN Ghana',
    newValue: 'Vodafone Ghana',
    reason: 'Changed employer',
    status: 'approved',
    createdAt: '2024-12-10T09:00:00Z',
    reviewedAt: '2024-12-10T14:00:00Z',
    tenant: { user: { firstName: 'Kwame', lastName: 'Asante', email: 'kwame@email.com' } },
  },
  {
    id: 'CR4',
    field: 'email',
    oldValue: 'old@email.com',
    newValue: 'new@email.com',
    reason: null,
    status: 'rejected',
    reviewNote: 'Email changes require admin verification',
    createdAt: '2024-12-08T11:00:00Z',
    reviewedAt: '2024-12-09T10:00:00Z',
    tenant: { user: { firstName: 'Efua', lastName: 'Mensah', email: 'efua@email.com' } },
  },
];

const fieldLabels: Record<string, string> = {
  phone: 'Phone Number',
  email: 'Email Address',
  emergencyContact: 'Emergency Contact',
  emergencyPhone: 'Emergency Phone',
  employerName: 'Employer',
  employerPhone: 'Employer Phone',
  occupation: 'Occupation',
  firstName: 'First Name',
  lastName: 'Last Name',
};

export default function ApprovalsPage() {
  const { isDemoMode } = useAuthStore();
  const [activeTab, setActiveTab] = useState('pending');
  const [reviewDialog, setReviewDialog] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const requests = demoChangeRequests;
  const filtered = requests.filter((r) => r.status === activeTab);
  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  const handleReview = (id: string, status: 'approved' | 'rejected') => {
    setReviewDialog(null);
    setReviewNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Approval Queue</h1>
          <p className="text-muted-foreground">Review tenant profile change requests</p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-amber-100 text-amber-800 text-sm px-3 py-1">
            {pendingCount} pending
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg"><Clock className="h-5 w-5 text-amber-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{requests.filter((r) => r.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{requests.filter((r) => r.status === 'approved').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg"><XCircle className="h-5 w-5 text-red-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">{requests.filter((r) => r.status === 'rejected').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3 mt-4">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No {activeTab} requests
              </CardContent>
            </Card>
          ) : (
            filtered.map((req) => (
              <Card key={req.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{req.tenant.user.firstName} {req.tenant.user.lastName}</span>
                        <span className="text-sm text-muted-foreground">({req.tenant.user.email})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{fieldLabels[req.field] || req.field}</Badge>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-red-500 line-through">{req.oldValue || '(empty)'}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-green-600 font-medium">{req.newValue}</span>
                        </div>
                      </div>
                      {req.reason && (
                        <p className="text-sm text-muted-foreground mt-1">Reason: {req.reason}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(req.createdAt).toLocaleDateString('en-GH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {req.status === 'pending' ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleReview(req.id, 'approved')}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setReviewDialog(req.id)}
                          >
                            <XCircle className="mr-1 h-4 w-4" /> Reject
                          </Button>
                        </>
                      ) : (
                        <Badge className={req.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {req.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={!!reviewDialog} onOpenChange={() => setReviewDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Change Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for rejection (optional)</Label>
              <Textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="e.g. This change requires admin verification..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => reviewDialog && handleReview(reviewDialog, 'rejected')}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
