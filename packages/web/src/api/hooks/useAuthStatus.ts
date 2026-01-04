import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

interface AuthStatusResponse {
  authenticated: boolean;
  user?: {
    id: string;
    orgId: string;
    email: string;
    displayName?: string;
  };
  org?: {
    id: string;
    name: string;
    azureTenantId: string;
  };
}

export function useAuthStatus(accessToken: string | null) {
  return useQuery({
    queryKey: ['auth', 'status', accessToken],
    queryFn: () => apiClient.get<AuthStatusResponse>('/auth/status', undefined, accessToken!),
    enabled: !!accessToken,
    retry: false,
  });
}
