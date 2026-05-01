
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/v1';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  _retry?: boolean;
}

async function request(endpoint: string, options: RequestOptions = {}) {
  const { params, _retry, ...init } = options;
  
  // 1. Setup URL and query parameters
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const query = new URLSearchParams(params).toString();
    url += `?${query}`;
  }

  // 2. Request Interceptor: Inject Token
  const token = await SecureStore.getItemAsync('access_token');
  const headers = new Headers(init.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response = await fetch(url, {
    ...init,
    headers,
  });

  // 3. Response Interceptor: Handle 401 and Token Refresh
  if (response.status === 401 && !_retry) {
    try {
      await useAuthStore.getState().refreshAccessToken();
      const newToken = await SecureStore.getItemAsync('access_token');
      
      // Retry the request once with the new token
      return request(endpoint, {
        ...options,
        _retry: true,
        headers: {
          ...init.headers as object,
          Authorization: `Bearer ${newToken}`,
        },
      });
    } catch (refreshError) {
      useAuthStore.getState().logout();
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