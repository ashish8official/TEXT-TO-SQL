
import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { Schema, Dialect } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
  explanation?: string;
  suggestions?: string[];
  reasoning?: string[];
}

export function createSqlChat(schema: Schema, dialect: Dialect): Chat {
  const schemaContext = JSON.stringify(schema, null, 2);
  
  const systemInstruction = `
    You are the SQL Neural Engine, a specialized AI for high-performance data engineering.
    
    SCHEMA:
    ${schemaContext}
    
    DIALECT: ${dialect}

    TASK:
    1. Analyze the user's intent.
    2. Map natural language to the provided schema.
    3. Generate optimized, syntactically perfect SQL.
    4. provide a "reasoning" array of steps showing your chain of thought (e.g. "Step 1: Identified 'revenue' as SUM(amount)...").

    RESPONSE FORMAT:
    You MUST return JSON:
    {
      "sql": "...",
      "explanation": "Brief overview of what the query does.",
      "reasoning": ["Step 1...", "Step 2..."],
      "suggestions": ["Optional follow up 1", "Optional follow up 2"]
    }
  `;

  return ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: 'Initializing...',
    config: { systemInstruction }
  }).then(() => {
    return ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sql: { type: Type.STRING },
            explanation: { type: Type.STRING },
            reasoning: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["sql", "explanation", "reasoning"]
        }
      }
    });
  });
}

export async function sendChatMessage(chatPromise: Promise<Chat> | Chat, message: string) {
  try {
    const chat = await chatPromise;
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Neural Engine failed to parse intent. Please refine your prompt.");
  }
}
