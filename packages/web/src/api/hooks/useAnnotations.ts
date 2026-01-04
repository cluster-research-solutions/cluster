import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

export interface Annotation {
  id: string;
  orgId: string;
  studyId: string | null;
  motivation: string[];
  creatorId: string;
  createdAt: string;
  modifiedAt: string;
  participantId: string | null;
  sessionId: string | null;
  jsonld: any;
  bodyText: string | null;
  deletedAt: string | null;
  targets: AnnotationTarget[];
  tagIds: string[];
}

export interface AnnotationTarget {
  id: string;
  annotationId: string;
  fileRefId: string;
  sharepointItemId?: string; // SharePoint item ID for matching with files
  selectorType: string;
  selectorValue: any;
  exactText: string | null;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  fileRef?: {
    id: string;
    name: string;
    mimeType: string | null;
    webUrl: string | null;
    sharepointDriveId?: string;
    sharepointItemId?: string;
  };
}

export interface CreateAnnotationInput {
  motivation: string[];
  bodyText?: string;
  targets: {
    driveId: string;
    itemId: string;
    provider?: 'sharepoint' | 'googledrive';
    selectorType: string;
    selectorValue: any;
    exactText?: string;
    startTime?: number;
    endTime?: number;
    fileMetadata?: {
      name: string;
      mimeType?: string;
      size?: number;
      webUrl?: string;
      siteId?: string;
    };
  }[];
  tagIds?: string[];
  studyId?: string;
  participantId?: string;
  sessionId?: string;
}

export interface UpdateAnnotationInput {
  motivation?: string[];
  bodyText?: string;
  tagIds?: string[];
  studyId?: string;
  participantId?: string;
  sessionId?: string;
}

export interface AnnotationsListFilters {
  studyId?: string;
  fileRefId?: string;
  tagIds?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Hook to fetch annotations with optional filters
 */
export function useAnnotations(
  filters: AnnotationsListFilters,
  accessToken: string | null
) {
  const queryParams = new URLSearchParams();

  if (filters.studyId) queryParams.set('studyId', filters.studyId);
  if (filters.fileRefId) queryParams.set('fileRefId', filters.fileRefId);
  if (filters.tagIds && filters.tagIds.length > 0) {
    queryParams.set('tagIds', filters.tagIds.join(','));
  }
  if (filters.limit) queryParams.set('limit', filters.limit.toString());
  if (filters.offset) queryParams.set('offset', filters.offset.toString());

  const queryString = queryParams.toString();
  const url = `/annotations${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: ['annotations', filters, accessToken],
    queryFn: () => apiClient.get<Annotation[]>(url, undefined, accessToken!),
    enabled: !!accessToken,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch a single annotation by ID
 */
export function useAnnotation(id: string | null, accessToken: string | null) {
  return useQuery({
    queryKey: ['annotation', id, accessToken],
    queryFn: () => apiClient.get<Annotation>(`/annotations/${id}`, undefined, accessToken!),
    enabled: !!id && !!accessToken,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to create a new annotation (with optimistic update)
 */
export function useCreateAnnotation(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAnnotationInput) =>
      apiClient.post<Annotation>('/annotations', input, accessToken!),
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['annotations'] });

      // Snapshot the previous value
      const queryCache = queryClient.getQueryCache();
      const annotationQueries = queryCache.findAll({ queryKey: ['annotations'] });
      const previousAnnotations = annotationQueries[0]?.state.data as Annotation[] | undefined;

      // Create optimistic annotation with temporary ID
      const optimisticAnnotation: Annotation = {
        id: `temp-${Date.now()}`,
        orgId: '',
        studyId: input.studyId || null,
        motivation: input.motivation,
        creatorId: '',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        participantId: input.participantId || null,
        sessionId: input.sessionId || null,
        jsonld: {},
        bodyText: input.bodyText || null,
        deletedAt: null,
        targets: input.targets.map((t, i) => ({
          id: `temp-target-${i}`,
          annotationId: `temp-${Date.now()}`,
          fileRefId: '',
          selectorType: t.selectorType,
          selectorValue: t.selectorValue,
          exactText: t.exactText || null,
          startTime: t.startTime?.toString() || null,
          endTime: t.endTime?.toString() || null,
          createdAt: new Date().toISOString(),
          fileRef: t.fileMetadata ? {
            id: '',
            name: t.fileMetadata.name,
            mimeType: t.fileMetadata.mimeType || null,
            webUrl: t.fileMetadata.webUrl || null,
          } : undefined,
        })),
        tagIds: input.tagIds || [],
      };

      // Optimistically add annotation to all matching queries
      annotationQueries.forEach((query) => {
        queryClient.setQueryData<Annotation[]>(query.queryKey, (old) => {
          if (!old) return [optimisticAnnotation];
          return [optimisticAnnotation, ...old];
        });
      });

      return { previousAnnotations, optimisticId: optimisticAnnotation.id };
    },
    onSuccess: (data, _variables, context) => {
      // Replace optimistic annotation with real one from server
      const queryCache = queryClient.getQueryCache();
      const annotationQueries = queryCache.findAll({ queryKey: ['annotations'] });

      annotationQueries.forEach((query) => {
        queryClient.setQueryData<Annotation[]>(query.queryKey, (old) => {
          if (!old) return old;
          return old.map((annotation) =>
            annotation.id === context?.optimisticId ? data : annotation
          );
        });
      });
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousAnnotations) {
        const queryCache = queryClient.getQueryCache();
        const annotationQueries = queryCache.findAll({ queryKey: ['annotations'] });
        annotationQueries.forEach((query) => {
          queryClient.setQueryData(query.queryKey, context.previousAnnotations);
        });
      }
    },
  });
}

/**
 * Hook to update an annotation
 */
export function useUpdateAnnotation(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAnnotationInput }) =>
      apiClient.put<Annotation>(`/annotations/${id}`, input, accessToken!),
    onSuccess: (data) => {
      // Invalidate annotation queries
      queryClient.invalidateQueries({ queryKey: ['annotations'] });
      queryClient.invalidateQueries({ queryKey: ['annotation', data.id] });
    },
  });
}

/**
 * Hook to delete an annotation (with optimistic update)
 */
export function useDeleteAnnotation(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/annotations/${id}`, accessToken!),
    onMutate: async (annotationId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['annotations'] });
      await queryClient.cancelQueries({ queryKey: ['clusters'] });

      // Snapshot the previous value
      const queryCache = queryClient.getQueryCache();
      const annotationQueries = queryCache.findAll({ queryKey: ['annotations'] });
      const previousAnnotations = annotationQueries[0]?.state.data as Annotation[] | undefined;

      // Optimistically remove annotation from all matching queries
      annotationQueries.forEach((query) => {
        queryClient.setQueryData<Annotation[]>(query.queryKey, (old) => {
          if (!old) return old;
          return old.filter((annotation) => annotation.id !== annotationId);
        });
      });

      // Remove annotation from all clusters
      const clusterQueries = queryCache.findAll({ queryKey: ['clusters'] });
      const previousClusters = clusterQueries[0]?.state.data;

      clusterQueries.forEach((query) => {
        queryClient.setQueryData(query.queryKey, (old: any) => {
          if (!old) return old;
          // Handle both ClusterWithItems[] and single ClusterWithItems
          if (Array.isArray(old)) {
            return old.map((cluster: any) => ({
              ...cluster,
              items: cluster.items?.filter((item: any) => item.annotationId !== annotationId) || [],
            }));
          }
          return old;
        });
      });

      return { previousAnnotations, previousClusters };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      const queryCache = queryClient.getQueryCache();

      if (context?.previousAnnotations) {
        const annotationQueries = queryCache.findAll({ queryKey: ['annotations'] });
        annotationQueries.forEach((query) => {
          queryClient.setQueryData(query.queryKey, context.previousAnnotations);
        });
      }

      if (context?.previousClusters) {
        const clusterQueries = queryCache.findAll({ queryKey: ['clusters'] });
        clusterQueries.forEach((query) => {
          queryClient.setQueryData(query.queryKey, context.previousClusters);
        });
      }
    },
    // Don't refetch on success - optimistic update is the source of truth
    onSuccess: () => {
      // Silent success
    },
  });
}
