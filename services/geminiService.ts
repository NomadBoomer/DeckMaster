
import { GoogleGenAI, Type } from "@google/genai";
import { DeckSpecs, PlanData, CostEstimate } from "../types";

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

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
    - Use Case: ${specs.function}

    You MUST generate:
    1. A complete Bill of Materials (BOM) categorized by Framing, Decking, Hardware, and Waterproofing.
    2. A list of required tools for a DIY enthusiast, including a brief "description" for each tool.
    3. A detailed Step-by-Step Execution Plan (5-8 major steps).

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
  return JSON.parse(response.text) as PlanData;
};

export const estimateDeckCost = async (specs: DeckSpecs, bomSummary: string): Promise<CostEstimate> => {
  const ai = getAiClient();
  const prompt = `
    I need a current, real-time cost estimate for a deck project in ${specs.zipCode}, USA.
    
    CRITICAL: YOU MUST PROVIDE A PRICING BREAKDOWN FOR EVERY SINGLE ITEM IN THIS LIST:
    ${bomSummary}

    Instructions:
    1. Use Google Search to find current retail prices for each item from Home Depot, Lowe's, and local lumber yards within 10 miles of ${specs.zipCode}.
    2. Use Google Maps to verify at least 3 local supplier locations (Home Depot, Lowe's, or local specialists) near ${specs.zipCode}.
    3. Do not summarize items. List every piece of hardware, framing, and decking individually in the JSON "breakdown".

    Return a valid JSON string (no markdown):
    {
      "materialTotal": "string (Total of all items)",
      "laborTotal": "string (Local pro rate estimate)",
      "permitFees": "string (Est. for this region)",
      "contingency": "string (15%)",
      "breakdown": [
         { "item": "string", "quantity": "string", "unitPrice": "string", "totalPrice": "string" }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', // Required for Google Maps tool
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }, { googleMaps: {} }],
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(c => c.web?.uri || c.maps?.uri)
    .map(c => ({ 
      title: c.web?.title || c.maps?.title || 'Location/Source', 
      uri: c.web?.uri || c.maps?.uri || '#' 
    })) || [];

  if (!response.text) throw new Error("Failed to estimate costs");
  
  let cleanText = response.text.trim();
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```json\s?/, '').replace(/^```\s?/, '').replace(/```$/, '');
  }

  let data: any;
  try {
    data = JSON.parse(cleanText);
  } catch (e) {
    data = { materialTotal: "Error", laborTotal: "Error", permitFees: "Error", contingency: "15%", breakdown: [] };
  }
  
  return { ...data, sources };
};

export const chatWithAssistant = async (history: any[], message: string) => {
  const ai = getAiClient();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are a professional Deck Building Expert. Use grounding to provide accurate code and material advice. IMPORTANT: Do NOT use markdown for formatting. You MUST use <b>text</b> for bold and <i>text</i> for italics.",
    },
    history,
  });
  const result = await chat.sendMessage({ message });
  return result.text;
};

export const generateStepImage = async (desc: string, type: string, context: string, size: string) => {
  const ai = getAiClient(); 
  const prompt = `Architectural technical drawing of ${desc} for a ${size} ${type}. High contrast black and white lines. ${context}. No people.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: prompt,
    config: { imageConfig: { aspectRatio: "16:9" } }
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : null;
};

export const generateDreamDeckImage = async (specs: DeckSpecs) => {
  const ai = getAiClient();
  const prompt = `High-end architectural photograph of a ${specs.material} ${specs.type}, ${specs.length}x${specs.width}ft. Golden hour lighting, luxury backyard setting.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: prompt,
    config: { imageConfig: { aspectRatio: "16:9" } }
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : null;
};
