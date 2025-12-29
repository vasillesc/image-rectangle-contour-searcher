
import React, { useState, useCallback } from 'react';
import ImageCanvas from './components/ImageCanvas';
import CoordDisplay from './components/CoordDisplay';
import { analyzeImageRegion } from './services/geminiService';
import { Point, Rect, ImageData } from './types';

const App: React.FC = () => {
  const [image, setImage] = useState<ImageData | null>(null);
  const [currentPos, setCurrentPos] = useState<Point | null>(null);
  const [selection, setSelection] = useState<Rect | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setImage({
          url,
          base64: url,
          width: img.naturalWidth,
          height: img.naturalHeight
        });
        setSelection(null);
        setAnalysis(null);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const runAnalysis = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await analyzeImageRegion(image.base64, selection || undefined);
      setAnalysis(result);
    } catch (err) {
      setAnalysis("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div 
      className={`min-h-screen bg-slate-950 flex flex-col transition-colors duration-300 ${isDragging ? 'bg-slate-900' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center bg-red-500/10 backdrop-blur-sm border-8 border-dashed border-red-600 m-4 rounded-3xl">
          <div className="bg-slate-900 px-8 py-6 rounded-2xl shadow-2xl border-2 border-red-500 text-center scale-110 transition-transform">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <h2 className="text-2xl font-black text-white">Drop to Upload</h2>
            <p className="text-slate-400 font-medium">Release to start analyzing the image</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b-2 border-slate-800 bg-slate-900/50 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-red-400 bg-clip-text text-transparent">
              Image Precision Analyzer
            </h1>
          </div>
          
          <label className="flex items-center gap-2 px-5 py-2.5 bg-red-700 hover:bg-red-600 text-white rounded-lg font-bold shadow-lg shadow-red-950/20 transition-all cursor-pointer text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Image
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <ImageCanvas 
            image={image}
            onPosChange={setCurrentPos}
            onSelectionChange={setSelection}
          />
          
          {analysis && (
            <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h2 className="text-sm font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Precision Analysis
              </h2>
              <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed font-medium">
                {analysis.split('\n').map((para, i) => para ? <p key={i} className="mb-4 last:mb-0">{para}</p> : <br key={i} />)}
              </div>
            </div>
          )}
        </div>

        {/* Right: Controls and Info */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <CoordDisplay 
            currentPos={currentPos}
            selection={selection}
          />

          <div className="bg-slate-900 border-2 border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">Tools & Actions</h3>
            
            <button
              onClick={runAnalysis}
              disabled={!image || isAnalyzing}
              className={`w-full py-4 px-4 rounded-lg font-black flex items-center justify-center gap-2 transition-all uppercase tracking-tighter ${
                !image || isAnalyzing 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-2 border-slate-700'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-900/40 border-2 border-red-400'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Analyze {selection ? 'Selection' : 'Whole Image'}
                </>
              )}
            </button>

            {image && (
              <div className="pt-2">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Image Metadata</div>
                <div className="bg-slate-950/50 p-3 rounded-lg border-2 border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-bold">Dimensions</span>
                  <span className="mono text-xs text-red-400 font-black">{image.width} × {image.height} px</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-red-900/10 border-2 border-red-500/20 rounded-xl p-5 shadow-lg">
            <h3 className="text-xs font-black uppercase text-red-500 mb-2 tracking-widest">Instructions</h3>
            <ul className="text-xs text-slate-300 space-y-2 font-medium">
              <li className="flex gap-2">
                <span className="text-red-500 font-black">•</span>
                Drag and drop or upload an image.
              </li>
              <li className="flex gap-2">
                <span className="text-red-500 font-black">•</span>
                Hover for real-time red-point coordinates.
              </li>
              <li className="flex gap-2">
                <span className="text-red-500 font-black">•</span>
                Drag to select regions with the red box.
              </li>
              <li className="flex gap-2">
                <span className="text-red-500 font-black">•</span>
                Click analyze for AI insights on the selection.
              </li>
            </ul>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-slate-800 p-6 bg-slate-900/30 text-center text-slate-500 text-sm font-bold">
        &copy; {new Date().getFullYear()} Image Precision Analyzer &bull; Red-Line Edition &bull; Gemini 3 Flash
      </footer>
    </div>
  );
};

export default App;
