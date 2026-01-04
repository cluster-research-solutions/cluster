import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent } from '../ui/card';
import { X } from 'lucide-react';
import type { Annotation } from '../../api/hooks/useAnnotations';

export interface HighlightNodeData {
  annotation: Annotation;
  onRemove?: (nodeId: string) => void;
  nodeId?: string;
}

export const HighlightNode = memo(({ data, id }: NodeProps<HighlightNodeData>) => {
  const { annotation, onRemove } = data;
  const target = annotation.targets[0];
  const fileRef = target?.fileRef;

  const getFileIcon = () => {
    const mimeType = fileRef?.mimeType?.toLowerCase() || '';
    if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) {
      return (
        <svg className="h-4 w-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    if (mimeType === 'application/pdf') {
      return (
        <svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  const formatTime = (seconds: string | null) => {
    if (!seconds) return null;
    const num = parseFloat(seconds);
    const mins = Math.floor(num / 60);
    const secs = Math.floor(num % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeRange = target?.startTime
    ? `${formatTime(target.startTime)}${target.endTime ? ` - ${formatTime(target.endTime)}` : ''}`
    : null;

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div className="relative group">
        <Card className="w-[280px] cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg transition-shadow overflow-hidden">
          <CardContent className="p-3 space-y-2 overflow-hidden">
            {/* File name */}
            <div className="flex items-center gap-2 min-w-0">
              {getFileIcon()}
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
