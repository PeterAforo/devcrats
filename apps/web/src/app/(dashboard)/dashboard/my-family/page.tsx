'use client';

import { useState } from 'react';
import { Users, User, Phone, Calendar, CreditCard, Camera, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth-store';

const demoFamilyMembers = [
  {
    id: 'FM1',
    firstName: 'Ama',
    lastName: 'Asante',
    relationship: 'Spouse',
    dateOfBirth: '1992-03-15',
    phone: '+233 24 555 6789',
    photoUrl: null,
    idType: 'ghana_card',
    idNumber: 'GHA-987654321-0',
  },
  {
    id: 'FM2',
    firstName: 'Kofi',
    lastName: 'Asante',
    relationship: 'Son',
    dateOfBirth: '2015-08-20',
    phone: null,
    photoUrl: null,
    idType: null,
    idNumber: null,
  },
  {
    id: 'FM3',
    firstName: 'Abena',
    lastName: 'Asante',
    relationship: 'Daughter',
    dateOfBirth: '2018-12-05',
    phone: null,
    photoUrl: null,
    idType: null,
    idNumber: null,
  },
];

function calculateAge(dob: string): number {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

export default function MyFamilyPage() {
  const { isDemoMode } = useAuthStore();
  const familyMembers = demoFamilyMembers;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">My Family</h1>
          <p className="text-muted-foreground">Family members registered with your tenancy</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {familyMembers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No family members registered</p>
            <p className="text-muted-foreground">Your landlord can add family members to your tenancy profile.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {familyMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={member.photoUrl || ''} alt={member.firstName} />
                    <AvatarFallback className="bg-navy-500 text-white font-bold">
                      {member.firstName[0]}{member.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{member.firstName} {member.lastName}</h3>
                    <Badge variant="outline" className="mt-1">{member.relationship}</Badge>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {member.dateOfBirth && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(member.dateOfBirth).toLocaleDateString('en-GH', { year: 'numeric', month: 'short', day: 'numeric' })}
                        <span className="text-muted-foreground ml-1">({calculateAge(member.dateOfBirth)} yrs)</span>
                      </span>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {member.idNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span>{member.idType === 'ghana_card' ? 'Ghana Card' : 'Passport'}: {member.idNumber}</span>
                    </div>
                  )}
                  {!member.photoUrl && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <Camera className="h-4 w-4" />
                      <span>Photo required</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">
            Family member information is managed by your landlord. To request changes, submit a change request from your profile settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
