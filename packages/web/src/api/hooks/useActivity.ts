import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

export interface FileView {
  id: string;
  userId: string;
  fileRefId: string;
  viewedAt: string;
  updatedAt: string;
  fileRef?: {
    id: string;
    name: string;
    mimeType: string | null;
    sizeBytes: bigint | null;
    webUrl: string | null;
    sharepointDriveId: string;
    sharepointItemId: string;
  };
}

/**
 * Hook to fetch recent activity (file views)
 */
export function useRecentActivity(
  accessToken: string | null,
  limit: number = 10
) {
  return useQuery({
    queryKey: ['activity', 'recent', limit, accessToken],
    queryFn: () =>
      apiClient.get<FileView[]>(
        `/activity/recent?limit=${limit}`,
        undefined,
        accessToken!
      ),
    enabled: !!accessToken,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to record a file view
 */
export function useRecordFileView(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ driveId, itemId }: { driveId: string; itemId: string }) =>
      apiClient.post<FileView>(
        '/activity/file-view',
        { driveId, itemId, provider: 'sharepoint' },
        accessToken!
      ),
    onSuccess: () => {
      // Invalidate recent activity queries to refetch
      queryClient.invalidateQueries({ queryKey: ['activity', 'recent'] });
    },
  });
}
