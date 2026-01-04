import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

export interface TranscriptCue {
  id?: string;
  startTime: number;
  endTime: number;
  text: string;
  speaker?: string;
}

export interface ParsedTranscript {
  cues: TranscriptCue[];
  language?: string;
}

/**
 * Hook to fetch and parse a transcript file
 */
export function useTranscript(
  driveId: string | null,
  itemId: string | null,
  accessToken: string | null
) {
  return useQuery({
    queryKey: ['transcript', driveId, itemId, accessToken],
    queryFn: () =>
      apiClient.get<ParsedTranscript>(
        `/files/drives/${driveId}/items/${itemId}/transcript`,
        undefined,
        accessToken!
      ),
    enabled: !!driveId && !!itemId && !!accessToken,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Detect if a transcript file exists for a video file
 * Looks for .vtt files with similar names in the same folder
 */
export function findTranscriptFile(videoFile: any, allFiles: any[]): any | null {
  if (!videoFile || !allFiles) return null;

  const videoName = videoFile.name.replace(/\.[^/.]+$/, ''); // Remove extension
  const videoNameLower = videoName.toLowerCase();

  // Extract base name (before date/number suffixes)
  // E.g., "[Research] Call with Brian-20260101_174142-Meeting Recording" → "[research] call with brian"
  const videoBaseName = videoNameLower
    .replace(/-\d{8}_\d{6}.*$/, '') // Remove date-time stamps like -20260101_174142
    .replace(/\s*\(\d+\).*$/, '')   // Remove (1), (2), etc.
    .trim();

  // Look for .vtt files with matching names
  const transcriptFile = allFiles.find((file) => {
    if (!file.file?.mimeType) return false;

    const isVTT =
      file.file.mimeType === 'text/vtt' ||
      file.name.toLowerCase().endsWith('.vtt');

    if (!isVTT) return false;

    const fileName = file.name.toLowerCase().replace(/\.vtt$/, '');
    const fileBaseName = fileName
      .replace(/-\d{8}_\d{6}.*$/, '')
      .replace(/\s*\(\d+\).*$/, '')
      .trim();

    // Check for exact match or similar names using base names
    return (
      fileName === videoNameLower ||
      fileName.includes(videoNameLower) ||
      videoNameLower.includes(fileName) ||
      fileBaseName === videoBaseName ||
      (fileBaseName.length > 10 && videoBaseName.includes(fileBaseName)) ||
      (videoBaseName.length > 10 && fileBaseName.includes(videoBaseName))
    );
  });

  return transcriptFile || null;
}
