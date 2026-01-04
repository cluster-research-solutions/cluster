import { useState } from 'react';
import { useAccessToken } from '../../hooks/useAccessToken';
import {
  useCanvasSnapshots,
  useCreateCanvasSnapshot,
  useDeleteCanvasSnapshot,
  type CanvasSnapshot,
} from '../../api/hooks/useCanvasSnapshots';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Save, FolderOpen, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface CanvasSnapshotManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'save' | 'load';
  onLoad?: (snapshot: CanvasSnapshot) => void;
  currentCanvasState?: {
    nodes: any[];
    edges: any[];
    viewport: { x: number; y: number; zoom: number };
  };
  studyId?: string;
}

export function CanvasSnapshotManager({
  open,
  onOpenChange,
  mode,
  onLoad,
  currentCanvasState,
  studyId,
}: CanvasSnapshotManagerProps) {
  const { accessToken } = useAccessToken();
  const { data: snapshots = [], isLoading } = useCanvasSnapshots(studyId, accessToken);
  const createSnapshot = useCreateCanvasSnapshot(accessToken);
  const deleteSnapshot = useDeleteCanvasSnapshot(accessToken);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name for the board');
      return;
    }

    if (!currentCanvasState) {
      toast.error('No canvas state to save');
      return;
    }

    try {
      await createSnapshot.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        studyId,
        canvasState: currentCanvasState,
      });

      toast.success('Board saved successfully');
      setName('');
      setDescription('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving board:', error);
      toast.error('Failed to save board');
    }
  };

  const handleLoad = (snapshot: CanvasSnapshot) => {
    if (onLoad) {
      onLoad(snapshot);
      onOpenChange(false);
      toast.success(`Loaded board: ${snapshot.name}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await deleteSnapshot.mutateAsync(id);
      toast.success('Board deleted');
    } catch (error) {
      console.error('Error deleting board:', error);
      toast.error('Failed to delete board');
    }
  };

  const handleExport = (snapshot: CanvasSnapshot) => {
    const dataStr = JSON.stringify(snapshot, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${snapshot.name.replace(/\s+/g, '-')}-v${snapshot.versionNumber}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Board exported');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'save' ? (
              <>
                <Save className="h-5 w-5" />
                Save Board
              </>
            ) : (
              <>
                <FolderOpen className="h-5 w-5" />
                Load Board
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'save'
              ? 'Save the current state of your canvas as a board'
              : 'Load a previously saved board'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'save' ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                placeholder="e.g., Initial clustering, Final synthesis"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
                id="description"
                placeholder="Add notes about this version..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading boards...</p>
              </div>
            ) : snapshots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No saved boards yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Save your canvas to create a board
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {snapshots.map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className="group border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold truncate">{snapshot.name}</h4>
                          <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded">
                            v{snapshot.versionNumber}
                          </span>
                        </div>
                        {snapshot.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {snapshot.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(snapshot.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExport(snapshot)}
                          title="Export JSON"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(snapshot.id, snapshot.name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleLoad(snapshot)}
                        >
                          Load
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {mode === 'save' && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={createSnapshot.isPending}>
              {createSnapshot.isPending ? 'Saving...' : 'Save Board'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
