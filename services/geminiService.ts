import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuizQuestion, Recommendation, GeneratedRoadmap, ResearchResult } from "../types";

// Initialize Gemini
// NOTE: Ideally this comes from process.env, but per instructions we use it directly if available or assume pre-configured.
// Since the prompt forbids asking user for key in UI, we rely on process.env.API_KEY
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const geminiService = {
  // 1. AI Tutor Chat
  chat: async (history: { role: 'user' | 'model', text: string }[], message: string) => {
    try {
      const model = 'gemini-2.5-flash';
      const contents = history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }));
      // Add current message
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
            systemInstruction: "You are a helpful and knowledgeable AI Tutor for students. Keep answers concise, encouraging, and educational.",
        }
      });
      
      return response.text;
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      return "I'm having trouble connecting right now. Please check your API key.";
    }
  },

  // 2. Generate Quiz
  generateQuiz: async (topic: string): Promise<QuizQuestion[]> => {
    try {
        const schema: Schema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.STRING, description: "Must be exactly one of the strings in options" },
                    explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctAnswer", "explanation"]
            }
        };

        const prompt = `Generate a 5-question multiple choice quiz about "${topic}". 
        Ensure the 'correctAnswer' matches exactly one of the strings in the 'options' array. 
        Provide a brief explanation for the correct answer.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as QuizQuestion[];
        }
        throw new Error("No data returned");
    } catch (error) {
        console.error("Gemini Quiz Error:", error);
        return [];
    }
  },

  // 3. Get Recommendations
  getRecommendations: async (jobGoal: string, level: string, resourceType: string): Promise<Recommendation[]> => {
      try {
        const schema: Schema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    platform: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ["Course", "Certification"] },
                    difficulty: { type: Type.STRING },
                    description: { type: Type.STRING },
                    link: { type: Type.STRING, description: "A valid URL to the specific course or certification page." }
                },
                required: ["title", "platform", "type", "difficulty", "description", "link"]
            }
        };

        const prompt = `Suggest 3 top-rated ${resourceType === 'All Resources' ? 'courses or certifications' : resourceType} 
        for a user who wants to become a "${jobGoal}" and is currently at a "${level}" level.
        Provide the real URL link to the course page (e.g., on Coursera, Udemy, edX, or the official certification site).`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as Recommendation[];
        }
        throw new Error("No data returned");
      } catch (error) {
          console.error("Gemini Recs Error:", error);
          return [];
      }
  },

  // 4. Generate Career Roadmap
  generateRoadmap: async (role: string): Promise<GeneratedRoadmap | null> => {
    try {
        const schema: Schema = {
            type: Type.OBJECT,
            properties: {
                role: { type: Type.STRING },
                description: { type: Type.STRING },
                steps: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            phaseName: { type: Type.STRING },
                            description: { type: Type.STRING },
                            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                            duration: { type: Type.STRING }
                        },
                        required: ["phaseName", "description", "skills", "duration"]
                    }
                }
            },
            required: ["role", "description", "steps"]
        };

        const prompt = `Create a detailed career roadmap for the role of "${role}". 
        Break it down into 4-6 logical learning phases (e.g., Foundations, Advanced Concepts, Projects). 
        For each phase, list key skills to learn and an estimated duration.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as GeneratedRoadmap;
        }
        return null;
    } catch (error) {
        console.error("Gemini Roadmap Error:", error);
        return null;
    }
  },

  // 5. Research Assistant
  findResearch: async (query: string): Promise<ResearchResult[]> => {
    try {
      const schema: Schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["Paper", "Book", "Journal", "Article", "Thesis"] },
            authors: { type: Type.ARRAY, items: { type: Type.STRING } },
            year: { type: Type.STRING },
            publication: { type: Type.STRING },
            summary: { type: Type.STRING },
            link: { type: Type.STRING }
          },
          required: ["id", "title", "type", "authors", "year", "publication", "summary", "link"]
        }
      };

      const prompt = `Act as an academic research assistant. Find 5-7 distinct research resources related to the topic: "${query}".
      Include a mix of Research Papers, Books, Journal Articles, and Thesis work if applicable.
      For the 'link' field, provide a Google Scholar search URL for that specific title.
      Ensure the summary is concise and academic.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema
        }
      });

      if (response.text) {
        return JSON.parse(response.text) as ResearchResult[];
      }
      return [];
    } catch (error) {
      console.error("Gemini Research Error:", error);
      return [];
    }
  }
};
