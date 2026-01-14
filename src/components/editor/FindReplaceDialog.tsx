import React, { useState, useCallback, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronUp, ChevronDown, X, Replace } from 'lucide-react';

interface FindReplaceDialogProps {
  editor: Editor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  from: number;
  to: number;
}

const FindReplaceDialog: React.FC<FindReplaceDialogProps> = ({
  editor,
  open,
  onOpenChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [caseSensitive, setCaseSensitive] = useState(false);

  const findMatches = useCallback(() => {
    if (!editor || !searchTerm) {
      setResults([]);
      return;
    }

    const doc = editor.state.doc;
    const matches: SearchResult[] = [];
    const searchRegex = new RegExp(
      searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      caseSensitive ? 'g' : 'gi'
    );

    doc.descendants((node, pos) => {
      if (node.isText && node.text) {
        let match;
        while ((match = searchRegex.exec(node.text)) !== null) {
          matches.push({
            from: pos + match.index,
            to: pos + match.index + match[0].length,
          });
        }
      }
    });

    setResults(matches);
    if (matches.length > 0) {
      setCurrentIndex(0);
      highlightMatch(matches[0]);
    }
  }, [editor, searchTerm, caseSensitive]);

  const highlightMatch = useCallback(
    (match: SearchResult) => {
      if (!editor) return;

      editor.commands.setTextSelection({
        from: match.from,
        to: match.to,
      });

      // Scroll the selection into view
      const view = editor.view;
      const coords = view.coordsAtPos(match.from);
      const editorRect = view.dom.getBoundingClientRect();
      
      if (coords.top < editorRect.top || coords.bottom > editorRect.bottom) {
        view.dom.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    [editor]
  );

  const goToNext = useCallback(() => {
    if (results.length === 0) return;
    const nextIndex = (currentIndex + 1) % results.length;
    setCurrentIndex(nextIndex);
    highlightMatch(results[nextIndex]);
  }, [results, currentIndex, highlightMatch]);

  const goToPrevious = useCallback(() => {
    if (results.length === 0) return;
    const prevIndex = (currentIndex - 1 + results.length) % results.length;
    setCurrentIndex(prevIndex);
    highlightMatch(results[prevIndex]);
  }, [results, currentIndex, highlightMatch]);

  const replaceOne = useCallback(() => {
    if (!editor || results.length === 0) return;

    const match = results[currentIndex];
    editor
      .chain()
      .focus()
      .setTextSelection({ from: match.from, to: match.to })
      .insertContent(replaceTerm)
      .run();

    // Re-run search after replace
    setTimeout(findMatches, 100);
  }, [editor, results, currentIndex, replaceTerm, findMatches]);

  const replaceAll = useCallback(() => {
    if (!editor || results.length === 0) return;

    // Replace from end to start to preserve positions
    const sortedResults = [...results].sort((a, b) => b.from - a.from);
    
    editor.chain().focus();
    
    sortedResults.forEach((match) => {
      editor
        .chain()
        .setTextSelection({ from: match.from, to: match.to })
        .insertContent(replaceTerm)
        .run();
    });

    // Re-run search after replace all
    setTimeout(findMatches, 100);
  }, [editor, results, replaceTerm, findMatches]);

  useEffect(() => {
    if (open && searchTerm) {
      findMatches();
    }
  }, [open, searchTerm, caseSensitive, findMatches]);

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setReplaceTerm('');
      setResults([]);
      setCurrentIndex(0);
    }
  }, [open]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, goToNext, goToPrevious, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Find and Replace</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Find Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Find</label>
            <div className="flex gap-2">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search text..."
                className="flex-1"
                autoFocus
              />
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevious}
                disabled={results.length === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                disabled={results.length === 0}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {results.length > 0
                  ? `${currentIndex + 1} of ${results.length} matches`
                  : searchTerm
                  ? 'No matches found'
                  : 'Type to search'}
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="rounded"
                />
                Match case
              </label>
            </div>
          </div>

          {/* Replace Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Replace with</label>
            <Input
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              placeholder="Replacement text..."
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={replaceOne}
                disabled={results.length === 0}
                className="flex-1"
              >
                <Replace className="h-4 w-4 mr-2" />
                Replace
              </Button>
              <Button
                variant="outline"
                onClick={replaceAll}
                disabled={results.length === 0}
                className="flex-1"
              >
                Replace All
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FindReplaceDialog;
