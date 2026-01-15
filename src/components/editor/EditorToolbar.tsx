import { Editor } from '@tiptap/react';
import { motion } from 'framer-motion';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link,
  Image,
  Table,
  Highlighter,
  Undo,
  Redo,
  Minus,
  Printer,
  Search,
  PaintBucket,
  Type,
  ChevronDown,
  Plus,
  Minus as MinusIcon,
  IndentIncrease,
  IndentDecrease,
  RemoveFormatting,
  Subscript,
  Superscript,
  MessageSquare,
  CheckSquare,
  MoreHorizontal,
  Baseline,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useCallback } from 'react';

interface EditorToolbarProps {
  editor: Editor | null;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
}

const ToolbarButton = ({
  onClick,
  isActive,
  disabled,
  tooltip,
  children,
}: ToolbarButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`toolbar-btn ${isActive ? 'active' : ''}`}
      >
        {children}
      </button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="text-xs">
      {tooltip}
    </TooltipContent>
  </Tooltip>
);

const FONTS = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS' },
  { label: 'Comic Sans MS', value: 'Comic Sans MS' },
  { label: 'Impact', value: 'Impact' },
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

const TEXT_COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
];

const HIGHLIGHT_COLORS = [
  '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#ff0000', '#0000ff',
  '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9',
];

const STYLES = [
  { label: 'Normal text', level: 0 },
  { label: 'Title', level: 1 },
  { label: 'Heading 1', level: 1 },
  { label: 'Heading 2', level: 2 },
  { label: 'Heading 3', level: 3 },
  { label: 'Heading 4', level: 4 },
  { label: 'Heading 5', level: 5 },
  { label: 'Heading 6', level: 6 },
];

const LINE_SPACINGS = [
  { label: 'Single', value: 1 },
  { label: '1.15', value: 1.15 },
  { label: '1.5', value: 1.5 },
  { label: 'Double', value: 2 },
];

export const EditorToolbar = ({ editor, zoom, onZoomChange }: EditorToolbarProps) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState(11);
  const [currentFont, setCurrentFont] = useState('Arial');
  const [currentTextColor, setCurrentTextColor] = useState('#000000');
  const [currentHighlight, setCurrentHighlight] = useState('#ffff00');
  const [lineSpacing, setLineSpacing] = useState(1.15);

  if (!editor) return null;

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
    }
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const handlePrint = () => {
    window.print();
  };

  const setFontFamily = (font: string) => {
    setCurrentFont(font);
    editor.chain().focus().setFontFamily(font).run();
  };

  const setTextColor = (color: string) => {
    setCurrentTextColor(color);
    editor.chain().focus().setColor(color).run();
  };

  const setHighlightColor = (color: string) => {
    setCurrentHighlight(color);
    editor.chain().focus().setHighlight({ color }).run();
  };

  const getCurrentStyle = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    if (editor.isActive('heading', { level: 4 })) return 'Heading 4';
    if (editor.isActive('heading', { level: 5 })) return 'Heading 5';
    if (editor.isActive('heading', { level: 6 })) return 'Heading 6';
    return 'Normal text';
  };

  const setStyle = (level: number) => {
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
    }
  };

  const increaseFontSize = () => {
    const currentIndex = FONT_SIZES.indexOf(currentFontSize);
    if (currentIndex < FONT_SIZES.length - 1) {
      setCurrentFontSize(FONT_SIZES[currentIndex + 1]);
    }
  };

  const decreaseFontSize = () => {
    const currentIndex = FONT_SIZES.indexOf(currentFontSize);
    if (currentIndex > 0) {
      setCurrentFontSize(FONT_SIZES[currentIndex - 1]);
    }
  };

  const clearFormatting = () => {
    editor.chain().focus().unsetAllMarks().clearNodes().run();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-[57px] z-20 bg-background border-b border-border"
    >
      {/* Menu Bar */}
      <div className="flex items-center gap-1 px-1 py-0.5 border-b border-border text-xs bg-background">
        <DropdownMenu>
          <DropdownMenuTrigger className="px-1.5 py-0.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors text-xs">
            File
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>New</DropdownMenuItem>
            <DropdownMenuItem>Open</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Save</DropdownMenuItem>
            <DropdownMenuItem>Save as...</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handlePrint}>Print</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="px-1.5 py-0.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors text-xs">
            Edit
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => editor.chain().focus().undo().run()}>
              Undo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().redo().run()}>
              Redo
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => document.execCommand('cut')}>Cut</DropdownMenuItem>
            <DropdownMenuItem onClick={() => document.execCommand('copy')}>Copy</DropdownMenuItem>
            <DropdownMenuItem onClick={() => document.execCommand('paste')}>Paste</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => editor.chain().focus().selectAll().run()}>
              Select all
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="px-1.5 py-0.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors text-xs">
            View
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onZoomChange(50)} className="text-xs">50%</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onZoomChange(75)} className="text-xs">75%</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onZoomChange(100)} className="text-xs">100%</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onZoomChange(125)} className="text-xs">125%</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onZoomChange(150)} className="text-xs">150%</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="px-1.5 py-0.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors text-xs">
            Insert
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={addTable}>Table</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => editor.chain().focus().setHorizontalRule().run()}>
              Horizontal line
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleBlockquote().run()}>
              Quote
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
              Code block
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="px-1.5 py-0.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors text-xs">
            Format
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Text</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleBold().run()}>
                  Bold
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleItalic().run()}>
                  Italic
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleUnderline().run()}>
                  Underline
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleStrike().run()}>
                  Strikethrough
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleSuperscript().run()}>
                  Superscript
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleSubscript().run()}>
                  Subscript
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Paragraph styles</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {STYLES.map((style) => (
                  <DropdownMenuItem key={style.label} onClick={() => setStyle(style.level)}>
                    {style.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Align & indent</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('left').run()}>
                  Left
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('center').run()}>
                  Center
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('right').run()}>
                  Right
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
                  Justify
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={clearFormatting}>Clear formatting</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="px-1.5 py-0.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors text-xs">
            Tools
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setShowSearch(!showSearch)}>
              Find and replace
            </DropdownMenuItem>
            <DropdownMenuItem>Word count</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="px-1.5 py-0.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors text-xs">
            Help
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Keyboard shortcuts</DropdownMenuItem>
            <DropdownMenuItem>Help</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Toolbar */}
      <div className="flex items-center gap-1 px-1 py-1 flex-wrap bg-background">
        {/* Search */}
        <ToolbarButton onClick={() => setShowSearch(!showSearch)} tooltip="Search (Ctrl+F)">
          <Search className="w-4 h-4" />
        </ToolbarButton>

        {/* History */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          tooltip="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          tooltip="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        {/* Print */}
        <ToolbarButton onClick={handlePrint} tooltip="Print (Ctrl+P)">
          <Printer className="w-4 h-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Zoom */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="toolbar-btn flex items-center gap-1 px-2 min-w-[60px] justify-center">
              <span className="text-sm">{zoom}%</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[50, 75, 90, 100, 125, 150, 200].map((z) => (
              <DropdownMenuItem key={z} onClick={() => onZoomChange(z)} className="text-xs p-1">
                {z}%
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Styles Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="toolbar-btn flex items-center gap-1 px-2 min-w-[100px] justify-between">
              <span className="text-sm truncate">{getCurrentStyle()}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            {STYLES.map((style) => (
              <DropdownMenuItem 
                key={style.label} 
                onClick={() => setStyle(style.level)}
                className={`${style.level === 1 ? 'text-lg font-bold' : style.level === 2 ? 'text-base font-semibold' : style.level === 3 ? 'text-sm font-medium' : 'text-sm'} text-xs p-1`}
              >
                {style.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Font Family */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="toolbar-btn flex items-center gap-1 px-2 min-w-[100px] justify-between">
              <span className="text-sm truncate">{currentFont}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-64 overflow-y-auto">
            {FONTS.map((font) => (
              <DropdownMenuItem 
                key={font.value} 
                onClick={() => setFontFamily(font.value)}
                style={{ fontFamily: font.value }}
              >
                {font.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Font Size */}
        <div className="flex items-center gap-1">
          <ToolbarButton onClick={decreaseFontSize} tooltip="Decrease font size">
            <MinusIcon className="w-3 h-3" />
          </ToolbarButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="toolbar-btn px-2 min-w-[40px] text-center text-sm">
                {currentFontSize}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-64 overflow-y-auto">
              {FONT_SIZES.map((size) => (
                <DropdownMenuItem key={size} onClick={() => setCurrentFontSize(size)} className="text-xs">
                  {size}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ToolbarButton onClick={increaseFontSize} tooltip="Increase font size">
            <Plus className="w-3 h-3" />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          tooltip="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          tooltip="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          tooltip="Underline (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </ToolbarButton>

        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="toolbar-btn flex flex-col items-center p-1.5">
              <Type className="w-4 h-4" />
              <div className="w-4 h-1 mt-0.5 rounded-sm" style={{ backgroundColor: currentTextColor }} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-10 gap-1">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => setTextColor(color)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Highlight Color */}
        <Popover>
          <PopoverTrigger asChild>
            <button className={`toolbar-btn flex flex-col items-center p-1.5 ${editor.isActive('highlight') ? 'active' : ''}`}>
              <Highlighter className="w-4 h-4" />
              <div className="w-4 h-1 mt-0.5 rounded-sm" style={{ backgroundColor: currentHighlight }} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-6 gap-1">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => setHighlightColor(color)}
                />
              ))}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2 text-xs"
              onClick={() => editor.chain().focus().unsetHighlight().run()}
            >
              Remove highlight
            </Button>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Link */}
        <Popover>
          <PopoverTrigger asChild>
            <button className={`toolbar-btn ${editor.isActive('link') ? 'active' : ''}`}>
              <Link className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter URL..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addLink()}
              />
              <Button size="sm" onClick={addLink}>Add</Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Comment */}
        <ToolbarButton onClick={() => {}} tooltip="Add comment (Ctrl+Alt+M)">
          <MessageSquare className="w-4 h-4" />
        </ToolbarButton>

        {/* Image */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="toolbar-btn">
              <Image className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter image URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addImage()}
              />
              <Button size="sm" onClick={addImage}>Add</Button>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Alignment Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="toolbar-btn flex items-center gap-1">
              <AlignLeft className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('left').run()} className="text-xs p-1">
              <AlignLeft className="w-3 h-3 mr-1" /> L
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('center').run()} className="text-xs p-1">
              <AlignCenter className="w-3 h-3 mr-1" /> C
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('right').run()} className="text-xs p-1">
              <AlignRight className="w-3 h-3 mr-1" /> R
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('justify').run()} className="text-xs p-1">
              <AlignJustify className="w-3 h-3 mr-1" /> J
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Line Spacing */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="toolbar-btn flex items-center gap-1">
              <Baseline className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {LINE_SPACINGS.map((spacing) => (
              <DropdownMenuItem 
                key={spacing.value} 
                onClick={() => setLineSpacing(spacing.value)}
                className="text-xs p-1"
              >
                {spacing.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs p-1">SPC B</DropdownMenuItem>
            <DropdownMenuItem className="text-xs p-1">SPC A</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Lists */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`toolbar-btn flex items-center gap-1 ${editor.isActive('bulletList') ? 'active' : ''}`}>
              <List className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleBulletList().run()} className="text-xs p-1">
              • BL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleBulletList().run()} className="text-xs p-1">
              ◦ HB
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleBulletList().run()} className="text-xs p-1">
              ■ SB
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`toolbar-btn flex items-center gap-1 ${editor.isActive('orderedList') ? 'active' : ''}`}>
              <ListOrdered className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleOrderedList().run()} className="text-xs p-1">
              1. NL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleOrderedList().run()} className="text-xs p-1">
              a. LL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleOrderedList().run()} className="text-xs p-1">
              i. RN
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Indentation */}
        <ToolbarButton onClick={() => {}} tooltip="Decrease indent">
          <IndentDecrease className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} tooltip="Increase indent">
          <IndentIncrease className="w-4 h-4" />
        </ToolbarButton>

        {/* Clear Formatting */}
        <ToolbarButton onClick={clearFormatting} tooltip="Clear formatting (Ctrl+\)">
          <RemoveFormatting className="w-4 h-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* More Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="toolbar-btn">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleSuperscript().run()} className="text-xs p-1">
              <Superscript className="w-3 h-3 mr-1" /> Superscript
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleSubscript().run()} className="text-xs p-1">
              <Subscript className="w-3 h-3 mr-1" /> Subscript
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleStrike().run()} className="text-xs p-1">
              <Strikethrough className="w-3 h-3 mr-1" /> Strikethrough
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleCode().run()} className="text-xs p-1">
              <Code className="w-3 h-3 mr-1" /> Inline code
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleBlockquote().run()} className="text-xs p-1">
              <Quote className="w-3 h-3 mr-1" /> Quote
            </DropdownMenuItem>
            <DropdownMenuItem onClick={addTable} className="text-xs p-1">
              <Table className="w-3 h-3 mr-1" /> Insert table
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().setHorizontalRule().run()} className="text-xs p-1">
              <Minus className="w-3 h-3 mr-1" /> Horizontal line
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="text-xs p-1">
              <Code className="w-3 h-3 mr-1" /> Code block
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search Bar (toggleable) */}
      {showSearch && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-2 py-1 border-t border-border bg-background"
        >
          <div className="flex items-center gap-1 max-w-md">
            <Input
              placeholder="Find in document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-6 text-xs"
            />
            <Button size="sm" variant="outline" className="h-7 text-xs">F</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs">R</Button>
            <Button size="sm" variant="ghost" className="h-7" onClick={() => setShowSearch(false)}>×</Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
