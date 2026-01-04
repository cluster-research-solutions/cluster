import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

interface DriveItem {
  id: string;
  name: string;
  size?: number;
  webUrl: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  folder?: {
    childCount: number;
  };
  file?: {
    mimeType: string;
  };
  parentReference: {
    driveId: string;
    id: string;
    path: string;
  };
}

export function useDriveItems(
  driveId: string | null,
  itemId: string = 'root',
  accessToken: string | null
) {
  return useQuery({
    queryKey: ['driveItems', driveId, itemId, accessToken],
    queryFn: () =>
      apiClient.get<DriveItem[]>(
        `/files/drives/${driveId}/items`,
        { itemId },
        accessToken!
      ),
    enabled: !!driveId && !!accessToken,
    staleTime: 2 * 60 * 1000,
  });
}
