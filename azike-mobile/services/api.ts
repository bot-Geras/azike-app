
import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/v1';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  _retry?: boolean;
}

// Store a reference to the logout/refresh functions to avoid circular dependency
let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

async function request(endpoint: string, options: RequestOptions = {}) {
  const { params, _retry, ...init } = options;
  
  // 1. Setup URL and query parameters
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const query = new URLSearchParams(params).toString();
    url += `?${query}`;
  }

  console.log(`[API Request] ${init.method || 'GET'} ${url}`);

  // 2. Request Interceptor: Inject Token
  const token = await SecureStore.getItemAsync('access_token');
  const headers = new Headers(init.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    let response = await fetch(url, {
      ...init,
      headers,
    });

    // 3. Response Interceptor: Handle 401 and Token Refresh
    if (response.status === 401 && !_retry) {
      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!refreshResponse.ok) throw new Error('Refresh failed');

        const refreshData = await refreshResponse.json();
        const { access_token } = refreshData.data;
        
        await SecureStore.setItemAsync('access_token', access_token);
        
        // Retry the request once with the new token
        return request(endpoint, {
          ...options,
          _retry: true,
          headers: {
            ...init.headers as object,
            Authorization: `Bearer ${access_token}`,
          },
        });
      } catch (refreshError) {
        if (onUnauthorized) onUnauthorized();
        throw refreshError;
      }
    }

    // 4. Handle Errors (Mimic Axios error structure for compatibility)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || 'API Request failed');
      (error as any).response = {
        status: response.status,
        data: errorData,
      };
      throw error;
    }

    // 5. Success: Wrap JSON in a data property to match Axios
    const data = await response.json();
    return { data };
  } catch (error: any) {
    console.error(`[API Error] ${init.method || 'GET'} ${url}:`, error.message);
    
    // Provide a more helpful error for network failures
    if (error.message === 'Network request failed') {
      const helpfulError = new Error(
        `Connection Failed: Cannot reach ${API_BASE_URL}. \n\n` +
        `Tips:\n` +
        `1. Ensure server is running at ${API_BASE_URL}\n` +
        `2. If using Android Emulator, use 10.0.2.2 instead of localhost\n` +
        `3. Ensure phone and PC are on the same Wi-Fi`
      );
      throw helpfulError;
    }
    
    throw error;
  }
}

export const api = {
  get: (url: string, options?: RequestOptions) => 
    request(url, { ...options, method: 'GET' }),
  
  post: (url: string, body?: any, options?: RequestOptions) => 
    request(url, { 
      ...options, 
      method: 'POST', 
      body: JSON.stringify(body) 
    }),

  put: (url: string, body?: any, options?: RequestOptions) => 
    request(url, { 
      ...options, 
      method: 'PUT', 
      body: JSON.stringify(body) 
    }),

  delete: (url: string, options?: RequestOptions) => 
    request(url, { ...options, method: 'DELETE' }),
};