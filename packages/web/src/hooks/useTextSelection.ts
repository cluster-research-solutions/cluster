import { useState, useEffect, useCallback } from 'react';

export interface TextQuoteSelector {
  type: 'TextQuoteSelector';
  exact: string;
  prefix?: string;
  suffix?: string;
}

export interface TextPositionSelector {
  type: 'TextPositionSelector';
  start: number;
  end: number;
}

export interface SelectionInfo {
  text: string;
  textQuoteSelector: TextQuoteSelector;
  textPositionSelector: TextPositionSelector;
  containerElement: Element | null;
  startTime?: number;
  endTime?: number;
  selectedCueIndices?: number[];
}

export interface TranscriptCue {
  id?: string;
  startTime: number;
  endTime: number;
  text: string;
  speaker?: string;
}

interface UseTextSelectionOptions {
  /** Container element to monitor for selections (defaults to document) */
  containerRef?: React.RefObject<HTMLElement>;
  /** Minimum length of selection to capture */
  minLength?: number;
  /** Number of characters for prefix/suffix context */
  contextLength?: number;
  /** Transcript cues for time range calculation */
  cues?: TranscriptCue[];
}

/**
 * Hook for capturing and processing text selections
 * Builds W3C-compliant TextQuoteSelector and TextPositionSelector
 * If cues provided, auto-calculates time range from cue boundaries
 */
export function useTextSelection(options: UseTextSelectionOptions = {}) {
  const { containerRef, minLength = 1, contextLength = 50, cues = [] } = options;
  const [selection, setSelection] = useState<SelectionInfo | null>(null);

  const captureSelection = useCallback(() => {
    const windowSelection = window.getSelection();

    if (!windowSelection || windowSelection.rangeCount === 0) {
      setSelection(null);
      return;
    }

    const range = windowSelection.getRangeAt(0);
    const text = windowSelection.toString().trim();

    // Check minimum length
    if (text.length < minLength) {
      setSelection(null);
      return;
    }

    // Check if selection is within container (if specified)
    const container = containerRef?.current;
    if (container && !container.contains(range.commonAncestorContainer)) {
      setSelection(null);
      return;
    }

    // Build TextQuoteSelector
    const textQuoteSelector = buildTextQuoteSelector(range, text, contextLength);

    // Build TextPositionSelector
    const textPositionSelector = buildTextPositionSelector(range, container || null);

    // Calculate time range from cues if available
    let startTime: number | undefined;
    let endTime: number | undefined;
    let selectedCueIndices: number[] | undefined;

    if (cues.length > 0 && container) {
      const cueInfo = findSelectedCues(range, container, cues);
      if (cueInfo.indices.length > 0) {
        selectedCueIndices = cueInfo.indices;
        const firstIndex = cueInfo.indices[0];
        const lastIndex = cueInfo.indices[cueInfo.indices.length - 1];
        if (firstIndex !== undefined && lastIndex !== undefined) {
          const firstCue = cues[firstIndex];
          const lastCue = cues[lastIndex];
          if (firstCue && lastCue) {
            startTime = firstCue.startTime;
            endTime = lastCue.endTime;
          }
        }
      }
    }

    setSelection({
      text,
      textQuoteSelector,
      textPositionSelector,
      containerElement: range.commonAncestorContainer.parentElement,
      startTime,
      endTime,
      selectedCueIndices,
    });
  }, [containerRef, minLength, contextLength, cues]);

  const clearSelection = useCallback(() => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => {
      // Debounce to avoid capturing intermediate states
      setTimeout(captureSelection, 10);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [captureSelection]);

  return {
    selection,
    clearSelection,
    captureSelection,
  };
}

/**
 * Build TextQuoteSelector from range
 */
function buildTextQuoteSelector(
  range: Range,
  exactText: string,
  contextLength: number
): TextQuoteSelector {
  const container = range.commonAncestorContainer;
  const fullText = container.textContent || '';

  // Find exact text position in container
  const startOffset = getTextOffset(container, range.startContainer, range.startOffset);
  const endOffset = startOffset + exactText.length;

  // Extract prefix (up to contextLength characters before)
  const prefixStart = Math.max(0, startOffset - contextLength);
  const prefix = fullText.substring(prefixStart, startOffset).trim();

  // Extract suffix (up to contextLength characters after)
  const suffixEnd = Math.min(fullText.length, endOffset + contextLength);
  const suffix = fullText.substring(endOffset, suffixEnd).trim();

  return {
    type: 'TextQuoteSelector',
    exact: exactText,
    prefix: prefix || undefined,
    suffix: suffix || undefined,
  };
}

/**
 * Build TextPositionSelector from range
 */
function buildTextPositionSelector(
  range: Range,
  container: HTMLElement | null
): TextPositionSelector {
  const root = container || document.body;
  const startOffset = getTextOffset(root, range.startContainer, range.startOffset);
  const endOffset = startOffset + range.toString().length;

  return {
    type: 'TextPositionSelector',
    start: startOffset,
    end: endOffset,
  };
}

/**
 * Calculate text offset from root to target node
 */
function getTextOffset(root: Node, target: Node, offset: number): number {
  let currentOffset = 0;
  const treeWalker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    null
  );

  let currentNode: Node | null;
  while ((currentNode = treeWalker.nextNode())) {
    if (currentNode === target) {
      return currentOffset + offset;
    }
    currentOffset += currentNode.textContent?.length || 0;
  }

  return currentOffset + offset;
}

/**
 * Find which cues contain the selected text
 * Uses data-cue-index attributes on cue elements
 */
function findSelectedCues(
  range: Range,
  container: HTMLElement,
  cues: TranscriptCue[]
): { indices: number[] } {
  const indices: number[] = [];

  // Get all elements that intersect with the selection range
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return { indices };
  }

  // Find all cue elements (they should have data-cue-index attribute)
  const cueElements = container.querySelectorAll('[data-cue-index]');

  cueElements.forEach((element) => {
    const cueIndex = parseInt(element.getAttribute('data-cue-index') || '-1', 10);

    if (cueIndex >= 0 && cueIndex < cues.length) {
      // Check if this cue element intersects with selection
      if (range.intersectsNode(element)) {
        indices.push(cueIndex);
      }
    }
  });

  // Sort indices
  indices.sort((a, b) => a - b);

  return { indices };
}
