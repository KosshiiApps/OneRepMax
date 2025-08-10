// 1RM calculation formulas and utilities

export type Unit = 'kg' | 'lb';
export type Formula = 'epley' | 'brzycki' | 'lombardi';

export interface CalculationResult {
  epley: number;
  brzycki: number;
  lombardi: number;
  best: number;
}

// Conversion constant: 1 kg = 2.20462262185 lb
const KG_TO_LB = 2.20462262185;
const LB_TO_KG = 1 / KG_TO_LB;

/**
 * Convert weight between kg and lb
 */
export function convertWeight(weight: number, from: Unit, to: Unit): number {
  if (from === to) return weight;
  if (from === 'kg' && to === 'lb') return weight * KG_TO_LB;
  return weight * LB_TO_KG;
}

/**
 * Round weight based on unit
 * kg → nearest 0.5, lb → nearest 1
 */
export function roundWeight(weight: number, unit: Unit): number {
  if (unit === 'kg') {
    return Math.round(weight * 2) / 2;
  }
  return Math.round(weight);
}

/**
 * Epley formula: 1RM = w * (1 + r/30)
 */
export function calculateEpley(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}

/**
 * Brzycki formula: 1RM = w * (36 / (37 - r))
 */
export function calculateBrzycki(weight: number, reps: number): number {
  if (reps >= 37) return weight; // Prevent division by zero
  return weight * (36 / (37 - reps));
}

/**
 * Lombardi formula: 1RM = w * r^0.10
 */
export function calculateLombardi(weight: number, reps: number): number {
  return weight * Math.pow(reps, 0.1);
}

/**
 * Calculate median of enabled formulas
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  
  return sorted[mid];
}

/**
 * Calculate 1RM using specified formulas
 */
export function calculate1RM(
  weight: number, 
  reps: number, 
  enabledFormulas: Formula[]
): CalculationResult {
  const results = {
    epley: calculateEpley(weight, reps),
    brzycki: calculateBrzycki(weight, reps),
    lombardi: calculateLombardi(weight, reps)
  };

  const enabledResults = enabledFormulas.map(formula => results[formula]);
  const best = calculateMedian(enabledResults);

  return {
    ...results,
    best
  };
}

/**
 * Validate input values
 */
export function validateInputs(weight: number, reps: number): string | null {
  if (weight <= 0) return 'Weight must be greater than 0';
  if (reps < 1 || reps > 20) return 'Reps must be between 1 and 20';
  if (reps > 10) return 'Estimates less accurate at >10 reps';
  return null;
}
