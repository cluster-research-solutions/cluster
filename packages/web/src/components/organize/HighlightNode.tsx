import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent } from '../ui/card';
import { X } from 'lucide-react';
import type { Annotation } from '../../api/hooks/useAnnotations';
import { getFileIcon } from '../../lib/fileIcons';
import { formatTimeRange } from '../../lib/formatting';

export interface HighlightNodeData {
  annotation: Annotation;
  onRemove?: (nodeId: string) => void;
  nodeId?: string;
}

export const HighlightNode = memo(({ data, id }: NodeProps<HighlightNodeData>) => {
  const { annotation, onRemove } = data;
  const target = annotation.targets[0];
  const fileRef = target?.fileRef;

  const timeRange = formatTimeRange(target?.startTime, target?.endTime);

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div className="relative group">
        <Card className="w-[280px] cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg transition-shadow overflow-hidden">
          <CardContent className="p-3 space-y-2 overflow-hidden">
            {/* File name */}
            <div className="flex items-center gap-2 min-w-0">
              {getFileIcon(fileRef?.mimeType, 'sm')}
              <span className="text-xs text-gray-500 truncate flex-1 min-w-0">
                {fileRef?.name || 'Unknown file'}
              </span>
            </div>

          {/* Quoted text */}
          {target?.exactText && (
            <p className="text-sm text-gray-700 line-clamp-3 italic" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
              "{target.exactText}"
            </p>
          )}

          {/* User note */}
          {annotation.bodyText && (
            <p className="text-sm text-gray-600 line-clamp-2" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
              {annotation.bodyText}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {timeRange && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 break-words">
                {timeRange}
              </span>
            )}
            {annotation.participantId && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 break-words">
                {annotation.participantId}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Remove button - only show if onRemove is provided */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 nodrag z-10"
          title="Remove from canvas"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  );
});

HighlightNode.displayName = 'HighlightNode';
