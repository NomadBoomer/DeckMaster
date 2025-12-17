import { GoogleGenAI, Type } from "@google/genai";
import { DeckSpecs, PlanData, CostEstimate } from "../types";

// Helper to get client with current key
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// 1. Generate Static Plan (BOM, Tools, Steps)
export const generateDeckPlan = async (specs: DeckSpecs): Promise<PlanData> => {
  const ai = getAiClient();
  const prompt = `
    Act as a professional US-based deck builder and architect.
    Create a detailed construction plan for a residential deck with the following specifications:
    - Type: ${specs.type}
    - Material: ${specs.material}
    - Dimensions: ${specs.length}ft x ${specs.width}ft, ${specs.height}ft off grade.
    - Location Context (Climate): ${specs.environment}
    - Function: ${specs.function}
    - Expansion Plans: ${specs.expansion}
    - Railing: ${specs.railingMatch ? 'Matching material' : 'Standard'}

    Output a JSON object with strictly this schema:
    {
      "bom": [ { "category": "Framing" | "Decking" | "Hardware" | "Waterproofing", "item": "string", "quantity": "string", "notes": "string" } ],
      "tools": [ { "category": "string", "tools": ["string"] } ],
      "steps": [ { "stepNumber": number, "title": "string", "description": "detailed string", "timeEstimate": "string" } ]
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bom: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING, enum: ['Framing', 'Decking', 'Hardware', 'Waterproofing'] },
                item: { type: Type.STRING },
                quantity: { type: Type.STRING },
                notes: { type: Type.STRING },
              }
            }
          },
          tools: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                tools: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stepNumber: { type: Type.NUMBER },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                timeEstimate: { type: Type.STRING },
              }
            }
          }
        }
      }
    }
  });

  if (!response.text) throw new Error("Failed to generate plan");
  return JSON.parse(response.text) as PlanData;
};

// 2. Real-Time Cost Estimation (Search & Maps)
export const estimateDeckCost = async (specs: DeckSpecs, bomSummary: string): Promise<CostEstimate> => {
  const ai = getAiClient();
  const prompt = `
    I need a current, real-time cost estimate for building a deck in ${specs.zipCode} (${specs.address || 'USA'}).
    Deck Specs: ${specs.length}x${specs.width}ft, ${specs.material}.
    
    Based on these materials:
    ${bomSummary}

    Tasks:
    1. Use Google Search to find current retail prices for ${specs.material} and pressure-treated lumber in/near ${specs.zipCode}.
    2. Use Google Maps to verify local suppliers if possible.
    3. Estimate local labor rates for deck building per sq ft.
    4. Find typical building permit fees for this region.

    Return a valid JSON string (and only the JSON string) matching this structure. Do not include markdown formatting:
    {
      "materialTotal": "string (e.g. $2,500 - $3,000)",
      "laborTotal": "string",
      "permitFees": "string",
      "contingency": "string (15% recommended)",
      "breakdown": [
         { "item": "string (e.g. 2x6x12 Pressure Treated)", "quantity": "string", "unitPrice": "string (e.g. $12.50 / board)", "totalPrice": "string (e.g. $250.00)" }
      ]
    }
  `;

  // Note: responseMimeType and responseSchema are NOT supported when using tools like googleSearch/googleMaps.
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }, { googleMaps: {} }],
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(c => c.web?.uri)
    .map(c => ({ title: c.web?.title || 'Source', uri: c.web?.uri || '#' })) || [];

  // Maps chunks
  const mapSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(c => c.maps?.uri)
    .map(c => ({ title: c.maps?.title || 'Map Location', uri: c.maps?.uri || '#' })) || [];

  const allSources = [...sources, ...mapSources];

  if (!response.text) throw new Error("Failed to estimate costs");
  
  // Clean the response text to extract JSON
  let cleanText = response.text.trim();
  // Remove markdown code blocks if present
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```json\s?/, '').replace(/^```\s?/, '').replace(/```$/, '');
  }

  let data: any;
  try {
    data = JSON.parse(cleanText);
  } catch (e) {
    console.warn("Failed to parse cost estimate JSON, falling back to empty", e);
    data = {
      materialTotal: "N/A",
      laborTotal: "N/A",
      permitFees: "N/A",
      contingency: "N/A",
      breakdown: []
    };
  }
  
  return { 
    materialTotal: data.materialTotal || "N/A",
    laborTotal: data.laborTotal || "N/A",
    permitFees: data.permitFees || "N/A",
    contingency: data.contingency || "N/A",
    breakdown: Array.isArray(data.breakdown) ? data.breakdown : [],
    sources: allSources 
  };
};

// 3. Chat Assistant
export const chatWithAssistant = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  const ai = getAiClient();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are an expert Deck Building AI Assistant. Help the user with technical questions about codes, materials, structural loads, and tools. Keep answers concise and helpful.",
    },
    history: history as any,
  });

  const result = await chat.sendMessage({ message });
  return result.text;
};

// 4. Image Generation (Visualization)
export const generateStepImage = async (stepDescription: string, deckType: string, material: string, size: string) => {
  const ai = getAiClient(); 
  
  // Updated prompt for better technical quality
  const prompt = `Professional architectural technical drawing, isometric view. ${stepDescription}. Construction detail of a ${size} ${deckType} made of ${material}. Blueprint style, black lines on white background, high contrast, precise engineering diagram.`;

  try {
      // Use gemini-2.5-flash-image (Nano Banana) for broader access and to avoid 403 errors.
      // This model does not support 'imageSize' in config, only aspectRatio.
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: prompt,
        config: {
            imageConfig: {
                aspectRatio: "16:9"
            }
        }
      });
    
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
  } catch (error) {
      console.error("Image generation failed", error);
      throw error;
  }
};
