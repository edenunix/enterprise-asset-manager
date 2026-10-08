import { GoogleGenAI } from '@google/genai';

// Initialisez le client Gemini avec la clé sécurisée depuis Vercel
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  // Récupérez la question de l'utilisateur depuis le frontend
  const { requeteUtilisateur } = await request.json();

  // Choisissez un modèle (Flash est rapide et efficace pour ce type de tâche)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Créez une consigne (prompt) pour demander à l'IA de filtrer vos actifs
  // Remplacez "VOTRE_LISTE_D_ACTIFS" par une structure de données réelle de votre application
  const prompt = `
    Vous êtes un assistant pour la gestion d'actifs d'entreprise.
    Voici la liste de mes actifs actuels (format JSON) :
    [{"id": 1, "nom": "MacBook Pro", "etat": "Excellent", "emplacement": "Bureaux Paris", "service": "Comptabilité"},
     {"id": 2, "nom": "Imprimante HP", "etat": "En réparation", "emplacement": "Usine Lyon", "service": "Production"},
     {"id": 3, "nom": "Dell XPS", "etat": "Bon", "emplacement": "Bureaux Paris", "service": "Marketing"}]
    
    L'utilisateur a demandé : "${requeteUtilisateur}"
    
    Analysez la demande et répondez UNIQUEMENT avec une liste filtrée au format JSON des actifs qui correspondent à la demande de l'utilisateur, en expliquant brièvement votre raisonnement.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const texteAI = response.text();

    // Renvoyez la réponse de l'IA au frontend
    return Response.json({ result: texteAI });
  } catch (error) {
    return Response.json({ error: "Erreur lors de l'appel à l'IA" }, { status: 500 });
  }
}