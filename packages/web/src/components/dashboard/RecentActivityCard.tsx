import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import type { FileView } from '../../api/hooks/useActivity';

interface RecentActivityCardProps {
  fileView: FileView;
}

export function RecentActivityCard({ fileView }: RecentActivityCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
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
        <svg className="h-20 w-20 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      );
    }

    if (mimeType === 'application/pdf') {
      return (
        <svg className="h-20 w-20 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }

    if (mimeType.includes('folder') || mimeType.includes('directory')) {
      return (
        <svg className="h-20 w-20 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
      );
    }

    // Default file icon
    return (
      <svg className="h-20 w-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  };

  return (
    <Card
      className="cursor-pointer hover:bg-gray-50 transition-all hover:shadow-xl h-full group border-gray-200"
      onClick={handleClick}
    >
      <CardContent className="p-10 flex flex-col items-center text-center h-full justify-center min-h-[280px]">
        <div className="mb-6 transition-transform group-hover:scale-110">
          {getFileIcon()}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 truncate w-full px-2 group-hover:text-primary transition-colors">
          {fileView.fileRef?.name || 'Unknown file'}
        </h3>
        <p className="text-sm text-gray-500">
          {formatTimeAgo(fileView.viewedAt)}
        </p>
      </CardContent>
    </Card>
  );
}
