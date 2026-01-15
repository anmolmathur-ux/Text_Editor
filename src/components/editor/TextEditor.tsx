import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import EditorToolbar from './EditorToolbar';
import EditorRuler from './EditorRuler';
import FindReplaceDialog from './FindReplaceDialog';
import PageSetupDialog from './PageSetupDialog';
import { PAGE_SIZES, PageSize } from './types';

const TextEditor: React.FC = () => {
  const [zoom, setZoom] = useState(100);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showPageSetup, setShowPageSetup] = useState(false);
  const [pageSize, setPageSize] = useState<PageSize>(PAGE_SIZES.letter);
  const [margins, setMargins] = useState({ top: 1, bottom: 1, left: 1, right: 1 });
  const [tabStops, setTabStops] = useState<number[]>([0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your document...',
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      LineHeight,
      Indent,
      Subscript,
      Superscript,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: `<h1>Welcome to TEXT Editor</h1><p>This is a professional-grade document editor with AI-powered features. Start writing your next masterpiece!</p><h2>Getting Started</h2><p>Use the toolbar above to format your text, add headings, lists, and more. Click the <strong>AI</strong> button to access AI-powered writing assistance.</p><h3>Features</h3><ul><li>Rich text formatting (bold, italic, underline, etc.)</li><li>Multiple heading levels</li><li>Lists and blockquotes</li><li>Code blocks with syntax highlighting</li><li>Tables and images</li><li>AI-powered content generation</li></ul><blockquote>"The first draft is just you telling yourself the story." — Terry Pratchett</blockquote><h2>Export Options</h2><p>When you're ready, export your document as PDF, DOCX, or Markdown.</p>`,
    onUpdate: ({ editor }) => {
      updateHeadings(editor);
      updateWordCount(editor);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        const text = editor.state.doc.textBetween(from, to, ' ');
        setSelectedText(text);
      } else {
        setSelectedText('');
      }
    },
  });

  // Track selected text for AI sidebar
  useEffect(() => {
    if (!editor) return;
    
    const updateSelection = () => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, ' ');
      setSelectedText(text);
    };

    editor.on('selectionUpdate', updateSelection);
    return () => {
      editor.off('selectionUpdate', updateSelection);
    };
  }, [editor]);

  const updateHeadings = useCallback((editor: Editor) => {
    const newHeadings: Heading[] = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        newHeadings.push({
          level: node.attrs.level,
          text: node.textContent,
          id: `heading-${pos}`,
        });
      }
    });
    setHeadings(newHeadings);
  }, []);

  const updateWordCount = useCallback((editor: Editor) => {
    const text = editor.state.doc.textContent;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, []);

  const handleOpenPageSetup = useCallback(() => {
    setShowPageSetup(true);
  }, []);

  const handleSave = () => {
    if (!editor) return;
    
    const content = {
      title: documentTitle,
      html: editor.getHTML(),
      savedAt: new Date().toISOString(),
    };
    
    localStorage.setItem('text-editor-document', JSON.stringify(content));
    setLastSaved(new Date());
    toast.success('Document saved!');
  };

  const handleAIGenerate = (content: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(content).run();
    setIsAISidebarOpen(false);
  };

  const handleTabStopRemove = useCallback((position: number) => {
    setTabStops(prev => prev.filter(t => Math.abs(t - position) > 0.05));
  }, []);

  // Calculate page dimensions in pixels (at 96 DPI)
  const pageWidthPx = pageSize.width * 96;
  const pageHeightPx = pageSize.height * 96;
  const contentWidthPx = (pageSize.width - margins.left - margins.right) * 96;
  const paddingTopPx = margins.top * 96;
  const paddingBottomPx = margins.bottom * 96;
  const paddingLeftPx = margins.left * 96;
  const paddingRightPx = margins.right * 96;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Toolbar */}
      <EditorToolbar
        editor={editor}
        zoom={zoom}
        onZoomChange={handleZoomChange}
        onOpenFindReplace={handleOpenFindReplace}
        onOpenPageSetup={handleOpenPageSetup}
      />

      {/* Ruler */}
      <EditorRuler
        pageWidth={pageSize.width}
        leftMargin={margins.left}
        rightMargin={margins.right}
        tabStops={tabStops}
        zoom={zoom}
        onTabStopAdd={handleTabStopAdd}
        onTabStopRemove={handleTabStopRemove}
        onMarginChange={(left, right) => setMargins(prev => ({ ...prev, left, right }))}
      />

      {/* Editor Area */}
      <div className="flex-1 overflow-auto bg-muted/30 p-8">
        <div
          className="mx-auto bg-card shadow-lg"
          style={{
            width: `${pageWidthPx * (zoom / 100)}px`,
            minHeight: `${pageHeightPx * (zoom / 100)}px`,
            transform: `scale(1)`,
            transformOrigin: 'top center',
          }}
        >
          <div
            style={{
              padding: `${paddingTopPx * (zoom / 100)}px ${paddingRightPx * (zoom / 100)}px ${paddingBottomPx * (zoom / 100)}px ${paddingLeftPx * (zoom / 100)}px`,
              minHeight: `${pageHeightPx * (zoom / 100)}px`,
              fontSize: `${(zoom / 100)}em`,
            }}
          >
            <EditorContent editor={editor} className="min-h-full" />
          </div>
        </main>

        {/* AI Sidebar */}
        <AISidebar
          isOpen={isAISidebarOpen}
          onClose={() => setIsAISidebarOpen(false)}
          onGenerate={handleAIGenerate}
          selectedText={selectedText}
          onTransformText={handleTransformText}
        />
      </div>

      {/* Find and Replace Dialog */}
      <FindReplaceDialog
        editor={editor}
        open={showFindReplace}
        onOpenChange={setShowFindReplace}
      />

      {/* Page Setup Dialog */}
      <PageSetupDialog
        open={showPageSetup}
        onOpenChange={setShowPageSetup}
        pageSize={pageSize}
        margins={margins}
        onPageSizeChange={handlePageSizeChange}
        onMarginsChange={handleMarginsChange}
      />
    </div>
  );
};
