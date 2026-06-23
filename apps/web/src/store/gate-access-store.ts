import { create } from 'zustand';
import { gateAccessApi } from '@/lib/api';

interface Gate {
  id: string;
  estateId: string;
  name: string;
  type: string;
  description?: string;
  isActive: boolean;
}

interface GuardShift {
  id: string;
  estateId: string;
  gateId: string;
  guardId: string;
  startTime: string;
  endTime?: string;
  notes?: string;
  gate?: Gate;
  guard?: { id: string; firstName: string; lastName: string };
}

interface AccessPass {
  id: string;
  estateId: string;
  holderName: string;
  holderPhone?: string;
  passType: string;
  company?: string;
  pin: string;
  validFrom: string;
  validUntil: string;
  allowedDays: string[];
  allowedTimeStart?: string;
  allowedTimeEnd?: string;
  isActive: boolean;
  notes?: string;
}

interface GateLog {
  id: string;
  estateId: string;
  visitorInviteId?: string;
  accessPassId?: string;
  gateId?: string;
  personType: string;
  visitorName: string;
  visitorPhone?: string;
  purpose?: string;
  entryTime: string;
  exitTime?: string;
  authorizedBy?: string;
  processedBy?: string;
  isWalkIn: boolean;
  vehiclePlate?: string;
  notes?: string;
  gate?: Gate;
  visitorInvite?: any;
  accessPass?: AccessPass;
}

interface Vehicle {
  id: string;
  estateId: string;
  licensePlate: string;
  ownerName: string;
  unitId?: string;
  parkingSlot?: string;
  color?: string;
  make?: string;
  model?: string;
  unit?: any;
}

interface Blacklist {
  id: string;
  estateId: string;
  name: string;
  phone?: string;
  reason: string;
  addedBy: string;
  createdAt: string;
}

interface GateAccessState {
  gates: Gate[];
  activeShifts: GuardShift[];
  accessPasses: AccessPass[];
  gateLogs: GateLog[];
  activeVisitors: GateLog[];
  vehicles: Vehicle[];
  blacklist: Blacklist[];
  isLoading: boolean;
  error: string | null;

  // Gates
  fetchGates: (estateId?: string) => Promise<void>;
  createGate: (data: any) => Promise<void>;
  updateGate: (id: string, data: any) => Promise<void>;
  deleteGate: (id: string) => Promise<void>;

  // Guard Shifts
  fetchActiveShifts: (estateId?: string) => Promise<void>;
  startShift: (data: any) => Promise<void>;
  endShift: (id: string) => Promise<void>;

  // Access Passes
  fetchAccessPasses: (estateId?: string, page?: number, limit?: number) => Promise<void>;
  createAccessPass: (data: any) => Promise<void>;
  revokeAccessPass: (id: string) => Promise<void>;
  updateAccessPass: (id: string, data: any) => Promise<void>;

  // Gate Logs
  fetchGateLogs: (estateId?: string, filters?: any) => Promise<void>;
  fetchActiveVisitors: (estateId?: string) => Promise<void>;
  checkInWalkIn: (data: any) => Promise<void>;
  checkOut: (gateLogId: string) => Promise<void>;

  // Vehicles
  fetchVehicles: (estateId?: string, page?: number, limit?: number) => Promise<void>;
  registerVehicle: (data: any) => Promise<void>;
  updateVehicle: (id: string, data: any) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;

  // Blacklist
  fetchBlacklist: (estateId?: string, page?: number, limit?: number) => Promise<void>;
  addToBlacklist: (data: any) => Promise<void>;
  removeFromBlacklist: (id: string) => Promise<void>;
}

export const useGateAccessStore = create<GateAccessState>((set) => ({
  gates: [],
  activeShifts: [],
  accessPasses: [],
  gateLogs: [],
  activeVisitors: [],
  vehicles: [],
  blacklist: [],
  isLoading: false,
  error: null,

  // Gates
  fetchGates: async (estateId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await gateAccessApi.getGates(estateId);
      set({ gates: res.data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createGate: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await gateAccessApi.createGate(data);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateGate: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await gateAccessApi.updateGate(id, data);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteGate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await gateAccessApi.deleteGate(id);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  // Guard Shifts
  fetchActiveShifts: async (estateId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await gateAccessApi.getActiveShifts(estateId);
      set({ activeShifts: res.data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  startShift: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await gateAccessApi.startShift(data);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  endShift: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await gateAccessApi.endShift(id);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  // Access Passes
  fetchAccessPasses: async (estateId, page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const res = await gateAccessApi.getAccessPasses(estateId, page, limit);
      set({ accessPasses: res.data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createAccessPass: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await gateAccessApi.createAccessPass(data);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  revokeAccessPass: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await gateAccessApi.revokeAccessPass(id);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateAccessPass: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await gateAccessApi.updateAccessPass(id, data);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  // Gate Logs
  fetchGateLogs: async (estateId, filters) => {
    set({ isLoading: true, error: null });
    try {
      const res = await gateAccessApi.getGateLogs(estateId, filters);
      set({ gateLogs: res.data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchActiveVisitors: async (estateId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await gateAccessApi.getActiveVisitors(estateId);
      set({ activeVisitors: res.data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  checkInWalkIn: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await gateAccessApi.checkInWalkIn(data);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  checkOut: async (gateLogId) => {
    set({ isLoading: true, error: null });
    try {
      await gateAccessApi.checkOut(gateLogId);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  // Vehicles
  fetchVehicles: async (estateId, page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const res = await gateAccessApi.getVehicles(estateId, page, limit);
      set({ vehicles: res.data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  registerVehicle: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await gateAccessApi.registerVehicle(data);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateVehicle: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await gateAccessApi.updateVehicle(id, data);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteVehicle: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await gateAccessApi.deleteVehicle(id);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  // Blacklist
  fetchBlacklist: async (estateId, page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const res = await gateAccessApi.getBlacklist(estateId, page, limit);
      set({ blacklist: res.data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addToBlacklist: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await gateAccessApi.addToBlacklist(data);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  removeFromBlacklist: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await gateAccessApi.removeFromBlacklist(id);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
}));
