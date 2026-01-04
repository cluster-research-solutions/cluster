import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import type { FileView } from '../../api/hooks/useActivity';

interface ContinueWatchingCardProps {
  fileView: FileView;
}

export function ContinueWatchingCard({ fileView }: ContinueWatchingCardProps) {
  const navigate = useNavigate();

  const handleContinue = () => {
    // Navigate to /browse and restore session state with the file
    navigate('/browse', {
      state: {
        selectedFileId: fileView.fileRefId,
      },
    });
  };

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

  const getFileIcon = () => {
    const mimeType = fileView.fileRef?.mimeType?.toLowerCase() || '';

    if (mimeType.startsWith('video/')) {
      return (
        <svg className="h-12 w-12 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      );
    }

    if (mimeType === 'application/pdf') {
      return (
        <svg className="h-12 w-12 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }

    // Default file icon
    return (
      <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  };

  return (
    <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          🎯 Pick up where you left off
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-200 truncate mb-1">
              {fileView.fileRef?.name || 'Unknown file'}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Last viewed {formatTimeAgo(fileView.viewedAt)}
            </p>
            <Button onClick={handleContinue} className="bg-primary hover:bg-primary/90">
              Continue →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
