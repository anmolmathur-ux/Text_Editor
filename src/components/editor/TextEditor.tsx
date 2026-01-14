import React, { useState, useCallback } from 'react';
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
      Subscript,
      Superscript,
    ],
    content: '<p></p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-full p-0',
      },
    },
  });

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(Math.min(200, Math.max(50, newZoom)));
  }, []);

  const handleOpenFindReplace = useCallback(() => {
    setShowFindReplace(true);
  }, []);

  const handleOpenPageSetup = useCallback(() => {
    setShowPageSetup(true);
  }, []);

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
    </div>
  );
};

export default TextEditor;
