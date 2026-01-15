import React, { useState, useCallback, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Undo,
  Redo,
  Link,
  Image,
  Search,
  Minus,
  Plus,
  Printer,
  Highlighter,
  Type,
  IndentDecrease,
  IndentIncrease,
  RemoveFormatting,
  FileText,
  Sparkles,
  Subscript,
  Superscript,
  Table,
  FileDown,
  FilePlus,
  FolderOpen,
  Save,
  Settings,
  Keyboard,
  Info,
  LineChart,
  SpellCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface EditorToolbarProps {
  editor: Editor | null;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onOpenFindReplace: () => void;
  onOpenPageSetup: () => void;
  onOpenAISidebar: () => void;
}

const FONTS = [
  'Arial',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Trebuchet MS',
  'Comic Sans MS',
  'Inter',
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

const COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
];

const LINE_HEIGHTS = [
  { value: '1', label: 'Single' },
  { value: '1.15', label: '1.15' },
  { value: '1.5', label: '1.5' },
  { value: '2', label: 'Double' },
  { value: '2.5', label: '2.5' },
  { value: '3', label: 'Triple' },
];

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  zoom,
  onZoomChange,
  onOpenFindReplace,
  onOpenPageSetup,
  onOpenAISidebar,
}) => {
  const [fontSize, setFontSize] = useState('11');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showWordCount, setShowWordCount] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const currentFont = editor.getAttributes('textStyle').fontFamily || 'Arial';
  const currentColor = editor.getAttributes('textStyle').color || '#000000';
  const currentFontSize = editor.getAttributes('textStyle').fontSize?.replace('pt', '') || '11';

  // Font size handlers
  const handleFontSizeChange = (newSize: string) => {
    const size = parseInt(newSize);
    if (size >= 1 && size <= 400) {
      setFontSize(newSize);
      editor.chain().focus().setFontSize(`${size}pt`).run();
    }
  };

  const increaseFontSize = () => {
    const currentSize = parseInt(fontSize);
    const nextSize = FONT_SIZES.find(s => s > currentSize) || currentSize + 2;
    handleFontSizeChange(String(nextSize));
  };

  const decreaseFontSize = () => {
    const currentSize = parseInt(fontSize);
    const prevSize = [...FONT_SIZES].reverse().find(s => s < currentSize) || Math.max(1, currentSize - 2);
    handleFontSizeChange(String(prevSize));
  };

  // Word count calculation
  const getWordCount = () => {
    const text = editor.state.doc.textContent;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    return { words: words.length, characters, charactersNoSpaces };
  };

  // File operations
  const handleNew = () => {
    if (confirm('Create a new document? Any unsaved changes will be lost.')) {
      editor.commands.setContent('<p></p>');
      toast.success('New document created');
    }
  };

  const handleOpen = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
          editor.commands.setContent(content);
        } else {
          editor.commands.setContent(`<p>${content}</p>`);
        }
        toast.success('File opened successfully');
      };
      reader.readAsText(file);
    }
  };

  // Link handling
  const handleSetLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  // Image handling
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        editor.chain().focus().setImage({ src: dataUrl }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageDialog(false);
    }
  };

  // Table insertion
  const handleInsertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  // Horizontal rule
  const handleInsertHorizontalRule = () => {
    editor.chain().focus().setHorizontalRule().run();
  };

  return (
    <div className="bg-card border-b border-border">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".html,.htm,.txt"
        className="hidden"
        onChange={handleFileUpload}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Menu Bar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border text-sm">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              File
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={handleNew}>
              <FilePlus className="h-4 w-4 mr-2" />
              New
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpen}>
              <FolderOpen className="h-4 w-4 mr-2" />
              Open
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.success('Document saved!')}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FileDown className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => {
                  const blob = new Blob([editor.getHTML()], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'document.html';
                  a.click();
                  URL.revokeObjectURL(url);
                }}>
                  HTML (.html)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const blob = new Blob([editor.getText()], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'document.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                }}>
                  Plain text (.txt)
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenPageSetup}>
              <Settings className="h-4 w-4 mr-2" />
              Page setup
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              Edit
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
              Undo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
              Redo
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => document.execCommand('cut')}>
              Cut
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => document.execCommand('copy')}>
              Copy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => document.execCommand('paste')}>
              Paste
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => editor.chain().focus().selectAll().run()}>
              Select all
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenFindReplace}>
              <Search className="h-4 w-4 mr-2" />
              Find and replace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Zoom</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => onZoomChange(50)}>50%</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onZoomChange(75)}>75%</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onZoomChange(100)}>100%</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onZoomChange(125)}>125%</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onZoomChange(150)}>150%</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onZoomChange(200)}>200%</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              Insert
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setShowImageDialog(true)}>
              <Image className="h-4 w-4 mr-2" />
              Image from URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
              <Image className="h-4 w-4 mr-2" />
              Upload image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowLinkDialog(true)}>
              <Link className="h-4 w-4 mr-2" />
              Link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleInsertTable}>
              <Table className="h-4 w-4 mr-2" />
              Table
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleInsertHorizontalRule}>
              <Minus className="h-4 w-4 mr-2" />
              Horizontal line
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              Format
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Text</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleBold().run()}>
                  <Bold className="h-4 w-4 mr-2" />
                  Bold
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleItalic().run()}>
                  <Italic className="h-4 w-4 mr-2" />
                  Italic
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleUnderline().run()}>
                  <UnderlineIcon className="h-4 w-4 mr-2" />
                  Underline
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleStrike().run()}>
                  <Strikethrough className="h-4 w-4 mr-2" />
                  Strikethrough
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleSubscript().run()}>
                  <Subscript className="h-4 w-4 mr-2" />
                  Subscript
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleSuperscript().run()}>
                  <Superscript className="h-4 w-4 mr-2" />
                  Superscript
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Paragraph styles</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
                  Normal text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                  Heading 1
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                  Heading 2
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                  Heading 3
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>
                  Heading 4
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Align</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('left').run()}>
                  <AlignLeft className="h-4 w-4 mr-2" />
                  Left
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('center').run()}>
                  <AlignCenter className="h-4 w-4 mr-2" />
                  Center
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('right').run()}>
                  <AlignRight className="h-4 w-4 mr-2" />
                  Right
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
                  <AlignJustify className="h-4 w-4 mr-2" />
                  Justify
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <LineChart className="h-4 w-4 mr-2" />
                Line spacing
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {LINE_HEIGHTS.map((lh) => (
                  <DropdownMenuItem key={lh.value} onClick={() => editor.chain().focus().setLineHeight(lh.value).run()}>
                    {lh.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
              <RemoveFormatting className="h-4 w-4 mr-2" />
              Clear formatting
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              Tools
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setShowWordCount(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Word count
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info('Spell check is handled by your browser')}>
              <SpellCheck className="h-4 w-4 mr-2" />
              Spelling & grammar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              Help
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setShowKeyboardShortcuts(true)}>
              <Keyboard className="h-4 w-4 mr-2" />
              Keyboard shortcuts
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowAbout(true)}>
              <Info className="h-4 w-4 mr-2" />
              About
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 flex-wrap">
        {/* Search */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenFindReplace}>
              <Search className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Find and replace (Ctrl+H)</TooltipContent>
        </Tooltip>

        {/* Undo/Redo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
        </Tooltip>

        {/* Print */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Print (Ctrl+P)</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onZoomChange(zoom - 10)}
            disabled={zoom <= 50}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-sm">{zoom}%</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onZoomChange(zoom + 10)}
            disabled={zoom >= 200}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Styles dropdown */}
        <Select
          value={editor.isActive('heading', { level: 1 }) ? 'h1' : editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'}
          onValueChange={(value) => {
            if (value === 'p') editor.chain().focus().setParagraph().run();
            else if (value === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
            else if (value === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
            else if (value === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
          }}
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p">Normal text</SelectItem>
            <SelectItem value="h1">Heading 1</SelectItem>
            <SelectItem value="h2">Heading 2</SelectItem>
            <SelectItem value="h3">Heading 3</SelectItem>
          </SelectContent>
        </Select>

        {/* Font family */}
        <Select
          value={currentFont}
          onValueChange={(value) => editor.chain().focus().setFontFamily(value).run()}
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            {FONTS.map((font) => (
              <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Font size */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-6"
                onClick={decreaseFontSize}
              >
                <Minus className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Decrease font size</TooltipContent>
          </Tooltip>
          <Select value={fontSize} onValueChange={handleFontSizeChange}>
            <SelectTrigger className="w-14 h-8 text-center px-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-6"
                onClick={increaseFontSize}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Increase font size</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Bold, Italic, Underline, Strikethrough */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", editor.isActive('bold') && "bg-accent")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Bold (Ctrl+B)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", editor.isActive('italic') && "bg-accent")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Italic (Ctrl+I)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", editor.isActive('underline') && "bg-accent")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Underline (Ctrl+U)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", editor.isActive('strike') && "bg-accent")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Strikethrough</TooltipContent>
        </Tooltip>

        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <div className="flex flex-col items-center">
                <Type className="h-3.5 w-3.5" />
                <div className="w-4 h-1 mt-0.5" style={{ backgroundColor: currentColor }} />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-10 gap-1">
              {COLORS.map((color) => (
                <button
                  key={color}
                  className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => editor.chain().focus().setColor(color).run()}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Highlight Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-10 gap-1">
              {COLORS.slice(10).map((color) => (
                <button
                  key={color}
                  className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              onClick={() => editor.chain().focus().unsetHighlight().run()}
            >
              Remove highlight
            </Button>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Subscript/Superscript */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", editor.isActive('subscript') && "bg-accent")}
              onClick={() => editor.chain().focus().toggleSubscript().run()}
            >
              <Subscript className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Subscript</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", editor.isActive('superscript') && "bg-accent")}
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
            >
              <Superscript className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Superscript</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Link */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", editor.isActive('link') && "bg-accent")}
              onClick={() => {
                if (editor.isActive('link')) {
                  editor.chain().focus().unsetLink().run();
                } else {
                  setShowLinkDialog(true);
                }
              }}
            >
              <Link className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Insert link (Ctrl+K)</TooltipContent>
        </Tooltip>

        {/* Image */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => imageInputRef.current?.click()}
            >
              <Image className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Insert image</TooltipContent>
        </Tooltip>

        {/* Table */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleInsertTable}
            >
              <Table className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Insert table</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Alignment */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", editor.isActive({ textAlign: 'left' }) && "bg-accent")}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align left</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", editor.isActive({ textAlign: 'center' }) && "bg-accent")}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align center</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", editor.isActive({ textAlign: 'right' }) && "bg-accent")}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align right</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", editor.isActive({ textAlign: 'justify' }) && "bg-accent")}
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Justify</TooltipContent>
        </Tooltip>

        {/* Line spacing */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <LineChart className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-32 p-1">
            {LINE_HEIGHTS.map((lh) => (
              <Button
                key={lh.value}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => editor.chain().focus().setLineHeight(lh.value).run()}
              >
                {lh.label}
              </Button>
            ))}
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", editor.isActive('bulletList') && "bg-accent")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Bulleted list</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", editor.isActive('orderedList') && "bg-accent")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Numbered list</TooltipContent>
        </Tooltip>

        {/* Indent */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => editor.chain().focus().outdent().run()}
            >
              <IndentDecrease className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Decrease indent</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => editor.chain().focus().indent().run()}
            >
              <IndentIncrease className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Increase indent</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Clear formatting */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            >
              <RemoveFormatting className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear formatting</TooltipContent>
        </Tooltip>

        {/* Page Setup */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onOpenPageSetup}
            >
              <FileText className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Page setup</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* AI Sidebar Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-gradient-to-r from-violet-500/10 to-purple-600/10 hover:from-violet-500/20 hover:to-purple-600/20"
              onClick={onOpenAISidebar}
            >
              <Sparkles className="h-4 w-4 text-violet-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>AI Assistant</TooltipContent>
        </Tooltip>
      </div>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>Cancel</Button>
            <Button onClick={handleSetLink}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image URL Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image from URL</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageDialog(false)}>Cancel</Button>
            <Button onClick={handleSetImage}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Word Count Dialog */}
      <Dialog open={showWordCount} onOpenChange={setShowWordCount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Word Count</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {(() => {
              const counts = getWordCount();
              return (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Words:</span>
                    <span className="font-medium">{counts.words}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Characters (with spaces):</span>
                    <span className="font-medium">{counts.characters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Characters (without spaces):</span>
                    <span className="font-medium">{counts.charactersNoSpaces}</span>
                  </div>
                </div>
              );
            })()}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowWordCount(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-[400px] overflow-y-auto">
            {[
              { key: 'Ctrl+B', action: 'Bold' },
              { key: 'Ctrl+I', action: 'Italic' },
              { key: 'Ctrl+U', action: 'Underline' },
              { key: 'Ctrl+Z', action: 'Undo' },
              { key: 'Ctrl+Y', action: 'Redo' },
              { key: 'Ctrl+Shift+S', action: 'Strikethrough' },
              { key: 'Ctrl+K', action: 'Insert link' },
              { key: 'Ctrl+Shift+7', action: 'Numbered list' },
              { key: 'Ctrl+Shift+8', action: 'Bulleted list' },
              { key: 'Tab', action: 'Indent' },
              { key: 'Shift+Tab', action: 'Outdent' },
            ].map((shortcut) => (
              <div key={shortcut.key} className="flex justify-between py-1 border-b border-border last:border-0">
                <span>{shortcut.action}</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">{shortcut.key}</kbd>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowKeyboardShortcuts(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* About Dialog */}
      <Dialog open={showAbout} onOpenChange={setShowAbout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>About</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              A rich text editor built with TipTap and React. Features include formatting, 
              tables, images, links, and AI-powered writing assistance.
            </p>
            <p className="text-sm text-muted-foreground">
              Version 1.0.0
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowAbout(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditorToolbar;
