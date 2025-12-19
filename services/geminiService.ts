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
    Act as a professional US-based Architectural and Construction Planning AI.
    Create a comprehensive construction plan for a residential deck named "${specs.projectName}".
    
    Specifications:
    - Type: ${specs.type}
    - Material: ${specs.material}
    - Dimensions: ${specs.length}ft (L) x ${specs.width}ft (W) x ${specs.height}ft (H above grade)
    - Location Context: ${specs.zipCode}
    - Environment: ${specs.environment}
    - Use Case: ${specs.function}
    - Expansion: ${specs.expansion}
    - Railing: ${specs.railingMatch ? 'Matching' : 'Standard'}

    You MUST generate:
    1. A complete Bill of Materials (BOM) categorized by Framing, Decking, Hardware, and Waterproofing.
    2. A list of required tools for a DIY enthusiast, including a brief "description" for each tool explaining its specific purpose for this deck.
    3. A detailed Step-by-Step Execution Plan (at least 5-8 major steps) including Preparation, Foundation, Framing, Decking, and Finishing.

    Output strictly valid JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
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
              },
              required: ['category', 'item', 'quantity']
            }
          },
          tools: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                tools: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ['name', 'description']
                  } 
                }
              },
              required: ['category', 'tools']
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
              },
              required: ['stepNumber', 'title', 'description', 'timeEstimate']
            }
          }
        },
        required: ['bom', 'tools', 'steps']
      }
    }
  });

  if (!response.text) throw new Error("Failed to generate plan");
  try {
    return JSON.parse(response.text) as PlanData;
  } catch (e) {
    console.error("JSON Parse error in generateDeckPlan", e);
    throw new Error("Invalid plan data received from AI");
  }
};

// 2. Real-Time Cost Estimation (Search & Maps)
export const estimateDeckCost = async (specs: DeckSpecs, bomSummary: string): Promise<CostEstimate> => {
  const ai = getAiClient();
  const prompt = `
    I need a current, real-time cost estimate for building a deck in zip code ${specs.zipCode}, USA.
    Deck Specs: ${specs.length}x${specs.width}ft, ${specs.material}.
    
    Below is the exact Bill of Materials (BOM) you must price. 
    CRITICAL: The "breakdown" in your JSON response MUST contain a price for EVERY SINGLE ITEM in this list. 
    DO NOT summarize them. List each one as a separate entry in the "breakdown" array.
    
    BOM to Price:
    ${bomSummary}
    
    CRITICAL: YOU MUST ONLY USE US-BASED DATA SOURCES. 
    - Search for retailers: Home Depot, Lowe's, Menards, or 84 Lumber near ${specs.zipCode}.
    - Search for building codes and permit fees for the city or county associated with zip code ${specs.zipCode}.
    - DO NOT include international sources. Avoid sources like "Lotus's Bangkapi" or "Ace H and B" outside of the US.

    Return a valid JSON string matching this structure:
    {
      "materialTotal": "string (e.g. $2500)",
      "laborTotal": "string",
      "permitFees": "string",
      "contingency": "string (15%)",
      "breakdown": [
         { "item": "string", "quantity": "string", "unitPrice": "string", "totalPrice": "string" }
      ]
    }
  `;

  // MUST use gemini-2.5-flash for googleMaps tool support
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }, { googleMaps: {} }],
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(c => c.web?.uri && !c.web.uri.includes('.th') && !c.web.uri.includes('.uk') && !c.web.uri.includes('.au'))
    .map(c => ({ title: c.web?.title || 'Source', uri: c.web?.uri || '#' })) || [];

  const mapSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(c => c.maps?.uri)
    .map(c => ({ title: c.maps?.title || 'Map Location', uri: c.maps?.uri || '#' })) || [];

  const allSources = [...sources, ...mapSources];

  if (!response.text) throw new Error("Failed to estimate costs");
  
  let cleanText = response.text.trim();
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```json\s?/, '').replace(/^```\s?/, '').replace(/```$/, '');
  }

  let data: any;
  try {
    data = JSON.parse(cleanText);
  } catch (e) {
    console.warn("Failed to parse cost estimate JSON", e);
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

// 4. Image Generation (Visualization - refined technical drawing style)
export const generateStepImage = async (stepDescription: string, deckType: string, material: string, size: string) => {
  const ai = getAiClient(); 
  const prompt = `Isometric view, technical drawing style of a construction detail. Step: ${stepDescription}. Professional architectural blueprint style for a ${size} ${deckType} built with ${material}. Clean black lines on solid white background, high contrast, precise engineering diagram, professional carpentry illustration. No people.`;

  try {
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

// 5. Dream Deck Generation (Ultra-realistic)
export const generateDreamDeckImage = async (specs: DeckSpecs) => {
  const ai = getAiClient();
  const prompt = `Ultra-realistic high-angle overhead photograph of a young couple lounging on a beautiful, modern ${specs.material} ${specs.type}. They are sitting in comfortable outdoor furniture. Professional architectural photography, Cinematic golden hour lighting, 8k resolution, lifestyle magazine aesthetic, lush green landscaping in the background, high detail, sharp focus.`;

  try {
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
      console.error("Dream deck generation failed", error);
      throw error;
  }
};