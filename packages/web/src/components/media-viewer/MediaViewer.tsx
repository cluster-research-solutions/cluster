import { useEffect, useRef, useState } from 'react';
import { apiClient } from '../../api/client';

interface MediaViewerProps {
  file: {
    id: string;
    name: string;
    file?: {
      mimeType: string;
    };
    parentReference: {
      driveId: string;
    };
  };
  accessToken: string;
  onTimeUpdate?: (currentTime: number) => void;
  seekToTime?: number;
  onMarkStart?: () => void;
  onMarkEnd?: () => void;
  isSelecting?: boolean;
}

export function MediaViewer({
  file,
  accessToken,
  onTimeUpdate,
  seekToTime,
}: MediaViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mimeType = file.file?.mimeType || '';

  const isVideo = mimeType.startsWith('video/');
  const isAudio = mimeType.startsWith('audio/');
  const isImage = mimeType.startsWith('image/');

  // Fetch SharePoint download URL (bypasses auth issue with video tag)
  useEffect(() => {
    async function fetchDownloadUrl() {
      setLoading(true);
      setError(null);

      try {
        const data = await apiClient.get<{ url: string }>(
          `/files/drives/${file.parentReference.driveId}/items/${file.id}/download-url`,
          undefined,
          accessToken
        );
        setDownloadUrl(data.url);
      } catch (err) {
        console.error('Error fetching download URL:', err);
        setError(err instanceof Error ? err.message : 'Failed to load media');
      } finally {
        setLoading(false);
      }
    }

    if (isVideo || isAudio || isImage) {
      fetchDownloadUrl();
    }
  }, [file.id, file.parentReference.driveId, accessToken, isVideo, isAudio, isImage]);

  // Handle time updates from video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      onTimeUpdate?.(time);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [onTimeUpdate]);

  // Handle seek requests from transcript
  useEffect(() => {
    if (seekToTime !== undefined && videoRef.current) {
      videoRef.current.currentTime = seekToTime;
    }
  }, [seekToTime]);

  if (!isVideo && !isAudio && !isImage) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
        <p className="text-sm text-gray-600">Preview not available for this file type</p>
        <p className="text-xs text-gray-500 mt-1">{mimeType}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <div className="animate-spin mx-auto h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-sm text-gray-600">Loading media...</p>
      </div>
    );
  }

  if (error || !downloadUrl) {
    return (
      <div className="bg-red-50 rounded-lg p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-red-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm text-red-600">Failed to load media</p>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      <div className="bg-black rounded-lg overflow-hidden">
        {isVideo && (
          <video
            ref={videoRef}
            controls
            className="w-full"
            src={downloadUrl}
            onError={(e) => {
              console.error('Video playback error:', e);
              setError('Video playback failed');
            }}
          >
            <p className="text-white p-4">
              Your browser doesn't support HTML5 video. Here is a{' '}
              <a href={downloadUrl} className="text-blue-400 underline">
                link to the video
              </a>{' '}
              instead.
            </p>
          </video>
        )}

      {isAudio && (
        <div className="p-8">
          <audio
            controls
            className="w-full"
            src={downloadUrl}
            onError={(e) => {
              console.error('Audio playback error:', e);
              setError('Audio playback failed');
            }}
          >
            <p className="text-white">
              Your browser doesn't support HTML5 audio. Here is a{' '}
              <a href={downloadUrl} className="text-blue-400 underline">
                link to the audio
              </a>{' '}
              instead.
            </p>
          </audio>
        </div>
      )}

        {isImage && (
          <img
            src={downloadUrl}
            alt={file.name}
            className="w-full h-auto"
            onError={(e) => {
              console.error('Image load error:', e);
              setError('Image failed to load');
            }}
          />
        )}
      </div>
    </div>
  );
}
