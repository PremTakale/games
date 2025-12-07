import { GoogleGenAI } from "@google/genai";
import { Difficulty, WeaponType } from "../types";

// Note: In a real app, ensure process.env.API_KEY is set. 
// For this demo, we handle the case gracefully if missing.

export const generateLevelLore = async (level: number, difficulty: Difficulty, unlockedWeapon: WeaponType | null): Promise<string> => {
  if (!process.env.API_KEY) {
    return `Mission Level ${level}: Elimination Protocol Initiated. Difficulty: ${difficulty}.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Write a short, immersive, 2-sentence "mission briefing" for a futuristic cyberpunk archery game.
      Level: ${level}
      Difficulty: ${difficulty}
      ${unlockedWeapon ? `The player just unlocked ${unlockedWeapon} arrows.` : ''}
      Tone: Serious, tactical, sci-fi.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || `Target verified. Level ${level} engaging.`;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `System Offline. Tactical uplink failed. engaging manual override for Level ${level}.`;
  }
};