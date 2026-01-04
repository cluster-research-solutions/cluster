import { useParams, Link } from 'react-router-dom';
import { useAccessToken } from '../hooks/useAccessToken';
import { useCluster } from '../api/hooks/useClusters';
import { useState, useRef, useEffect } from 'react';
import type { Annotation } from '../api/hooks/useAnnotations';
import { ChevronLeft, Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { Button } from '../components/ui/button';
import { apiClient } from '../api/client';

interface PlaylistItem {
  annotation: Annotation;
  startTime: number;
  endTime: number;
  order: number;
}

export function ClusterPlaybackPage() {
  const { clusterId } = useParams<{ clusterId: string }>();
  const { accessToken } = useAccessToken();
  const { data: cluster, isLoading } = useCluster(clusterId!, accessToken);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Build playlist from cluster items (video/audio only)
  const playlist: PlaylistItem[] = (cluster?.items || [])
    .filter((item) => {
      const mimeType = item.annotation.targets[0]?.fileRef?.mimeType || '';
      return mimeType.startsWith('video/') || mimeType.startsWith('audio/');
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => {
      const target = item.annotation.targets[0];
      const startTime = target?.startTime ? parseFloat(target.startTime) : 0;
      // If no endTime, use a very large number so it plays to the end
      const endTime = target?.endTime ? parseFloat(target.endTime) : Infinity;

      return {
        annotation: item.annotation,
        startTime,
        endTime,
        order: item.sortOrder,
      };
    });

  // Get non-playable items for reference section
  const referenceItems = (cluster?.items || [])
    .filter((item) => {
      const mimeType = item.annotation.targets[0]?.fileRef?.mimeType || '';
      return !mimeType.startsWith('video/') && !mimeType.startsWith('audio/');
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const currentItem = playlist[currentIndex];
  const currentFile = currentItem?.annotation.targets[0]?.fileRef;

  // Fetch download URL when current file changes
  useEffect(() => {
    if (!currentFile || !accessToken) return;

    async function fetchDownloadUrl() {
      if (!currentFile) return; // Guard for TypeScript

      setLoadingUrl(true);
      try {
        const data = await apiClient.get<{ url: string }>(
          `/files/drives/${currentFile.sharepointDriveId}/items/${currentFile.sharepointItemId}/download-url`,
          undefined,
          accessToken || undefined
        );
        setDownloadUrl(data.url);
      } catch (error) {
        console.error('Error fetching download URL:', error);
        setDownloadUrl(null);
      } finally {
        setLoadingUrl(false);
      }
    }

    fetchDownloadUrl();
  }, [currentFile?.id, currentFile?.sharepointDriveId, currentFile?.sharepointItemId, accessToken]);

  // Handle video time update - check if we've reached the end of current clip
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentItem) return;

    const handleTimeUpdate = () => {
      if (video.currentTime >= currentItem.endTime) {
        // Pause the video at end time
        video.pause();

        // Move to next clip
        if (currentIndex < playlist.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // Playlist finished
          setIsPlaying(false);
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [currentItem, currentIndex, playlist.length]);

  // When current item or download URL changes, load video and seek to start time
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentItem || !downloadUrl) return;

    const handleLoadedMetadata = () => {
      video.currentTime = currentItem.startTime;
      if (isPlaying) {
        video.play().catch((error) => {
          console.error('Failed to play:', error);
          setIsPlaying(false);
        });
      }
    };

    // If metadata is already loaded, seek immediately
    if (video.readyState >= 1) {
      video.currentTime = currentItem.startTime;
      if (isPlaying) {
        video.play().catch((error) => {
          console.error('Failed to play:', error);
          setIsPlaying(false);
        });
      }
    } else {
      // Wait for metadata to load
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [currentItem, downloadUrl, isPlaying]);

  const handlePlayPause = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      try {
        await video.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Failed to play:', error);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleClipClick = (index: number) => {
    setCurrentIndex(index);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading cluster...</div>
      </div>
    );
  }

  if (!cluster) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cluster not found</h2>
          <Link to="/clusters" className="text-primary hover:underline">
            Back to Organize
          </Link>
        </div>
      </div>
    );
  }

  if (playlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link to="/clusters" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Organize
          </Link>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No playable clips</h2>
            <p className="text-gray-600 mb-4">
              This cluster doesn't contain any video or audio clips.
            </p>
            <Link to="/clusters">
              <Button>Back to Organize</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/clusters" className="inline-flex items-center text-sm text-gray-400 hover:text-white">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Organize
          </Link>
          <h1 className="text-2xl font-semibold text-white">{cluster.name}</h1>
          <div className="w-32" /> {/* Spacer for centering */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
              {loadingUrl ? (
                <div className="text-white">Loading video...</div>
              ) : downloadUrl ? (
                <video
                  key={currentFile?.id}
                  ref={videoRef}
                  className="w-full h-full"
                  src={downloadUrl}
                  controls={false}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  Your browser does not support video playback.
                </video>
              ) : (
                <div className="text-white">No video available</div>
              )}
            </div>

            {/* Playback Controls */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-white">
                  <div className="text-sm font-medium">{currentFile?.name}</div>
                  <div className="text-xs text-gray-400">
                    Clip {currentIndex + 1} of {playlist.length}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentIndex === playlist.length - 1}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Transcript */}
              {currentItem?.annotation.targets[0]?.exactText && (
                <div className="bg-gray-900 rounded p-4">
                  <div className="text-xs text-gray-400 mb-2">Transcript</div>
                  <p className="text-sm text-gray-200 italic">
                    "{currentItem.annotation.targets[0].exactText}"
                  </p>
                  {currentItem.annotation.bodyText && (
                    <p className="text-sm text-gray-300 mt-2">
                      {currentItem.annotation.bodyText}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Playlist */}
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-white mb-4">Playlist</h2>
              <div className="space-y-2">
                {playlist.map((item, index) => (
                  <button
                    key={item.annotation.id}
                    onClick={() => handleClipClick(index)}
                    className={`w-full text-left p-3 rounded transition-colors ${
                      index === currentIndex
                        ? 'bg-primary text-white'
                        : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="text-xs font-medium mb-1">
                      {index + 1}. {item.annotation.targets[0]?.fileRef?.name}
                    </div>
                    {item.annotation.targets[0]?.exactText && (
                      <div className="text-xs opacity-75 line-clamp-2">
                        "{item.annotation.targets[0].exactText}"
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Items */}
            {referenceItems.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-sm font-semibold text-white mb-4">Reference Materials</h2>
                <div className="space-y-2">
                  {referenceItems.map((item) => (
                    <div key={item.annotationId} className="text-sm">
                      <a
                        href={item.annotation.targets[0]?.fileRef?.webUrl || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {item.annotation.targets[0]?.fileRef?.name}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
