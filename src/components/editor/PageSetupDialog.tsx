import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PAGE_SIZES, PageSize, Margins } from './types';

interface PageSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageSize: PageSize;
  margins: Margins;
  onPageSizeChange: (size: PageSize) => void;
  onMarginsChange: (margins: Margins) => void;
}

const PageSetupDialog: React.FC<PageSetupDialogProps> = ({
  open,
  onOpenChange,
  pageSize,
  margins,
  onPageSizeChange,
  onMarginsChange,
}) => {
  const [localPageSize, setLocalPageSize] = React.useState(pageSize);
  const [localMargins, setLocalMargins] = React.useState(margins);
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait');

  React.useEffect(() => {
    setLocalPageSize(pageSize);
    setLocalMargins(margins);
  }, [pageSize, margins, open]);

  const handleApply = () => {
    let finalPageSize = localPageSize;
    
    // Apply orientation
    if (orientation === 'landscape' && localPageSize.width < localPageSize.height) {
      finalPageSize = {
        ...localPageSize,
        width: localPageSize.height,
        height: localPageSize.width,
      };
    } else if (orientation === 'portrait' && localPageSize.width > localPageSize.height) {
      finalPageSize = {
        ...localPageSize,
        width: localPageSize.height,
        height: localPageSize.width,
      };
    }
    
    onPageSizeChange(finalPageSize);
    onMarginsChange(localMargins);
    onOpenChange(false);
  };

  const handlePageSizeSelect = (key: string) => {
    const size = PAGE_SIZES[key];
    if (size) {
      setLocalPageSize(size);
    }
  };

  const getCurrentPageSizeKey = () => {
    return Object.entries(PAGE_SIZES).find(
      ([_, size]) => 
        (size.width === localPageSize.width && size.height === localPageSize.height) ||
        (size.height === localPageSize.width && size.width === localPageSize.height)
    )?.[0] || 'letter';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Page Setup</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Page Size */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Page Size</label>
            <Select value={getCurrentPageSizeKey()} onValueChange={handlePageSizeSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select page size" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAGE_SIZES).map(([key, size]) => (
                  <SelectItem key={key} value={key}>
                    {size.name} ({size.width}" × {size.height}")
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Orientation */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Orientation</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="orientation"
                  checked={orientation === 'portrait'}
                  onChange={() => setOrientation('portrait')}
                  className="w-4 h-4"
                />
                <div className="flex items-center gap-2">
                  <div className="w-4 h-6 border-2 border-foreground rounded-sm" />
                  Portrait
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="orientation"
                  checked={orientation === 'landscape'}
                  onChange={() => setOrientation('landscape')}
                  className="w-4 h-4"
                />
                <div className="flex items-center gap-2">
                  <div className="w-6 h-4 border-2 border-foreground rounded-sm" />
                  Landscape
                </div>
              </label>
            </div>
          </div>

          {/* Margins */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Margins (inches)</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Top</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="3"
                  value={localMargins.top}
                  onChange={(e) =>
                    setLocalMargins({ ...localMargins, top: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Bottom</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="3"
                  value={localMargins.bottom}
                  onChange={(e) =>
                    setLocalMargins({ ...localMargins, bottom: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Left</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="3"
                  value={localMargins.left}
                  onChange={(e) =>
                    setLocalMargins({ ...localMargins, left: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Right</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="3"
                  value={localMargins.right}
                  onChange={(e) =>
                    setLocalMargins({ ...localMargins, right: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Preview</label>
            <div className="flex justify-center p-4 bg-muted rounded-lg">
              <div
                className="bg-card border shadow-sm relative"
                style={{
                  width: orientation === 'portrait' ? '60px' : '80px',
                  height: orientation === 'portrait' ? '80px' : '60px',
                }}
              >
                <div
                  className="absolute bg-accent/50"
                  style={{
                    top: `${(localMargins.top / 3) * 100}%`,
                    bottom: `${(localMargins.bottom / 3) * 100}%`,
                    left: `${(localMargins.left / 3) * 100}%`,
                    right: `${(localMargins.right / 3) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PageSetupDialog;
