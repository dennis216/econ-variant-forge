export interface SolutionStep {
  stepNumber: number;
  description: string;
  formula: string;
  calculation: string;
  result: string;
}

export interface Solution {
  steps: SolutionStep[];
  finalAnswer: string;
}

export type VariantTier = "bronze" | "silver" | "gold";

export interface Variant {
  tier: VariantTier;
  title: string;
  question: string;
  changes: string[];
  solution: Solution;
}

export interface MasterAnalysis {
  subject: string;
  model: string;
  keyVariables: string[];
  formula: string;
}

export interface VariantResult {
  masterAnalysis: MasterAnalysis;
  variants: Variant[];
}

// Stage 1: Extracted data types
export interface ExtractedVariable {
  name: string;
  symbol: string;
  value: string;
  unit: string;
}

export interface ExtractedContext {
  subject: string;
  model: string;
  marketType: string;
  country: string;
}

export interface ExtractedData {
  context: ExtractedContext;
  variables: ExtractedVariable[];
  formula: string;
  questionText: string;
}

export const TIER_LABELS: Record<VariantTier, string> = {
  bronze: "Bronze — Surface Level",
  silver: "Silver — Contextual Shift",
  gold: "Gold — Structural Reversal",
};

export const TIER_DESCRIPTIONS: Record<VariantTier, string> = {
  bronze: "Variable & entity swaps with realistic constraints",
  silver: "Scenario change with directional policy shift",
  gold: "Inverse logic & model expansion",
};

export const EXAMPLE_QUESTIONS = [
  {
    label: "Keynesian Cross — Equilibrium GDP",
    text: `In a closed economy, the consumption function is C = 200 + 0.75Y, planned investment I = 150, and government spending G = 100. Calculate the equilibrium level of GDP using the Keynesian Cross model. Also determine the value of the government spending multiplier.`,
  },
  {
    label: "Supply & Demand — Market Equilibrium",
    text: `In the US agricultural market for wheat, the demand function is Qd = 500 - 4P and the supply function is Qs = -100 + 6P, where P is the price per bushel in dollars and Q is in thousands of bushels. Find the equilibrium price and quantity. If the government imposes a price floor of $70, what will be the resulting surplus?`,
  },
  {
    label: "IS-LM Model — Interest Rate",
    text: `Consider an economy described by the following equations: C = 100 + 0.8(Y - T), I = 200 - 10r, G = 150, T = 100, and the money market with Md/P = 0.5Y - 20r and Ms/P = 500. Derive the IS and LM curves, and find the equilibrium interest rate and output.`,
  },
];
