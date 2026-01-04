export interface TranscriptCue {
  id?: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  text: string;
  speaker?: string;
}

export interface ParsedTranscript {
  cues: TranscriptCue[];
  language?: string;
}

/**
 * Parse WebVTT timestamp to seconds
 * Supports formats: HH:MM:SS.mmm or MM:SS.mmm
 */
function parseTimestamp(timestamp: string): number {
  const parts = timestamp.split(':');
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (parts.length === 3) {
    // HH:MM:SS.mmm
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10);
    seconds = parseFloat(parts[2]);
  } else if (parts.length === 2) {
    // MM:SS.mmm
    minutes = parseInt(parts[0], 10);
    seconds = parseFloat(parts[1]);
  } else {
    // SS.mmm
    seconds = parseFloat(parts[0]);
  }

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Extract speaker name from text
 * Teams format: "Speaker Name: text"
 */
function extractSpeaker(text: string): { speaker?: string; cleanText: string } {
  const speakerMatch = text.match(/^([^:]+):\s*(.+)$/);
  if (speakerMatch) {
    return {
      speaker: speakerMatch[1].trim(),
      cleanText: speakerMatch[2].trim(),
    };
  }
  return { cleanText: text };
}

/**
 * Parse WebVTT transcript file
 */
export function parseVTT(vttContent: string): ParsedTranscript {
  const lines = vttContent.split('\n');
  const cues: TranscriptCue[] = [];

  let currentCue: Partial<TranscriptCue> = {};
  let inCue = false;
  let cueText: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      if (inCue && currentCue.startTime !== undefined && currentCue.endTime !== undefined) {
        // End of current cue
        const fullText = cueText.join(' ');
        const { speaker, cleanText } = extractSpeaker(fullText);

        cues.push({
          id: currentCue.id,
          startTime: currentCue.startTime,
          endTime: currentCue.endTime,
          text: cleanText,
          speaker,
        });

        currentCue = {};
        cueText = [];
        inCue = false;
      }
      continue;
    }

    // Skip WEBVTT header and NOTE blocks
    if (line.startsWith('WEBVTT') || line.startsWith('NOTE')) {
      continue;
    }

    // Check for timestamp line (contains -->)
    if (line.includes('-->')) {
      const [startStr, endStr] = line.split('-->').map(s => s.trim());
      currentCue.startTime = parseTimestamp(startStr);
      currentCue.endTime = parseTimestamp(endStr);
      inCue = true;
      continue;
    }

    // If we're in a cue and this isn't a timestamp, it's cue text
    if (inCue) {
      // Check if this line is a cue identifier (number)
      if (!currentCue.startTime && /^\d+$/.test(line)) {
        currentCue.id = line;
      } else {
        // Strip VTT formatting tags
        const cleanLine = line.replace(/<[^>]+>/g, '');
        if (cleanLine) {
          cueText.push(cleanLine);
        }
      }
    }
  }

  // Handle last cue if file doesn't end with empty line
  if (inCue && currentCue.startTime !== undefined && currentCue.endTime !== undefined && cueText.length > 0) {
    const fullText = cueText.join(' ');
    const { speaker, cleanText } = extractSpeaker(fullText);

    cues.push({
      id: currentCue.id,
      startTime: currentCue.startTime,
      endTime: currentCue.endTime,
      text: cleanText,
      speaker,
    });
  }

  return { cues };
}

/**
 * Format seconds to timestamp string
 */
export function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
