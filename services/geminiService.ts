import { GoogleGenAI } from "@google/genai";
import { Game } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateSystemInstruction = (games: Game[]) => {
  // Simplify game objects for token efficiency
  const catalog = games.slice(0, 50).map(g => ({ 
    title: g.title, 
    details: g.description.substring(0, 100) 
  }));

  return `
    You are "AIni", a knowledgeable AI assistant for a digital game store.
    Your goal is to help users find games they will love from our specific catalog.
    Be concise, friendly, and helpful.

    Here is a sample of our current catalog:
    ${JSON.stringify(catalog)}

    If a user asks about a game not in this list, politely inform them we don't carry it but suggest a similar one from our catalog if possible.
    Keep your responses relatively short (under 100 words).
  `;
};

export const chatWithGemini = async (history: {role: string, parts: {text: string}[]}[], message: string, games: Game[]) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: generateSystemInstruction(games),
      },
      history: history,
    });

    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having a bit of trouble connecting to the mainframe right now. Please try again later.";
  }
};

export const getGameRecommendation = async (userLibraryIds: string[], allGames: Game[]) => {
    const ownedGames = allGames.filter(g => userLibraryIds.includes(g.id));
    const ownedTitles = ownedGames.map(g => g.title).join(", ");
    
    const prompt = `
      The user owns the following games: ${ownedTitles || "None yet"}.
      Based on this (or if they have none, suggest a popular starter), recommend ONE game from our catalog that they don't own yet.
      Explain briefly why in 1 sentence.
      Format: "I recommend [Game Title]: [Reason]"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: generateSystemInstruction(allGames)
            }
        });
        return response.text;
    } catch (e) {
        return "Check out our featured section for great deals!";
    }
}