import { ReactNode } from 'react';

export type FileIconSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeClasses: Record<FileIconSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-12 w-12',
  xl: 'h-20 w-20',
};

/**
 * Returns an appropriate icon for a file based on its MIME type.
 * @param mimeType - The MIME type of the file (e.g., 'video/mp4', 'application/pdf')
 * @param size - The size of the icon (sm, md, lg, xl)
 * @returns A React element representing the file icon
 */
export function getFileIcon(
  mimeType: string | undefined | null,
  size: FileIconSize = 'md'
): ReactNode {
  const sizeClass = sizeClasses[size];
  const mimeTypeLower = mimeType?.toLowerCase() || '';

  // Video/Audio files
  if (mimeTypeLower.startsWith('video/') || mimeTypeLower.startsWith('audio/')) {
    return (
      <svg className={`${sizeClass} text-purple-400 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
      </svg>
    );
  }

  // PDF files
  if (mimeTypeLower === 'application/pdf') {
    return (
      <svg className={`${sizeClass} text-red-400 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    );
  }

  // Folder/Directory
  if (mimeTypeLower.includes('folder') || mimeTypeLower.includes('directory')) {
    return (
      <svg className={`${sizeClass} text-blue-400 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
      </svg>
    );
  }

  // Default document icon
  return (
    <svg className={`${sizeClass} text-gray-400 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}
