'use client';

import { useState, useEffect } from 'react';
import { useGateAccessStore } from '@/store/gate-access-store';
import { useAuthStore } from '@/store/auth-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Users, Car, AlertTriangle, LogOut, Clock, Plus, Edit, Trash2 } from 'lucide-react';

export default function GateAccessPage() {
  const { user } = useAuthStore();
  const {
    gates,
    activeShifts,
    accessPasses,
    gateLogs,
    activeVisitors,
    vehicles,
    blacklist,
    isLoading,
    fetchGates,
    fetchActiveShifts,
    fetchAccessPasses,
    fetchGateLogs,
    fetchActiveVisitors,
    fetchVehicles,
    fetchBlacklist,
    createGate,
    startShift,
    createAccessPass,
    registerVehicle,
    addToBlacklist,
    checkInWalkIn,
    checkOut,
  } = useGateAccessStore();

  const [activeTab, setActiveTab] = useState('gates');
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'gate' | 'shift' | 'pass' | 'vehicle' | 'blacklist' | 'checkin'>('gate');

  useEffect(() => {
    if (user?.estateId) {
      fetchGates(user.estateId);
      fetchActiveShifts(user.estateId);
      fetchAccessPasses(user.estateId);
      fetchGateLogs(user.estateId);
      fetchActiveVisitors(user.estateId);
      fetchVehicles(user.estateId);
      fetchBlacklist(user.estateId);
    }
  }, [user?.estateId]);

  const handleCreate = async (data: any) => {
    try {
      if (dialogType === 'gate') await createGate(data);
      if (dialogType === 'shift') await startShift(data);
      if (dialogType === 'pass') await createAccessPass(data);
      if (dialogType === 'vehicle') await registerVehicle(data);
      if (dialogType === 'blacklist') await addToBlacklist(data);
      if (dialogType === 'checkin') await checkInWalkIn(data);
      setShowDialog(false);
      // Refresh data
      if (user?.estateId) {
        fetchGates(user.estateId);
        fetchActiveShifts(user.estateId);
        fetchAccessPasses(user.estateId);
        fetchGateLogs(user.estateId);
        fetchActiveVisitors(user.estateId);
        fetchVehicles(user.estateId);
        fetchBlacklist(user.estateId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gate Access Control</h1>
          <p className="text-muted-foreground">Manage gates, guard shifts, access passes, and visitor logs</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="gates">Gates</TabsTrigger>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
          <TabsTrigger value="passes">Passes</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="blacklist">Blacklist</TabsTrigger>
        </TabsList>

        {/* Gates Tab */}
        <TabsContent value="gates">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Estate Gates</CardTitle>
                  <CardDescription>Manage entry and exit points</CardDescription>
                </div>
                <Dialog open={showDialog && dialogType === 'gate'} onOpenChange={(open) => { setShowDialog(open); setDialogType('gate'); }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setShowDialog(true); setDialogType('gate'); }}>
                      <Plus className="mr-2 h-4 w-4" /> Add Gate
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Gate</DialogTitle>
                      <DialogDescription>Create a new gate entry point</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); handleCreate({ estateId: user?.estateId, name: (e.currentTarget as any).name.value, type: (e.currentTarget as any).type.value }); }}>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="name">Gate Name</Label>
                          <Input id="name" placeholder="Main Gate" required />
                        </div>
                        <div>
                          <Label htmlFor="type">Gate Type</Label>
                          <Select name="type" defaultValue="entry_exit">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="entry">Entry Only</SelectItem>
                              <SelectItem value="exit">Exit Only</SelectItem>
                              <SelectItem value="entry_exit">Entry & Exit</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button type="submit" className="w-full">Create Gate</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gates.map((gate) => (
                    <TableRow key={gate.id}>
                      <TableCell className="font-medium">{gate.name}</TableCell>
                      <TableCell>{gate.type.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Badge variant={gate.isActive ? 'default' : 'secondary'}>
                          {gate.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guard Shifts Tab */}
        <TabsContent value="shifts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Guard Shifts</CardTitle>
                  <CardDescription>Active and historical guard shifts</CardDescription>
                </div>
                <Dialog open={showDialog && dialogType === 'shift'} onOpenChange={(open) => { setShowDialog(open); setDialogType('shift'); }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setShowDialog(true); setDialogType('shift'); }}>
                      <Clock className="mr-2 h-4 w-4" /> Start Shift
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Start Guard Shift</DialogTitle>
                      <DialogDescription>Begin a new guard shift at a gate</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); handleCreate({ estateId: user?.estateId, gateId: (e.currentTarget as any).gateId.value, guardId: user?.id, notes: (e.currentTarget as any).notes.value }); }}>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="gateId">Gate</Label>
                          <Select name="gateId" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gate" />
                            </SelectTrigger>
                            <SelectContent>
                              {gates.map((gate) => (
                                <SelectItem key={gate.id} value={gate.id}>{gate.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="notes">Notes (optional)</Label>
                          <Input id="notes" placeholder="Any special instructions" />
                        </div>
                      </div>
                      <Button type="submit" className="w-full">Start Shift</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Active Shifts</h3>
                  {activeShifts.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No active shifts</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Guard</TableHead>
                          <TableHead>Gate</TableHead>
                          <TableHead>Start Time</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeShifts.map((shift) => (
                          <TableRow key={shift.id}>
                            <TableCell>{shift.guard?.firstName} {shift.guard?.lastName}</TableCell>
                            <TableCell>{shift.gate?.name}</TableCell>
                            <TableCell>{new Date(shift.startTime).toLocaleString()}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" onClick={() => checkOut(shift.id)}>
                                <LogOut className="mr-2 h-3 w-3" /> End Shift
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Passes Tab */}
        <TabsContent value="passes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Access Passes</CardTitle>
                  <CardDescription>Worker, contractor, and service passes</CardDescription>
                </div>
                <Dialog open={showDialog && dialogType === 'pass'} onOpenChange={(open) => { setShowDialog(open); setDialogType('pass'); }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setShowDialog(true); setDialogType('pass'); }}>
                      <Shield className="mr-2 h-4 w-4" /> Create Pass
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Access Pass</DialogTitle>
                      <DialogDescription>Generate a new access pass with PIN</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); handleCreate({ estateId: user?.estateId, holderName: (e.currentTarget as any).holderName.value, holderPhone: (e.currentTarget as any).holderPhone.value, passType: (e.currentTarget as any).passType.value, company: (e.currentTarget as any).company.value, validFrom: new Date().toISOString(), validUntil: (e.currentTarget as any).validUntil.value, allowedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }); }}>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="holderName">Holder Name</Label>
                          <Input id="holderName" required />
                        </div>
                        <div>
                          <Label htmlFor="holderPhone">Phone (optional)</Label>
                          <Input id="holderPhone" />
                        </div>
                        <div>
                          <Label htmlFor="passType">Pass Type</Label>
                          <Select name="passType" required>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="worker">Worker</SelectItem>
                              <SelectItem value="contractor">Contractor</SelectItem>
                              <SelectItem value="delivery">Delivery</SelectItem>
                              <SelectItem value="service">Service</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="company">Company (optional)</Label>
                          <Input id="company" />
                        </div>
                        <div>
                          <Label htmlFor="validUntil">Valid Until</Label>
                          <Input id="validUntil" type="date" required />
                        </div>
                      </div>
                      <Button type="submit" className="w-full">Create Pass</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Holder</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>PIN</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessPasses.map((pass) => (
                    <TableRow key={pass.id}>
                      <TableCell className="font-medium">{pass.holderName}</TableCell>
                      <TableCell>{pass.passType}</TableCell>
                      <TableCell>{pass.company || '-'}</TableCell>
                      <TableCell className="font-mono">{pass.pin}</TableCell>
                      <TableCell>{new Date(pass.validUntil).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={pass.isActive ? 'default' : 'secondary'}>
                          {pass.isActive ? 'Active' : 'Revoked'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gate Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gate Logs</CardTitle>
                  <CardDescription>Entry and exit records</CardDescription>
                </div>
                <Dialog open={showDialog && dialogType === 'checkin'} onOpenChange={(open) => { setShowDialog(open); setDialogType('checkin'); }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setShowDialog(true); setDialogType('checkin'); }}>
                      <Users className="mr-2 h-4 w-4" /> Walk-in Check-in
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Walk-in Check-in</DialogTitle>
                      <DialogDescription>Register a walk-in visitor</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); handleCreate({ estateId: user?.estateId, gateId: (e.currentTarget as any).gateId.value, visitorName: (e.currentTarget as any).visitorName.value, visitorPhone: (e.currentTarget as any).visitorPhone.value, purpose: (e.currentTarget as any).purpose.value, vehiclePlate: (e.currentTarget as any).vehiclePlate.value, notes: (e.currentTarget as any).notes.value }); }}>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="gateId">Gate</Label>
                          <Select name="gateId" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gate" />
                            </SelectTrigger>
                            <SelectContent>
                              {gates.map((gate) => (
                                <SelectItem key={gate.id} value={gate.id}>{gate.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="visitorName">Visitor Name</Label>
                          <Input id="visitorName" required />
                        </div>
                        <div>
                          <Label htmlFor="visitorPhone">Phone (optional)</Label>
                          <Input id="visitorPhone" />
                        </div>
                        <div>
                          <Label htmlFor="purpose">Purpose</Label>
                          <Input id="purpose" required />
                        </div>
                        <div>
                          <Label htmlFor="vehiclePlate">Vehicle Plate (optional)</Label>
                          <Input id="vehiclePlate" />
                        </div>
                        <div>
                          <Label htmlFor="notes">Notes (optional)</Label>
                          <Input id="notes" />
                        </div>
                      </div>
                      <Button type="submit" className="w-full">Check In</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Active Visitors ({activeVisitors.length})</h3>
                  {activeVisitors.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No active visitors</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead>Entry Time</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeVisitors.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">{log.visitorName}</TableCell>
                            <TableCell>{log.personType}</TableCell>
                            <TableCell>{log.purpose}</TableCell>
                            <TableCell>{new Date(log.entryTime).toLocaleString()}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" onClick={() => checkOut(log.id)}>
                                <LogOut className="mr-2 h-3 w-3" /> Check Out
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Registered Vehicles</CardTitle>
                  <CardDescription>Resident and tenant vehicles</CardDescription>
                </div>
                <Dialog open={showDialog && dialogType === 'vehicle'} onOpenChange={(open) => { setShowDialog(open); setDialogType('vehicle'); }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setShowDialog(true); setDialogType('vehicle'); }}>
                      <Car className="mr-2 h-4 w-4" /> Register Vehicle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Register Vehicle</DialogTitle>
                      <DialogDescription>Add a new vehicle to the estate</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); handleCreate({ estateId: user?.estateId, licensePlate: (e.currentTarget as any).licensePlate.value, ownerName: (e.currentTarget as any).ownerName.value, color: (e.currentTarget as any).color.value, make: (e.currentTarget as any).make.value, model: (e.currentTarget as any).model.value }); }}>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="licensePlate">License Plate</Label>
                          <Input id="licensePlate" required />
                        </div>
                        <div>
                          <Label htmlFor="ownerName">Owner Name</Label>
                          <Input id="ownerName" required />
                        </div>
                        <div>
                          <Label htmlFor="color">Color (optional)</Label>
                          <Input id="color" />
                        </div>
                        <div>
                          <Label htmlFor="make">Make (optional)</Label>
                          <Input id="make" />
                        </div>
                        <div>
                          <Label htmlFor="model">Model (optional)</Label>
                          <Input id="model" />
                        </div>
                      </div>
                      <Button type="submit" className="w-full">Register Vehicle</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Make/Model</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-mono font-medium">{vehicle.licensePlate}</TableCell>
                      <TableCell>{vehicle.ownerName}</TableCell>
                      <TableCell>{vehicle.color || '-'}</TableCell>
                      <TableCell>{vehicle.make} {vehicle.model}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blacklist Tab */}
        <TabsContent value="blacklist">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Blacklist</CardTitle>
                  <CardDescription>Individuals denied estate access</CardDescription>
                </div>
                <Dialog open={showDialog && dialogType === 'blacklist'} onOpenChange={(open) => { setShowDialog(open); setDialogType('blacklist'); }}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" onClick={() => { setShowDialog(true); setDialogType('blacklist'); }}>
                      <AlertTriangle className="mr-2 h-4 w-4" /> Add to Blacklist
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add to Blacklist</DialogTitle>
                      <DialogDescription>Deny access to this individual</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); handleCreate({ estateId: user?.estateId, name: (e.currentTarget as any).name.value, phone: (e.currentTarget as any).phone.value, reason: (e.currentTarget as any).reason.value, addedBy: user?.id }); }}>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" required />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone (optional)</Label>
                          <Input id="phone" />
                        </div>
                        <div>
                          <Label htmlFor="reason">Reason</Label>
                          <Input id="reason" required />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" variant="destructive">Add to Blacklist</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Added Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blacklist.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.name}</TableCell>
                      <TableCell>{entry.phone || '-'}</TableCell>
                      <TableCell>{entry.reason}</TableCell>
                      <TableCell>{new Date(entry.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
