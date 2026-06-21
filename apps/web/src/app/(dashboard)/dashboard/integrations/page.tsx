'use client';

import { useState, useEffect } from 'react';
import { Plug, CreditCard, MessageSquare, Mail, Map, Eye, EyeOff, Save, CheckCircle2, Loader2, Plus, Trash2, Settings2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useIntegrations, useUpdateIntegration, useToggleIntegration, useCreateIntegration, useDeleteIntegration } from '@/lib/hooks';

interface Integration {
  id: string;
  provider: string;
  category: string;
  displayName: string;
  description: string;
  isActive: boolean;
  isSandbox: boolean;
  isBuiltIn: boolean;
  credentials: Record<string, string>;
  config: Record<string, string>;
}

// Field definitions per built-in provider
const CREDENTIAL_FIELDS: Record<string, { key: string; label: string; placeholder: string }[]> = {
  paystack: [
    { key: 'publicKey', label: 'Public Key', placeholder: 'pk_test_...' },
    { key: 'secretKey', label: 'Secret Key', placeholder: 'sk_test_...' },
  ],
  hubtel: [
    { key: 'clientId', label: 'Client ID', placeholder: 'Enter Hubtel Client ID' },
    { key: 'clientSecret', label: 'Client Secret', placeholder: 'Enter Hubtel Client Secret' },
  ],
  resend: [
    { key: 'apiKey', label: 'API Key', placeholder: 're_...' },
  ],
  mnotify: [
    { key: 'apiKey', label: 'API Key', placeholder: 'Enter mNotify API Key' },
  ],
  google_maps: [
    { key: 'apiKey', label: 'API Key', placeholder: 'AIza...' },
  ],
};

const CONFIG_FIELDS: Record<string, { key: string; label: string; placeholder: string }[]> = {
  paystack: [
    { key: 'callbackUrl', label: 'Callback URL', placeholder: 'https://yourdomain.com/api/webhooks/paystack' },
  ],
  hubtel: [
    { key: 'merchantAccount', label: 'Merchant Account Number', placeholder: 'e.g. HM2706210001' },
    { key: 'callbackUrl', label: 'Callback URL', placeholder: 'https://yourdomain.com/api/webhooks/hubtel' },
  ],
  resend: [
    { key: 'fromEmail', label: 'From Email', placeholder: 'noreply@estateiq.app' },
    { key: 'fromName', label: 'From Name', placeholder: 'EstateIQ' },
  ],
  mnotify: [
    { key: 'senderId', label: 'Sender ID (max 11 chars)', placeholder: 'EstateIQ' },
  ],
  google_maps: [],
};

const CATEGORY_ICONS: Record<string, typeof CreditCard> = {
  payment: CreditCard,
  sms: MessageSquare,
  email: Mail,
  maps: Map,
};

const CATEGORY_COLORS: Record<string, string> = {
  payment: 'bg-blue-100 text-blue-700',
  sms: 'bg-purple-100 text-purple-700',
  email: 'bg-amber-100 text-amber-700',
  maps: 'bg-green-100 text-green-700',
  custom: 'bg-gray-100 text-gray-700',
};

export default function IntegrationsPage() {
  const { data: rawData, isLoading } = useIntegrations();
  const integrations: Integration[] = rawData?.data || rawData || [];
  const updateIntegration = useUpdateIntegration();
  const toggleIntegration = useToggleIntegration();
  const createIntegration = useCreateIntegration();
  const deleteIntegration = useDeleteIntegration();

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, { credentials: Record<string, string>; config: Record<string, string> }>>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newInt, setNewInt] = useState({ provider: '', displayName: '', category: 'custom', description: '' });
  const [newCredFields, setNewCredFields] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);
  const [newConfFields, setNewConfFields] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);

  // Initialize edits from loaded data
  useEffect(() => {
    if (!integrations.length) return;
    const init: typeof edits = {};
    for (const i of integrations) {
      if (!edits[i.provider]) {
        init[i.provider] = { credentials: { ...i.credentials }, config: { ...i.config } };
      }
    }
    if (Object.keys(init).length) setEdits((prev) => ({ ...init, ...prev }));
  }, [integrations]);

  const toggleKey = (key: string) => setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));

  const setCredField = (provider: string, key: string, value: string) => {
    setEdits((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], credentials: { ...prev[provider]?.credentials, [key]: value } },
    }));
  };

  const setConfField = (provider: string, key: string, value: string) => {
    setEdits((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], config: { ...prev[provider]?.config, [key]: value } },
    }));
  };

  const handleSave = (provider: string) => {
    const data = edits[provider];
    if (!data) return;
    updateIntegration.mutate(
      { provider, data },
      {
        onSuccess: () => { setSaved(provider); toast.success('Configuration saved'); setTimeout(() => setSaved(null), 2000); },
        onError: () => toast.error('Failed to save'),
      },
    );
  };

  const handleToggle = (provider: string, isActive: boolean) => {
    toggleIntegration.mutate(
      { provider, isActive },
      {
        onSuccess: () => toast.success(`${provider} ${isActive ? 'enabled' : 'disabled'}`),
        onError: () => toast.error('Failed to toggle'),
      },
    );
  };

  const handleDelete = (provider: string) => {
    if (!confirm(`Delete integration "${provider}"? This cannot be undone.`)) return;
    deleteIntegration.mutate(provider, {
      onSuccess: () => toast.success('Integration deleted'),
      onError: () => toast.error('Failed to delete'),
    });
  };

  const handleCreateCustom = () => {
    if (!newInt.provider || !newInt.displayName) { toast.error('Provider name and display name are required'); return; }
    const creds: Record<string, string> = {};
    for (const f of newCredFields) { if (f.key) creds[f.key] = f.value; }
    const conf: Record<string, string> = {};
    for (const f of newConfFields) { if (f.key) conf[f.key] = f.value; }
    createIntegration.mutate(
      { provider: newInt.provider, category: newInt.category, displayName: newInt.displayName, description: newInt.description, credentials: creds, config: conf },
      {
        onSuccess: () => {
          toast.success('Integration added');
          setShowAddDialog(false);
          setNewInt({ provider: '', displayName: '', category: 'custom', description: '' });
          setNewCredFields([{ key: '', value: '' }]);
          setNewConfFields([{ key: '', value: '' }]);
        },
        onError: () => toast.error('Failed to add integration'),
      },
    );
  };

  const MaskedInput = ({ id, value, onChange, placeholder }: { id: string; value: string; onChange: (v: string) => void; placeholder: string }) => (
    <div className="relative">
      <Input type={showKeys[id] ? 'text' : 'password'} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pr-10" />
      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => toggleKey(id)}>{showKeys[id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
    </div>
  );

  // Group integrations by category
  const byCategory = integrations.reduce<Record<string, Integration[]>>((acc, i) => {
    const cat = i.category || 'custom';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(i);
    return acc;
  }, {});

  const renderIntegrationCard = (item: Integration) => {
    const credFields = CREDENTIAL_FIELDS[item.provider] || Object.keys(item.credentials).map((k) => ({ key: k, label: k.replace(/([A-Z])/g, ' $1').replace(/^./, (s: string) => s.toUpperCase()), placeholder: `Enter ${k}` }));
    const confFields = CONFIG_FIELDS[item.provider] || Object.keys(item.config).map((k) => ({ key: k, label: k.replace(/([A-Z])/g, ' $1').replace(/^./, (s: string) => s.toUpperCase()), placeholder: `Enter ${k}` }));
    const Icon = CATEGORY_ICONS[item.category] || Settings2;
    const colorClass = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.custom;
    const providerEdits = edits[item.provider] || { credentials: { ...item.credentials }, config: { ...item.config } };

    return (
      <Card key={item.provider}>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}><Icon className="h-4 w-4" /></div>
              {item.displayName}
              {!item.isBuiltIn && <Badge variant="outline" className="text-[10px] ml-1">Custom</Badge>}
            </CardTitle>
            <CardDescription className="mt-1">{item.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {item.isSandbox && <Badge variant="warning">Sandbox</Badge>}
            <Badge variant={item.isActive ? 'success' : 'secondary'}>{item.isActive ? 'Active' : 'Disabled'}</Badge>
            <Button size="sm" variant={item.isActive ? 'destructive' : 'default'} onClick={() => handleToggle(item.provider, !item.isActive)}>
              {item.isActive ? 'Disable' : 'Enable'}
            </Button>
            {!item.isBuiltIn && (
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(item.provider)}><Trash2 className="h-4 w-4" /></Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {credFields.length > 0 && (
            <div className={`grid gap-4 ${credFields.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {credFields.map((f) => (
                <div key={f.key} className="space-y-2">
                  <Label>{f.label}</Label>
                  <MaskedInput id={`${item.provider}-${f.key}`} value={providerEdits.credentials[f.key] || ''} onChange={(v) => setCredField(item.provider, f.key, v)} placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          )}
          {confFields.length > 0 && (
            <div className={`grid gap-4 ${confFields.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {confFields.map((f) => (
                <div key={f.key} className="space-y-2">
                  <Label>{f.label}</Label>
                  <Input value={providerEdits.config[f.key] || ''} onChange={(e) => setConfField(item.provider, f.key, e.target.value)} placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={item.isSandbox} onChange={(e) => updateIntegration.mutate({ provider: item.provider, data: { isSandbox: e.target.checked } })} className="rounded" />
              <span className="text-sm">Sandbox / Test Mode</span>
            </label>
            <Button onClick={() => handleSave(item.provider)} className="gap-2 ml-auto" disabled={updateIntegration.isPending}>
              {saved === item.provider ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved === item.provider ? 'Saved!' : 'Save Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Integrations</h1>
          <p className="text-muted-foreground mt-1">Configure payment gateways, email, SMS providers, and third-party APIs</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Integration
        </Button>
      </div>

      <Tabs defaultValue="payment">
        <TabsList>
          <TabsTrigger value="payment" className="gap-2"><CreditCard className="h-4 w-4" /> Payments</TabsTrigger>
          <TabsTrigger value="email" className="gap-2"><Mail className="h-4 w-4" /> Email</TabsTrigger>
          <TabsTrigger value="sms" className="gap-2"><MessageSquare className="h-4 w-4" /> SMS</TabsTrigger>
          <TabsTrigger value="other" className="gap-2"><Plug className="h-4 w-4" /> Other</TabsTrigger>
        </TabsList>

        <TabsContent value="payment" className="space-y-6 mt-6">
          {(byCategory['payment'] || []).map(renderIntegrationCard)}
          {!(byCategory['payment'] || []).length && <p className="text-muted-foreground text-center py-8">No payment integrations configured</p>}
        </TabsContent>

        <TabsContent value="email" className="space-y-6 mt-6">
          {(byCategory['email'] || []).map(renderIntegrationCard)}
          {!(byCategory['email'] || []).length && <p className="text-muted-foreground text-center py-8">No email integrations configured</p>}
        </TabsContent>

        <TabsContent value="sms" className="space-y-6 mt-6">
          {(byCategory['sms'] || []).map(renderIntegrationCard)}
          {!(byCategory['sms'] || []).length && <p className="text-muted-foreground text-center py-8">No SMS integrations configured</p>}
        </TabsContent>

        <TabsContent value="other" className="space-y-6 mt-6">
          {[...(byCategory['maps'] || []), ...(byCategory['ai'] || []), ...(byCategory['custom'] || []), ...(byCategory['other'] || [])].map(renderIntegrationCard)}
          {![...(byCategory['maps'] || []), ...(byCategory['ai'] || []), ...(byCategory['custom'] || []), ...(byCategory['other'] || [])].length && <p className="text-muted-foreground text-center py-8">No other integrations configured</p>}
        </TabsContent>
      </Tabs>

      {/* ─── ADD CUSTOM INTEGRATION DIALOG ─────────────────────── */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Custom Integration</DialogTitle>
            <DialogDescription>Add any third-party API or service. You can define custom credential fields.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provider ID</Label>
                <Input value={newInt.provider} onChange={(e) => setNewInt({ ...newInt, provider: e.target.value.toLowerCase().replace(/\s+/g, '_') })} placeholder="e.g. stripe" />
                <p className="text-xs text-muted-foreground">Unique identifier, lowercase</p>
              </div>
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input value={newInt.displayName} onChange={(e) => setNewInt({ ...newInt, displayName: e.target.value })} placeholder="e.g. Stripe Payments" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <select value={newInt.category} onChange={(e) => setNewInt({ ...newInt, category: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="payment">Payment</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="maps">Maps</option>
                  <option value="ai">AI</option>
                  <option value="custom">Custom / Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={newInt.description} onChange={(e) => setNewInt({ ...newInt, description: e.target.value })} placeholder="Brief description" />
              </div>
            </div>

            {/* Dynamic credential fields */}
            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                API Credentials
                <Button type="button" variant="ghost" size="sm" onClick={() => setNewCredFields([...newCredFields, { key: '', value: '' }])}>
                  <Plus className="h-3 w-3 mr-1" /> Add Field
                </Button>
              </Label>
              {newCredFields.map((f, i) => (
                <div key={i} className="grid grid-cols-5 gap-2">
                  <Input className="col-span-2" placeholder="Field name (e.g. apiKey)" value={f.key} onChange={(e) => { const nf = [...newCredFields]; nf[i].key = e.target.value; setNewCredFields(nf); }} />
                  <Input className="col-span-2" placeholder="Value" type="password" value={f.value} onChange={(e) => { const nf = [...newCredFields]; nf[i].value = e.target.value; setNewCredFields(nf); }} />
                  {newCredFields.length > 1 && <Button variant="ghost" size="icon" onClick={() => setNewCredFields(newCredFields.filter((_, j) => j !== i))}><Trash2 className="h-3 w-3" /></Button>}
                </div>
              ))}
            </div>

            {/* Dynamic config fields */}
            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                Configuration
                <Button type="button" variant="ghost" size="sm" onClick={() => setNewConfFields([...newConfFields, { key: '', value: '' }])}>
                  <Plus className="h-3 w-3 mr-1" /> Add Field
                </Button>
              </Label>
              {newConfFields.map((f, i) => (
                <div key={i} className="grid grid-cols-5 gap-2">
                  <Input className="col-span-2" placeholder="Field name (e.g. webhookUrl)" value={f.key} onChange={(e) => { const nf = [...newConfFields]; nf[i].key = e.target.value; setNewConfFields(nf); }} />
                  <Input className="col-span-2" placeholder="Value" value={f.value} onChange={(e) => { const nf = [...newConfFields]; nf[i].value = e.target.value; setNewConfFields(nf); }} />
                  {newConfFields.length > 1 && <Button variant="ghost" size="icon" onClick={() => setNewConfFields(newConfFields.filter((_, j) => j !== i))}><Trash2 className="h-3 w-3" /></Button>}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateCustom} disabled={createIntegration.isPending} className="gap-2">
              {createIntegration.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
