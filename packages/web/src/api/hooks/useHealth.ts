import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
}

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.get<HealthResponse>('/health'),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
