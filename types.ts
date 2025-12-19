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
  projectName: string;
  length: number;
  width: number;
  height: number;
  zipCode: string;
  address?: string;
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

export interface ToolItem {
  name: string;
  description: string;
}

export interface ToolCategory {
  category: string;
  tools: ToolItem[];
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
