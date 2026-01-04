const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
  accessToken?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { params, accessToken, ...fetchOptions } = options;

    let url = `${this.baseUrl}${endpoint}`;

    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string> || {}),
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: response.statusText,
      }));
      throw new Error(error.error || 'An error occurred');
    }

    // Handle 204 No Content (e.g., DELETE responses)
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, string>, accessToken?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params, accessToken });
  }

  async post<T>(endpoint: string, data?: unknown, accessToken?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      accessToken,
    });
  }

  async put<T>(endpoint: string, data?: unknown, accessToken?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      accessToken,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, accessToken?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      accessToken,
    });
  }

  async delete<T>(endpoint: string, accessToken?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', accessToken });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
