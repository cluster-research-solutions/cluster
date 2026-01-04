import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { Annotation } from './useAnnotations';

export interface CanvasNode {
  id: string;
  orgId: string;
  studyId: string | null;
  annotationId: string;
  positionX: string;
  positionY: string;
  createdAt: string;
  updatedAt: string;
  position: { x: number; y: number };
}

export interface CreateCanvasNodeInput {
  annotationId: string;
  position: { x: number; y: number };
  studyId?: string;
  annotation?: Annotation; // For optimistic updates
}

export interface UpdateCanvasNodeInput {
  position: { x: number; y: number };
}

/**
 * List all canvas nodes (optionally filtered by study)
 */
export function useCanvasNodes(studyId?: string, accessToken?: string | null) {
  return useQuery({
    queryKey: ['canvas-nodes', studyId],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (studyId) params.studyId = studyId;

      return apiClient.get<CanvasNode[]>('/canvas-nodes', params, accessToken!);
    },
    enabled: !!accessToken,
  });
}

/**
 * Create canvas node (with optimistic update)
 */
export function useSaveCanvasNode(accessToken?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ annotation, ...input }: CreateCanvasNodeInput) =>
      apiClient.post<CanvasNode>('/canvas-nodes', input, accessToken!),
    onMutate: async ({ annotationId, position, annotation }) => {
      // Update all canvas node queries
      const queryCache = queryClient.getQueryCache();
      const canvasQueries = queryCache.findAll({ queryKey: ['canvas-nodes'] });

      // Snapshot previous value
      const previousNodes = canvasQueries[0]?.state.data as CanvasNode[] | undefined;

      // Create optimistic canvas node with temporary ID
      if (annotation) {
        const optimisticNode: CanvasNode = {
          id: `temp-${Date.now()}`,
          orgId: '',
          studyId: null,
          annotationId,
          positionX: position.x.toString(),
          positionY: position.y.toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          position,
        };

        // Optimistically add node to all matching queries
        canvasQueries.forEach((query) => {
          queryClient.setQueryData<CanvasNode[]>(query.queryKey, (old) => {
            if (!old) return [optimisticNode];
            return [...old, optimisticNode];
          });
        });

        return { previousNodes, optimisticId: optimisticNode.id };
      }

      return { previousNodes };
    },
    onSuccess: (data, _variables, context) => {
      // Replace optimistic node with real one from server
      const queryCache = queryClient.getQueryCache();
      const canvasQueries = queryCache.findAll({ queryKey: ['canvas-nodes'] });

      canvasQueries.forEach((query) => {
        queryClient.setQueryData<CanvasNode[]>(query.queryKey, (old) => {
          if (!old) return old;
          // Replace the optimistic node with the real one
          return old.map((node) =>
            node.id === context?.optimisticId ? data : node
          );
        });
      });
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousNodes) {
        const queryCache = queryClient.getQueryCache();
        const canvasQueries = queryCache.findAll({ queryKey: ['canvas-nodes'] });
        canvasQueries.forEach((query) => {
          queryClient.setQueryData(query.queryKey, context.previousNodes);
        });
      }
    },
  });
}

/**
 * Update canvas node position
 */
export function useUpdateCanvasNode(accessToken?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateCanvasNodeInput & { id: string }) =>
      apiClient.patch<CanvasNode>(`/canvas-nodes/${id}`, input, accessToken!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['canvas-nodes'] });
    },
  });
}

/**
 * Delete canvas node by ID
 */
export function useDeleteCanvasNode(accessToken?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nodeId: string) =>
      apiClient.delete(`/canvas-nodes/${nodeId}`, accessToken!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['canvas-nodes'] });
    },
  });
}
