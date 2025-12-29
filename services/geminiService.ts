
import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImageRegion = async (
  base64Image: string,
  rect?: { x: number; y: number; x1: number; y1: number }
): Promise<string> => {
  const prompt = rect 
    ? `Analyze the region bounded by (x: ${rect.x}, y: ${rect.y}) to (x1: ${rect.x1}, y1: ${rect.y1}) in the provided image. Describe what is inside this specific area in detail.`
    : "Analyze the provided image in detail. Describe the main subjects, colors, and overall composition.";

  const imagePart = {
    inlineData: {
      mimeType: 'image/png',
      data: base64Image.split(',')[1] || base64Image,
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, { text: prompt }] },
    });

    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error: Could not complete analysis. Check console for details.";
  }
};
