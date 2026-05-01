// admin/lib/api.ts
import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

async function request(endpoint: string, options: RequestOptions = {}) {
  const session = await getSession();
  
  // Equivalent to Request Interceptor
  if (session?.user) {
    // For admin API calls, we use the backend JWT
    // The admin routes proxy through Next.js API routes
  }

  const { params, ...init } = options;
  let url = `${API_BASE_URL}${endpoint}`;
  
  if (params) {
    const query = new URLSearchParams(params).toString();
    url += `?${query}`;
  }

  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  // Equivalent to Response Interceptor
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || 'API Request failed');
    // Mimic Axios error structure for compatibility
    (error as any).response = { status: response.status, data: errorData };
    throw error;
  }

  return response.json();
}

export const api = {
  get: (url: string, options?: RequestOptions) => 
    request(url, { ...options, method: 'GET' }),
  post: (url: string, data?: any, options?: RequestOptions) => 
    request(url, { ...options, method: 'POST', body: JSON.stringify(data) }),
  put: (url: string, data?: any, options?: RequestOptions) => 
    request(url, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  patch: (url: string, data?: any, options?: RequestOptions) => 
    request(url, { ...options, method: 'PATCH', body: JSON.stringify(data) }),
  delete: (url: string, options?: RequestOptions) => 
    request(url, { ...options, method: 'DELETE' }),
};