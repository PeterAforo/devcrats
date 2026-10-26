'use client';

import { useState, useRef, useMemo } from 'react';
import { FileText, Upload, Search, Download, Eye, FolderOpen, Loader2, Trash2, Lock, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDocuments, useUploadDocument, useDeleteDocument } from '@/lib/hooks';
import { useAuthStore } from '@/store/auth-store';

interface Doc {
  id: string;
  name: string;
  category: string;
  size: string;
  type: string;
  uploaded: string;
  uploadedBy: string;
  url: string;
}

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1').replace(/\/api\/v1\/?$/, '');
const resolveUrl = (u?: string) => (!u ? '' : u.startsWith('http') ? u : `${API_ORIGIN}${u}`);

const categoryColors: Record<string, string> = {
  Lease: 'info', Insurance: 'success', Compliance: 'warning', Meeting: 'secondary',
  Financial: 'default', Contract: 'outline', General: 'secondary', 'ID Document': 'warning',
  'Move-in Report': 'info', lease: 'info', other: 'secondary',
};

function formatSize(bytes?: number) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');

  const user = useAuthStore((s) => s.user);
  const role = user?.role || 'tenant';
  const isTenant = role === 'tenant';
  const isLandlord = role === 'landlord';
  const isAdmin = role === 'super_admin' || role === 'estate_manager';

  const { data: apiData, isLoading } = useDocuments();
  const uploadDoc = useUploadDocument();
  const deleteDoc = useDeleteDocument();

  const apiDocs: Doc[] = apiData?.data
    ? apiData.data.map((d: any) => ({
        id: d.id,
        name: d.title || d.fileName,
        category: d.type || 'General',
        size: formatSize(d.fileSize),
        type: (d.mimeType?.split('/')[1] || 'file').toUpperCase(),
        uploaded: new Date(d.createdAt).toISOString().split('T')[0],
        uploadedBy: 'User',
        url: resolveUrl(d.fileUrl),
      }))
    : [];

  const documents = useMemo(() => {
    let filtered = apiDocs;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((d) => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q));
    }
    return filtered;
  }, [apiDocs, search]);

  const leaseCount = documents.filter((d) => d.category === 'Lease').length;
  const canUpload = isAdmin;
  const canDelete = isAdmin;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    uploadDoc.mutate(formData);
    e.target.value = '';
  };

  const pageTitle = isTenant ? 'My Documents' : isLandlord ? 'Property Documents' : 'Documents';
  const pageDesc = isTenant
    ? 'View your lease agreements, ID copies, and estate documents'
    : isLandlord
      ? 'View documents related to your properties and tenants'
      : 'Store and manage all estate documents';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">{pageTitle}</h1>
          <p className="text-muted-foreground mt-1">{pageDesc}</p>
        </div>
        {canUpload && (
          <div>
            <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx,.jpg,.png,.webp" />
            <Button className="gap-2" size="sm" onClick={() => fileRef.current?.click()} disabled={uploadDoc.isPending}>
              {uploadDoc.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload Document
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-5 flex items-center gap-3"><FolderOpen className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">{documents.length}</p><p className="text-xs text-muted-foreground">{isTenant ? 'Your Documents' : 'Total Documents'}</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-3"><FileText className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">{leaseCount}</p><p className="text-xs text-muted-foreground">Lease Agreements</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-3"><FileText className="h-8 w-8 text-orange-500" /><div><p className="text-2xl font-bold">{documents.filter((d) => d.category === 'ID Document').length}</p><p className="text-xs text-muted-foreground">ID Documents</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-3"><ShieldCheck className="h-8 w-8 text-purple-500" /><div><p className="text-2xl font-bold">{new Set(documents.map((d) => d.category)).size}</p><p className="text-xs text-muted-foreground">Categories</p></div></CardContent></Card>
      </div>

      {/* Role-based info banner */}
      {isTenant && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Lock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold">Your Documents</p>
            <p className="text-xs mt-0.5">You can view documents related to your tenancy — lease agreements, ID copies, move-in reports, and shared estate notices. Contact your estate manager to request additional documents.</p>
          </div>
        </div>
      )}
      {isLandlord && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <FolderOpen className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold">Property Documents</p>
            <p className="text-xs mt-0.5">Showing documents related to your properties and their tenants, plus shared estate documents.</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isAdmin ? 'All Documents' : 'Documents'}</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search documents..." className="pl-9 w-48 sm:w-60" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                {isAdmin && <TableHead>By</TableHead>}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline mr-2" />Loading documents...</TableCell></TableRow>
              ) : documents.length === 0 ? (
                <TableRow><TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-10 text-muted-foreground">No documents found</TableCell></TableRow>
              ) : (
                documents.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell><Badge variant={categoryColors[d.category] as any}>{d.category}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{d.type}</Badge></TableCell>
                    <TableCell>{d.size}</TableCell>
                    <TableCell>{d.uploaded}</TableCell>
                    {isAdmin && <TableCell>{d.uploadedBy}</TableCell>}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!d.url} onClick={() => window.open(d.url, '_blank')}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!d.url} onClick={() => { const a = document.createElement('a'); a.href = d.url; a.download = d.name; a.target = '_blank'; a.click(); }}><Download className="h-4 w-4" /></Button>
                        {canDelete && <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteDoc.mutate(d.id)}><Trash2 className="h-4 w-4" /></Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
