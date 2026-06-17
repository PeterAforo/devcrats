'use client';

import { useState, useRef } from 'react';
import { FileText, Upload, Search, Download, Eye, FolderOpen, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDocuments, useUploadDocument, useDeleteDocument } from '@/lib/hooks';

const mockDocuments = [
  { id: '1', name: 'Lease Agreement — Kwame Asante — A-101', category: 'Lease', size: '2.4 MB', type: 'PDF', uploaded: '2024-01-01', uploadedBy: 'Manager' },
  { id: '2', name: 'Lease Agreement — Ama Mensah — A-203', category: 'Lease', size: '2.1 MB', type: 'PDF', uploaded: '2024-03-15', uploadedBy: 'Manager' },
  { id: '3', name: 'Insurance Certificate — 2024', category: 'Insurance', size: '1.8 MB', type: 'PDF', uploaded: '2024-01-10', uploadedBy: 'Admin' },
  { id: '4', name: 'Fire Safety Inspection Report', category: 'Compliance', size: '3.2 MB', type: 'PDF', uploaded: '2024-06-20', uploadedBy: 'Admin' },
  { id: '5', name: 'AGM Minutes — Nov 2024', category: 'Meeting', size: '450 KB', type: 'DOCX', uploaded: '2024-11-18', uploadedBy: 'Manager' },
  { id: '6', name: 'Monthly Financial Report — Jan 2025', category: 'Financial', size: '1.1 MB', type: 'XLSX', uploaded: '2025-02-01', uploadedBy: 'Admin' },
  { id: '7', name: 'Maintenance SLA — CoolAir Ghana', category: 'Contract', size: '890 KB', type: 'PDF', uploaded: '2024-04-01', uploadedBy: 'Manager' },
  { id: '8', name: 'Estate Rules & Regulations', category: 'General', size: '320 KB', type: 'PDF', uploaded: '2023-08-01', uploadedBy: 'Admin' },
];

const categoryColors: Record<string, string> = { Lease: 'info', Insurance: 'success', Compliance: 'warning', Meeting: 'secondary', Financial: 'default', Contract: 'outline', General: 'secondary', lease: 'info', other: 'secondary' };

function formatSize(bytes?: number) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: apiData, isLoading } = useDocuments();
  const uploadDoc = useUploadDocument();
  const deleteDoc = useDeleteDocument();

  const documents = apiData?.data
    ? apiData.data.map((d: any) => ({
        id: d.id,
        name: d.title || d.fileName,
        category: d.type || 'General',
        size: formatSize(d.fileSize),
        type: (d.mimeType?.split('/')[1] || 'file').toUpperCase(),
        uploaded: new Date(d.createdAt).toISOString().split('T')[0],
        uploadedBy: 'User',
      }))
    : mockDocuments;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    uploadDoc.mutate(formData);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Documents</h1>
          <p className="text-muted-foreground mt-1">Store and manage estate documents</p>
        </div>
        <div>
          <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx,.jpg,.png,.webp" />
          <Button className="gap-2" onClick={() => fileRef.current?.click()} disabled={uploadDoc.isPending}>
            {uploadDoc.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload Document
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-5 flex items-center gap-3"><FolderOpen className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">{documents.length}</p><p className="text-xs text-muted-foreground">Total Documents</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-3"><FileText className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">5</p><p className="text-xs text-muted-foreground">Lease Agreements</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-3"><FileText className="h-8 w-8 text-orange-500" /><div><p className="text-2xl font-bold">12.3 MB</p><p className="text-xs text-muted-foreground">Total Storage</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-3"><FileText className="h-8 w-8 text-purple-500" /><div><p className="text-2xl font-bold">3</p><p className="text-xs text-muted-foreground">Uploaded This Month</p></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Documents</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search documents..." className="pl-9 w-60" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((d: any) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell><Badge variant={categoryColors[d.category] as any}>{d.category}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{d.type}</Badge></TableCell>
                  <TableCell>{d.size}</TableCell>
                  <TableCell>{d.uploaded}</TableCell>
                  <TableCell>{d.uploadedBy}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteDoc.mutate(d.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
