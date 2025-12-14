import { GoogleGenAI } from "@google/genai";
import { FeedbackData } from "../types";

// Initialize Gemini
// Note: In a real production app, this key should be proxied or handled securely.
// For this demo, we assume the environment variable is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getEncouragement = async (gameName: string, score: number, success: boolean): Promise<FeedbackData> => {
  if (!process.env.API_KEY) {
    return {
      message: success ? "Wonderful job! You are doing great." : "That was a good try. Let's try again gently.",
      isPositive: success,
      fact: "Did you know? Sunflowers track the sun across the sky!"
    };
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are a gentle, warm, and encouraging gardening companion for a senior citizen (age 65+).
      The user just played a mini-game called "${gameName}".
      They ${success ? 'won' : 'did not finish yet'}.
      Their score/progress was: ${score}.

      Please provide:
      1. A short, warm sentence of encouragement (maximum 15 words).
      2. A fun, simple one-sentence fact about flowers, gardening, or nature (maximum 20 words).

      Return the response in JSON format with keys: "message" and "fact".
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const parsed = JSON.parse(text);
    
    return {
      message: parsed.message,
      fact: parsed.fact,
      isPositive: success
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      message: success ? "Wonderful job! You are doing great." : "That was a good try. Take your time.",
      isPositive: success,
      fact: "Gardening is good for the soul."
    };
  }
};