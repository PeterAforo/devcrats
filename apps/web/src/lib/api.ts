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
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
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
