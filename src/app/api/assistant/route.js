import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { prompt, patrimoine } = await request.json();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(
      `En tant qu'assistant de gestion d'actifs, analyse cette demande : "${prompt}" en te basant sur cet inventaire : ${JSON.stringify(patrimoine)}`
    );
    const response = await result.response;

    return Response.json({ result: response.text() });
  } catch (error) {
    // Renvoie l'erreur exacte pour comprendre d'où elle vient
    return Response.json({ result: "Erreur technique : " + error.message }, { status: 500 });
  }
}
