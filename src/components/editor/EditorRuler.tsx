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
              "w-px",
              isMajor 
                ? "h-4 bg-gray-600" 
                : isHalf 
                  ? "h-3 bg-gray-500" 
                  : "h-2 bg-gray-400"
            )}
          />
          {isMajor && (
            <span
              className="absolute top-4 text-xs text-gray-600 font-medium -translate-x-1/2"
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
    <div className="bg-gray-50 border-b border-gray-200 shadow-sm">
      <div className="flex justify-center overflow-x-auto py-1">
        <div
          ref={rulerRef}
          className="relative h-8 bg-white border border-gray-300 rounded-sm cursor-crosshair select-none shadow-inner"
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
            className="absolute top-0 h-full bg-blue-50 border-r border-dashed border-blue-200"
            style={{ left: 0, width: `${leftMarginPx}px` }}
          />

          {/* Right margin area */}
          <div
            className="absolute top-0 h-full bg-blue-50 border-l border-dashed border-blue-200"
            style={{ right: 0, width: `${rightMarginPx}px` }}
          />

          {/* Content area - includes both spacing and indicator */}
          <div
            className="absolute top-0 h-full"
            style={{
              left: `${leftMarginPx}px`,
              width: `${contentWidth}px`,
            }}
          >
            {/* Content area indicator */}
            <div
              className="absolute top-0 h-0.5 bg-green-400"
              style={{
                left: 0,  // Positioned relative to the content area container
                width: '100%',  // Full width of the content area
                top: '1px'
              }}
            />
          </div>

          {/* Left margin handle */}
          <div
            className={cn(
              "absolute top-0 h-full w-3 cursor-ew-resize group flex items-center justify-center",
              dragging === 'left' && "z-10"
            )}
            style={{ left: `${leftMarginPx - 6}px` }}
            onMouseDown={(e) => handleMarginDragStart('left', e)}
          >
            <div className="w-1 h-6 bg-blue-500 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-0.5 h-4 bg-white rounded-sm"></div>
            </div>
            <div className="absolute -top-1 w-1 h-2 bg-blue-500 rounded-sm"></div>
          </div>

          {/* Right margin handle */}
          <div
            className={cn(
              "absolute top-0 h-full w-3 cursor-ew-resize group flex items-center justify-center",
              dragging === 'right' && "z-10"
            )}
            style={{ right: `${rightMarginPx - 6}px` }}
            onMouseDown={(e) => handleMarginDragStart('right', e)}
          >
            <div className="w-1 h-6 bg-blue-500 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-0.5 h-4 bg-white rounded-sm"></div>
            </div>
            <div className="absolute -top-1 w-1 h-2 bg-blue-500 rounded-sm"></div>
          </div>

          {/* Tab stops */}
          {tabStops.map((stop, index) => (
            <div
              key={index}
              className="absolute top-0 h-full w-3 cursor-pointer group flex items-end justify-center"
              style={{ left: `${leftMarginPx + inchesToPx(stop) - 6}px` }}
              onMouseDown={(e) => handleTabDragStart(index, e)}
              onDoubleClick={(e) => handleTabDoubleClick(index, e)}
              title="Double-click to remove"
            >
              <div className="w-0.5 h-3 bg-orange-500 rounded-t-sm opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute -bottom-1 w-2 h-2 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default EditorRuler;