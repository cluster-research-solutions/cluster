import { Card, CardContent } from '../ui/card';
import type { Annotation } from '../../api/hooks/useAnnotations';

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

  // Format time for video/audio files
  const formatTime = (seconds: string | null) => {
    if (!seconds) return null;
    const secs = parseFloat(seconds);
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Get file icon based on mime type
  const getFileIcon = () => {
    const mimeType = fileRef?.mimeType?.toLowerCase() || '';

    if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) {
      return (
        <svg className="h-4 w-4 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      );
    }

    if (mimeType === 'application/pdf') {
      return (
        <svg className="h-4 w-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }

    // Default document icon
    return (
      <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, annotation);
    }
  };

  const startTime = target?.startTime ? formatTime(target.startTime) : null;
  const endTime = target?.endTime ? formatTime(target.endTime) : null;
  const timeRange = startTime && endTime ? `${startTime}-${endTime}` : startTime;

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
          {getFileIcon()}
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
