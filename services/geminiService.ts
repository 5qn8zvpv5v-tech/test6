import { GoogleGenAI, Modality } from "@google/genai";

// IMPORTANT: In a real deployment, always proxy API calls securely.
// For this demo, we assume process.env.API_KEY is available.

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    if (!process.env.API_KEY) throw new Error("API Key missing");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' }, // 'Puck' is a nice clear voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

export const getTutorResponse = async (history: {role: 'user' | 'model', text: string}[], message: string): Promise<string> => {
  try {
    if (!process.env.API_KEY) return "Please configure your API Key to use the AI Tutor.";

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
      config: {
        systemInstruction: "You are a helpful, encouraging Thai language teacher for beginners. Keep answers concise, use emojis, and focus on explaining pronunciation, tones, and usage of Thai characters. Explain things simply."
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "Sorry, I couldn't understand that.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Sorry, I am having trouble connecting to the classroom right now.";
  }
};
