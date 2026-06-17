'use client';

import { useState } from 'react';
import { Plug, CreditCard, MessageSquare, Shield, Eye, EyeOff, Save, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useIntegrations, useUpdateIntegration, useToggleIntegration } from '@/lib/hooks';

interface GatewayConfig {
  enabled: boolean;
  apiKey: string;
  secretKey: string;
  merchantId?: string;
  callbackUrl?: string;
  sandbox: boolean;
}

interface SmsConfig {
  enabled: boolean;
  apiKey: string;
  senderId: string;
  sandbox: boolean;
}

export default function IntegrationsPage() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<string | null>(null);

  // Payment Gateways
  const [hubtel, setHubtel] = useState<GatewayConfig>({ enabled: true, apiKey: '', secretKey: '', merchantId: '', callbackUrl: '', sandbox: true });
  const [paystack, setPaystack] = useState<GatewayConfig>({ enabled: false, apiKey: '', secretKey: '', callbackUrl: '', sandbox: true });
  const [flutterwave, setFlutterwave] = useState<GatewayConfig>({ enabled: false, apiKey: '', secretKey: '', callbackUrl: '', sandbox: true });

  // SMS Gateways
  const [mnotify, setMnotify] = useState<SmsConfig>({ enabled: true, apiKey: '', senderId: 'EstateIQ', sandbox: true });
  const [hubtelSms, setHubtelSms] = useState<SmsConfig>({ enabled: false, apiKey: '', senderId: 'EstateIQ', sandbox: true });
  const [twilio, setTwilio] = useState<SmsConfig & { authToken: string }>({ enabled: false, apiKey: '', senderId: '', authToken: '', sandbox: true });

  const updateIntegration = useUpdateIntegration();
  const toggleIntegration = useToggleIntegration();

  const toggleKey = (key: string) => setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = (section: string) => {
    const configs: Record<string, any> = { hubtel, paystack, flutterwave, mnotify, hubtelSms, twilio };
    updateIntegration.mutate(
      { provider: section, data: configs[section] },
      { onSettled: () => { setSaved(section); setTimeout(() => setSaved(null), 2000); } },
    );
  };

  const MaskedInput = ({ id, value, onChange, placeholder }: { id: string; value: string; onChange: (v: string) => void; placeholder: string }) => (
    <div className="relative">
      <Input
        type={showKeys[id] ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10"
      />
      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => toggleKey(id)}>
        {showKeys[id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-1">Configure payment gateways, SMS providers, and third-party APIs</p>
      </div>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments" className="gap-2"><CreditCard className="h-4 w-4" /> Payment Gateways</TabsTrigger>
          <TabsTrigger value="sms" className="gap-2"><MessageSquare className="h-4 w-4" /> SMS Gateways</TabsTrigger>
          <TabsTrigger value="other" className="gap-2"><Plug className="h-4 w-4" /> Other APIs</TabsTrigger>
        </TabsList>

        {/* ─── PAYMENT GATEWAYS ─────────────────────────────────── */}
        <TabsContent value="payments" className="space-y-6 mt-6">
          {/* Hubtel */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><CreditCard className="h-4 w-4 text-green-700" /></div>
                  Hubtel Payment Gateway
                </CardTitle>
                <CardDescription>Accept mobile money (MTN, Vodafone, AirtelTigo) and card payments via Hubtel</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {hubtel.sandbox && <Badge variant="warning">Sandbox</Badge>}
                <Badge variant={hubtel.enabled ? 'success' : 'secondary'}>{hubtel.enabled ? 'Active' : 'Disabled'}</Badge>
                <Button size="sm" variant={hubtel.enabled ? 'destructive' : 'default'} onClick={() => setHubtel({ ...hubtel, enabled: !hubtel.enabled })}>
                  {hubtel.enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <MaskedInput id="hubtel-client" value={hubtel.apiKey} onChange={(v) => setHubtel({ ...hubtel, apiKey: v })} placeholder="Enter Hubtel Client ID" />
                </div>
                <div className="space-y-2">
                  <Label>Client Secret</Label>
                  <MaskedInput id="hubtel-secret" value={hubtel.secretKey} onChange={(v) => setHubtel({ ...hubtel, secretKey: v })} placeholder="Enter Hubtel Client Secret" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Merchant Account Number</Label>
                  <Input value={hubtel.merchantId} onChange={(e) => setHubtel({ ...hubtel, merchantId: e.target.value })} placeholder="e.g. HM2706210001" />
                </div>
                <div className="space-y-2">
                  <Label>Callback URL</Label>
                  <Input value={hubtel.callbackUrl} onChange={(e) => setHubtel({ ...hubtel, callbackUrl: e.target.value })} placeholder="https://yourdomain.com/api/webhooks/hubtel" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={hubtel.sandbox} onChange={(e) => setHubtel({ ...hubtel, sandbox: e.target.checked })} className="rounded" />
                  <span className="text-sm">Sandbox/Test Mode</span>
                </label>
                <Button onClick={() => handleSave('hubtel')} className="gap-2 ml-auto">
                  {saved === 'hubtel' ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saved === 'hubtel' ? 'Saved!' : 'Save Configuration'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Paystack */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><CreditCard className="h-4 w-4 text-blue-700" /></div>
                  Paystack
                </CardTitle>
                <CardDescription>Accept payments via Paystack (cards, mobile money, bank transfers)</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {paystack.sandbox && <Badge variant="warning">Sandbox</Badge>}
                <Badge variant={paystack.enabled ? 'success' : 'secondary'}>{paystack.enabled ? 'Active' : 'Disabled'}</Badge>
                <Button size="sm" variant={paystack.enabled ? 'destructive' : 'default'} onClick={() => setPaystack({ ...paystack, enabled: !paystack.enabled })}>
                  {paystack.enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Public Key</Label>
                  <MaskedInput id="paystack-pub" value={paystack.apiKey} onChange={(v) => setPaystack({ ...paystack, apiKey: v })} placeholder="pk_test_..." />
                </div>
                <div className="space-y-2">
                  <Label>Secret Key</Label>
                  <MaskedInput id="paystack-secret" value={paystack.secretKey} onChange={(v) => setPaystack({ ...paystack, secretKey: v })} placeholder="sk_test_..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Callback URL</Label>
                <Input value={paystack.callbackUrl} onChange={(e) => setPaystack({ ...paystack, callbackUrl: e.target.value })} placeholder="https://yourdomain.com/api/webhooks/paystack" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={paystack.sandbox} onChange={(e) => setPaystack({ ...paystack, sandbox: e.target.checked })} className="rounded" />
                  <span className="text-sm">Test Mode</span>
                </label>
                <Button onClick={() => handleSave('paystack')} className="gap-2 ml-auto">
                  {saved === 'paystack' ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saved === 'paystack' ? 'Saved!' : 'Save Configuration'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Flutterwave */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center"><CreditCard className="h-4 w-4 text-orange-700" /></div>
                  Flutterwave
                </CardTitle>
                <CardDescription>Accept international card payments and mobile money via Flutterwave</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {flutterwave.sandbox && <Badge variant="warning">Sandbox</Badge>}
                <Badge variant={flutterwave.enabled ? 'success' : 'secondary'}>{flutterwave.enabled ? 'Active' : 'Disabled'}</Badge>
                <Button size="sm" variant={flutterwave.enabled ? 'destructive' : 'default'} onClick={() => setFlutterwave({ ...flutterwave, enabled: !flutterwave.enabled })}>
                  {flutterwave.enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Public Key</Label>
                  <MaskedInput id="flw-pub" value={flutterwave.apiKey} onChange={(v) => setFlutterwave({ ...flutterwave, apiKey: v })} placeholder="FLWPUBK_TEST-..." />
                </div>
                <div className="space-y-2">
                  <Label>Secret Key</Label>
                  <MaskedInput id="flw-secret" value={flutterwave.secretKey} onChange={(v) => setFlutterwave({ ...flutterwave, secretKey: v })} placeholder="FLWSECK_TEST-..." />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={flutterwave.sandbox} onChange={(e) => setFlutterwave({ ...flutterwave, sandbox: e.target.checked })} className="rounded" />
                  <span className="text-sm">Test Mode</span>
                </label>
                <Button onClick={() => handleSave('flutterwave')} className="gap-2 ml-auto">
                  {saved === 'flutterwave' ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saved === 'flutterwave' ? 'Saved!' : 'Save Configuration'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── SMS GATEWAYS ────────────────────────────────────── */}
        <TabsContent value="sms" className="space-y-6 mt-6">
          {/* mNotify */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"><MessageSquare className="h-4 w-4 text-purple-700" /></div>
                  mNotify SMS Gateway
                </CardTitle>
                <CardDescription>Send SMS notifications to tenants and staff via mNotify (Ghana)</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={mnotify.enabled ? 'success' : 'secondary'}>{mnotify.enabled ? 'Active' : 'Disabled'}</Badge>
                <Button size="sm" variant={mnotify.enabled ? 'destructive' : 'default'} onClick={() => setMnotify({ ...mnotify, enabled: !mnotify.enabled })}>
                  {mnotify.enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <MaskedInput id="mnotify-key" value={mnotify.apiKey} onChange={(v) => setMnotify({ ...mnotify, apiKey: v })} placeholder="Enter mNotify API Key" />
                </div>
                <div className="space-y-2">
                  <Label>Sender ID</Label>
                  <Input value={mnotify.senderId} onChange={(e) => setMnotify({ ...mnotify, senderId: e.target.value })} placeholder="e.g. EstateIQ" maxLength={11} />
                  <p className="text-xs text-muted-foreground">Max 11 characters, no spaces</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={mnotify.sandbox} onChange={(e) => setMnotify({ ...mnotify, sandbox: e.target.checked })} className="rounded" />
                  <span className="text-sm">Sandbox Mode</span>
                </label>
                <Button onClick={() => handleSave('mnotify')} className="gap-2 ml-auto">
                  {saved === 'mnotify' ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saved === 'mnotify' ? 'Saved!' : 'Save Configuration'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Hubtel SMS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><MessageSquare className="h-4 w-4 text-green-700" /></div>
                  Hubtel SMS
                </CardTitle>
                <CardDescription>Send SMS via Hubtel Messaging API (Ghana)</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={hubtelSms.enabled ? 'success' : 'secondary'}>{hubtelSms.enabled ? 'Active' : 'Disabled'}</Badge>
                <Button size="sm" variant={hubtelSms.enabled ? 'destructive' : 'default'} onClick={() => setHubtelSms({ ...hubtelSms, enabled: !hubtelSms.enabled })}>
                  {hubtelSms.enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>API Key (Client ID)</Label>
                  <MaskedInput id="hubtel-sms-key" value={hubtelSms.apiKey} onChange={(v) => setHubtelSms({ ...hubtelSms, apiKey: v })} placeholder="Enter Hubtel Client ID" />
                </div>
                <div className="space-y-2">
                  <Label>Sender ID</Label>
                  <Input value={hubtelSms.senderId} onChange={(e) => setHubtelSms({ ...hubtelSms, senderId: e.target.value })} placeholder="e.g. EstateIQ" maxLength={11} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button onClick={() => handleSave('hubtelSms')} className="gap-2 ml-auto">
                  {saved === 'hubtelSms' ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saved === 'hubtelSms' ? 'Saved!' : 'Save Configuration'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Twilio */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center"><MessageSquare className="h-4 w-4 text-red-700" /></div>
                  Twilio (International)
                </CardTitle>
                <CardDescription>Send SMS/WhatsApp notifications via Twilio</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={twilio.enabled ? 'success' : 'secondary'}>{twilio.enabled ? 'Active' : 'Disabled'}</Badge>
                <Button size="sm" variant={twilio.enabled ? 'destructive' : 'default'} onClick={() => setTwilio({ ...twilio, enabled: !twilio.enabled })}>
                  {twilio.enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account SID</Label>
                  <MaskedInput id="twilio-sid" value={twilio.apiKey} onChange={(v) => setTwilio({ ...twilio, apiKey: v })} placeholder="ACxxxxxxxxxxxxxxx" />
                </div>
                <div className="space-y-2">
                  <Label>Auth Token</Label>
                  <MaskedInput id="twilio-token" value={twilio.authToken} onChange={(v) => setTwilio({ ...twilio, authToken: v })} placeholder="Enter Auth Token" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone Number / Sender</Label>
                <Input value={twilio.senderId} onChange={(e) => setTwilio({ ...twilio, senderId: e.target.value })} placeholder="+1234567890" />
              </div>
              <div className="flex items-center gap-4">
                <Button onClick={() => handleSave('twilio')} className="gap-2 ml-auto">
                  {saved === 'twilio' ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saved === 'twilio' ? 'Saved!' : 'Save Configuration'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── OTHER APIs ──────────────────────────────────────── */}
        <TabsContent value="other" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Google Maps API</CardTitle>
              <CardDescription>Used for estate location mapping and address autocomplete</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <MaskedInput id="gmaps-key" value="" onChange={() => {}} placeholder="Enter Google Maps API Key" />
              </div>
              <Button onClick={() => handleSave('gmaps')} className="gap-2">
                {saved === 'gmaps' ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved === 'gmaps' ? 'Saved!' : 'Save'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Service (SendGrid)</CardTitle>
              <CardDescription>Used for transactional emails — receipts, lease reminders, notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <MaskedInput id="sendgrid-key" value="" onChange={() => {}} placeholder="SG.xxxxxxx" />
                </div>
                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input placeholder="noreply@estateiq.com" />
                </div>
              </div>
              <Button onClick={() => handleSave('sendgrid')} className="gap-2">
                {saved === 'sendgrid' ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved === 'sendgrid' ? 'Saved!' : 'Save'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>OpenAI / AI Assistant</CardTitle>
              <CardDescription>Powers AI-based insights, auto-categorization, and chatbot features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <MaskedInput id="openai-key" value="" onChange={() => {}} placeholder="sk-xxxxxxx" />
              </div>
              <Button onClick={() => handleSave('openai')} className="gap-2">
                {saved === 'openai' ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved === 'openai' ? 'Saved!' : 'Save'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
