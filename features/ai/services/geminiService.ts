import { GoogleGenAI } from "@google/genai";

// Safely access process.env to avoid ReferenceError in browser environments
const API_KEY = (typeof process !== 'undefined' && process.env && process.env.API_KEY) || ''; 

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateBusinessAdvice = async (query: string, context: string): Promise<string> => {
  if (!API_KEY) return "AI Key belum dikonfigurasi. Hubungi admin SIBOS.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Kamu adalah asisten bisnis cerdas di aplikasi SIBOS.
      Konteks Bisnis Saat Ini: ${context}.
      Pertanyaan User: ${query}.
      Jawablah dengan singkat, padat, profesional namun santai dalam Bahasa Indonesia.`,
    });

    return response.text || "Maaf, saya sedang berpikir keras tapi tidak menemukan jawaban.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terjadi kesalahan pada sistem AI SIBOS. Coba lagi nanti.";
  }
};
