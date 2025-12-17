export enum DeckType {
  ATTACHED = 'Attached Deck',
  DETACHED = 'Detached Deck',
  MULTI_LEVEL = 'Multi-Level Deck',
  WRAP_AROUND = 'Wrap-Around Deck',
  POOL = 'Pool Deck',
  ROOFTOP = 'Rooftop Deck',
}

export enum MaterialType {
  PRESSURE_TREATED = 'Natural Wood - Pressure Treated',
  CEDAR = 'Natural Wood - Cedar',
  REDWOOD = 'Natural Wood - Redwood',
  IPE = 'Natural Wood - Ipe',
  COMPOSITE = 'Composite Boards',
  PVC = 'Polyvinyl Chloride (PVC)',
  ALUMINUM = 'Aluminum',
}

export interface DeckSpecs {
  length: number;
  width: number;
  height: number;
  zipCode: string;
  address?: string; // Optional for more precise maps grounding
  function: string;
  expansion: string;
  environment: string;
  type: DeckType;
  material: MaterialType;
  railingMatch: boolean;
}

export interface BomItem {
  category: 'Framing' | 'Decking' | 'Hardware' | 'Waterproofing';
  item: string;
  quantity: string;
  notes?: string;
}

export interface ToolCategory {
  category: string;
  tools: string[];
}

export interface BuildStep {
  stepNumber: number;
  title: string;
  description: string;
  timeEstimate: string;
}

export interface BreakdownItem {
  item: string;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
}

export interface CostEstimate {
  materialTotal: string;
  laborTotal: string;
  permitFees: string;
  contingency: string;
  breakdown: BreakdownItem[];
  sources: { title: string; uri: string }[];
}

export interface PlanData {
  bom: BomItem[];
  tools: ToolCategory[];
  steps: BuildStep[];
}
