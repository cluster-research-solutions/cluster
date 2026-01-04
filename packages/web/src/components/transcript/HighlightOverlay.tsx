import { useEffect, useState } from 'react';

interface HighlightRange {
  id: string;
  startOffset: number;
  endOffset: number;
  isDraft?: boolean;
}

interface HighlightOverlayProps {
  containerRef: React.RefObject<HTMLElement>;
  highlights: HighlightRange[];
  onHighlightClick?: (highlightId: string) => void;
}

/**
 * Renders yellow highlight backgrounds for text selections
 * Uses CSS to apply backgrounds without modifying the DOM structure
 */
export function HighlightOverlay({ containerRef, highlights, onHighlightClick }: HighlightOverlayProps) {
  const [overlayElements, setOverlayElements] = useState<JSX.Element[]>([]);

  useEffect(() => {
    if (!containerRef.current || highlights.length === 0) {
      setOverlayElements([]);
      return;
    }

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const newElements: JSX.Element[] = [];

    // For each highlight, create overlay divs that match the text position
    highlights.forEach((highlight) => {
      try {
        // Create a range for this highlight
        const range = document.createRange();
        const textNodes = getTextNodesIn(container);

        let currentOffset = 0;
        let startNode: Node | null = null;
        let startNodeOffset = 0;
        let endNode: Node | null = null;
        let endNodeOffset = 0;

        // Find start and end nodes
        for (const node of textNodes) {
          const nodeLength = node.textContent?.length || 0;

          if (!startNode && currentOffset + nodeLength > highlight.startOffset) {
            startNode = node;
            startNodeOffset = highlight.startOffset - currentOffset;
          }

          if (!endNode && currentOffset + nodeLength >= highlight.endOffset) {
            endNode = node;
            endNodeOffset = highlight.endOffset - currentOffset;
            break;
          }

          currentOffset += nodeLength;
        }

        if (!startNode || !endNode) return;

        range.setStart(startNode, startNodeOffset);
        range.setEnd(endNode, endNodeOffset);

        // Get all rects for this range (handles multi-line selections)
        const rects = range.getClientRects();

        Array.from(rects).forEach((rect, index) => {
          newElements.push(
            <div
              key={`${highlight.id}-${index}`}
              onClick={() => {
                if (!highlight.isDraft && onHighlightClick) {
                  onHighlightClick(highlight.id);
                }
              }}
              className={`absolute transition-all duration-150 ${
                highlight.isDraft
                  ? 'bg-yellow-200/60 animate-in fade-in duration-200 pointer-events-none'
                  : 'bg-yellow-100/40 cursor-pointer hover:bg-yellow-200/50 hover:shadow-sm pointer-events-auto z-10'
              }`}
              style={{
                top: `${rect.top - containerRect.top}px`,
                left: `${rect.left - containerRect.left}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                pointerEvents: highlight.isDraft ? 'none' : 'auto',
              }}
            />
          );
        });
      } catch (error) {
        console.error('Error creating highlight overlay:', error, highlight);
      }
    });

    setOverlayElements(newElements);
  }, [containerRef, highlights, onHighlightClick]);

  return <>{overlayElements}</>;
}

/**
 * Get all text nodes within an element
 */
function getTextNodesIn(node: Node): Node[] {
  const textNodes: Node[] = [];
  const walker = document.createTreeWalker(
    node,
    NodeFilter.SHOW_TEXT,
    null
  );

  let currentNode: Node | null;
  while ((currentNode = walker.nextNode())) {
    textNodes.push(currentNode);
  }

  return textNodes;
}
