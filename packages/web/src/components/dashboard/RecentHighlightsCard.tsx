import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import type { Annotation } from '../../api/hooks/useAnnotations';

interface RecentHighlightsCardProps {
  annotations: Annotation[];
}

export function RecentHighlightsCard({ annotations }: RecentHighlightsCardProps) {
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

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const handleHighlightClick = (annotation: Annotation) => {
    // Navigate to browse page with the file from the first target
    if (annotation.targets.length > 0) {
      navigate('/browse', {
        state: {
          selectedFileId: annotation.targets[0]!.fileRefId,
          selectedAnnotationId: annotation.id,
        },
      });
    }
  };

  const handleViewAll = () => {
    navigate('/browse'); // TODO: Add highlights view when implemented
  };

  if (annotations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            📝 Recent Highlights
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm">No highlights yet</p>
            <p className="text-xs mt-1">Start highlighting content to see it here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          📝 Recent Highlights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {annotations.slice(0, 5).map((annotation) => (
            <button
              key={annotation.id}
              onClick={() => handleHighlightClick(annotation)}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors group"
            >
              <p className="text-sm text-gray-200 mb-1 group-hover:text-white">
                {annotation.targets[0]?.exactText
                  ? truncateText(annotation.targets[0].exactText)
                  : annotation.bodyText
                  ? truncateText(annotation.bodyText)
                  : 'Highlight'}
              </p>
              <p className="text-xs text-gray-500">
                {formatTimeAgo(annotation.createdAt)}
              </p>
            </button>
          ))}
        </div>
        {annotations.length > 5 && (
          <button
            onClick={handleViewAll}
            className="w-full mt-4 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            View All →
          </button>
        )}
      </CardContent>
    </Card>
  );
}
