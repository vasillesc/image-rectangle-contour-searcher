
import React from 'react';
import { Point, Rect } from '../types';

interface CoordDisplayProps {
  currentPos: Point | null;
  selection: Rect | null;
}

const CoordDisplay: React.FC<CoordDisplayProps> = ({ currentPos, selection }) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-800/50 rounded-xl border-2 border-slate-700 backdrop-blur-sm">
      <div className="space-y-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Current Pointer</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-900 p-2 rounded border-2 border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold block">X</span>
            <span className="mono text-xl font-bold text-red-500">{currentPos ? Math.round(currentPos.x) : '--'}</span>
          </div>
          <div className="bg-slate-900 p-2 rounded border-2 border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold block">Y</span>
            <span className="mono text-xl font-bold text-red-500">{currentPos ? Math.round(currentPos.y) : '--'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Selection Box</h3>
          {selection && (
            <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30 font-bold">ACTIVE</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-900 p-2 rounded border-2 border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold block">X (Start)</span>
            <span className="mono text-lg font-bold text-red-400">{selection ? Math.round(selection.x) : '--'}</span>
          </div>
          <div className="bg-slate-900 p-2 rounded border-2 border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold block">Y (Start)</span>
            <span className="mono text-lg font-bold text-red-400">{selection ? Math.round(selection.y) : '--'}</span>
          </div>
          <div className="bg-slate-900 p-2 rounded border-2 border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold block">X (End)</span>
            <span className="mono text-lg font-bold text-red-400">{selection ? Math.round(selection.x1) : '--'}</span>
          </div>
          <div className="bg-slate-900 p-2 rounded border-2 border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold block">Y (End)</span>
            <span className="mono text-lg font-bold text-red-400">{selection ? Math.round(selection.y1) : '--'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordDisplay;
