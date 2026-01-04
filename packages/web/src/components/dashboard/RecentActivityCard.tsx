import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import type { FileView } from '../../api/hooks/useActivity';
import { getFileIcon } from '../../lib/fileIcons';
import { formatTimeAgo } from '../../lib/formatting';

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

  return (
    <Card
      className="cursor-pointer hover:bg-gray-50 transition-all hover:shadow-xl h-full group border-gray-200"
      onClick={handleClick}
    >
      <CardContent className="p-10 flex flex-col items-center text-center h-full justify-center min-h-[280px]">
        <div className="mb-6 transition-transform group-hover:scale-110">
          {getFileIcon(fileView.fileRef?.mimeType, 'xl')}
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
