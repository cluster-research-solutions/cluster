import { useEffect, useState, useRef } from 'react';
import { Highlighter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HighlightButtonProps {
  onHighlightClick: () => void;
  containerRef: React.RefObject<HTMLElement>;
}

export function HighlightButton({ onHighlightClick, containerRef }: HighlightButtonProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0 || selection.toString().trim().length === 0) {
        setPosition(null);
        setIsVisible(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const container = containerRef?.current;

      // Check if selection is within container
      if (container && !container.contains(range.commonAncestorContainer)) {
        setPosition(null);
        setIsVisible(false);
        return;
      }

      // Get the bounding rect of the selection
      const rects = range.getClientRects();
      if (rects.length === 0) {
        setPosition(null);
        setIsVisible(false);
        return;
      }

      // Get the last rect (end of selection)
      const lastRect = rects[rects.length - 1];
      const containerRect = container?.getBoundingClientRect();

      if (containerRect) {
        // Position button to the right of the selection, vertically centered
        const newPosition = {
          top: lastRect.top - containerRect.top + (lastRect.height / 2) - 16, // Center vertically (button is 32px, so -16)
          left: lastRect.right - containerRect.left + 8, // 8px gap to the right
        };
        setPosition(newPosition);
      }
    };

    const handleMouseUp = () => {
      // Wait a brief moment after mouseup, then show button with fade-in
      setTimeout(() => {
        updatePosition();
        // Small delay before making visible for fade-in effect
        setTimeout(() => setIsVisible(true), 10);
      }, 50);
    };

    document.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', updatePosition);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', updatePosition);
    };
  }, [containerRef]);

  if (!position || !isVisible) {
    return null;
  }

  return (
    <Button
      ref={buttonRef}
      size="icon"
      onClick={onHighlightClick}
      className="absolute h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg z-50 animate-in fade-in duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      title="Create highlight"
    >
      <Highlighter className="h-4 w-4" />
    </Button>
  );
}
