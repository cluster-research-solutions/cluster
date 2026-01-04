import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

interface Drive {
  id: string;
  name: string;
  description?: string;
  driveType: string;
  webUrl: string;
}

export function useDrives(siteId: string | null, accessToken: string | null) {
  return useQuery({
    queryKey: ['drives', siteId, accessToken],
    queryFn: () => apiClient.get<Drive[]>(`/files/sites/${siteId}/drives`, undefined, accessToken!),
    enabled: !!siteId && !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
}
