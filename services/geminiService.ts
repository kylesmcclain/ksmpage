import { GoogleGenAI } from "@google/genai";
import { KYLE_BIO, EXPERIENCES, PROJECTS } from "../constants";

// Initialize the client ONLY if key exists. 
// In a real app, we'd handle the missing key UI gracefully. 
// For this demo, we assume process.env.API_KEY is available or we handle the error.
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const queryKyleAssistant = async (query: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    return "I'm currently offline (API Key missing). Please configure the environment to chat with System AI.";
  }

  const context = `
    You are an AI assistant embedded in the portfolio website of Kyle McClain, a Systems Administrator and DevOps Engineer.
    Use the following context about Kyle to answer the user's question. Be professional but concise, like a terminal output or a helpful sysadmin.
    
    Bio: ${KYLE_BIO}
    
    Experience:
    ${JSON.stringify(EXPERIENCES)}
    
    Projects:
    ${JSON.stringify(PROJECTS)}
    
    User Query: ${query}
    
    Answer in plain text, no markdown formatting if possible, keep it under 100 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: context,
    });
    return response.text || "No data received from neural link.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Connection refused. The neural link encountered an error processing your request.";
  }
};