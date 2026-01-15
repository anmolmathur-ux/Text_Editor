import React, { useMemo } from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  PanelLeftClose,
  FileText,
  Save,
  Download,
  Sparkles,
} from 'lucide-react';

interface EditorHeaderProps {
  editor: Editor | null;
  documentTitle: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onExport: () => void;
  onToggleAI: () => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  editor,
  documentTitle,
  onTitleChange,
  onSave,
  onExport,
  onToggleAI,
}) => {
  const wordCount = useMemo(() => {
    if (!editor) return 0;
    const text = editor.state.doc.textContent;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }, [editor?.state.doc.content]);

  return (
    <div className="flex items-center justify-between h-14 px-4 bg-card border-b border-border">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle sidebar</TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <Input
            value={documentTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="border-0 bg-transparent h-8 text-base font-medium focus-visible:ring-0 focus-visible:ring-offset-0 px-1 w-auto min-w-[150px]"
            placeholder="Untitled Document"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground mr-2">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </span>

        <Button variant="outline" size="sm" onClick={onSave} className="h-9 gap-2">
          <Save className="h-4 w-4" />
          Save
        </Button>

        <Button variant="outline" size="sm" onClick={onExport} className="h-9 gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>

        <Button
          size="sm"
          onClick={onToggleAI}
          className="h-9 gap-2 bg-primary hover:bg-primary/90"
        >
          <Sparkles className="h-4 w-4" />
          AI
        </Button>
      </div>
    </div>
  );
};

export default EditorHeader;
