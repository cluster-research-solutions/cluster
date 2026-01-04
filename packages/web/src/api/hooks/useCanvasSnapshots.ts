import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

export interface CanvasSnapshot {
  id: string;
  orgId: string;
  studyId: string | null;
  name: string;
  description: string | null;
  versionNumber: number;
  canvasState: {
    nodes: any[];
    edges: any[];
    viewport: { x: number; y: number; zoom: number };
  };
  createdBy: string | null;
  createdAt: string;
}

export interface CreateCanvasSnapshotInput {
  name: string;
  description?: string;
  studyId?: string;
  canvasState: {
    nodes: any[];
    edges: any[];
    viewport: { x: number; y: number; zoom: number };
  };
}

/**
 * List all canvas snapshots (optionally filtered by study)
 */
export function useCanvasSnapshots(studyId?: string, accessToken?: string | null) {
  return useQuery({
    queryKey: ['canvas-snapshots', studyId],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (studyId) params.studyId = studyId;

      return apiClient.get<CanvasSnapshot[]>('/canvas-snapshots', params, accessToken!);
    },
    enabled: !!accessToken,
  });
}

/**
 * Get single canvas snapshot
 */
export function useCanvasSnapshot(id: string, accessToken?: string | null) {
  return useQuery({
    queryKey: ['canvas-snapshots', id],
    queryFn: () => apiClient.get<CanvasSnapshot>(`/canvas-snapshots/${id}`, undefined, accessToken!),
    enabled: !!accessToken && !!id,
  });
}

/**
 * Create canvas snapshot
 */
export function useCreateCanvasSnapshot(accessToken?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCanvasSnapshotInput) =>
      apiClient.post<CanvasSnapshot>('/canvas-snapshots', input, accessToken!),
    onSuccess: () => {
      // Invalidate all snapshot queries to refetch
      queryClient.invalidateQueries({ queryKey: ['canvas-snapshots'] });
    },
  });
}

/**
 * Delete canvas snapshot
 */
export function useDeleteCanvasSnapshot(accessToken?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/canvas-snapshots/${id}`, accessToken!),
    onSuccess: () => {
      // Invalidate all snapshot queries to refetch
      queryClient.invalidateQueries({ queryKey: ['canvas-snapshots'] });
    },
  });
}
