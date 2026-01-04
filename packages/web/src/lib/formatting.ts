/**
 * Formats a time value in seconds to MM:SS format.
 * @param seconds - Time in seconds (can be string or number)
 * @returns Formatted time string (e.g., "3:45") or null if invalid
 */
export function formatTime(seconds: string | number | null | undefined): string | null {
  if (seconds === null || seconds === undefined) return null;
  const num = typeof seconds === 'string' ? parseFloat(seconds) : seconds;
  if (isNaN(num)) return null;

  const mins = Math.floor(num / 60);
  const secs = Math.floor(num % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats a time range from start to end time.
 * @param startTime - Start time in seconds
 * @param endTime - End time in seconds (optional)
 * @returns Formatted time range (e.g., "3:45-4:20" or "3:45") or null
 */
export function formatTimeRange(
  startTime: string | number | null | undefined,
  endTime?: string | number | null | undefined
): string | null {
  const start = formatTime(startTime);
  if (!start) return null;

  const end = formatTime(endTime);
  if (!end) return start;

  return `${start}-${end}`;
}

/**
 * Formats a date string to a relative time ago format.
 * @param dateString - ISO date string
 * @returns Relative time string (e.g., "5 min ago", "2 days ago")
 */
export function formatTimeAgo(dateString: string): string {
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
}
