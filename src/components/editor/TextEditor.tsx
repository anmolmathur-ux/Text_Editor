import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import FontFamily from '@tiptap/extension-font-family';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import EditorHeader from './EditorHeader';
import EditorToolbar from './EditorToolbar';
import EditorRuler from './EditorRuler';
import FindReplaceDialog from './FindReplaceDialog';
import PageSetupDialog from './PageSetupDialog';
import AISidebar from './AISidebar';
import FontSize from './extensions/FontSize';
import LineHeight from './extensions/LineHeight';
import Indent from './extensions/Indent';
import { PAGE_SIZES, PageSize } from './types';
import { toast } from 'sonner';

const TextEditor: React.FC = () => {
  const [zoom, setZoom] = useState(100);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showPageSetup, setShowPageSetup] = useState(false);
  const [showAISidebar, setShowAISidebar] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [pageSize, setPageSize] = useState<PageSize>(PAGE_SIZES.letter);
  const [margins, setMargins] = useState({ top: 1, bottom: 1, left: 1, right: 1 });
  const [tabStops, setTabStops] = useState<number[]>([0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder: 'Start typing...',
      }),
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
    content: '<p></p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-full p-0',
      },
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

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(Math.min(200, Math.max(50, newZoom)));
  }, []);

  const handleOpenFindReplace = useCallback(() => {
    setShowFindReplace(true);
  }, []);

  const handleOpenPageSetup = useCallback(() => {
    setShowPageSetup(true);
  }, []);

  const handleOpenAISidebar = useCallback(() => {
    setShowAISidebar(true);
  }, []);

  const handleAIGenerate = useCallback((content: string) => {
    if (editor) {
      editor.chain().focus().insertContent(content).run();
    }
  }, [editor]);

  const handleAITransform = useCallback((action: string, result: string) => {
    if (editor) {
      editor.chain().focus().deleteSelection().insertContent(result).run();
    }
  }, [editor]);

  const handlePageSizeChange = useCallback((size: PageSize) => {
    setPageSize(size);
  }, []);

  const handleMarginsChange = useCallback((newMargins: typeof margins) => {
    setMargins(newMargins);
  }, []);

  const handleTabStopAdd = useCallback((position: number) => {
    setTabStops(prev => [...prev, position].sort((a, b) => a - b));
  }, []);

  const handleTabStopRemove = useCallback((position: number) => {
    setTabStops(prev => prev.filter(t => Math.abs(t - position) > 0.05));
  }, []);

  const handleSave = useCallback(() => {
    toast.success('Document saved successfully!');
  }, []);

  const handleExport = useCallback(() => {
    if (!editor) return;
    const html = editor.getHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Document exported!');
  }, [editor, documentTitle]);

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
      {/* Header Bar */}
      <EditorHeader
        editor={editor}
        documentTitle={documentTitle}
        onTitleChange={setDocumentTitle}
        onSave={handleSave}
        onExport={handleExport}
        onToggleAI={() => setShowAISidebar(!showAISidebar)}
      />

      {/* Toolbar */}
      <EditorToolbar
        editor={editor}
        zoom={zoom}
        onZoomChange={handleZoomChange}
        onOpenFindReplace={handleOpenFindReplace}
        onOpenPageSetup={handleOpenPageSetup}
        onOpenAISidebar={handleOpenAISidebar}
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
      <div className={`flex-1 overflow-auto bg-muted/30 p-8 transition-all ${showAISidebar ? 'mr-80' : ''}`}>
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
        </div>
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

      {/* AI Sidebar */}
      <AISidebar
        isOpen={showAISidebar}
        onClose={() => setShowAISidebar(false)}
        onGenerate={handleAIGenerate}
        selectedText={selectedText}
        onTransformText={handleAITransform}
      />
    </div>
  );
};

export default TextEditor;
