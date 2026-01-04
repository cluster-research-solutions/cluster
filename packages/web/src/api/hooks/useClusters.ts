import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { Annotation } from './useAnnotations';

export interface Cluster {
  id: string;
  studyId: string | null;
  boardId: string | null;
  name: string;
  color: string | null;
  positionX: string;
  positionY: string;
  width: string;
  height: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface ClusterItem {
  annotationId: string;
  position: { x: number; y: number };
  sortOrder: number;
  annotation: Annotation;
}

export interface ClusterWithItems extends Cluster {
  items: ClusterItem[];
}

export interface CreateClusterInput {
  name: string;
  color?: string;
  studyId?: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface UpdateClusterInput {
  name?: string;
  color?: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface AddClusterItemInput {
  annotationId: string;
  position?: { x: number; y: number };
  annotation?: Annotation; // For optimistic updates
}

/**
 * List all clusters (optionally filtered by study)
 */
export function useClusters(studyId?: string, accessToken?: string | null) {
  return useQuery({
    queryKey: ['clusters', studyId],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (studyId) params.studyId = studyId;

      return apiClient.get<ClusterWithItems[]>('/clusters', params, accessToken!);
    },
    enabled: !!accessToken,
  });
}

/**
 * Get single cluster with items
 */
export function useCluster(id: string, accessToken?: string | null) {
  return useQuery({
    queryKey: ['clusters', id],
    queryFn: () => apiClient.get<ClusterWithItems>(`/clusters/${id}`, undefined, accessToken!),
    enabled: !!accessToken && !!id,
  });
}

/**
 * Create cluster (with optimistic update)
 */
export function useCreateCluster(accessToken?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateClusterInput) =>
      apiClient.post<Cluster>('/clusters', input, accessToken!),
    onMutate: async (input) => {
      // Update all cluster queries
      const queryCache = queryClient.getQueryCache();
      const clusterQueries = queryCache.findAll({ queryKey: ['clusters'] });

      // Snapshot previous value from first matching query
      const previousClusters = clusterQueries[0]?.state.data as ClusterWithItems[] | undefined;

      // Create optimistic cluster with temporary ID
      const optimisticCluster: ClusterWithItems = {
        id: `temp-${Date.now()}`, // Temporary ID
        studyId: input.studyId || null,
        boardId: null,
        name: input.name,
        color: input.color || null,
        positionX: (input.position?.x || 0).toString(),
        positionY: (input.position?.y || 0).toString(),
        width: (input.size?.width || 400).toString(),
        height: (input.size?.height || 300).toString(),
        createdBy: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        position: input.position || { x: 0, y: 0 },
        size: input.size || { width: 400, height: 300 },
        items: [],
      };

      // Optimistically add cluster to all matching queries
      clusterQueries.forEach((query) => {
        queryClient.setQueryData<ClusterWithItems[]>(query.queryKey, (old) => {
          if (!old) return [optimisticCluster];
          // Only add to array queries, ignore single cluster queries
          if (Array.isArray(old)) {
            return [...old, optimisticCluster];
          }
          return old;
        });
      });

      return { previousClusters, optimisticId: optimisticCluster.id };
    },
    onSuccess: (data, _variables, context) => {
      // Replace optimistic cluster with real one from server
      const queryCache = queryClient.getQueryCache();
      const clusterQueries = queryCache.findAll({ queryKey: ['clusters'] });

      clusterQueries.forEach((query) => {
        queryClient.setQueryData<ClusterWithItems[]>(query.queryKey, (old) => {
          if (!old) return old;
          // Handle both array (list query) and single cluster (detail query)
          if (Array.isArray(old)) {
            // Replace the optimistic cluster with the real one
            return old.map((cluster) =>
              cluster.id === context?.optimisticId
                ? { ...data, items: [], position: { x: parseFloat(data.positionX), y: parseFloat(data.positionY) }, size: { width: parseFloat(data.width), height: parseFloat(data.height) } }
                : cluster
            );
          }
          // Single cluster queries don't need updating for create operations
          return old;
        });
      });
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousClusters) {
        const queryCache = queryClient.getQueryCache();
        const clusterQueries = queryCache.findAll({ queryKey: ['clusters'] });
        clusterQueries.forEach((query) => {
          queryClient.setQueryData(query.queryKey, context.previousClusters);
        });
      }
    },
  });
}

/**
 * Update cluster (with optimistic update)
 */
export function useUpdateCluster(accessToken?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateClusterInput & { id: string }) =>
      apiClient.patch<Cluster>(`/clusters/${id}`, input, accessToken!),
    onMutate: async ({ id, ...updates }) => {
      const queryCache = queryClient.getQueryCache();
      const clusterQueries = queryCache.findAll({ queryKey: ['clusters'] });
      const previousClusters = clusterQueries[0]?.state.data as ClusterWithItems[] | undefined;

      // Optimistically update cluster metadata
      clusterQueries.forEach((query) => {
        queryClient.setQueryData(query.queryKey, (old: ClusterWithItems[] | ClusterWithItems | undefined) => {
          if (!old) return old;
          // Handle both array (list query) and single cluster (detail query)
          if (Array.isArray(old)) {
            return old.map((cluster) => {
              if (cluster.id === id) {
                return { ...cluster, ...updates };
              }
              return cluster;
            });
          }
          // If it's a single cluster query and it matches, update it
          if (old && typeof old === 'object' && 'id' in old) {
            const singleCluster = old as ClusterWithItems;
            return singleCluster.id === id ? { ...singleCluster, ...updates } : singleCluster;
          }
          return old;
        });
      });

      return { previousClusters };
    },
    onError: (err, variables, context) => {
      // If cluster doesn't exist (404), remove it from the cache instead of rolling back
      const is404 = err instanceof Error && err.message.includes('404');

      if (is404) {
        console.warn(`Cluster ${variables.id} not found on server, removing from cache`);
        const queryCache = queryClient.getQueryCache();
        const clusterQueries = queryCache.findAll({ queryKey: ['clusters'] });
        clusterQueries.forEach((query) => {
          queryClient.setQueryData<ClusterWithItems[]>(query.queryKey, (old) => {
            if (!old) return old;
            // Handle both array (list query) and single cluster (detail query)
            if (Array.isArray(old)) {
              return old.filter((cluster) => cluster.id !== variables.id);
            }
            // If it's a single cluster query and it matches, return undefined
            return (old as any).id === variables.id ? undefined : old;
          });
        });
      } else {
        // Rollback on other errors
        if (context?.previousClusters) {
          const queryCache = queryClient.getQueryCache();
          const clusterQueries = queryCache.findAll({ queryKey: ['clusters'] });
          clusterQueries.forEach((query) => {
            queryClient.setQueryData(query.queryKey, context.previousClusters);
          });
        }
      }
    },
  });
}

/**
 * Delete cluster (with optimistic update)
 */
export function useDeleteCluster(accessToken?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/clusters/${id}`, accessToken!),
    onMutate: async (clusterId) => {
      // Update all cluster queries
      const queryCache = queryClient.getQueryCache();
      const clusterQueries = queryCache.findAll({ queryKey: ['clusters'] });

      // Snapshot previous value from first matching query
      const previousClusters = clusterQueries[0]?.state.data as ClusterWithItems[] | undefined;

      // Optimistically remove cluster from all matching queries
      clusterQueries.forEach((query) => {
        queryClient.setQueryData<ClusterWithItems[]>(query.queryKey, (old) => {
          if (!old) return old;
          // Handle both array (list query) and single cluster (detail query)
          if (Array.isArray(old)) {
            return old.filter((cluster) => cluster.id !== clusterId);
          }
          // If it's a single cluster query and it matches, return undefined
          return (old as any).id === clusterId ? undefined : old;
        });
      });

      return { previousClusters };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousClusters) {
        const queryCache = queryClient.getQueryCache();
        const clusterQueries = queryCache.findAll({ queryKey: ['clusters'] });
        clusterQueries.forEach((query) => {
          queryClient.setQueryData(query.queryKey, context.previousClusters);
        });
      }
    },
    // Don't refetch - let local state be source of truth
    onSuccess: () => {
      // Silent update - no refetch
    },
  });
}

/**
 * Add annotation to cluster (with optimistic update)
 */
export function useAddClusterItem(accessToken?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clusterId, annotation, ...input }: AddClusterItemInput & { clusterId: string }) =>
      apiClient.post<ClusterWithItems>(`/clusters/${clusterId}/items`, input, accessToken!),
    onMutate: async ({ clusterId, annotationId, annotation, position }) => {
      // Update all cluster queries (with and without studyId filter)
      const queryCache = queryClient.getQueryCache();
      const clusterQueries = queryCache.findAll({ queryKey: ['clusters'] });

      // Snapshot previous value from first matching query
      const previousClusters = clusterQueries[0]?.state.data as ClusterWithItems[] | undefined;

      // Optimistically update cluster items in all matching queries
      if (annotation && previousClusters) {
        clusterQueries.forEach((query) => {
          queryClient.setQueryData(query.queryKey, (old: ClusterWithItems[] | ClusterWithItems | undefined) => {
            if (!old) return old;
            // Handle both array (list query) and single cluster (detail query)
            if (Array.isArray(old)) {
              return old.map((cluster) => {
                if (cluster.id === clusterId) {
                  return {
                    ...cluster,
                    items: [
                      ...cluster.items,
                      {
                        annotationId,
                        annotation,
                        position: position || { x: 0, y: 0 },
                        sortOrder: cluster.items.length,
                      },
                    ],
                  };
                }
                return cluster;
              });
            }
            // If it's a single cluster query and it matches, add the item
            if (old && typeof old === 'object' && 'id' in old && 'items' in old) {
              const singleCluster = old as ClusterWithItems;
              if (singleCluster.id === clusterId) {
                return {
                  ...singleCluster,
                  items: [
                    ...singleCluster.items,
                    {
                      annotationId,
                      annotation,
                      position: position || { x: 0, y: 0 },
                      sortOrder: singleCluster.items.length,
                    },
                  ],
                };
              }
            }
            return old;
          });
        });
      }

      return { previousClusters };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousClusters) {
        const queryCache = queryClient.getQueryCache();
        const clusterQueries = queryCache.findAll({ queryKey: ['clusters'] });
        clusterQueries.forEach((query) => {
          queryClient.setQueryData(query.queryKey, context.previousClusters);
        });
      }
    },
    onSuccess: (updatedCluster, variables) => {
      // Replace cluster data in all queries with server response (ensures real UUIDs)
      const queryCache = queryClient.getQueryCache();
      const clusterQueries = queryCache.findAll({ queryKey: ['clusters'] });

      clusterQueries.forEach((query) => {
        queryClient.setQueryData(query.queryKey, (old: ClusterWithItems[] | ClusterWithItems | undefined) => {
          if (!old) return old;
          // Handle both array (list query) and single cluster (detail query)
          if (Array.isArray(old)) {
            return old.map((cluster) =>
              cluster.id === variables.clusterId ? updatedCluster : cluster
            );
          }
          // If it's a single cluster query and it matches, replace it
          if ('id' in old) {
            return old.id === variables.clusterId ? updatedCluster : old;
          }
          return old;
        });
      });
    },
  });
}

/**
 * Remove annotation from cluster (with optimistic update)
 */
export function useRemoveClusterItem(accessToken?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clusterId, annotationId }: { clusterId: string; annotationId: string }) =>
      apiClient.delete<ClusterWithItems>(`/clusters/${clusterId}/items/${annotationId}`, accessToken!),
    onMutate: async ({ clusterId, annotationId }) => {
      // Update all cluster queries (with and without studyId filter)
      const queryCache = queryClient.getQueryCache();
      const clusterQueries = queryCache.findAll({ queryKey: ['clusters'] });

      // Snapshot previous value from first matching query
      const previousClusters = clusterQueries[0]?.state.data as ClusterWithItems[] | undefined;

      // Optimistically remove item from all matching queries
      clusterQueries.forEach((query) => {
        queryClient.setQueryData(query.queryKey, (old: ClusterWithItems[] | ClusterWithItems | undefined) => {
          if (!old) return old;
          // Handle both array (list query) and single cluster (detail query)
          if (Array.isArray(old)) {
            return old.map((cluster) => {
              if (cluster.id === clusterId) {
                return {
                  ...cluster,
                  items: cluster.items.filter((item) => item.annotationId !== annotationId),
                };
              }
              return cluster;
            });
          }
          // If it's a single cluster query and it matches, remove the item
          if (old && typeof old === 'object' && 'id' in old && 'items' in old) {
            const singleCluster = old as ClusterWithItems;
            if (singleCluster.id === clusterId) {
              return {
                ...singleCluster,
                items: singleCluster.items.filter((item) => item.annotationId !== annotationId),
              };
            }
          }
          return old;
        });
      });

      return { previousClusters };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousClusters) {
        const queryCache = queryClient.getQueryCache();
        const clusterQueries = queryCache.findAll({ queryKey: ['clusters'] });
        clusterQueries.forEach((query) => {
          queryClient.setQueryData(query.queryKey, context.previousClusters);
        });
      }
    },
    onSuccess: (updatedCluster, variables) => {
      // Replace cluster data in all queries with server response (ensures real UUIDs)
      const queryCache = queryClient.getQueryCache();
      const clusterQueries = queryCache.findAll({ queryKey: ['clusters'] });

      clusterQueries.forEach((query) => {
        queryClient.setQueryData(query.queryKey, (old: ClusterWithItems[] | ClusterWithItems | undefined) => {
          if (!old) return old;
          // Handle both array (list query) and single cluster (detail query)
          if (Array.isArray(old)) {
            return old.map((cluster) =>
              cluster.id === variables.clusterId ? updatedCluster : cluster
            );
          }
          // If it's a single cluster query and it matches, replace it
          if ('id' in old) {
            return old.id === variables.clusterId ? updatedCluster : old;
          }
          return old;
        });
      });
    },
  });
}
