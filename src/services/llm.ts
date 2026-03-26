import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

export async function invokeLLM(messages: Message[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const model = ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    })),
    config: {
      systemInstruction: "You are a Custom Chatbot integrated into the Builderplex application. You have access to project assets, including ISO files. Your goal is to help the user build and manage their application. You are knowledgeable, professional, and efficient. Do not mention your underlying model or provider unless asked. Focus on the project at hand."
    }
  });

  const response = await model;
  return response.text || "I'm sorry, I couldn't process that.";
}
