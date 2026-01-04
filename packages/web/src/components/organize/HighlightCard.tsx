import { Card, CardContent } from '../ui/card';
import type { Annotation } from '../../api/hooks/useAnnotations';
import { getFileIcon } from '../../lib/fileIcons';
import { formatTimeRange } from '../../lib/formatting';

interface HighlightCardProps {
  annotation: Annotation;
  draggable?: boolean;
  compact?: boolean;
  onDragStart?: (e: React.DragEvent, annotation: Annotation) => void;
  onClick?: () => void;
}

export function HighlightCard({
  annotation,
  draggable = false,
  compact = false,
  onDragStart,
  onClick,
}: HighlightCardProps) {
  const target = annotation.targets[0];
  const fileRef = target?.fileRef;

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, annotation);
    }
  };

  const timeRange = formatTimeRange(target?.startTime, target?.endTime);

  return (
    <Card
      className={`
        ${compact ? 'max-w-full' : 'max-w-[300px]'}
        ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        hover:shadow-md transition-all border-gray-200
      `}
      draggable={draggable}
      onDragStart={handleDragStart}
      onClick={onClick}
    >
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        {/* File name */}
        <div className="flex items-center gap-2 mb-2">
          {getFileIcon(fileRef?.mimeType, 'sm')}
          <span className="text-xs text-gray-500 truncate flex-1">
            {fileRef?.name || 'Unknown file'}
          </span>
        </div>

        {/* Quoted text */}
        {target?.exactText && (
          <p className={`text-sm text-gray-700 mb-2 ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}>
            "{target.exactText}"
          </p>
        )}

        {/* User note */}
        {annotation.bodyText && (
          <p className={`text-sm text-gray-600 italic mb-2 ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}>
            {annotation.bodyText}
          </p>
        )}

        {/* Metadata badges */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Timestamp for video/audio */}
          {timeRange && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
              {timeRange}
            </span>
          )}

          {/* Participant ID */}
          {annotation.participantId && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {annotation.participantId}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
