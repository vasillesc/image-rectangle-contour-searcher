
export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  x1: number;
  y1: number;
}

export interface AnalysisResult {
  summary: string;
  objects: string[];
  details: string;
}

export interface ImageData {
  url: string;
  base64: string;
  width: number;
  height: number;
}
