'use client';

import { useState } from 'react';
import { Users, Building2, Home, Phone, Mail, ChevronDown, ChevronRight, CreditCard, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/auth-store';

const demoTree = [
  {
    landlord: { id: 'L1', firstName: 'Nana', lastName: 'Akufo-Mensah', email: 'nana@email.com', phone: '+233 20 789 0123', avatarUrl: null },
    properties: [
      {
        unit: { id: 'U1', unitNumber: '00AC12', houseNumber: '00AC12', building: 'Block A - Bellavilla' },
        occupancyType: 'rented',
        tenants: [
          {
            id: 'T1', firstName: 'Kwame', lastName: 'Asante', email: 'kwame@email.com', phone: '+233 24 123 4567', avatarUrl: null,
            familyMembers: [
              { id: 'FM1', firstName: 'Ama', lastName: 'Asante', relationship: 'Spouse' },
              { id: 'FM2', firstName: 'Kofi', lastName: 'Asante', relationship: 'Son' },
              { id: 'FM3', firstName: 'Abena', lastName: 'Asante', relationship: 'Daughter' },
            ],
            leaseStart: '2024-01-01', leaseEnd: '2025-12-31',
          },
        ],
      },
      {
        unit: { id: 'U2', unitNumber: '00BD05', houseNumber: '00BD05', building: 'Block B - East Legon Hills' },
        occupancyType: 'self_occupied',
        tenants: [],
      },
      {
        unit: { id: 'U3', unitNumber: '00CE08', houseNumber: '00CE08', building: 'Block C - Rosavilla' },
        occupancyType: 'rented',
        tenants: [
          {
            id: 'T2', firstName: 'Efua', lastName: 'Mensah', email: 'efua@email.com', phone: '+233 50 321 7654', avatarUrl: null,
            familyMembers: [],
            leaseStart: '2024-06-01', leaseEnd: '2026-05-31',
          },
        ],
      },
    ],
  },
  {
    landlord: { id: 'L2', firstName: 'Dr. Kweku', lastName: 'Agyemang', email: 'kweku@email.com', phone: '+233 24 890 1234', avatarUrl: null },
    properties: [
      {
        unit: { id: 'U4', unitNumber: 'B-102', houseNumber: 'B-102', building: 'Block B - Emerald' },
        occupancyType: 'rented',
        tenants: [
          {
            id: 'T3', firstName: 'Kofi', lastName: 'Boateng', email: 'kofi@email.com', phone: '+233 27 345 6789', avatarUrl: null,
            familyMembers: [
              { id: 'FM4', firstName: 'Akua', lastName: 'Boateng', relationship: 'Spouse' },
            ],
            leaseStart: '2024-03-01', leaseEnd: '2026-01-15',
          },
        ],
      },
    ],
  },
  {
    landlord: { id: 'L3', firstName: 'Mrs. Efua', lastName: 'Appiah', email: 'efua.appiah@email.com', phone: '+233 27 901 2345', avatarUrl: null },
    properties: [
      {
        unit: { id: 'U5', unitNumber: 'KRG-01', houseNumber: 'KRG-01', building: 'Kumasi Royal Gardens' },
        occupancyType: 'rented',
        tenants: [
          {
            id: 'T5', firstName: 'Yaw', lastName: 'Darko', email: 'yaw@email.com', phone: '+233 26 567 8901', avatarUrl: null,
            familyMembers: [
              { id: 'FM5', firstName: 'Adwoa', lastName: 'Darko', relationship: 'Spouse' },
              { id: 'FM6', firstName: 'Kwabena', lastName: 'Darko', relationship: 'Son' },
            ],
            leaseStart: '2024-09-01', leaseEnd: '2025-09-30',
          },
        ],
      },
    ],
  },
];

export default function DirectoryPage() {
  const { isDemoMode } = useAuthStore();
  const [search, setSearch] = useState('');
  const [expandedLandlords, setExpandedLandlords] = useState<Set<string>>(new Set(demoTree.map(t => t.landlord.id)));
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  const tree = demoTree;

  const toggleLandlord = (id: string) => {
    const next = new Set(expandedLandlords);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedLandlords(next);
  };

  const toggleUnit = (id: string) => {
    const next = new Set(expandedUnits);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedUnits(next);
  };

  const totalLandlords = tree.length;
  const totalProperties = tree.reduce((s, t) => s + t.properties.length, 0);
  const totalTenants = tree.reduce((s, t) => s + t.properties.reduce((s2, p) => s2 + p.tenants.length, 0), 0);
  const totalOccupants = tree.reduce((s, t) => s + t.properties.reduce((s2, p) => s2 + p.tenants.reduce((s3, tn) => s3 + 1 + tn.familyMembers.length, 0), 0), 0);

  const filteredTree = search
    ? tree.filter(t => {
        const llName = `${t.landlord.firstName} ${t.landlord.lastName}`.toLowerCase();
        const hasTenantMatch = t.properties.some(p => p.tenants.some(tn => `${tn.firstName} ${tn.lastName}`.toLowerCase().includes(search.toLowerCase())));
        return llName.includes(search.toLowerCase()) || hasTenantMatch;
      })
    : tree;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Estate Directory</h1>
        <p className="text-muted-foreground">Landlord-tenant hierarchy tree view</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Users className="h-5 w-5 text-blue-600" /></div>
              <div><p className="text-sm text-muted-foreground">Landlords</p><p className="text-2xl font-bold">{totalLandlords}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><Building2 className="h-5 w-5 text-green-600" /></div>
              <div><p className="text-sm text-muted-foreground">Properties</p><p className="text-2xl font-bold">{totalProperties}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg"><Users className="h-5 w-5 text-purple-600" /></div>
              <div><p className="text-sm text-muted-foreground">Tenants</p><p className="text-2xl font-bold">{totalTenants}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg"><Users className="h-5 w-5 text-amber-600" /></div>
              <div><p className="text-sm text-muted-foreground">Total Occupants</p><p className="text-2xl font-bold">{totalOccupants}</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search landlords or tenants..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="space-y-3">
        {filteredTree.map((item) => (
          <Card key={item.landlord.id}>
            <CardContent className="pt-4 pb-2">
              {/* Landlord Row */}
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleLandlord(item.landlord.id)}>
                {expandedLandlords.has(item.landlord.id) ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={item.landlord.avatarUrl || ''} />
                  <AvatarFallback className="bg-gold text-navy-900 font-bold text-sm">
                    {item.landlord.firstName[0]}{item.landlord.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{item.landlord.firstName} {item.landlord.lastName}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{item.landlord.phone}</span>
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{item.landlord.email}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{item.properties.length} properties</Badge>
                  <Badge className="bg-navy-500 text-white">{item.properties.reduce((s, p) => s + p.tenants.length, 0)} tenants</Badge>
                </div>
              </div>

              {/* Properties */}
              {expandedLandlords.has(item.landlord.id) && (
                <div className="ml-12 mt-3 space-y-2">
                  {item.properties.map((prop) => (
                    <div key={prop.unit.id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleUnit(prop.unit.id)}>
                        {prop.tenants.length > 0 ? (
                          expandedUnits.has(prop.unit.id) ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : <Home className="h-3.5 w-3.5 text-muted-foreground" />}
                        <Home className="h-4 w-4 text-gold" />
                        <span className="font-medium text-sm">House {prop.unit.houseNumber}</span>
                        <span className="text-xs text-muted-foreground">({prop.unit.building})</span>
                        <Badge variant={prop.occupancyType === 'rented' ? 'default' : 'secondary'} className="ml-auto text-xs">
                          {prop.occupancyType === 'rented' ? 'Rented' : 'Self Occupied'}
                        </Badge>
                      </div>

                      {/* Tenants */}
                      {expandedUnits.has(prop.unit.id) && prop.tenants.length > 0 && (
                        <div className="ml-8 mt-2 space-y-2">
                          {prop.tenants.map((tenant) => (
                            <div key={tenant.id} className="border-l-2 border-gold pl-3 py-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-navy-500 text-white text-xs">
                                    {tenant.firstName[0]}{tenant.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{tenant.firstName} {tenant.lastName}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{tenant.phone}</span>
                                    <span>{tenant.email}</span>
                                  </div>
                                </div>
                              </div>
                              {tenant.familyMembers.length > 0 && (
                                <div className="ml-10 mt-1 flex flex-wrap gap-1">
                                  {tenant.familyMembers.map((fm) => (
                                    <Badge key={fm.id} variant="outline" className="text-xs">
                                      {fm.firstName} ({fm.relationship})
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
