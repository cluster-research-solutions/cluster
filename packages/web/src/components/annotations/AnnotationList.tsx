import { useEffect, useRef } from 'react';
import type { Annotation } from '../../api/hooks/useAnnotations';

interface AnnotationListProps {
  annotations: Annotation[];
  onAnnotationClick?: (annotation: Annotation) => void;
  onAnnotationEdit?: (annotation: Annotation) => void;
  onAnnotationDelete?: (id: string) => void;
  currentTime?: number;
  selectedHighlightId?: string | null;
}

export function AnnotationList({
  annotations,
  onAnnotationClick,
  onAnnotationEdit,
  onAnnotationDelete,
  currentTime,
  selectedHighlightId,
}: AnnotationListProps) {
  const selectedRef = useRef<HTMLDivElement>(null);

  // Scroll to selected highlight when it changes
  useEffect(() => {
    if (selectedHighlightId && selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedHighlightId]);
  if (annotations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
        <p className="text-sm">No highlights yet</p>
        <p className="text-xs text-gray-400 mt-1">Select text or video to create one</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {annotations.map((annotation) => {
        const target = annotation.targets[0];
        const isMediaAnnotation = target?.selectorType === 'FragmentSelector';
        const startTime = target?.startTime ? parseFloat(target.startTime) : null;
        const endTime = target?.endTime ? parseFloat(target.endTime) : null;

        // Check if this media annotation is currently active
        const isActive =
          isMediaAnnotation &&
          currentTime !== undefined &&
          startTime !== null &&
          endTime !== null &&
          currentTime >= startTime &&
          currentTime <= endTime;

        const isSelected = selectedHighlightId === annotation.id;

        return (
          <div
            key={annotation.id}
            ref={isSelected ? selectedRef : null}
            onClick={() => onAnnotationClick?.(annotation)}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              isSelected
                ? 'bg-yellow-50 border-yellow-300 shadow-md ring-2 ring-yellow-200'
                : isActive
                ? 'bg-primary/10 border-primary/30 shadow-sm'
                : 'bg-card border-border hover:border-primary/30 hover:bg-muted/50'
            }`}
          >
            {/* Header with timestamp/motivation */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {isMediaAnnotation && startTime !== null && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAnnotationClick?.(annotation);
                    }}
                    className="text-xs font-mono text-primary hover:text-primary/80 hover:underline"
                  >
                    {formatTime(startTime)}
                  </button>
                )}
                <span className="text-xs text-muted-foreground">
                  {annotation.motivation.join(', ')}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {onAnnotationEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAnnotationEdit(annotation);
                    }}
                    className="text-muted-foreground hover:text-primary"
                    title="Edit highlight"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                )}
                {onAnnotationDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAnnotationDelete(annotation.id);
                    }}
                    className="text-gray-400 hover:text-red-600"
                    title="Delete highlight"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-1">
              {target?.exactText && (
                <p className="text-sm text-gray-600 italic">"{target.exactText}"</p>
              )}
              {annotation.bodyText && (
                <p className="text-sm text-gray-900">{annotation.bodyText}</p>
              )}
            </div>

            {/* Footer with metadata */}
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <span>{new Date(annotation.createdAt).toLocaleDateString()}</span>
              {annotation.participantId && (
                <>
                  <span>•</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded">
                    {annotation.participantId}
                  </span>
                </>
              )}
              {annotation.tagIds.length > 0 && (
                <>
                  <span>•</span>
                  <span>{annotation.tagIds.length} tag{annotation.tagIds.length > 1 ? 's' : ''}</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
