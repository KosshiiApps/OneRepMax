// Plate math calculations and configuration

import type { Unit } from './formulas.js';

export interface Plate {
  weight: number;
  available: boolean;
}

export interface PlateConfig {
  unit: Unit;
  bar: number;
  plates: Plate[];
}

export interface PlateResult {
  plates: Plate[];
  total: number;
  remainder: number;
}

// Default plate configurations
export const DEFAULT_PLATE_CONFIGS: Record<Unit, PlateConfig> = {
  kg: {
    unit: 'kg',
    bar: 20,
    plates: [
      { weight: 25, available: true },
      { weight: 20, available: true },
      { weight: 15, available: true },
      { weight: 10, available: true },
      { weight: 5, available: true },
      { weight: 2.5, available: true },
      { weight: 1.25, available: true },
      { weight: 0.5, available: true }
    ]
  },
  lb: {
    unit: 'lb',
    bar: 45,
    plates: [
      { weight: 55, available: true },
      { weight: 45, available: true },
      { weight: 35, available: true },
      { weight: 25, available: true },
      { weight: 10, available: true },
      { weight: 5, available: true },
      { weight: 2.5, available: true }
    ]
  }
};

/**
 * Calculate plates needed for target weight (per side)
 * Uses greedy largest-first algorithm after subtracting bar weight
 */
export function calculatePlates(
  targetWeight: number, 
  config: PlateConfig
): PlateResult {
  const availablePlates = config.plates
    .filter(p => p.available)
    .sort((a, b) => b.weight - a.weight); // Largest first

  let remainingWeight = (targetWeight - config.bar) / 2; // Per side
  const selectedPlates: Plate[] = [];
  let totalWeight = config.bar;

  if (remainingWeight <= 0) {
    return {
      plates: [],
      total: config.bar,
      remainder: Math.abs(remainingWeight)
    };
  }

  for (const plate of availablePlates) {
    if (remainingWeight >= plate.weight) {
      selectedPlates.push(plate);
      remainingWeight -= plate.weight;
      totalWeight += plate.weight * 2; // Both sides
    }
  }

  // Round remainder based on unit
  const remainder = config.unit === 'kg' 
    ? Math.round(remainingWeight * 2) / 2 
    : Math.round(remainingWeight);

  return {
    plates: selectedPlates,
    total: totalWeight,
    remainder: Math.max(0, remainder)
  };
}

/**
 * Get available bar weights for a unit
 */
export function getAvailableBars(unit: Unit): number[] {
  return unit === 'kg' ? [20, 15, 10] : [45, 35, 15];
}

/**
 * Update plate availability
 */
export function updatePlateAvailability(
  config: PlateConfig,
  plateIndex: number,
  available: boolean
): PlateConfig {
  const newConfig = { ...config };
  newConfig.plates = [...config.plates];
  newConfig.plates[plateIndex] = { ...config.plates[plateIndex], available };
  return newConfig;
}

/**
 * Check if target weight is valid for plate math
 */
export function isValidTargetWeight(targetWeight: number, config: PlateConfig): boolean {
  return targetWeight > config.bar;
}

/**
 * Get plate math hint text
 */
export function getPlateMathHint(targetWeight: number, config: PlateConfig): string | null {
  if (targetWeight <= config.bar) {
    return `Weight must be greater than bar weight (${config.bar} ${config.unit})`;
  }
  return null;
}
