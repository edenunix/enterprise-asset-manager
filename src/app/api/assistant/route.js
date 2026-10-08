import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    const { prompt, patrimoine } = await request.json();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `En tant qu'assistant de gestion d'actifs, analyse cette demande : "${prompt}" en te basant sur ce patrimoine : ${JSON.stringify(patrimoine)}`,
    });

    return Response.json({ result: response.text });
  } catch (error) {
    return Response.json({ error: "Erreur avec l'IA" }, { status: 500 });
  }
}