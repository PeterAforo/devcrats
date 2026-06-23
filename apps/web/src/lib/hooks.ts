import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// ─── DASHBOARD ────────────────────────────────────────────
export function useDashboardStats(estateId?: string) {
  return useQuery({
    queryKey: ['dashboard-stats', estateId],
    queryFn: () => api.get(`/dashboard/stats${estateId ? `?estateId=${estateId}` : ''}`),
  });
}

// ─── ESTATES ──────────────────────────────────────────────
export function useEstates(page = 1, search?: string) {
  return useQuery({
    queryKey: ['estates', page, search],
    queryFn: () => api.get(`/estates?page=${page}${search ? `&search=${search}` : ''}`),
  });
}

export function useEstate(id: string) {
  return useQuery({
    queryKey: ['estate', id],
    queryFn: () => api.get(`/estates/${id}`),
    enabled: !!id,
  });
}

export function useCreateEstate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/estates', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['estates'] }),
  });
}

export function useUpdateEstate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/estates/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['estates'] }),
  });
}

export function useDeleteEstate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/estates/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['estates'] }),
  });
}

export function useUploadEstateLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post(`/estates/${id}/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['estates'] });
    },
  });
}

// ─── BUILDINGS & UNITS ────────────────────────────────────
export function useBuildings(estateId: string) {
  return useQuery({
    queryKey: ['buildings', estateId],
    queryFn: () => api.get(`/estates/${estateId}/buildings`),
    enabled: !!estateId,
  });
}

export function useCreateBuilding(estateId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post(`/estates/${estateId}/buildings`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['buildings', estateId] }),
  });
}

export function useUnits(buildingId: string) {
  return useQuery({
    queryKey: ['units', buildingId],
    queryFn: () => api.get(`/buildings/${buildingId}/units`),
    enabled: !!buildingId,
  });
}

// ─── TENANTS ──────────────────────────────────────────────
export function useTenants(estateId?: string, page = 1, search?: string) {
  return useQuery({
    queryKey: ['tenants', estateId, page, search],
    queryFn: () => api.get(`/tenants?page=${page}${estateId ? `&estateId=${estateId}` : ''}${search ? `&search=${search}` : ''}`),
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: ['tenant', id],
    queryFn: () => api.get(`/tenants/${id}`),
    enabled: !!id,
  });
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/tenants', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  });
}

export function useDeleteTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/tenants/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  });
}

// ─── LANDLORDS ────────────────────────────────────────────
export function useLandlords(estateId?: string, page = 1, search?: string) {
  return useQuery({
    queryKey: ['landlords', estateId, page, search],
    queryFn: () => api.get(`/landlords?page=${page}${estateId ? `&estateId=${estateId}` : ''}${search ? `&search=${search}` : ''}`),
  });
}

export function useLandlord(id: string) {
  return useQuery({
    queryKey: ['landlord', id],
    queryFn: () => api.get(`/landlords/${id}`),
    enabled: !!id,
  });
}

export function useCreateLandlord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/landlords', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['landlords'] }),
  });
}

export function useDeleteLandlord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/landlords/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['landlords'] }),
  });
}

// ─── PAYMENTS & INVOICES ──────────────────────────────────
export function useInvoices(estateId?: string, status?: string, page = 1) {
  return useQuery({
    queryKey: ['invoices', estateId, status, page],
    queryFn: () => api.get(`/invoices?page=${page}${estateId ? `&estateId=${estateId}` : ''}${status ? `&status=${status}` : ''}`),
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/invoices', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function usePayments(estateId?: string, page = 1) {
  return useQuery({
    queryKey: ['payments', estateId, page],
    queryFn: () => api.get(`/payments?page=${page}${estateId ? `&estateId=${estateId}` : ''}`),
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/payments', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function usePaymentStats(estateId: string) {
  return useQuery({
    queryKey: ['payment-stats', estateId],
    queryFn: () => api.get(`/payments/stats/${estateId}`),
    enabled: !!estateId,
  });
}

// ─── MAINTENANCE ──────────────────────────────────────────
export function useMaintenanceRequests(estateId?: string, status?: string, page = 1) {
  return useQuery({
    queryKey: ['maintenance', estateId, status, page],
    queryFn: () => api.get(`/maintenance?page=${page}${estateId ? `&estateId=${estateId}` : ''}${status ? `&status=${status}` : ''}`),
  });
}

export function useCreateMaintenanceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/maintenance', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenance'] }),
  });
}

export function useUpdateMaintenanceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, assignedTo }: { id: string; status: string; assignedTo?: string }) =>
      api.put(`/maintenance/${id}/status`, { status, assignedTo }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenance'] }),
  });
}

export function useDeleteMaintenanceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/maintenance/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenance'] }),
  });
}

export function useMaintenanceStats(estateId: string) {
  return useQuery({
    queryKey: ['maintenance-stats', estateId],
    queryFn: () => api.get(`/maintenance/stats/${estateId}`),
    enabled: !!estateId,
  });
}

// ─── COMPLAINTS ───────────────────────────────────────────
export function useComplaints(estateId?: string, status?: string, page = 1) {
  return useQuery({
    queryKey: ['complaints', estateId, status, page],
    queryFn: () => api.get(`/complaints?page=${page}${estateId ? `&estateId=${estateId}` : ''}${status ? `&status=${status}` : ''}`),
  });
}

export function useCreateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/complaints', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['complaints'] }),
  });
}

export function useUpdateComplaintStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, resolution }: { id: string; status: string; resolution?: string }) =>
      api.put(`/complaints/${id}/status`, { status, resolution }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['complaints'] }),
  });
}

// ─── VISITORS ─────────────────────────────────────────────
export function useVisitorInvites(estateId?: string, page = 1) {
  return useQuery({
    queryKey: ['visitor-invites', estateId, page],
    queryFn: () => api.get(`/visitors/invites?page=${page}${estateId ? `&estateId=${estateId}` : ''}`),
  });
}

export function useCreateVisitorInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/visitors/invites', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['visitor-invites'] }),
  });
}

export function useCheckInVisitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => api.post(`/visitors/check-in/${inviteId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['visitor-invites'] }),
  });
}

export function useGateLogs(estateId: string, page = 1) {
  return useQuery({
    queryKey: ['gate-logs', estateId, page],
    queryFn: () => api.get(`/visitors/gate-logs/${estateId}?page=${page}`),
    enabled: !!estateId,
  });
}

// ─── NOTIFICATIONS ────────────────────────────────────────
export function useNotifications(page = 1, unreadOnly = false) {
  return useQuery({
    queryKey: ['notifications', page, unreadOnly],
    queryFn: () => api.get(`/notifications?page=${page}${unreadOnly ? '&unreadOnly=true' : ''}`),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['unread-count'],
    queryFn: () => api.get('/notifications/unread-count'),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/notifications/mark-all-read'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}

// ─── INTEGRATIONS ─────────────────────────────────────────
export function useIntegrations() {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: () => api.get('/integrations'),
  });
}

export function useUpdateIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ provider, data }: { provider: string; data: any }) => api.put(`/integrations/${provider}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['integrations'] }),
  });
}

export function useToggleIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ provider, isActive }: { provider: string; isActive: boolean }) =>
      api.put(`/integrations/${provider}/toggle`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['integrations'] }),
  });
}

export function useCreateIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { provider: string; category: string; displayName: string; description?: string; credentials?: Record<string, string>; config?: Record<string, string> }) =>
      api.post('/integrations', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['integrations'] }),
  });
}

export function useDeleteIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (provider: string) => api.delete(`/integrations/${provider}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['integrations'] }),
  });
}

// ─── DOCUMENTS / UPLOADS ─────────────────────────────────
export function useDocuments(estateId?: string, page = 1) {
  return useQuery({
    queryKey: ['documents', estateId, page],
    queryFn: () => api.get(`/uploads?page=${page}${estateId ? `&estateId=${estateId}` : ''}`),
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/uploads`, {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` },
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/uploads/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
}

// ─── TENANT PROFILE (MY UNIT) ───────────────────────────
export function useMyTenantProfile() {
  return useQuery({
    queryKey: ['my-tenant-profile'],
    queryFn: () => api.get('/tenants/me'),
  });
}

export function useFamilyMembers(tenantId: string) {
  return useQuery({
    queryKey: ['family-members', tenantId],
    queryFn: () => api.get(`/tenants/${tenantId}/family`),
    enabled: !!tenantId,
  });
}

export function useAddFamilyMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data: any }) => api.post(`/tenants/${tenantId}/family`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['family-members'] });
      qc.invalidateQueries({ queryKey: ['my-tenant-profile'] });
    },
  });
}

export function useRemoveFamilyMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/family-members/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['family-members'] });
      qc.invalidateQueries({ queryKey: ['my-tenant-profile'] });
    },
  });
}

// ─── TENANT CHANGE REQUESTS ────────────────────────────
export function useCreateChangeRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data: { field: string; newValue: string; reason?: string } }) =>
      api.post(`/tenants/${tenantId}/change-requests`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['change-requests'] }),
  });
}

export function useChangeRequests(tenantId?: string, status?: string, page = 1) {
  return useQuery({
    queryKey: ['change-requests', tenantId, status, page],
    queryFn: () => api.get(`/change-requests?page=${page}${tenantId ? `&tenantId=${tenantId}` : ''}${status ? `&status=${status}` : ''}`),
  });
}

export function useReviewChangeRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: 'approved' | 'rejected'; reviewNote?: string } }) =>
      api.put(`/change-requests/${id}/review`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['change-requests'] }),
  });
}

// ─── LANDLORD PROFILE ──────────────────────────────────
export function useMyLandlordProfile() {
  return useQuery({
    queryKey: ['my-landlord-profile'],
    queryFn: () => api.get('/landlords/me'),
  });
}

export function useAddPropertyToLandlord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ landlordId, data }: { landlordId: string; data: { unitId: string; occupancyType?: string } }) =>
      api.post(`/landlords/${landlordId}/properties`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-landlord-profile'] });
      qc.invalidateQueries({ queryKey: ['landlords'] });
    },
  });
}

export function useRemovePropertyFromLandlord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ landlordId, unitId }: { landlordId: string; unitId: string }) =>
      api.delete(`/landlords/${landlordId}/properties/${unitId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-landlord-profile'] });
      qc.invalidateQueries({ queryKey: ['landlords'] });
    },
  });
}

// ─── LANDLORD-TENANT TREE ──────────────────────────────
export function useLandlordTenantTree(estateId: string) {
  return useQuery({
    queryKey: ['landlord-tenant-tree', estateId],
    queryFn: () => api.get(`/estates/${estateId}/tree`),
    enabled: !!estateId,
  });
}

// ─── RECEIPTS ────────────────────────────────────────────
export function useReceipts(page = 1, search?: string) {
  return useQuery({
    queryKey: ['receipts', page, search],
    queryFn: () => api.get(`/receipts?page=${page}${search ? `&search=${search}` : ''}`),
  });
}

export function useReceipt(id: string) {
  return useQuery({
    queryKey: ['receipts', id],
    queryFn: () => api.get(`/receipts/${id}`),
    enabled: !!id,
  });
}

export function useCreateReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/receipts', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['receipts'] }),
  });
}

// ─── PAYMENT GATEWAYS ────────────────────────────────────────
export function useAvailableGateways() {
  return useQuery({
    queryKey: ['payment-gateways'],
    queryFn: () => api.get('/payments/gateways'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useInitPaystack() {
  return useMutation({
    mutationFn: (data: { invoiceId: string; email: string; amount: number; callbackUrl?: string }) =>
      api.post('/payments/initialize/paystack', data),
  });
}

export function useInitHubtel() {
  return useMutation({
    mutationFn: (data: { invoiceId: string; amount: number; description?: string; customerName?: string; customerEmail?: string; customerPhone?: string }) =>
      api.post('/payments/initialize/hubtel', data),
  });
}

export function useVerifyPayment(reference: string) {
  return useQuery({
    queryKey: ['payment-verify', reference],
    queryFn: () => api.get(`/payments/verify/${reference}`),
    enabled: !!reference,
  });
}
