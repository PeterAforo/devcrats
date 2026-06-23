const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const hasConfiguredApi = !!process.env.NEXT_PUBLIC_API_URL;

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshTokenValue: string | null = null;
  private _demoModeOverride: boolean | null = null;
  private _refreshPromise: Promise<boolean> | null = null;

  setToken(token: string | null) {
    this.accessToken = token;
  }

  getToken() {
    return this.accessToken;
  }

  setRefreshToken(token: string | null) {
    this.refreshTokenValue = token;
  }

  getRefreshToken() {
    return this.refreshTokenValue;
  }

  setDemoMode(demo: boolean) {
    this._demoModeOverride = demo;
  }

  get isDemoMode() {
    if (this._demoModeOverride !== null) return this._demoModeOverride;
    // Demo mode must be explicitly enabled via override
    return false;
  }

  async fetch<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    console.log('API Fetch:', { endpoint, isDemoMode: this.isDemoMode, API_URL });

    // In demo mode, skip network calls entirely to avoid console errors
    if (this.isDemoMode) {
      console.log('API Fetch: Blocked by demo mode');
      return null as T;
    }

    const { token, ...fetchOptions } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const authToken = token || this.accessToken;
    if (authToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
    }

    console.log('API Fetch: Request', { url: `${API_URL}${endpoint}`, headers, options: fetchOptions });

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
      credentials: 'include',
    });

    console.log('API Fetch: Response', { status: response.status, ok: response.ok });

    if (response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
        const retryResponse = await fetch(`${API_URL}${endpoint}`, {
          ...fetchOptions,
          headers,
          credentials: 'include',
        });
        return retryResponse.json();
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(`HTTP ${response.status}: ${error.message || 'Request failed'}`);
    }

    return response.json();
  }

  async get<T = any>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, options?: FetchOptions): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data,
      headers: isFormData ? { ...(options?.headers as Record<string, string>), 'Content-Type': 'multipart/form-data' } : options?.headers,
    });
  }

  async put<T = any>(endpoint: string, data?: any, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: 'DELETE' });
  }

  private async refreshToken(): Promise<boolean> {
    // Deduplicate concurrent refresh attempts
    if (this._refreshPromise) {
      return this._refreshPromise;
    }

    this._refreshPromise = this._doRefresh();
    try {
      return await this._refreshPromise;
    } finally {
      this._refreshPromise = null;
    }
  }

  private async _doRefresh(): Promise<boolean> {
    if (!this.refreshTokenValue) {
      return false;
    }
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshTokenValue }),
      });

      if (!response.ok) {
        this.accessToken = null;
        this.refreshTokenValue = null;
        return false;
      }

      const data = await response.json();
      if (data.data?.accessToken) {
        this.accessToken = data.data.accessToken;
        if (data.data?.refreshToken) {
          this.refreshTokenValue = data.data.refreshToken;
        }
        return true;
      }
      this.accessToken = null;
      this.refreshTokenValue = null;
      return false;
    } catch {
      this.accessToken = null;
      this.refreshTokenValue = null;
      return false;
    }
  }
}

export const api = new ApiClient();
export default api;

// ─── GATE ACCESS API METHODS ─────────────────────────────────────

export const gateAccessApi = {
  // Gates
  createGate: (data: any) => api.post('/gate-access/gates', data),
  getGates: (estateId?: string) => api.get(`/gate-access/gates${estateId ? `?estateId=${estateId}` : ''}`),
  updateGate: (id: string, data: any) => api.put(`/gate-access/gates/${id}`, data),
  deleteGate: (id: string) => api.delete(`/gate-access/gates/${id}`),

  // Guard Shifts
  startShift: (data: any) => api.post('/gate-access/shifts/start', data),
  endShift: (id: string) => api.post(`/gate-access/shifts/${id}/end`),
  getActiveShifts: (estateId?: string) => api.get(`/gate-access/shifts/active${estateId ? `?estateId=${estateId}` : ''}`),
  getShiftHistory: (estateId?: string, page = 1, limit = 20) =>
    api.get(`/gate-access/shifts/history?estateId=${estateId}&page=${page}&limit=${limit}`),

  // Access Passes
  createAccessPass: (data: any) => api.post('/gate-access/passes', data),
  verifyAccessPass: (pin: string) => api.get(`/gate-access/passes/verify/${pin}`),
  getAccessPasses: (estateId?: string, page = 1, limit = 20) =>
    api.get(`/gate-access/passes?estateId=${estateId}&page=${page}&limit=${limit}`),
  revokeAccessPass: (id: string) => api.put(`/gate-access/passes/${id}/revoke`),
  updateAccessPass: (id: string, data: any) => api.put(`/gate-access/passes/${id}`, data),

  // Gate Operations
  checkInViaInvite: (inviteId: string, gateId: string) =>
    api.post(`/gate-access/check-in/invite/${inviteId}`, { gateId }),
  checkInViaPass: (passId: string, gateId: string) =>
    api.post(`/gate-access/check-in/pass/${passId}`, { gateId }),
  checkInWalkIn: (data: any) => api.post('/gate-access/check-in/walk-in', data),
  checkOut: (gateLogId: string) => api.post(`/gate-access/check-out/${gateLogId}`),

  // Gate Logs
  getGateLogs: (estateId?: string, filters?: { page?: number; limit?: number; personType?: string; gateId?: string; activeOnly?: boolean }) => {
    const params = new URLSearchParams();
    if (estateId) params.append('estateId', estateId);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.personType) params.append('personType', filters.personType);
    if (filters?.gateId) params.append('gateId', filters.gateId);
    if (filters?.activeOnly) params.append('activeOnly', 'true');
    return api.get(`/gate-access/logs?${params.toString()}`);
  },
  getActiveVisitors: (estateId?: string) => api.get(`/gate-access/logs/active${estateId ? `?estateId=${estateId}` : ''}`),
  getGateStats: (estateId?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (estateId) params.append('estateId', estateId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/gate-access/logs/stats?${params.toString()}`);
  },

  // Vehicles
  registerVehicle: (data: any) => api.post('/gate-access/vehicles', data),
  findVehicleByPlate: (plate: string, estateId?: string) =>
    api.get(`/gate-access/vehicles/lookup/${plate}${estateId ? `?estateId=${estateId}` : ''}`),
  getVehicles: (estateId?: string, page = 1, limit = 20) =>
    api.get(`/gate-access/vehicles?estateId=${estateId}&page=${page}&limit=${limit}`),
  updateVehicle: (id: string, data: any) => api.put(`/gate-access/vehicles/${id}`, data),
  deleteVehicle: (id: string) => api.delete(`/gate-access/vehicles/${id}`),

  // Blacklist
  addToBlacklist: (data: any) => api.post('/gate-access/blacklist', data),
  removeFromBlacklist: (id: string) => api.delete(`/gate-access/blacklist/${id}`),
  checkBlacklist: (estateId?: string, name?: string, phone?: string) => {
    const params = new URLSearchParams();
    if (estateId) params.append('estateId', estateId);
    if (name) params.append('name', name);
    if (phone) params.append('phone', phone);
    return api.get(`/gate-access/blacklist/check?${params.toString()}`);
  },
  getBlacklist: (estateId?: string, page = 1, limit = 20) =>
    api.get(`/gate-access/blacklist?estateId=${estateId}&page=${page}&limit=${limit}`),
};

// Estates API
export const estatesApi = {
  getEstates: () => api.get('/estates'),
};
