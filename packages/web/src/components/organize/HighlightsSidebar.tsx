import { useState, useMemo } from 'react';
import { Search, ChevronLeft } from 'lucide-react';
import { HighlightCard } from './HighlightCard';
import { Button } from '../ui/button';
import type { Annotation } from '../../api/hooks/useAnnotations';

interface HighlightsSidebarProps {
  annotations: Annotation[];
  isLoading: boolean;
  onDragStart: (e: React.DragEvent, annotation: Annotation) => void;
  onClose?: () => void;
}

export function HighlightsSidebar({
  annotations,
  isLoading,
  onDragStart,
  onClose,
}: HighlightsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<string>('all');

  // Get unique participants
  const participants = useMemo(() => {
    const unique = new Set<string>();
    annotations.forEach((ann) => {
      if (ann.participantId) unique.add(ann.participantId);
    });
    return Array.from(unique).sort();
  }, [annotations]);

  // Filter annotations
  const filteredAnnotations = useMemo(() => {
    return annotations.filter((ann) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        ann.bodyText?.toLowerCase().includes(searchLower) ||
        ann.targets.some((t) => t.exactText?.toLowerCase().includes(searchLower)) ||
        ann.targets.some((t) => t.fileRef?.name?.toLowerCase().includes(searchLower));

      // Participant filter
      const matchesParticipant =
        selectedParticipant === 'all' || ann.participantId === selectedParticipant;

      return matchesSearch && matchesParticipant;
    });
  }, [annotations, searchQuery, selectedParticipant]);

  return (
    <div className="w-[400px] border-r border-gray-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Highlights</h2>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search highlights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        {/* Participant filter */}
        {participants.length > 0 && (
          <select
            value={selectedParticipant}
            onChange={(e) => setSelectedParticipant(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="all">All Participants</option>
            {participants.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        )}

        {/* Count */}
        <p className="text-xs text-gray-500 mt-2">
          {filteredAnnotations.length} of {annotations.length} highlights
        </p>
      </div>

      {/* Highlights list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : filteredAnnotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <svg
              className="h-12 w-12 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm">
              {searchQuery || selectedParticipant !== 'all'
                ? 'No highlights match your filters'
                : 'No highlights yet'}
            </p>
          </div>
        ) : (
          filteredAnnotations.map((annotation) => (
            <div key={annotation.id}>
              <HighlightCard
                annotation={annotation}
                draggable
                onDragStart={onDragStart}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
