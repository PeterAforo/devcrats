'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Clock, FileText, User, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';

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
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');
  const [reviewDialog, setReviewDialog] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const { data: apiData, isLoading } = useQuery({
    queryKey: ['change-requests', activeTab],
    queryFn: () => api.get(`/change-requests?status=${activeTab}`),
  });

  const requests: any[] = apiData?.data || [];
  const pendingCount = activeTab === 'pending' ? requests.length : 0;

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, reviewNote }: { id: string; status: string; reviewNote?: string }) =>
      api.put(`/change-requests/${id}/review`, { status, reviewNote }),
    onSuccess: () => {
      toast.success('Request reviewed successfully');
      qc.invalidateQueries({ queryKey: ['change-requests'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to review request'),
  });

  const handleReview = (id: string, status: 'approved' | 'rejected') => {
    reviewMutation.mutate({ id, status, reviewNote });
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3 mt-4">
          {isLoading ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />Loading...</CardContent></Card>
          ) : requests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No {activeTab} requests
              </CardContent>
            </Card>
          ) : (
            requests.map((req: any) => (
              <Card key={req.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{req.tenant?.user?.firstName || 'Unknown'} {req.tenant?.user?.lastName || ''}</span>
                        <span className="text-sm text-muted-foreground">({req.tenant?.user?.email || ''})</span>
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
                            disabled={reviewMutation.isPending}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setReviewDialog(req.id)}
                            disabled={reviewMutation.isPending}
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
