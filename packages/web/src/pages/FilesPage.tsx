import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Menu, X, ChevronLeft, FileText, Check, Trash2, AlertCircle, Pencil } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { FileBrowser } from '../components/file-browser/FileBrowser';
import { MediaViewer } from '../components/media-viewer/MediaViewer';
import { TranscriptViewer } from '../components/transcript/TranscriptViewer';
import { HighlightButton } from '../components/transcript/HighlightButton';
import { HighlightOverlay } from '../components/transcript/HighlightOverlay';
import { HighlightPopover } from '../components/annotations/HighlightPopover';
import { AnnotationList } from '../components/annotations/AnnotationList';
import { useAccessToken } from '../hooks/useAccessToken';
import { useDriveItems } from '../api/hooks/useDriveItems';
import { useTranscript, findTranscriptFile } from '../api/hooks/useTranscript';
import { useTextSelection } from '../hooks/useTextSelection';
import { useMediaSelection } from '../hooks/useMediaSelection';
import {
  useAnnotations,
  useCreateAnnotation,
  useDeleteAnnotation,
  useUpdateAnnotation,
  type CreateAnnotationInput,
  type Annotation,
} from '../api/hooks/useAnnotations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export function FilesPage() {
  const location = useLocation();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekToTime, setSeekToTime] = useState<number>();
  const [showAnnotationPopover, setShowAnnotationPopover] = useState(false);
  const [popoverMode, setPopoverMode] = useState<'create' | 'edit'>('create');
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);
  const [drawerSelection, setDrawerSelection] = useState<any>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [selectedHighlightId, setSelectedHighlightId] = useState<string | null>(null);
  const [fileBrowserState, setFileBrowserState] = useState<any>(null);
  const { accessToken } = useAccessToken();
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Restore state from sessionStorage when component mounts
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem('filesPageState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.selectedFile) {
          setSelectedFile(parsed.selectedFile);
        }
        // Don't restore leftSidebarOpen - always open on navigation
        if (parsed.rightSidebarOpen !== undefined) {
          setRightSidebarOpen(parsed.rightSidebarOpen);
        }
        if (parsed.fileBrowserState) {
          setFileBrowserState(parsed.fileBrowserState);
        }
      }
    } catch (error) {
      console.error('Failed to restore FilesPage state:', error);
    }

    // Check if navigating from homepage with a selected file
    const locationState = location.state as { selectedFileId?: string } | null;
    if (locationState?.selectedFileId) {
      // The FileBrowser will handle selecting the file via its own useEffect
      // We just need to clear the location state to prevent re-selecting on refresh
      window.history.replaceState({}, document.title);
    }

    // Always ensure left sidebar is open when mounting
    setLeftSidebarOpen(true);
  }, [location]);

  // Save state to sessionStorage when it changes
  useEffect(() => {
    if (selectedFile || fileBrowserState) {
      try {
        const stateToSave = {
          selectedFile,
          leftSidebarOpen,
          rightSidebarOpen,
          fileBrowserState,
        };
        sessionStorage.setItem('filesPageState', JSON.stringify(stateToSave));
      } catch (error) {
        console.error('Failed to save FilesPage state:', error);
      }
    }
  }, [selectedFile, leftSidebarOpen, rightSidebarOpen, fileBrowserState]);

  // Stable callback for FileBrowser state changes
  const handleFileBrowserStateChange = useCallback((state: any) => {
    setFileBrowserState(state);
  }, []);

  // Get files from current folder to detect transcript
  const { data: folderItems } = useDriveItems(
    selectedFile?.parentReference?.driveId,
    selectedFile?.parentReference?.id,
    accessToken
  );

  // Detect and fetch transcript
  const transcriptFile = selectedFile ? findTranscriptFile(selectedFile, folderItems || []) : null;
  const { data: transcript } = useTranscript(
    transcriptFile?.parentReference?.driveId,
    transcriptFile?.id,
    accessToken
  );

  // Text selection for transcript highlights (must come after transcript is defined)
  const textSelection = useTextSelection({
    containerRef: transcriptContainerRef,
    minLength: 3,
    cues: transcript?.cues || [],
  });

  // Media selection for video/audio highlights
  const mediaSelection = useMediaSelection();

  // Fetch all annotations (for now - will add file filtering later)
  const { data: annotations = [] } = useAnnotations(
    {},
    accessToken
  );

  // Mutations for annotations
  const createAnnotation = useCreateAnnotation(accessToken);
  const deleteAnnotation = useDeleteAnnotation(accessToken);
  const updateAnnotation = useUpdateAnnotation(accessToken);

  const isMediaFile = (file: any) => {
    const mimeType = file?.file?.mimeType || '';
    return (
      mimeType.startsWith('video/') ||
      mimeType.startsWith('audio/') ||
      mimeType.startsWith('image/')
    );
  };

  const handleSeek = (time: number) => {
    setSeekToTime(time);
    // Reset seek after a short delay to allow re-seeking to same time
    setTimeout(() => setSeekToTime(undefined), 100);
  };

  // Handle creating a highlight
  const handleCreateHighlight = async (data: {
    bodyText?: string;
    tagIds?: string[];
    selectorType: string;
    selectorValue: any;
    exactText?: string;
    startTime?: number;
    endTime?: number;
  }) => {
    if (!selectedFile) {
      console.error('No file selected');
      return;
    }

    if (!fileBrowserState?.selectedDriveId) {
      console.error('No drive ID available');
      toast.error('Unable to create highlight: missing drive information');
      return;
    }

    // Use time range from text selection if available (auto-calculated from cue boundaries)
    const startTime = textSelection.selection?.startTime ?? data.startTime;
    const endTime = textSelection.selection?.endTime ?? data.endTime;

    const input: CreateAnnotationInput = {
      motivation: ['highlighting'],
      bodyText: data.bodyText,
      targets: [
        {
          driveId: fileBrowserState.selectedDriveId,
          itemId: selectedFile.id,
          provider: 'sharepoint',
          selectorType: data.selectorType,
          selectorValue: data.selectorValue,
          exactText: data.exactText,
          startTime,
          endTime,
          fileMetadata: {
            name: selectedFile.name,
            mimeType: selectedFile.file?.mimeType,
            size: selectedFile.size,
            webUrl: selectedFile.webUrl,
            siteId: fileBrowserState.selectedSiteId,
          },
        },
      ],
      tagIds: data.tagIds,
    };

    console.log('Creating annotation:', {
      input,
      textSelection: textSelection.selection,
      calculatedTimes: { startTime, endTime },
    });

    try {
      const result = await createAnnotation.mutateAsync(input);
      console.log('Annotation created successfully:', result);
      toast.success('Highlight created', {
        icon: <Check className="h-4 w-4 text-green-600" />,
      });
      handleCloseDrawer();
    } catch (error) {
      console.error('Failed to create annotation:', error);
      toast.error(`Failed to create highlight: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
      });
    }
  };

  // Handle clicking on an annotation from the sidebar
  const handleAnnotationClick = (annotation: any) => {
    // If clicking the already-selected highlight, un-focus it
    if (selectedHighlightId === annotation.id) {
      setSelectedHighlightId(null);
      return;
    }

    const target = annotation.targets[0];

    // Set this as the selected highlight
    setSelectedHighlightId(annotation.id);

    // For video/audio highlights, seek to the start time
    if (target?.selectorType === 'FragmentSelector' && target.startTime) {
      handleSeek(parseFloat(target.startTime));
    }

    // For text highlights, seek to the time range (if available)
    if (target?.selectorType === 'TextQuoteSelector') {
      // Seek to the time range if available (this will auto-scroll the transcript)
      if (target.startTime) {
        handleSeek(parseFloat(target.startTime));
      }
    }
  };

  // Handle deleting annotation
  const handleDeleteAnnotation = async (id: string) => {
    try {
      await deleteAnnotation.mutateAsync(id);
      toast.success('Highlight deleted', {
        icon: <Trash2 className="h-4 w-4 text-red-600" />,
      });
    } catch (error) {
      console.error('Failed to delete annotation:', error);
      toast.error('Failed to delete highlight', {
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
      });
    }
  };

  // Handle editing annotation
  const handleEditAnnotation = (annotation: Annotation) => {
    setPopoverMode('edit');
    setEditingAnnotation(annotation);
    setShowAnnotationPopover(true);
  };

  // Handle updating annotation
  const handleUpdateHighlight = async (annotationId: string, data: { bodyText?: string; tagIds?: string[] }) => {
    try {
      await updateAnnotation.mutateAsync({
        id: annotationId,
        input: data,
      });
      toast.success('Highlight updated', {
        icon: <Pencil className="h-4 w-4 text-blue-600" />,
      });
      handleCloseDrawer();
    } catch (error) {
      console.error('Failed to update annotation:', error);
      toast.error('Failed to update highlight', {
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
      });
    }
  };

  // Handle clicking on a highlight in the transcript
  const handleHighlightClick = (highlightId: string) => {
    // If clicking the already-selected highlight, un-focus it
    if (selectedHighlightId === highlightId) {
      setSelectedHighlightId(null);
      return;
    }

    // Open the right sidebar if closed
    if (!rightSidebarOpen) {
      setRightSidebarOpen(true);
    }

    // Set the selected highlight (this will scroll to it and highlight it in the sidebar)
    setSelectedHighlightId(highlightId);

    // Find the annotation and seek video to its timestamp
    const annotation = annotations.find(a => a.id === highlightId);
    if (annotation) {
      const target = annotation.targets[0];

      // Seek to the timestamp without clearing the selection
      if (target?.selectorType === 'FragmentSelector' && target.startTime) {
        handleSeek(parseFloat(target.startTime));
      } else if (target?.selectorType === 'TextQuoteSelector' && target.startTime) {
        handleSeek(parseFloat(target.startTime));
      }
    }
  };

  // Capture selection when opening drawer
  const handleOpenDrawer = () => {
    const currentSelection = textSelection.selection || mediaSelection.selection;
    if (currentSelection) {
      setPopoverMode('create');
      setEditingAnnotation(null);
      setDrawerSelection(currentSelection);
      setShowAnnotationPopover(true);
    }
  };

  const handleCloseDrawer = () => {
    setShowAnnotationPopover(false);
    setEditingAnnotation(null);
    setDrawerSelection(null);
    textSelection.clearSelection();
    mediaSelection.clearSelection();
  };

  // Build highlight ranges for overlay
  const highlightRanges = useMemo(() => {
    const ranges: Array<{ id: string; startOffset: number; endOffset: number; isDraft?: boolean }> = [];

    // Add draft highlight if drawer is open
    if (showAnnotationPopover && drawerSelection && 'textPositionSelector' in drawerSelection) {
      const draft = {
        id: 'draft',
        startOffset: drawerSelection.textPositionSelector.start,
        endOffset: drawerSelection.textPositionSelector.end,
        isDraft: true,
      };
      ranges.push(draft);
    }

    // Add saved highlights for this file
    if (selectedFile && transcript) {
      const fileAnnotations = annotations.filter((ann) => {
        const target = ann.targets[0];
        // Match using SharePoint item ID instead of internal file ref ID
        return target?.sharepointItemId === selectedFile.id && target?.selectorType === 'TextQuoteSelector';
      });

      fileAnnotations.forEach((ann) => {
        const target = ann.targets[0];
        const textPosition = target?.selectorValue?.textPosition;
        if (textPosition?.start !== undefined && textPosition?.end !== undefined) {
          const saved = {
            id: ann.id,
            startOffset: textPosition.start,
            endOffset: textPosition.end,
            isDraft: false,
          };
          ranges.push(saved);
        }
      });
    }

    return ranges;
  }, [showAnnotationPopover, drawerSelection, selectedFile, transcript, annotations]);

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-background relative">
      {/* Left Sidebar - File Browser */}
      <div
        className={`bg-gray-900 border-r border-gray-700 transition-all duration-300 ease-in-out ${
          leftSidebarOpen ? 'w-80' : 'w-0'
        } overflow-hidden h-full`}
      >
        <div className="h-full w-80 flex flex-col">
          <div className="p-3 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Files</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLeftSidebarOpen(false)}
              className="h-8 w-8 text-gray-400 hover:text-gray-200 hover:bg-gray-800 relative z-50"
              title="Close file browser"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <FileBrowser
              onFileSelect={setSelectedFile}
              initialState={fileBrowserState}
              onStateChange={handleFileBrowserStateChange}
            />
          </ScrollArea>
        </div>
      </div>

      {/* Left Sidebar Toggle (when collapsed) */}
      {!leftSidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLeftSidebarOpen(true)}
          className="absolute top-3 left-3 z-10"
          title="Open file browser"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {selectedFile && isMediaFile(selectedFile) && accessToken ? (
          <ScrollArea className="h-full">
            <div className="max-w-6xl mx-auto p-6 space-y-6">
              {/* Video Player */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base font-medium">{selectedFile.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <MediaViewer
                    file={selectedFile}
                    accessToken={accessToken}
                    onTimeUpdate={setCurrentTime}
                    seekToTime={seekToTime}
                    onMarkStart={() => mediaSelection.markStart(currentTime)}
                    onMarkEnd={() => {
                      mediaSelection.markEnd(currentTime);
                      handleOpenDrawer();
                    }}
                    isSelecting={mediaSelection.isSelecting}
                  />
                </CardContent>
              </Card>

                {/* Transcript */}
                {transcript && transcript.cues.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm uppercase tracking-wide">Transcript</CardTitle>
                        {transcriptFile && (
                          <Badge variant="secondary" className="text-xs">
                            {transcriptFile.name}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div ref={transcriptContainerRef} className="relative">
                        <HighlightOverlay
                          containerRef={transcriptContainerRef}
                          highlights={highlightRanges}
                          onHighlightClick={handleHighlightClick}
                        />
                        <TranscriptViewer
                          cues={transcript.cues}
                          currentTime={currentTime}
                          onSeek={handleSeek}
                          selectedCueIndices={textSelection.selection?.selectedCueIndices}
                        />
                        {textSelection.selection && (
                          <HighlightButton
                            onHighlightClick={handleOpenDrawer}
                            containerRef={transcriptContainerRef}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileText className="mx-auto h-16 w-16 mb-4 opacity-50" />
                <p className="text-sm font-medium">Select a media file to get started</p>
                <p className="text-xs mt-1">Choose a video or audio file from the file browser</p>
              </div>
            </div>
          )}
      </div>

      {/* Right Sidebar - Annotations */}
      <div
        className={`bg-card border-l transition-all duration-300 ease-in-out ${
          rightSidebarOpen ? 'w-80' : 'w-0'
        } overflow-hidden h-full`}
      >
        <div className="h-full w-80 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                Highlights
              </h2>
              <Badge variant="secondary">{annotations.length}</Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRightSidebarOpen(false)}
              title="Close highlights"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            {selectedFile ? (
              <AnnotationList
                annotations={annotations}
                onAnnotationClick={handleAnnotationClick}
                onAnnotationEdit={handleEditAnnotation}
                onAnnotationDelete={handleDeleteAnnotation}
                currentTime={currentTime}
                selectedHighlightId={selectedHighlightId}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No file selected</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Right Sidebar Toggle (when collapsed) */}
      {!rightSidebarOpen && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setRightSidebarOpen(true)}
          className="absolute top-3 right-3 z-10 rounded-l-md rounded-r-none"
          title="Show highlights"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Highlight Drawer */}
      {selectedFile && (
        <HighlightPopover
          open={showAnnotationPopover}
          mode={popoverMode}
          selection={drawerSelection}
          editingAnnotation={editingAnnotation}
          fileId={selectedFile.id}
          onCreateHighlight={handleCreateHighlight}
          onUpdateHighlight={handleUpdateHighlight}
          onCancel={handleCloseDrawer}
        />
      )}
    </div>
  );
}
