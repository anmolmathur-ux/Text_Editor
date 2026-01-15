import { useEditor, EditorContent, Editor } from '@tiptap/react';
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
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  PanelLeft,
  Sparkles,
  Save,
  Clock,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EditorToolbar } from './EditorToolbar';
import { AISidebar } from './AISidebar';
import { DocumentOutline } from './DocumentOutline';
import { ExportMenu } from './ExportMenu';
import { toast } from 'sonner';

interface Heading {
  level: number;
  text: string;
  id: string;
}

export const TextEditor = () => {
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [zoom, setZoom] = useState(100);

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
      Subscript,
      Superscript,
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

  useEffect(() => {
    if (editor) {
      updateHeadings(editor);
      updateWordCount(editor);
    }
  }, [editor, updateHeadings, updateWordCount]);

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

  const handleTransformText = (action: string, result: string) => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    if (from !== to) {
      editor.chain().focus().deleteRange({ from, to }).insertContent(result).run();
      toast.success(`Text ${action}ed successfully!`);
    }
  };

  const handleHeadingClick = (id: string) => {
    const pos = parseInt(id.replace('heading-', ''));
    if (editor) {
      editor.chain().focus().setTextSelection(pos).run();
    }
  };

  const getHTML = () => editor?.getHTML() || '';

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  return (
    <div className="min-h-screen bg-editor-bg flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-40"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOutlineOpen(!isOutlineOpen)}
            className={isOutlineOpen ? 'bg-secondary' : ''}
          >
            <PanelLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <Input
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="border-0 bg-transparent font-semibold text-lg focus-visible:ring-0 focus-visible:ring-offset-0 w-[200px] md:w-[300px]"
              placeholder="Document title..."
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-muted-foreground hidden md:flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          
          <span className="text-xs text-muted-foreground hidden sm:block">
            {wordCount} words
          </span>

          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>

          <ExportMenu getHTML={getHTML} documentTitle={documentTitle} />

          <Button
            size="sm"
            onClick={() => setIsAISidebarOpen(!isAISidebarOpen)}
            className={isAISidebarOpen ? 'ai-gradient text-white' : ''}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI
          </Button>
        </div>
      </motion.header>

      {/* Toolbar */}
      <EditorToolbar editor={editor} zoom={zoom} onZoomChange={handleZoomChange} />

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Document Outline */}
        <DocumentOutline
          isOpen={isOutlineOpen}
          onClose={() => setIsOutlineOpen(false)}
          headings={headings}
          onHeadingClick={handleHeadingClick}
          documentTitle={documentTitle}
        />

        {/* Editor Area */}
        <main
          className={`flex-1 transition-all duration-300 ${
            isOutlineOpen ? 'ml-64' : ''
          } ${isAISidebarOpen ? 'mr-80' : ''}`}
        >
          <div className="max-w-4xl mx-auto py-8 px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-editor-paper rounded-lg paper-shadow min-h-[800px] p-8 md:p-12"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            >
              <EditorContent
                editor={editor}
                className="editor-document prose prose-lg max-w-none focus:outline-none"
              />
            </motion.div>
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
    </div>
  );
};
