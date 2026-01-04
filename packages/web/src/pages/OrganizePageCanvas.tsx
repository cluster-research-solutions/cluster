import { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Node,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeTypes,
  OnNodesChange,
  ReactFlowProvider,
  useReactFlow,
  NodeDragHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
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
import {
  useCanvasNodes,
  useSaveCanvasNode,
  useUpdateCanvasNode,
  useDeleteCanvasNode,
} from '../api/hooks/useCanvasNodes';
import { HighlightsSidebar } from '../components/organize/HighlightsSidebar';
import { HighlightNode } from '../components/organize/HighlightNode';
import { ClusterNode } from '../components/organize/ClusterNode';
import { CanvasSnapshotManager } from '../components/organize/CanvasSnapshotManager';
import { Button } from '../components/ui/button';
import { ChevronRight, Save, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import type { Annotation } from '../api/hooks/useAnnotations';
import type { CanvasSnapshot } from '../api/hooks/useCanvasSnapshots';

const PROXIMITY_THRESHOLD = 100; // pixels

// Define node types outside component to prevent re-creation
const nodeTypes: NodeTypes = {
  highlight: HighlightNode,
  cluster: ClusterNode,
};

// Wrapper component that provides ReactFlowProvider context
export function OrganizePageCanvas() {
  return (
    <ReactFlowProvider>
      <OrganizePageCanvasContent />
    </ReactFlowProvider>
  );
}

// Inner component that uses React Flow hooks
function OrganizePageCanvasContent() {
  const { accessToken } = useAccessToken();
  const { screenToFlowPosition, getViewport, setViewport } = useReactFlow();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [draggedAnnotation, setDraggedAnnotation] = useState<Annotation | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Canvas snapshot state
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [snapshotMode, setSnapshotMode] = useState<'save' | 'load'>('save');

  // Track pending position updates to save on unmount
  const pendingClusterUpdates = useRef<Map<string, { position: { x: number; y: number }; size?: { width: number; height: number } }>>(new Map());
  const pendingCanvasNodeUpdates = useRef<Map<string, { position: { x: number; y: number } }>>(new Map());

  // Check for saved viewport immediately (synchronous)
  const savedViewportStr = localStorage.getItem('organize-canvas-viewport');
  const hasSavedViewport = useRef(!!savedViewportStr);
  const isRestoringViewport = useRef(false); // Flag to prevent saving during restore

  // Fetch data
  const { data: annotations = [], isLoading: annotationsLoading } = useAnnotations(
    {},
    accessToken
  );
  const { data: clusters = [], isLoading: clustersLoading } = useClusters(
    undefined,
    accessToken
  );
  const { data: canvasNodesData = [] } = useCanvasNodes(undefined, accessToken);

  // Mutations
  const createCluster = useCreateCluster(accessToken);
  const updateCluster = useUpdateCluster(accessToken);
  const deleteCluster = useDeleteCluster(accessToken);
  const addClusterItem = useAddClusterItem(accessToken);
  const removeClusterItem = useRemoveClusterItem(accessToken);
  const saveCanvasNode = useSaveCanvasNode(accessToken);
  const updateCanvasNode = useUpdateCanvasNode(accessToken);
  const deleteCanvasNode = useDeleteCanvasNode(accessToken);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState([]);

  // Restore viewport on mount after nodes are ready
  useEffect(() => {
    // If data is still loading, wait
    if (annotationsLoading || clustersLoading) return;

    if (savedViewportStr && nodes.length > 0) {
      try {
        const viewport = JSON.parse(savedViewportStr);
        isRestoringViewport.current = true;

        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          setViewport(viewport, { duration: 0 });

          // Re-enable saving and mark canvas as ready after restore completes
          setTimeout(() => {
            isRestoringViewport.current = false;
            setCanvasReady(true);
          }, 100);
        });
      } catch (error) {
        isRestoringViewport.current = false;
        setCanvasReady(true);
      }
    } else if (nodes.length > 0) {
      // No saved viewport, show canvas immediately after fitView
      setTimeout(() => {
        setCanvasReady(true);
      }, 100);
    } else {
      // No nodes at all (empty canvas) - show it immediately after data loads
      setCanvasReady(true);
    }
  }, [savedViewportStr, setViewport, nodes.length, annotationsLoading, clustersLoading]);

  // Handle node changes (including resize)
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);

      // Handle dimension changes (resize) - defer save
      changes.forEach((change) => {
        if (change.type === 'dimensions' && change.dimensions) {
          const node = nodes.find((n) => n.id === change.id);
          if (node && node.type === 'cluster') {
            const clusterId = node.id.replace('cluster-', '');
            const existing = pendingClusterUpdates.current.get(clusterId) || { position: node.position };
            pendingClusterUpdates.current.set(clusterId, {
              ...existing,
              size: {
                width: change.dimensions.width,
                height: change.dimensions.height,
              },
            });
          }
        }
      });
    },
    [onNodesChange, nodes]
  );

  // Handlers
  const handleUpdateCluster = useCallback(
    (id: string, updates: { name?: string; color?: string }) => {
      updateCluster.mutate(
        { id, ...updates },
        {
          onError: () => {
            toast.error('Failed to update cluster');
          },
        }
      );
    },
    [updateCluster]
  );

  const handleDeleteCluster = useCallback(
    (id: string) => {
      // Remove from pending updates to prevent cleanup from trying to save it
      pendingClusterUpdates.current.delete(id);

      deleteCluster.mutate(id, {
        onError: (error) => {
          console.error('Failed to delete cluster:', error);
          toast.error('Failed to delete cluster');
        },
      });
    },
    [deleteCluster]
  );

  const handleRemoveItem = useCallback(
    (clusterId: string, annotationId: string) => {
      removeClusterItem.mutate(
        { clusterId, annotationId },
        {
          onError: (error) => {
            console.error('Failed to remove highlight:', error);
            toast.error('Failed to remove highlight');
          },
        }
      );
    },
    [removeClusterItem]
  );

  // Load canvas nodes from database and create highlight nodes
  useEffect(() => {
    if (!canvasNodesData.length || !annotations.length) return;

    const handleRemove = (reactFlowNodeId: string) => {
      // Extract canvas node ID from React Flow node ID
      // Format: highlight-{annotationId (UUID 5 segments)}-{canvasNodeId (UUID 5 segments)}
      // After splitting by '-', we have: ['highlight', ...5 annotationId segments, ...5 canvasNodeId segments]
      const parts = reactFlowNodeId.split('-');
      const canvasNodeId = parts.slice(6, 11).join('-'); // Last 5 segments form the canvas node UUID

      if (!canvasNodeId || canvasNodeId.length < 36) {
        toast.error('Invalid node ID');
        return;
      }

      // Remove from pending updates to prevent cleanup from trying to save it
      pendingCanvasNodeUpdates.current.delete(canvasNodeId);

      deleteCanvasNode.mutate(canvasNodeId);
      setNodes((nds) => nds.filter((n) => n.id !== reactFlowNodeId));
    };

    const canvasHighlightNodes: Node[] = canvasNodesData
      .map((canvasNode) => {
        const annotation = annotations.find((a) => a.id === canvasNode.annotationId);
        if (!annotation) return null;

        return {
          id: `highlight-${canvasNode.annotationId}-${canvasNode.id}`,
          type: 'highlight',
          position: canvasNode.position,
          data: { annotation, onRemove: handleRemove, canvasNodeId: canvasNode.id },
          draggable: true,
        };
      })
      .filter(Boolean) as Node[];

    setNodes((prevNodes) => {
      // Remove old canvas highlights, add new ones from DB
      const clusterNodes = prevNodes.filter((n) => n.type === 'cluster');
      return [...clusterNodes, ...canvasHighlightNodes];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasNodesData, annotations]);

  // Sync cluster nodes with database state (add new, remove deleted, update data)
  useEffect(() => {
    setNodes((prevNodes) => {
      const existingClusterIds = new Set(
        prevNodes.filter((n) => n.type === 'cluster').map((n) => n.id)
      );
      const newClusterIds = new Set(clusters.map((c) => `cluster-${c.id}`));

      // Find clusters to add and remove
      const clustersToAdd = clusters.filter((c) => !existingClusterIds.has(`cluster-${c.id}`));
      const nodesToKeep = prevNodes.filter((n) => {
        if (n.type !== 'cluster') return true; // Keep all highlight nodes
        return newClusterIds.has(n.id); // Keep cluster only if it still exists in DB
      });

      // Add new cluster nodes
      const newClusterNodes: Node[] = clustersToAdd.map((cluster) => {
        const pendingUpdate = pendingClusterUpdates.current.get(cluster.id);
        return {
          id: `cluster-${cluster.id}`,
          type: 'cluster',
          position: pendingUpdate?.position || cluster.position || { x: 100, y: 100 },
          style: {
            width: pendingUpdate?.size?.width || cluster.size?.width || 400,
            height: pendingUpdate?.size?.height || cluster.size?.height || 300,
          },
          data: {
            cluster: { ...cluster, items: [...cluster.items] },
            onUpdate: handleUpdateCluster,
            onDelete: handleDeleteCluster,
            onRemoveItem: handleRemoveItem,
          },
          draggable: true,
        };
      });

      // Update existing cluster nodes with fresh data (for item changes)
      const updatedNodes = nodesToKeep.map((node) => {
        if (node.type === 'cluster') {
          const clusterId = node.id.replace('cluster-', '');
          const cluster = clusters.find((c) => c.id === clusterId);
          if (cluster) {
            // Only update the data, preserve position/size from current node state
            return {
              ...node,
              data: {
                ...node.data,
                cluster: { ...cluster, items: [...cluster.items] },
              },
            };
          }
        }
        return node;
      });

      return [...updatedNodes, ...newClusterNodes];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusters]);

  // Save all pending updates and viewport on unmount
  useEffect(() => {
    return () => {
      // Save viewport state (only if canvas is actually loaded with content)
      if (!isRestoringViewport.current && nodes.length > 0) {
        const viewport = getViewport();
        localStorage.setItem('organize-canvas-viewport', JSON.stringify(viewport));
      }

      // Save cluster updates (validate UUID format first)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      pendingClusterUpdates.current.forEach((updates, clusterId) => {
        if (uuidRegex.test(clusterId)) {
          updateCluster.mutate({ id: clusterId, ...updates });
        }
      });

      // Save canvas node updates (validate UUID format first)
      pendingCanvasNodeUpdates.current.forEach((updates, canvasNodeId) => {
        if (uuidRegex.test(canvasNodeId)) {
          updateCanvasNode.mutate({ id: canvasNodeId, ...updates });
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length]);

  // Calculate distance between two points
  const distance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  // Find nearby highlights or clusters
  const findNearbyNodes = (position: { x: number; y: number }, excludeId: string) => {
    const nearbyHighlights = nodes.filter(
      (node) =>
        node.type === 'highlight' &&
        node.id !== excludeId &&
        distance(position, node.position) < PROXIMITY_THRESHOLD
    );

    // For clusters, check if position is INSIDE the cluster bounds (not just proximity)
    const nearbyCluster = nodes.find((node) => {
      if (node.type !== 'cluster' || node.id === excludeId) return false;

      // Get cluster dimensions from node style (which includes saved size) or use defaults
      const width = (node.style?.width as number) || 400;
      const height = (node.style?.height as number) || 300;

      // Check if position is inside cluster bounds
      return (
        position.x >= node.position.x &&
        position.x <= node.position.x + width &&
        position.y >= node.position.y &&
        position.y <= node.position.y + height
      );
    });

    return { nearbyHighlights, nearbyCluster };
  };

  // Handle node drag (for visual feedback while dragging)
  const onNodeDrag: NodeDragHandler = useCallback(
    (_event, node) => {
      if (node.type === 'highlight') {
        const { nearbyCluster } = findNearbyNodes(node.position, node.id);

        // Update all cluster nodes to show/hide drop zone styling
        setNodes((nds) =>
          nds.map((n) => {
            if (n.type === 'cluster') {
              const isTargetCluster = nearbyCluster && n.id === nearbyCluster.id;
              // Only update if the state changed to avoid unnecessary re-renders
              const currentIsDragOver = (n.data as any).isDragOver;
              if (currentIsDragOver !== isTargetCluster) {
                return {
                  ...n,
                  data: {
                    ...n.data,
                    isDragOver: isTargetCluster,
                  },
                };
              }
            }
            return n;
          })
        );
      }
    },
    [nodes, findNearbyNodes, setNodes]
  );

  // Handle node drag stop
  const onNodeDragStop: NodeDragHandler = useCallback(
    (_event, node) => {
      // Clear isDragOver state from all clusters
      setNodes((nds) =>
        nds.map((n) => {
          if (n.type === 'cluster' && (n.data as any).isDragOver) {
            return {
              ...n,
              data: {
                ...n.data,
                isDragOver: false,
              },
            };
          }
          return n;
        })
      );

      if (node.type === 'highlight') {
        // Extract IDs from node ID (format: highlight-{annotationId (5 segments)}-{canvasNodeId (5 segments)})
        const parts = node.id.split('-');
        const annotationId = parts.slice(1, 6).join('-'); // Segments 1-5 form annotationId UUID
        const canvasNodeId = parts.slice(6, 11).join('-'); // Segments 6-10 form canvasNodeId UUID
        const { nearbyCluster } = findNearbyNodes(node.position, node.id);

        if (nearbyCluster) {
          // Check if annotation is already in this cluster
          const clusterId = nearbyCluster.id.replace('cluster-', '');
          const cluster = clusters.find((c) => c.id === clusterId);
          const alreadyInCluster = cluster && Array.isArray(cluster.items)
            ? cluster.items.some((item) => item.annotationId === annotationId)
            : false;

          if (alreadyInCluster) {
            // Don't allow duplicate - just show feedback
            toast.info('Already in this cluster');
            return;
          }

          // Get the annotation for optimistic update
          const annotation = annotations.find((a) => a.id === annotationId);

          // Move from canvas to cluster
          addClusterItem.mutate(
            {
              clusterId,
              annotationId,
              annotation, // Pass full annotation for optimistic update
              position: node.position,
            },
            {
              onSuccess: () => {
                // Delete from canvas_nodes table using canvas node ID
                if (canvasNodeId) {
                  // Remove from pending updates to prevent cleanup from trying to save it
                  pendingCanvasNodeUpdates.current.delete(canvasNodeId);
                  deleteCanvasNode.mutate(canvasNodeId);
                }
                // Remove from canvas (this is a move operation)
                setNodes((nds) => nds.filter((n) => n.id !== node.id));
              },
              onError: (error) => {
                console.error('Failed to add to cluster:', error);
                toast.error('Failed to add to cluster');
              },
            }
          );
        } else {
          // Not near a cluster - defer canvas node position update
          if (canvasNodeId) {
            pendingCanvasNodeUpdates.current.set(canvasNodeId, {
              position: node.position,
            });
          }
        }
      } else if (node.type === 'cluster') {
        // Defer cluster position update
        const clusterId = node.id.replace('cluster-', '');
        const existing = pendingClusterUpdates.current.get(clusterId) || {};
        pendingClusterUpdates.current.set(clusterId, {
          ...existing,
          position: node.position,
        });
      }
    },
    [nodes, clusters, addClusterItem, deleteCanvasNode]
  );

  // Handle drag from sidebar
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !draggedAnnotation) {
        return;
      }

      // Convert screen coordinates to flow coordinates (no need to subtract bounds anymore)
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Find nearby cluster
      const { nearbyCluster } = findNearbyNodes(position, '');

      // Validate UUID format before any operations
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(draggedAnnotation.id)) {
        toast.warning('Please wait for annotation to save before adding to canvas...');
        setDraggedAnnotation(null);
        return;
      }

      if (nearbyCluster) {
        // Check if annotation is already in this cluster
        const clusterId = nearbyCluster.id.replace('cluster-', '');
        const cluster = clusters.find((c) => c.id === clusterId);
        const alreadyInCluster = cluster?.items?.some((item: any) => item.annotationId === draggedAnnotation.id);

        if (alreadyInCluster) {
          // Don't allow duplicate - just show feedback and clear drag state
          toast.info('Already in this cluster');
          setDraggedAnnotation(null);
          return;
        }

        // Add to existing cluster (no need to create canvas node)
        addClusterItem.mutate(
          {
            clusterId,
            annotationId: draggedAnnotation.id,
            annotation: draggedAnnotation, // Pass full annotation for optimistic update
            position,
          },
          {
            onSuccess: () => {
              setDraggedAnnotation(null);
            },
            onError: () => {
              toast.error('Failed to add to cluster');
              setDraggedAnnotation(null);
            },
          }
        );
      } else {
        // Drop as standalone highlight - save to database
        saveCanvasNode.mutate(
          {
            annotationId: draggedAnnotation.id,
            annotation: draggedAnnotation, // Pass for optimistic update
            position,
          },
          {
            onSuccess: () => {
              setDraggedAnnotation(null);
            },
            onError: () => {
              toast.error('Failed to add to canvas');
              setDraggedAnnotation(null);
            },
          }
        );
      }
    },
    [draggedAnnotation, nodes, clusters, screenToFlowPosition, addClusterItem, saveCanvasNode]
  );

  const handleDragStart = (e: React.DragEvent, annotation: Annotation) => {
    setDraggedAnnotation(annotation);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);

  // Handle right-click on canvas
  const handlePaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();

    // Store screen position for menu display
    setContextMenu({ x: event.clientX, y: event.clientY });

    // Store flow position for cluster creation
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    setContextMenuPosition(position);
  }, [screenToFlowPosition]);

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  // Create an empty cluster at the specified position
  const handleCreateClusterAtPosition = useCallback(() => {
    if (!contextMenuPosition) return;

    createCluster.mutate(
      {
        name: `Cluster ${clusters.length + 1}`,
        position: contextMenuPosition,
        size: { width: 400, height: 300 },
      },
      {
        onSuccess: () => {
          setContextMenu(null);
          setContextMenuPosition(null);
        },
        onError: () => {
          toast.error('Failed to create cluster');
        },
      }
    );
  }, [contextMenuPosition, clusters.length, createCluster]);

  // Save viewport whenever it changes (zoom/pan)
  const handleViewportChange = useCallback(() => {
    // Don't save if we're currently restoring or if fitView is running
    if (isRestoringViewport.current) {
      return;
    }

    const viewport = getViewport();
    localStorage.setItem('organize-canvas-viewport', JSON.stringify(viewport));
  }, [getViewport]);

  // Snapshot handlers
  const handleOpenSaveSnapshot = useCallback(() => {
    setSnapshotMode('save');
    setSnapshotModalOpen(true);
  }, []);

  const handleOpenLoadSnapshot = useCallback(() => {
    setSnapshotMode('load');
    setSnapshotModalOpen(true);
  }, []);

  const handleLoadSnapshot = useCallback((snapshot: CanvasSnapshot) => {
    const { nodes: savedNodes, edges: savedEdges, viewport } = snapshot.canvasState;

    // Restore nodes, edges, and viewport
    setNodes(savedNodes);
    setEdges(savedEdges);
    setViewport(viewport, { duration: 300 });

    toast.success(`Loaded: ${snapshot.name}`);
  }, [setNodes, setEdges, setViewport]);

  const getCurrentCanvasState = useCallback(() => {
    return {
      nodes,
      edges,
      viewport: getViewport(),
    };
  }, [nodes, edges, getViewport]);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Sidebar */}
      {sidebarOpen && (
        <HighlightsSidebar
          annotations={annotations}
          isLoading={false}
          onDragStart={handleDragStart}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        {/* Loading overlay */}
        {!canvasReady && (
          <div className="absolute inset-0 bg-gray-50 z-50 flex items-center justify-center">
            <div className="text-gray-500">Loading canvas...</div>
          </div>
        )}

        {/* Show sidebar button when collapsed */}
        {!sidebarOpen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-10 bg-white shadow-md hover:shadow-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Board save/load buttons */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenLoadSnapshot}
            className="bg-white shadow-md hover:shadow-lg"
            title="Load board"
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Load
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenSaveSnapshot}
            className="bg-white shadow-md hover:shadow-lg"
            title="Save board"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onPaneContextMenu={handlePaneContextMenu}
          onMoveEnd={handleViewportChange}
          nodeTypes={nodeTypes}
          fitView={!hasSavedViewport.current}
          minZoom={0.5}
          maxZoom={1.5}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>

        {/* Canvas Snapshot Manager */}
        <CanvasSnapshotManager
          open={snapshotModalOpen}
          onOpenChange={setSnapshotModalOpen}
          mode={snapshotMode}
          onLoad={handleLoadSnapshot}
          currentCanvasState={getCurrentCanvasState()}
          studyId={undefined}
        />

        {/* Context menu */}
        {contextMenu && (
          <div
            className="fixed bg-white shadow-lg rounded-md border border-gray-200 py-1 z-50"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              onClick={handleCreateClusterAtPosition}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
            >
              Create Cluster
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
