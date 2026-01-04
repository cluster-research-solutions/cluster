import { useState, useEffect } from 'react';
import type { SelectionInfo } from '../../hooks/useTextSelection';
import type { MediaSelectionInfo } from '../../hooks/useMediaSelection';
import type { Annotation } from '../../api/hooks/useAnnotations';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface HighlightPopoverProps {
  open: boolean;
  mode: 'create' | 'edit';
  selection: SelectionInfo | MediaSelectionInfo | null;
  editingAnnotation?: Annotation | null;
  fileId: string;
  onCreateHighlight: (data: {
    bodyText?: string;
    tagIds?: string[];
    selectorType: string;
    selectorValue: any;
    exactText?: string;
    startTime?: number;
    endTime?: number;
  }) => void;
  onUpdateHighlight?: (annotationId: string, data: {
    bodyText?: string;
    tagIds?: string[];
  }) => void;
  onCancel: () => void;
}

export function HighlightPopover({
  open,
  mode,
  selection,
  editingAnnotation,
  fileId,
  onCreateHighlight,
  onUpdateHighlight,
  onCancel,
}: HighlightPopoverProps) {
  const [note, setNote] = useState('');

  // Initialize note from editing annotation
  useEffect(() => {
    if (mode === 'edit' && editingAnnotation) {
      setNote(editingAnnotation.bodyText || '');
    } else if (mode === 'create') {
      setNote('');
    }
  }, [mode, editingAnnotation]);

  if (mode === 'create' && !selection) return null;

  const isMediaSelection = selection && 'fragmentSelector' in selection;
  const isTextSelection = selection && 'textQuoteSelector' in selection;

  const handleCreate = () => {
    if (isTextSelection && selection) {
      onCreateHighlight({
        bodyText: note || undefined,
        selectorType: 'TextQuoteSelector',
        selectorValue: {
          textQuote: selection.textQuoteSelector,
          textPosition: selection.textPositionSelector,
        },
        exactText: selection.text,
      });
    } else if (isMediaSelection && selection) {
      onCreateHighlight({
        bodyText: note || undefined,
        selectorType: 'FragmentSelector',
        selectorValue: selection.fragmentSelector,
        startTime: selection.startTime,
        endTime: selection.endTime,
      });
    }

    setNote('');
  };

  const handleUpdate = () => {
    if (editingAnnotation && onUpdateHighlight) {
      onUpdateHighlight(editingAnnotation.id, {
        bodyText: note || undefined,
      });
      setNote('');
    }
  };

  // Get preview text/time based on mode
  const previewText = mode === 'edit' && editingAnnotation
    ? editingAnnotation.targets[0]?.exactText
    : isTextSelection && selection
    ? selection.text
    : null;

  const previewTime = mode === 'edit' && editingAnnotation
    ? {
        startTime: editingAnnotation.targets[0]?.startTime ? parseFloat(editingAnnotation.targets[0].startTime) : null,
        endTime: editingAnnotation.targets[0]?.endTime ? parseFloat(editingAnnotation.targets[0].endTime) : null,
      }
    : isMediaSelection && selection
    ? { startTime: selection.startTime, endTime: selection.endTime }
    : null;

  return (
    <Sheet open={open} onOpenChange={(isOpen: boolean) => !isOpen && onCancel()}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{mode === 'create' ? 'Create Highlight' : 'Edit Highlight'}</SheetTitle>
          <SheetDescription>
            {mode === 'create' ? 'Add notes and tags to capture your insights' : 'Update notes and tags'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Selection preview */}
          <div className="rounded-lg bg-muted p-4">
            {previewText && (
              <p className="text-sm text-muted-foreground italic">
                "{previewText}"
              </p>
            )}
            {previewTime && previewTime.startTime !== null && previewTime.endTime !== null && (
              <div className="text-sm">
                <div className="font-medium mb-1">Video Clip</div>
                <div className="text-muted-foreground">
                  {formatTime(previewTime.startTime)} → {formatTime(previewTime.endTime)}
                  <span className="ml-2 text-xs">
                    ({(previewTime.endTime - previewTime.startTime).toFixed(1)}s)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Note input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Add a note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why is this important? What patterns do you see?"
              className="w-full px-3 py-2 text-sm border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input bg-background min-h-[100px]"
              rows={4}
            />
          </div>

          {/* Tags (placeholder for future implementation) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tags
            </label>
            <div className="text-sm text-muted-foreground italic">
              Tag management coming soon
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={mode === 'create' ? handleCreate : handleUpdate}
              className="flex-1"
            >
              {mode === 'create' ? 'Create Highlight' : 'Update Highlight'}
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
