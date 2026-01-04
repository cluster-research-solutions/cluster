import { useState, useCallback } from 'react';

export interface FragmentSelector {
  type: 'FragmentSelector';
  conformsTo: 'http://www.w3.org/TR/media-frags/';
  value: string; // e.g., "t=30.5,45.2"
}

export interface MediaSelectionInfo {
  startTime: number;
  endTime: number;
  fragmentSelector: FragmentSelector;
}

/**
 * Hook for capturing media time range selections
 * Builds W3C-compliant FragmentSelector for video/audio
 */
export function useMediaSelection() {
  const [selection, setSelection] = useState<MediaSelectionInfo | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  /**
   * Mark the start of a media selection
   */
  const markStart = useCallback((time: number) => {
    setStartTime(time);
    setSelection(null);
  }, []);

  /**
   * Mark the end of a media selection
   */
  const markEnd = useCallback((time: number) => {
    if (startTime === null) {
      console.warn('Cannot mark end without marking start first');
      return;
    }

    const start = Math.min(startTime, time);
    const end = Math.max(startTime, time);

    const fragmentSelector: FragmentSelector = {
      type: 'FragmentSelector',
      conformsTo: 'http://www.w3.org/TR/media-frags/',
      value: `t=${start.toFixed(3)},${end.toFixed(3)}`,
    };

    setSelection({
      startTime: start,
      endTime: end,
      fragmentSelector,
    });

    setStartTime(null);
  }, [startTime]);

  /**
   * Create a selection from explicit start/end times
   */
  const createSelection = useCallback((start: number, end: number) => {
    const fragmentSelector: FragmentSelector = {
      type: 'FragmentSelector',
      conformsTo: 'http://www.w3.org/TR/media-frags/',
      value: `t=${start.toFixed(3)},${end.toFixed(3)}`,
    };

    setSelection({
      startTime: start,
      endTime: end,
      fragmentSelector,
    });
  }, []);

  /**
   * Clear the selection
   */
  const clearSelection = useCallback(() => {
    setSelection(null);
    setStartTime(null);
  }, []);

  return {
    selection,
    startTime,
    isSelecting: startTime !== null,
    markStart,
    markEnd,
    createSelection,
    clearSelection,
  };
}
