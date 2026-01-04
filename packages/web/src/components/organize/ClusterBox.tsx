import { useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { X, Trash2, Palette } from 'lucide-react';
import { HighlightCard } from './HighlightCard';
import type { ClusterWithItems } from '../../api/hooks/useClusters';

interface ClusterBoxProps {
  cluster: ClusterWithItems;
  onUpdate: (id: string, updates: { name?: string; color?: string }) => void;
  onDelete: (id: string) => void;
  onRemoveItem: (clusterId: string, annotationId: string) => void;
  onDrop?: (clusterId: string) => void;
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

export function ClusterBox({
  cluster,
  onUpdate,
  onDelete,
  onRemoveItem,
  onDrop,
}: ClusterBoxProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(cluster.name);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (onDrop) {
      onDrop(cluster.id);
    }
  };

  const borderColor = cluster.color || '#d1d5db';

  return (
    <Card
      className={`
        transition-all
        ${isDragOver ? 'ring-2 ring-primary ring-offset-2' : ''}
      `}
      style={{ borderColor, borderWidth: '2px' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-3">
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
              className="flex-1 px-2 py-1 text-lg font-semibold border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          ) : (
            <h3
              onClick={() => setIsEditingName(true)}
              className="flex-1 text-lg font-semibold cursor-pointer hover:text-primary transition-colors"
            >
              {cluster.name}
            </h3>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Item count */}
            <span className="text-sm text-gray-500 px-2">
              {cluster.items.length}
            </span>

            {/* Color picker */}
            <div className="relative">
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

            {/* Delete cluster */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(cluster.id)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="min-h-[200px]">
        {cluster.items.length === 0 ? (
          <div className="flex items-center justify-center h-[180px] text-gray-400 text-sm">
            Drag highlights here
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {cluster.items.map((item) => (
              <div key={item.annotationId} className="relative group">
                <HighlightCard annotation={item.annotation} compact />

                {/* Remove button */}
                <button
                  onClick={() => onRemoveItem(cluster.id, item.annotationId)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
