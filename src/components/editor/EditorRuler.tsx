import React, { useRef, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

interface EditorRulerProps {
  pageWidth: number; // in inches
  leftMargin: number; // in inches
  rightMargin: number; // in inches
  tabStops: number[]; // in inches from left margin
  zoom: number;
  onTabStopAdd: (position: number) => void;
  onTabStopRemove: (position: number) => void;
  onMarginChange: (left: number, right: number) => void;
}

const EditorRuler: React.FC<EditorRulerProps> = ({
  pageWidth,
  leftMargin,
  rightMargin,
  tabStops,
  zoom,
  onTabStopAdd,
  onTabStopRemove,
  onMarginChange,
}) => {
  const rulerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'left' | 'right' | 'tab' | null>(null);
  const [dragTabIndex, setDragTabIndex] = useState<number | null>(null);

  // Convert inches to pixels (96 DPI)
  const inchesToPx = (inches: number) => inches * 96 * (zoom / 100);
  const pxToInches = (px: number) => px / 96 / (zoom / 100);

  const rulerWidth = inchesToPx(pageWidth);
  const leftMarginPx = inchesToPx(leftMargin);
  const rightMarginPx = inchesToPx(rightMargin);
  const contentWidth = rulerWidth - leftMarginPx - rightMarginPx;

  // Generate ruler marks
  const generateMarks = () => {
    const marks = [];
    const majorInterval = inchesToPx(1);
    const minorInterval = inchesToPx(0.125);

    for (let i = 0; i <= pageWidth * 8; i++) {
      const pos = i * minorInterval / 8;
      const isMajor = i % 8 === 0;
      const isHalf = i % 4 === 0;

      marks.push(
        <div
          key={i}
          className="absolute top-0"
          style={{ left: `${pos}px` }}
        >
          <div
            className={cn(
              "w-px bg-muted-foreground/60",
              isMajor ? "h-3" : isHalf ? "h-2" : "h-1"
            )}
          />
          {isMajor && (
            <span
              className="absolute top-3 text-[9px] text-muted-foreground -translate-x-1/2"
              style={{ left: '0.5px' }}
            >
              {i / 8}
            </span>
          )}
        </div>
      );
    }
    return marks;
  };

  const handleRulerClick = useCallback((e: React.MouseEvent) => {
    if (!rulerRef.current || dragging) return;

    const rect = rulerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const posInches = pxToInches(clickX) - leftMargin;

    // Only add tab stops within content area
    if (posInches > 0 && posInches < pageWidth - leftMargin - rightMargin) {
      onTabStopAdd(Math.round(posInches * 4) / 4); // Snap to 0.25"
    }
  }, [dragging, leftMargin, rightMargin, pageWidth, pxToInches, onTabStopAdd]);

  const handleTabDoubleClick = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onTabStopRemove(tabStops[index]);
  }, [tabStops, onTabStopRemove]);

  const handleMarginDragStart = useCallback((side: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    setDragging(side);
  }, []);

  const handleTabDragStart = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDragging('tab');
    setDragTabIndex(index);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !rulerRef.current) return;

    const rect = rulerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const posInches = pxToInches(mouseX);

    if (dragging === 'left') {
      const newLeft = Math.max(0.25, Math.min(pageWidth - rightMargin - 1, posInches));
      onMarginChange(Math.round(newLeft * 4) / 4, rightMargin);
    } else if (dragging === 'right') {
      const newRight = Math.max(0.25, Math.min(pageWidth - leftMargin - 1, pageWidth - posInches));
      onMarginChange(leftMargin, Math.round(newRight * 4) / 4);
    } else if (dragging === 'tab' && dragTabIndex !== null) {
      const newPos = posInches - leftMargin;
      if (newPos > 0 && newPos < pageWidth - leftMargin - rightMargin) {
        onTabStopRemove(tabStops[dragTabIndex]);
        onTabStopAdd(Math.round(newPos * 4) / 4);
      }
    }
  }, [dragging, dragTabIndex, leftMargin, rightMargin, pageWidth, pxToInches, onMarginChange, tabStops, onTabStopRemove, onTabStopAdd]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setDragTabIndex(null);
  }, []);

  return (
    <div className="bg-card border-b border-border">
      <div className="flex justify-center overflow-x-auto py-1">
        <div
          ref={rulerRef}
          className="relative h-6 bg-background border border-border cursor-crosshair select-none"
          style={{ width: `${rulerWidth}px` }}
          onClick={handleRulerClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Ruler marks */}
          {generateMarks()}

          {/* Left margin area */}
          <div
            className="absolute top-0 h-full bg-muted/50"
            style={{ left: 0, width: `${leftMarginPx}px` }}
          />

          {/* Right margin area */}
          <div
            className="absolute top-0 h-full bg-muted/50"
            style={{ right: 0, width: `${rightMarginPx}px` }}
          />

          {/* Left margin handle */}
          <div
            className={cn(
              "absolute top-0 h-full w-2 cursor-ew-resize group",
              dragging === 'left' && "z-10"
            )}
            style={{ left: `${leftMarginPx - 4}px` }}
            onMouseDown={(e) => handleMarginDragStart('left', e)}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] border-t-primary group-hover:border-t-primary/80" />
          </div>

          {/* Right margin handle */}
          <div
            className={cn(
              "absolute top-0 h-full w-2 cursor-ew-resize group",
              dragging === 'right' && "z-10"
            )}
            style={{ right: `${rightMarginPx - 4}px` }}
            onMouseDown={(e) => handleMarginDragStart('right', e)}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] border-t-primary group-hover:border-t-primary/80" />
          </div>

          {/* Tab stops */}
          {tabStops.map((stop, index) => (
            <div
              key={index}
              className="absolute top-0 h-full w-2 cursor-pointer group"
              style={{ left: `${leftMarginPx + inchesToPx(stop) - 4}px` }}
              onMouseDown={(e) => handleTabDragStart(index, e)}
              onDoubleClick={(e) => handleTabDoubleClick(index, e)}
              title="Double-click to remove"
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-secondary group-hover:border-b-secondary/80" />
            </div>
          ))}

          {/* Content area indicator */}
          <div
            className="absolute bottom-0 h-0.5 bg-primary/30"
            style={{
              left: `${leftMarginPx}px`,
              width: `${contentWidth}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorRuler;
