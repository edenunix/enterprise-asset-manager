import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { prompt, patrimoine } = await request.json();
    
    // Initialisation avec la clé d'environnement
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Utilisation d'un modèle stable et récent
    const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

    const result = await model.generateContent(
      `En tant qu'assistant de gestion d'actifs, analyse cette demande : "${prompt}" en te basant sur cet inventaire : ${JSON.stringify(patrimoine)}`
    );
    const response = await result.response;

    return Response.json({ result: response.text() });
  } catch (error) {
    return Response.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
