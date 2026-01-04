import { useState, useEffect, useRef } from 'react';
import { useSharePointSites } from '../../api/hooks/useSharePointSites';
import { useDrives } from '../../api/hooks/useDrives';
import { useDriveItems } from '../../api/hooks/useDriveItems';
import { useAccessToken } from '../../hooks/useAccessToken';
import sharepointLogo from '../../../assets/sharepoint_logo.svg';

interface FileBrowserProps {
  onFileSelect?: (file: any) => void;
  initialState?: {
    selectedSiteId: string | null;
    selectedDriveId: string | null;
    currentFolderId: string;
    breadcrumbs: Array<{ id: string; name: string }>;
  };
  onStateChange?: (state: {
    selectedSiteId: string | null;
    selectedDriveId: string | null;
    currentFolderId: string;
    breadcrumbs: Array<{ id: string; name: string }>;
  }) => void;
}

export function FileBrowser({ onFileSelect, initialState, onStateChange }: FileBrowserProps) {
  const { accessToken } = useAccessToken();
  const { data: sites, isLoading: sitesLoading } = useSharePointSites(accessToken);
  const isInitialMount = useRef(true);

  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(
    initialState?.selectedSiteId ?? null
  );
  const [selectedDriveId, setSelectedDriveId] = useState<string | null>(
    initialState?.selectedDriveId ?? null
  );
  const [currentFolderId, setCurrentFolderId] = useState<string>(
    initialState?.currentFolderId ?? 'root'
  );
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string; name: string }>>(
    initialState?.breadcrumbs ?? [{ id: 'root', name: 'Root' }]
  );

  const { data: drives, isLoading: drivesLoading } = useDrives(selectedSiteId, accessToken);
  const { data: items, isLoading: itemsLoading } = useDriveItems(
    selectedDriveId,
    currentFolderId,
    accessToken
  );

  // Update internal state when initialState prop changes (e.g., when parent restores from sessionStorage)
  useEffect(() => {
    if (initialState) {
      setSelectedSiteId(initialState.selectedSiteId);
      setSelectedDriveId(initialState.selectedDriveId);
      setCurrentFolderId(initialState.currentFolderId);
      setBreadcrumbs(initialState.breadcrumbs);
    }
  }, [initialState]);

  // Mark initial mount complete after first render (using microtask to ensure it happens after initial effects)
  useEffect(() => {
    Promise.resolve().then(() => {
      isInitialMount.current = false;
    });
  }, []);

  // Notify parent of state changes (but skip on initial mount to avoid overwriting restored state)
  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }

    onStateChange?.({
      selectedSiteId,
      selectedDriveId,
      currentFolderId,
      breadcrumbs,
    });
  }, [selectedSiteId, selectedDriveId, currentFolderId, breadcrumbs]);

  const handleFolderClick = (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    setBreadcrumbs([...breadcrumbs, { id: folderId, name: folderName }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolderId(newBreadcrumbs[newBreadcrumbs.length - 1]!.id);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="h-full">
      <div className="p-3">
        {/* Site Selector */}
        {!selectedSiteId && (
          <div>
            <h3 className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-2">
              <img src={sharepointLogo} alt="SharePoint" className="h-3.5 w-3.5" />
              SharePoint Sites
            </h3>
            {sitesLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-400 border-r-transparent"></div>
              </div>
            ) : (
              <div className="space-y-1">
                {sites?.map((site) => (
                  <button
                    key={site.id}
                    onClick={() => setSelectedSiteId(site.id)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-800 transition-colors group"
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate group-hover:text-white">{site.displayName}</p>
                        {site.description && (
                          <p className="text-xs text-gray-500 truncate">{site.description}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Drive Selector */}
        {selectedSiteId && !selectedDriveId && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">Document Libraries</h3>
              <button
                onClick={() => setSelectedSiteId(null)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                ← Back
              </button>
            </div>
            {drivesLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-400 border-r-transparent"></div>
              </div>
            ) : (
              <div className="space-y-1">
                {drives?.map((drive) => (
                  <button
                    key={drive.id}
                    onClick={() => setSelectedDriveId(drive.id)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-800 transition-colors group"
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate group-hover:text-white">{drive.name}</p>
                        <p className="text-xs text-gray-500">{drive.driveType}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* File/Folder Browser */}
        {selectedDriveId && (
          <div>
            {/* Breadcrumbs */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-700">
              <nav className="flex items-center space-x-1 text-xs min-w-0 flex-1">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.id} className="flex items-center min-w-0">
                    {index > 0 && <span className="mx-1 text-gray-600">/</span>}
                    <button
                      onClick={() => handleBreadcrumbClick(index)}
                      className={`hover:text-blue-400 truncate ${
                        index === breadcrumbs.length - 1
                          ? 'text-gray-200 font-medium'
                          : 'text-gray-500'
                      }`}
                    >
                      {crumb.name}
                    </button>
                  </div>
                ))}
              </nav>
              <button
                onClick={() => {
                  setSelectedDriveId(null);
                  setCurrentFolderId('root');
                  setBreadcrumbs([{ id: 'root', name: 'Root' }]);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 ml-2 flex-shrink-0"
              >
                ← Back
              </button>
            </div>

            {/* Items List */}
            {itemsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-400 border-r-transparent"></div>
              </div>
            ) : items && items.length > 0 ? (
              <div className="space-y-1">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.folder) {
                        handleFolderClick(item.id, item.name);
                      } else {
                        onFileSelect?.(item);
                      }
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-800 transition-colors group"
                  >
                    <div className="flex items-center space-x-2">
                      {item.folder ? (
                        <svg className="h-4 w-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 truncate group-hover:text-white">{item.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{formatDate(item.lastModifiedDateTime)}</span>
                          {!item.folder && (
                            <>
                              <span>•</span>
                              <span>{formatFileSize(item.size)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto h-10 w-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <p className="mt-2 text-xs">This folder is empty</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
