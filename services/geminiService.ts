import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Question } from "../types";

// Helper to ensure API Key exists
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

// Generate personalized lesson content using high thinking budget
export const generateLessonContent = async (
  user: UserProfile,
  topic: string,
  levelTitle: string
): Promise<string> => {
  const ai = getClient();
  
  const prompt = `
    You are an expert AI Professor with a PhD-level understanding of Artificial Intelligence, capable of explaining the most complex topics to absolute beginners without losing technical depth.
    
    Student Profile:
    - Profession: ${user.profession}
    - Background: ${user.background}
    - Qualification: ${user.qualification}
    - Nationality: ${user.nationality}
    
    Task:
    Create a detailed, crystal-clear, and engaging educational lesson about "${topic}" (from the module "${levelTitle}").
    
    Requirements:
    1. EXTREME DEPTH & CLARITY: Explain concepts from first principles. Do not dumb it down, but explain it simply. Use "Feynman Technique".
    2. ANALOGIES: Use analogies related to their profession (${user.profession}) or background (${user.background}).
    3. STRUCTURE:
       - Introduction: Hook the learner.
       - Core Concept: The "What" and "How".
       - Technical Deep Dive: The "Why" (e.g., weights, biases, attention heads) explained visually in text.
       - Real World Application: How this affects ${user.nationality} or their field.
    4. TONE: Encouraging, authoritative, premium, and friendly.
    5. FORMAT: Clear Markdown headings, bullet points, and bold text.
    
    The goal is for the user to understand this better than a standard textbook.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // Maximum thinking for deep synthesis
      },
    });

    return response.text || "Failed to generate lesson content.";
  } catch (error) {
    console.error("Error generating lesson:", error);
    return `Error generating content: ${(error as Error).message}. Please try again.`;
  }
};

// Generate exam questions
export const generateExamQuestions = async (): Promise<Question[]> => {
  const ai = getClient();

  const prompt = `
    Generate a final exam for an AI Mastery course covering: Neural Networks, Transformers, GPT, Gemini, Grok, and Generative Media.
    
    Requirements:
    1. Create exactly 20 multiple-choice questions.
    2. Questions should test DEEP understanding, not just memorization. Test reasoning capabilities.
    3. Vary the difficulty: 5 Easy, 10 Medium, 5 Hard (PhD concept level simplified).
    4. Return the response as a JSON array of objects.
    
    Schema:
    Array of {
      id: number,
      questionText: string,
      options: string[] (4 options),
      correctAnswerIndex: number (0-3)
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // Increased to max for better question quality
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              questionText: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswerIndex: { type: Type.INTEGER }
            },
            required: ["id", "questionText", "options", "correctAnswerIndex"]
          }
        }
      },
    });

    const jsonStr = response.text || "[]";
    return JSON.parse(jsonStr) as Question[];
  } catch (error) {
    console.error("Error generating exam:", error);
    throw error;
  }
};