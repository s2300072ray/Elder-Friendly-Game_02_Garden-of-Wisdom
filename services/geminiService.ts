
import { GoogleGenAI } from "@google/genai";
import { FeedbackData } from "../types";

// Safety Check:
// We only initialize the client if the key exists to prevent errors.
// In a real production environment, ensure you have set up HTTP Referrer restrictions
// in the Google Cloud Console to prevent unauthorized usage of your key.

const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey: apiKey }) : null;

// Fallback messages to ensure the game works 100% offline or if the API quota is exceeded.
const FALLBACK_MESSAGES = {
  success: [
    "Wonderful job! You are doing great.",
    "Your garden is blooming beautifully.",
    "Excellent focus and patience today.",
    "You have a gentle touch with nature."
  ],
  retry: [
    "That was a good try. Let's try again gently.",
    "Take your time, there is no rush.",
    "Nature grows at its own pace, and so do we.",
    "Every attempt helps your garden grow."
  ],
  facts: [
    "Did you know? Sunflowers track the sun across the sky!",
    "Earthworms are the heroes of healthy soil.",
    "Trees communicate with each other through their roots.",
    "Gardening can lower stress and improve mood.",
    "Bees dance to tell others where flowers are."
  ]
};

const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export const getEncouragement = async (gameName: string, score: number, success: boolean): Promise<FeedbackData> => {
  // 1. COST SAVING & SAFETY: 
  // If no API Key is provided, immediately return local data. 
  // This ensures zero cost and zero crashes for public demos.
  if (!ai || !apiKey) {
    console.log("Running in offline mode (No API Key found).");
    return {
      message: success ? getRandom(FALLBACK_MESSAGES.success) : getRandom(FALLBACK_MESSAGES.retry),
      isPositive: success,
      fact: getRandom(FALLBACK_MESSAGES.facts)
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
    // 2. ROBUSTNESS:
    // If the API call fails (network error, quota exceeded, invalid key),
    // we silently fall back to local messages so the user experience is never interrupted.
    console.warn("Gemini API skipped or failed, using offline fallback.", error);
    
    return {
      message: success ? getRandom(FALLBACK_MESSAGES.success) : getRandom(FALLBACK_MESSAGES.retry),
      isPositive: success,
      fact: getRandom(FALLBACK_MESSAGES.facts)
    };
  }
};
