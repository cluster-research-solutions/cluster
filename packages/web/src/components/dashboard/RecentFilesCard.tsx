import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import type { FileView } from '../../api/hooks/useActivity';

interface RecentFilesCardProps {
  fileViews: FileView[];
}

export function RecentFilesCard({ fileViews }: RecentFilesCardProps) {
  const navigate = useNavigate();

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getFileIcon = (mimeType: string | null | undefined) => {
    const mime = mimeType?.toLowerCase() || '';

    if (mime.startsWith('video/')) {
      return (
        <svg className="h-4 w-4 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      );
    }

    if (mime === 'application/pdf') {
      return (
        <svg className="h-4 w-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }

    if (mime.includes('folder') || mime.includes('directory')) {
      return (
        <svg className="h-4 w-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
      );
    }

    // Default file icon
    return (
      <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  };

  const handleFileClick = (fileView: FileView) => {
    navigate('/browse', {
      state: {
        selectedFileId: fileView.fileRefId,
      },
    });
  };

  const handleBrowseFiles = () => {
    navigate('/browse');
  };

  if (fileViews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            🗂️ Recent Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <svg
              className="mx-auto h-10 w-10 text-gray-600 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
            <p className="text-sm">No files viewed yet</p>
            <p className="text-xs mt-1">Browse files to see them here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          🗂️ Recent Files
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {fileViews.slice(0, 5).map((fileView) => (
            <button
              key={fileView.id}
              onClick={() => handleFileClick(fileView)}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-800 transition-colors group"
            >
              <div className="flex items-center space-x-2">
                {getFileIcon(fileView.fileRef?.mimeType)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 truncate group-hover:text-white">
                    {fileView.fileRef?.name || 'Unknown file'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTimeAgo(fileView.viewedAt)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={handleBrowseFiles}
          className="w-full mt-4 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Browse Files →
        </button>
      </CardContent>
    </Card>
  );
}
