// Warm-up set generator with plate math integration

import type { Unit } from './formulas.js';
import type { PlateConfig } from './plates.js';
import { calculatePlates } from './plates.js';

export interface WarmupSet {
  percentage: number;
  reps: number;
  weight: number;
  plates: string;
  description: string;
}

export interface WarmupPlan {
  sets: WarmupSet[];
  workingWeight: number;
  unit: Unit;
}

// Default warm-up percentages and reps
const DEFAULT_WARMUP_SETS = [
  { percentage: 0, reps: 8, description: 'Empty bar' },
  { percentage: 40, reps: 5, description: 'Light warm-up' },
  { percentage: 60, reps: 3, description: 'Moderate warm-up' },
  { percentage: 75, reps: 2, description: 'Heavy warm-up' },
  { percentage: 85, reps: 1, description: 'Working weight prep' }
];

/**
 * Generate warm-up plan based on working weight or 1RM
 */
export function generateWarmupPlan(
  workingWeight: number,
  unit: Unit,
  plateConfig: PlateConfig
): WarmupPlan {
  const sets: WarmupSet[] = [];

  for (const warmupSet of DEFAULT_WARMUP_SETS) {
    let weight: number;
    let plates: string;

    if (warmupSet.percentage === 0) {
      // Empty bar
      weight = plateConfig.bar;
      plates = 'Bar only';
    } else {
      // Calculate percentage of working weight
      weight = Math.round((workingWeight * warmupSet.percentage) / 100);
      
      // Get plate math for this weight
      const plateResult = calculatePlates(weight, plateConfig);
      
      if (plateResult.plates.length === 0) {
        plates = `${plateConfig.bar} ${unit} bar`;
      } else {
        const plateList = plateResult.plates
          .map(p => `${p.weight} ${unit}`)
          .join(' + ');
        plates = `${plateConfig.bar} bar + ${plateList} per side`;
      }
    }

    sets.push({
      percentage: warmupSet.percentage,
      reps: warmupSet.reps,
      weight,
      plates,
      description: warmupSet.description
    });
  }

  return {
    sets,
    workingWeight,
    unit
  };
}

/**
 * Update warm-up plan when working weight changes
 */
export function updateWarmupPlan(
  plan: WarmupPlan,
  newWorkingWeight: number,
  plateConfig: PlateConfig
): WarmupPlan {
  return generateWarmupPlan(newWorkingWeight, plan.unit, plateConfig);
}

/**
 * Get warm-up set description with proper formatting
 */
export function formatWarmupSet(set: WarmupSet): string {
  if (set.percentage === 0) {
    return `${set.reps} reps`;
  }
  return `${set.percentage}% × ${set.reps} reps`;
}
