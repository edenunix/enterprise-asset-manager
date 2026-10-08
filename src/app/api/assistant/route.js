import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { prompt, patrimoine } = await request.json();
    
    // Initialisation sécurisée avec la clé d'environnement Vercel
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Utilisation du modèle stable gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(
      `En tant qu'assistant de gestion d'actifs, analyse cette demande : "${prompt}" en te basant sur cet inventaire réel de l'entreprise : ${JSON.stringify(patrimoine)}. Réponds clairement et directement en français.`
    );
    
    const response = await result.response;

    return Response.json({ result: response.text() });
  } catch (error) {
    return Response.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
