import { useState } from 'react';
import { useAccessToken } from '../hooks/useAccessToken';
import { useAnnotations } from '../api/hooks/useAnnotations';
import {
  useClusters,
  useCreateCluster,
  useUpdateCluster,
  useDeleteCluster,
  useAddClusterItem,
  useRemoveClusterItem,
} from '../api/hooks/useClusters';
import { HighlightsSidebar } from '../components/organize/HighlightsSidebar';
import { ClusterBox } from '../components/organize/ClusterBox';
import { Button } from '../components/ui/button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import type { Annotation } from '../api/hooks/useAnnotations';

export function OrganizePage() {
  const { accessToken } = useAccessToken();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [draggedAnnotation, setDraggedAnnotation] = useState<Annotation | null>(null);

  // Fetch data
  const { data: annotations = [], isLoading: annotationsLoading } = useAnnotations(
    {},
    accessToken
  );
  const { data: clusters = [], isLoading: clustersLoading } = useClusters(
    undefined,
    accessToken
  );

  // Mutations
  const createCluster = useCreateCluster(accessToken);
  const updateCluster = useUpdateCluster(accessToken);
  const deleteCluster = useDeleteCluster(accessToken);
  const addClusterItem = useAddClusterItem(accessToken);
  const removeClusterItem = useRemoveClusterItem(accessToken);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, annotation: Annotation) => {
    setDraggedAnnotation(annotation);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('annotationId', annotation.id);
  };

  const handleDropOnCluster = (clusterId: string) => {
    if (!draggedAnnotation) return;

    addClusterItem.mutate(
      {
        clusterId,
        annotationId: draggedAnnotation.id,
      },
      {
        onSuccess: () => {
          toast.success('Highlight added to cluster');
          setDraggedAnnotation(null);
        },
        onError: (error: any) => {
          if (error.response?.status === 409) {
            toast.error('Highlight already in this cluster');
          } else {
            toast.error('Failed to add highlight to cluster');
          }
        },
      }
    );
  };

  // Create new cluster
  const handleCreateCluster = () => {
    const clusterNumber = clusters.length + 1;
    createCluster.mutate(
      {
        name: `Cluster ${clusterNumber}`,
        position: { x: 0, y: 0 },
        size: { width: 300, height: 200 },
      },
      {
        onSuccess: () => {
          toast.success('Cluster created');
        },
        onError: () => {
          toast.error('Failed to create cluster');
        },
      }
    );
  };

  // Update cluster
  const handleUpdateCluster = (
    id: string,
    updates: { name?: string; color?: string }
  ) => {
    updateCluster.mutate(
      { id, ...updates },
      {
        onError: () => {
          toast.error('Failed to update cluster');
        },
      }
    );
  };

  // Delete cluster
  const handleDeleteCluster = (id: string) => {
    if (confirm('Are you sure you want to delete this cluster?')) {
      deleteCluster.mutate(id, {
        onSuccess: () => {
          toast.success('Cluster deleted');
        },
        onError: () => {
          toast.error('Failed to delete cluster');
        },
      });
    }
  };

  // Remove item from cluster
  const handleRemoveItem = (clusterId: string, annotationId: string) => {
    removeClusterItem.mutate(
      { clusterId, annotationId },
      {
        onSuccess: () => {
          toast.success('Highlight removed from cluster');
        },
        onError: () => {
          toast.error('Failed to remove highlight');
        },
      }
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Sidebar */}
      {sidebarOpen && (
        <HighlightsSidebar
          annotations={annotations}
          isLoading={annotationsLoading}
          onDragStart={handleDragStart}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Toggle sidebar button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-10"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>

        {/* Clusters grid */}
        <div className="flex-1 overflow-auto p-8">
          {clustersLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : clusters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg
                className="h-24 w-24 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="text-lg font-medium mb-2">No clusters yet</h3>
              <p className="text-sm mb-4">
                Create your first cluster to start organizing highlights
              </p>
              <Button onClick={handleCreateCluster}>
                <Plus className="h-4 w-4 mr-2" />
                Create Cluster
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {clusters.map((cluster) => (
                <ClusterBox
                  key={cluster.id}
                  cluster={cluster}
                  onUpdate={handleUpdateCluster}
                  onDelete={handleDeleteCluster}
                  onRemoveItem={handleRemoveItem}
                  onDrop={handleDropOnCluster}
                />
              ))}
            </div>
          )}
        </div>

        {/* Floating action button */}
        {clusters.length > 0 && (
          <Button
            onClick={handleCreateCluster}
            className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg"
            size="lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  );
}
