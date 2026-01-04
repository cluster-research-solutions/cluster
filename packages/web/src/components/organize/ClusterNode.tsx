import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Trash2, Palette, X, Play } from 'lucide-react';
import type { ClusterWithItems } from '../../api/hooks/useClusters';
import { HighlightCard } from './HighlightCard';
import { useNavigate } from 'react-router-dom';

export interface ClusterNodeData {
  cluster: ClusterWithItems;
  onUpdate: (id: string, updates: { name?: string; color?: string }) => void;
  onDelete: (id: string) => void;
  onRemoveItem: (clusterId: string, annotationId: string) => void;
  isDragOver?: boolean; // For showing drop zone when dragging from canvas
}

const PRESET_COLORS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6b7280', // gray
];

export const ClusterNode = memo(({ data }: NodeProps<ClusterNodeData>) => {
  const { cluster, onUpdate, onDelete, onRemoveItem, isDragOver: isDragOverFromCanvas = false } = data;
  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(cluster.name);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isDragOverFromSidebar, setIsDragOverFromSidebar] = useState(false);
  const dragCounterRef = React.useRef(0);

  // Combine both drag over states
  const isDragOver = isDragOverFromCanvas || isDragOverFromSidebar;

  const handleNameSave = () => {
    if (editedName.trim() && editedName !== cluster.name) {
      onUpdate(cluster.id, { name: editedName.trim() });
    }
    setIsEditingName(false);
  };

  const handleColorChange = (color: string) => {
    onUpdate(cluster.id, { color });
    setShowColorPicker(false);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (dragCounterRef.current === 1) {
      setIsDragOverFromSidebar(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOverFromSidebar(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Don't stopPropagation - let it bubble to ReactFlow's onDrop
    dragCounterRef.current = 0;
    setIsDragOverFromSidebar(false);
  };

  const borderColor = cluster.color || '#d1d5db';

  return (
    <>
      <NodeResizer
        color={borderColor}
        isVisible={true}
        minWidth={280}
        minHeight={150}
        handleStyle={{
          width: '12px',
          height: '12px',
          borderRadius: '2px',
        }}
        lineStyle={{
          borderWidth: '2px',
        }}
      />
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Card
        className="w-full h-full cursor-move overflow-hidden transition-all relative"
        style={{
          borderColor: borderColor,
          borderWidth: isDragOver ? '4px' : '2px',
          borderStyle: isDragOver ? 'dashed' : 'solid',
          backgroundColor: `${borderColor}15`,
          boxShadow: isDragOver ? `0 0 0 6px ${borderColor}40, 0 0 20px ${borderColor}60` : undefined,
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drop zone overlay */}
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="bg-white/90 px-6 py-4 rounded-lg shadow-xl border-2" style={{ borderColor }}>
              <p className="text-lg font-semibold" style={{ color: borderColor }}>
                Drop here to add to cluster
              </p>
            </div>
          </div>
        )}
        <CardHeader className="pb-2 px-3 pt-3">
          <div className="flex items-center justify-between gap-2">
            {/* Cluster name */}
            {isEditingName ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSave();
                  if (e.key === 'Escape') {
                    setEditedName(cluster.name);
                    setIsEditingName(false);
                  }
                }}
                className="flex-1 px-2 py-1 text-lg font-semibold border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary nodrag"
                autoFocus
              />
            ) : (
              <h3 className="flex-1 text-lg font-semibold">
                <span
                  onClick={() => setIsEditingName(true)}
                  className="cursor-pointer hover:text-primary transition-colors nodrag inline-block"
                >
                  {cluster.name}
                </span>
              </h3>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Item count */}
              <span className="text-sm text-gray-500 px-2">
                {cluster.items.length}
              </span>

              {/* Color picker */}
              <div className="relative nodrag">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="h-8 w-8 p-0"
                >
                  <Palette className="h-4 w-4" style={{ color: borderColor }} />
                </Button>

                {showColorPicker && (
                  <div className="absolute right-0 top-full mt-1 p-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="grid grid-cols-4 gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorChange(color)}
                          className="w-6 h-6 rounded border-2 border-gray-200 hover:scale-110 transition-transform"
                          style={{
                            backgroundColor: color,
                            borderColor: cluster.color === color ? '#000' : '#e5e7eb',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Play cluster */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/clusters/${cluster.id}/play`)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-primary nodrag"
                title="Play cluster"
              >
                <Play className="h-4 w-4" />
              </Button>

              {/* Delete cluster */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(cluster.id)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 nodrag"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="min-h-[120px] px-3 pb-3 nodrag">
          {cluster.items.length === 0 ? (
            <div className="flex items-center justify-center h-[100px] text-gray-400 text-sm">
              Drop highlights here
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {cluster.items.map((item) => (
                <div key={item.annotationId} className="relative group pr-6">
                  <HighlightCard annotation={item.annotation} compact />
                  {/* Remove button */}
                  <button
                    onClick={() => onRemoveItem(cluster.id, item.annotationId)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  );
});

ClusterNode.displayName = 'ClusterNode';
