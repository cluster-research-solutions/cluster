import { useEffect, useRef, useState } from 'react';
import type { TranscriptCue } from '../../api/hooks/useTranscript';

interface TranscriptViewerProps {
  cues: TranscriptCue[];
  currentTime?: number;
  onSeek?: (time: number) => void;
  selectedCueIndices?: number[];
}

function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function TranscriptViewer({
  cues,
  currentTime = 0,
  onSeek,
  selectedCueIndices = []
}: TranscriptViewerProps) {
  const [activeCueIndex, setActiveCueIndex] = useState<number | null>(null);
  const activeCueRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find active cue based on current time
  useEffect(() => {
    const index = cues.findIndex(
      (cue) => currentTime >= cue.startTime && currentTime <= cue.endTime
    );
    setActiveCueIndex(index >= 0 ? index : null);
  }, [currentTime, cues]);

  // Auto-scroll to active cue
  useEffect(() => {
    if (activeCueRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeElement = activeCueRef.current;

      const containerRect = container.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();

      // Check if active cue is not fully visible
      if (
        activeRect.top < containerRect.top ||
        activeRect.bottom > containerRect.bottom
      ) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [activeCueIndex]);

  if (cues.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No transcript available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="max-h-96 overflow-y-auto space-y-4 pr-2"
      style={{ scrollbarWidth: 'thin' }}
    >
      {cues.map((cue, index) => {
        const isActive = index === activeCueIndex;
        const isSelected = selectedCueIndices.includes(index);

        return (
          <div
            key={cue.id || index}
            ref={isActive ? activeCueRef : null}
            data-cue-index={index}
            className={`py-3 px-3 transition-all group relative ${
              isActive
                ? 'border-l-4 border-l-primary'
                : 'border-l-4 border-l-transparent'
            }`}
          >
            <div className="flex items-start justify-between mb-1">
              <button
                onClick={() => onSeek?.(cue.startTime)}
                className="text-xs font-mono text-primary hover:text-primary/80 hover:underline"
              >
                {formatTimestamp(cue.startTime)}
              </button>
              {cue.speaker && (
                <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                  {cue.speaker}
                </span>
              )}
            </div>
            <p className="text-sm select-text text-gray-700">
              {cue.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}
