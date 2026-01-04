import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

interface SharePointSite {
  id: string;
  displayName: string;
  webUrl: string;
  description?: string;
}

export function useSharePointSites(accessToken: string | null) {
  return useQuery({
    queryKey: ['sharepoint', 'sites', accessToken],
    queryFn: () => apiClient.get<SharePointSite[]>('/files/sites', undefined, accessToken!),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
