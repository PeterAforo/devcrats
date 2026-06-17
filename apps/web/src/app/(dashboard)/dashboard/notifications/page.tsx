'use client';

import { Bell, Check, Trash2, Mail, AlertTriangle, Receipt, Wrench, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '@/lib/hooks';

const mockNotifications = [
  { id: '1', type: 'payment', title: 'Payment Received', message: 'Kwame Asante paid GH₵ 3,500 for Unit A-101 rent.', time: '5 min ago', read: false, icon: Receipt },
  { id: '2', type: 'maintenance', title: 'New Service Request', message: 'AC repair request submitted for Unit B-203.', time: '15 min ago', read: false, icon: Wrench },
  { id: '3', type: 'alert', title: 'Lease Expiring Soon', message: 'Abena Owusu\'s lease for Unit A-301 expires in 30 days.', time: '1 hour ago', read: false, icon: AlertTriangle },
  { id: '4', type: 'payment', title: 'Payment Failed', message: 'Mobile Money from Akosua Frimpong failed — insufficient balance.', time: '2 hours ago', read: true, icon: Receipt },
  { id: '5', type: 'system', title: 'Monthly Report Ready', message: 'January 2025 estate report is available for download.', time: '3 hours ago', read: true, icon: Mail },
  { id: '6', type: 'maintenance', title: 'Work Order Completed', message: 'Paint job in Unit B-101 marked as completed.', time: '5 hours ago', read: true, icon: Wrench },
  { id: '7', type: 'event', title: 'Upcoming: AGM Meeting', message: 'Annual General Meeting scheduled for Feb 15 at 10:00 AM.', time: '1 day ago', read: true, icon: Calendar },
  { id: '8', type: 'alert', title: 'Security Alert', message: 'Unauthorized vehicle detected at Gate 2 at 2:30 AM.', time: '1 day ago', read: true, icon: AlertTriangle },
];

const typeColors: Record<string, string> = { payment: 'bg-green-50 text-green-600', maintenance: 'bg-orange-50 text-orange-600', alert: 'bg-red-50 text-red-600', system: 'bg-blue-50 text-blue-600', event: 'bg-purple-50 text-purple-600' };
const iconMap: Record<string, any> = { payment: Receipt, rent_due: Receipt, maintenance: Wrench, alert: AlertTriangle, system: Mail, event: Calendar };

export default function NotificationsPage() {
  const { data: apiData, isLoading, isError } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  // Use API data if available, fall back to mock
  const notifications = apiData?.data
    ? apiData.data.map((n: any) => ({ ...n, icon: iconMap[n.type] || Bell, time: new Date(n.createdAt).toLocaleString(), read: !!n.readAt }))
    : mockNotifications;

  const unread = notifications.filter((n: any) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">{isLoading ? 'Loading...' : `${unread} unread notifications`}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
            {markAllRead.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Mark All Read
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((n: any) => {
          const Icon = n.icon || Bell;
          return (
            <Card
              key={n.id}
              className={`transition-all hover:shadow-md cursor-pointer ${!n.read ? 'border-l-4 border-l-gold bg-gold/5' : ''}`}
              onClick={() => !n.read && markRead.mutate(n.id)}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeColors[n.type] || 'bg-gray-50 text-gray-600'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{n.title}</p>
                    {!n.read && <Badge className="h-5 text-[10px]">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
