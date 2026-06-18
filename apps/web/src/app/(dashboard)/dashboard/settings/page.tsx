'use client';

import { useState, useRef } from 'react';
import { User, Bell, Shield, Palette, Globe, Camera, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth-store';

const roleLabels: Record<string, string> = {
  tenant: 'Tenant',
  landlord: 'Landlord',
  estate_manager: 'Estate Manager',
  super_admin: 'Super Admin',
};

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.firstName || 'Kwame';
  const lastName = user?.lastName || 'Boateng';
  const email = user?.email || 'manager@estateiq.com';
  const role = user?.role || 'estate_manager';
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5 MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /> <span className="hidden sm:inline">Profile</span></TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> <span className="hidden sm:inline">Notifications</span></TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /> <span className="hidden sm:inline">Security</span></TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2"><Palette className="h-4 w-4" /> <span className="hidden sm:inline">Appearance</span></TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          {/* Profile Picture Card */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Upload a photo for your profile. This will be visible to other estate members.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-gold/10 border-2 border-border flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-gold">{initials}</span>
                    )}
                  </div>
                  <button
                    className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-6 w-6 text-white" />
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div>
                    <p className="font-semibold text-lg">{firstName} {lastName}</p>
                    <div className="flex items-center gap-2 justify-center sm:justify-start mt-1">
                      <Badge variant="outline" className="text-xs">{roleLabels[role] || role}</Badge>
                      <span className="text-xs text-muted-foreground">{email}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center sm:justify-start">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
                      <Camera className="h-3.5 w-3.5" /> {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    {avatarPreview && (
                      <Button variant="ghost" size="sm" className="gap-1.5 text-destructive" onClick={() => setAvatarPreview(null)}>
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 5 MB.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={firstName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={lastName} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" defaultValue="+233 24 000 0002" />
              </div>
              <Separator />
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Payment Received', desc: 'Get notified when a payment is made', email: true, push: true },
                { label: 'New Maintenance Request', desc: 'When a resident submits a request', email: true, push: true },
                { label: 'Complaint Filed', desc: 'When a new complaint is logged', email: true, push: false },
                { label: 'Lease Expiring', desc: '30 days before lease expiration', email: true, push: true },
                { label: 'Visitor Arrival', desc: 'When a visitor checks in', email: false, push: true },
              ].map((pref, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{pref.label}</p>
                    <p className="text-xs text-muted-foreground">{pref.desc}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" defaultChecked={pref.email} className="rounded" /> Email
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" defaultChecked={pref.push} className="rounded" /> Push
                    </label>
                  </div>
                </div>
              ))}
              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and security options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
              <Separator />
              <Button>Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize your interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-sm">Theme</p>
                  <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Light</Button>
                  <Button variant="outline" size="sm">Dark</Button>
                  <Button variant="outline" size="sm">System</Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-sm">Language</p>
                  <p className="text-xs text-muted-foreground">Select your preferred language</p>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">English</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
