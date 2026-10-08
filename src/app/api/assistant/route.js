import { GoogleGenAI } from '@google/genai';

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, patrimoine } = body;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `En tant qu'assistant de gestion d'actifs, analyse cette demande : "${prompt}" en te basant sur cet inventaire : ${JSON.stringify(patrimoine)}`,
    });

    return Response.json({ result: response.text });
  } catch (error) {
    return Response.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
