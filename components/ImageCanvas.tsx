
import React, { useRef, useState, useCallback } from 'react';
import { Point, Rect, ImageData } from '../types';

interface ImageCanvasProps {
  image: ImageData | null;
  onPosChange: (pos: Point | null) => void;
  onSelectionChange: (rect: Rect | null) => void;
}

const ImageCanvas: React.FC<ImageCanvasProps> = ({ image, onPosChange, onSelectionChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<Point | null>(null);
  const [currentSelection, setCurrentSelection] = useState<Rect | null>(null);
  const [pointerPos, setPointerPos] = useState<Point | null>(null);
  const [cursorScreenPos, setCursorScreenPos] = useState<{x: number, y: number} | null>(null);

  const getCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent | MouseEvent): { image: Point, screen: {x: number, y: number} } | null => {
    if (!imgRef.current) return null;
    
    const rect = imgRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e && (e as TouchEvent).touches?.length > 0) {
      clientX = (e as TouchEvent).touches[0].clientX;
      clientY = (e as TouchEvent).touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    // Scale to image actual dimensions
    const scaleX = imgRef.current.naturalWidth / rect.width;
    const scaleY = imgRef.current.naturalHeight / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    return {
      image: {
        x: Math.max(0, Math.min(x, imgRef.current.naturalWidth)),
        y: Math.max(0, Math.min(y, imgRef.current.naturalHeight))
      },
      screen: {
        x: clientX - rect.left,
        y: clientY - rect.top
      }
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    setStartPos(coords.image);
    const initialRect = { x: coords.image.x, y: coords.image.y, x1: coords.image.x, y1: coords.image.y };
    setCurrentSelection(initialRect);
    onSelectionChange(initialRect);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCoordinates(e);
    if (!coords) {
      onPosChange(null);
      setPointerPos(null);
      setCursorScreenPos(null);
      return;
    }

    onPosChange(coords.image);
    setPointerPos(coords.image);
    setCursorScreenPos(coords.screen);

    if (isDrawing && startPos) {
      const newSelection = {
        x: startPos.x,
        y: startPos.y,
        x1: coords.image.x,
        y1: coords.image.y
      };
      setCurrentSelection(newSelection);
      onSelectionChange(newSelection);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleMouseLeave = () => {
    onPosChange(null);
    setPointerPos(null);
    setCursorScreenPos(null);
    if (isDrawing) setIsDrawing(false);
  };

  const getVisualRect = () => {
    if (!currentSelection) return null;
    return {
      left: Math.min(currentSelection.x, currentSelection.x1),
      top: Math.min(currentSelection.y, currentSelection.y1),
      right: Math.max(currentSelection.x, currentSelection.x1),
      bottom: Math.max(currentSelection.y, currentSelection.y1),
      width: Math.abs(currentSelection.x1 - currentSelection.x),
      height: Math.abs(currentSelection.y1 - currentSelection.y)
    };
  };

  const boxStyle = React.useMemo(() => {
    const vRect = getVisualRect();
    if (!vRect || !imgRef.current) return { display: 'none' };
    
    const w = imgRef.current.naturalWidth;
    const h = imgRef.current.naturalHeight;

    return {
      left: `${(vRect.left / w) * 100}%`,
      top: `${(vRect.top / h) * 100}%`,
      width: `${(vRect.width / w) * 100}%`,
      height: `${(vRect.height / h) * 100}%`,
      display: 'block'
    };
  }, [currentSelection, image]);

  if (!image) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center border-4 border-dashed border-slate-700 rounded-2xl bg-slate-800/20 text-slate-500">
        <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-bold">Upload an image to start analysis</p>
        <p className="text-sm font-medium">Drag to select a precision region</p>
      </div>
    );
  }

  const vRect = getVisualRect();

  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl bg-black shadow-2xl group cursor-none border-2 border-slate-800"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <img 
        ref={imgRef}
        src={image.url} 
        alt="Analysis target"
        className="w-full h-auto block select-none pointer-events-none"
      />
      
      {/* Selection Box Overlay */}
      {vRect && (
        <div 
          className="absolute border-[1px] border-red-500 bg-red-600/10 pointer-events-none z-10"
          style={boxStyle}
        >
          {/* Handles (Minimal and subtle) */}
          <div className="absolute -top-[3px] -left-[3px] w-1.5 h-1.5 bg-red-600 rounded-full border border-white"></div>
          <div className="absolute -top-[3px] -right-[3px] w-1.5 h-1.5 bg-red-600 rounded-full border border-white"></div>
          <div className="absolute -bottom-[3px] -left-[3px] w-1.5 h-1.5 bg-red-600 rounded-full border border-white"></div>
          <div className="absolute -bottom-[3px] -right-[3px] w-1.5 h-1.5 bg-red-600 rounded-full border border-white"></div>

          {/* Coordinate Labels */}
          <div 
            className={`absolute bg-slate-900/90 border border-red-500 text-white px-1.5 py-0.5 rounded text-[9px] font-black mono whitespace-nowrap shadow-xl z-20 ${
              (vRect.top / image.height) < 0.1 ? 'top-1.5' : '-top-8'
            } left-0`}
          >
            START: X{Math.round(vRect.left)} Y{Math.round(vRect.top)}
          </div>
          
          <div 
            className={`absolute bg-slate-900/90 border border-red-500 text-white px-1.5 py-0.5 rounded text-[9px] font-black mono whitespace-nowrap shadow-xl z-20 ${
              (vRect.bottom / image.height) > 0.9 ? 'bottom-1.5' : '-bottom-8'
            } right-0`}
          >
            END: X{Math.round(vRect.right)} Y{Math.round(vRect.bottom)}
          </div>
        </div>
      )}

      {/* Guide Lines during drag */}
      {startPos && isDrawing && (
        <div className="absolute inset-0 pointer-events-none z-0">
           <div 
             className="absolute border-l border-red-500/20 w-px h-full"
             style={{ left: `${(startPos.x / image.width) * 100}%` }}
           />
           <div 
             className="absolute border-t border-red-500/20 h-px w-full"
             style={{ top: `${(startPos.y / image.height) * 100}%` }}
           />
        </div>
      )}

      {/* Floating Pointer Info (Crosshair) */}
      {pointerPos && cursorScreenPos && (
        <div 
          className="absolute pointer-events-none z-50"
          style={{ 
            left: `${cursorScreenPos.x}px`, 
            top: `${cursorScreenPos.y}px`,
          }}
        >
          {/* Crosshair Cursor (Compact and precise) */}
          <div className="absolute -left-2 top-0 w-4 h-[1px] bg-red-500 shadow-sm shadow-black"></div>
          <div className="absolute left-0 -top-2 w-[1px] h-4 bg-red-500 shadow-sm shadow-black"></div>
          
          {/* Coordinate Tooltip */}
          <div className="absolute left-2.5 top-2.5 bg-red-600/90 text-white px-1.5 py-0.5 rounded shadow-xl border border-white font-black text-[11px] mono whitespace-nowrap">
            {Math.round(pointerPos.x)}, {Math.round(pointerPos.y)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCanvas;
