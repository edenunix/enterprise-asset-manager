export async function POST(request) {
  try {
    const { prompt, patrimoine } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json({ error: "La clé GEMINI_API_KEY est manquante sur Vercel." }, { status: 500 });
    }

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const apiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `En tant qu'assistant de gestion d'actifs, analyse cette demande : "${prompt}" en te basant sur cet inventaire : ${JSON.stringify(patrimoine)}. Réponds directement en français.`
              }
            ]
          }
        ]
      })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      throw new Error(data.error?.message || "Erreur de l'API Gemini");
    }

    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text || "Aucune réponse générée.";

    return Response.json({ result: textResult });
  } catch (error) {
    return Response.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
