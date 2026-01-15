import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  FileText,
  FileCode,
  File,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ExportMenuProps {
  getHTML: () => string;
  documentTitle: string;
}

export const ExportMenu = ({ getHTML, documentTitle }: ExportMenuProps) => {
  const [exporting, setExporting] = useState<string | null>(null);

  const exportToPDF = async () => {
    setExporting('pdf');
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const html = getHTML();
      
      const container = document.createElement('div');
      container.innerHTML = html;
      container.className = 'editor-document';
      container.style.padding = '40px';
      container.style.fontFamily = 'Georgia, serif';
      document.body.appendChild(container);

      await html2pdf()
        .set({
          margin: [10, 10],
          filename: `${documentTitle || 'document'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(container)
        .save();

      document.body.removeChild(container);
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    } finally {
      setExporting(null);
    }
  };

  const exportToDOCX = async () => {
    setExporting('docx');
    try {
      const HTMLtoDOCX = (await import('html-to-docx')).default;
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; }
              h1 { font-size: 24pt; font-weight: bold; }
              h2 { font-size: 18pt; font-weight: bold; }
              h3 { font-size: 14pt; font-weight: bold; }
              code { font-family: 'Courier New', monospace; background: #f4f4f4; padding: 2px 4px; }
              pre { font-family: 'Courier New', monospace; background: #f4f4f4; padding: 10px; }
              blockquote { border-left: 3px solid #ccc; padding-left: 10px; margin-left: 0; color: #666; }
            </style>
          </head>
          <body>${getHTML()}</body>
        </html>
      `;
      
      const blob = await HTMLtoDOCX(html, null, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
      });

      const url = URL.createObjectURL(blob as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentTitle || 'document'}.docx`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('DOCX exported successfully!');
    } catch (error) {
      console.error('DOCX export error:', error);
      toast.error('Failed to export DOCX');
    } finally {
      setExporting(null);
    }
  };

  const exportToMarkdown = async () => {
    setExporting('md');
    try {
      const TurndownService = (await import('turndown')).default;
      const turndown = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
      });

      const markdown = turndown.turndown(getHTML());
      
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentTitle || 'document'}.md`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Markdown exported successfully!');
    } catch (error) {
      console.error('Markdown export error:', error);
      toast.error('Failed to export Markdown');
    } finally {
      setExporting(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Document</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={exportToPDF} disabled={!!exporting}>
          <div className="flex items-center gap-3 w-full">
            {exporting === 'pdf' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <File className="w-4 h-4 text-red-500" />
            )}
            <span>PDF Document</span>
            {exporting === 'pdf' && <Check className="w-4 h-4 ml-auto text-success" />}
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={exportToDOCX} disabled={!!exporting}>
          <div className="flex items-center gap-3 w-full">
            {exporting === 'docx' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 text-blue-500" />
            )}
            <span>Word Document</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={exportToMarkdown} disabled={!!exporting}>
          <div className="flex items-center gap-3 w-full">
            {exporting === 'md' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileCode className="w-4 h-4 text-gray-500" />
            )}
            <span>Markdown</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
