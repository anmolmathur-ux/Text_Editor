import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Hash, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface DocumentOutlineProps {
  isOpen: boolean;
  onClose: () => void;
  headings: Heading[];
  onHeadingClick: (id: string) => void;
  documentTitle: string;
}

export const DocumentOutline = ({
  isOpen,
  onClose,
  headings,
  onHeadingClick,
  documentTitle,
}: DocumentOutlineProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-border shadow-lg z-30 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Document Outline</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Document Title */}
          <div className="p-4 border-b border-border">
            <p className="text-xs text-muted-foreground mb-1">Document</p>
            <h3 className="font-medium text-sm truncate">{documentTitle || 'Untitled Document'}</h3>
          </div>

          {/* Headings List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {headings.length > 0 ? (
                <nav className="space-y-1">
                  {headings.map((heading, index) => (
                    <motion.button
                      key={heading.id || index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onHeadingClick(heading.id)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary transition-colors group flex items-center gap-2"
                      style={{ paddingLeft: `${(heading.level - 1) * 12 + 12}px` }}
                    >
                      <Hash className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate flex-1">
                        {heading.text || 'Untitled'}
                      </span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  ))}
                </nav>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Hash className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No headings yet</p>
                  <p className="text-xs mt-1">Add headings to see the outline</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Stats */}
          <div className="p-4 border-t border-border bg-secondary/30">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-lg font-semibold">{headings.length}</p>
                <p className="text-xs text-muted-foreground">Headings</p>
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {headings.filter((h) => h.level === 1).length}
                </p>
                <p className="text-xs text-muted-foreground">Sections</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
