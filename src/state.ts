// State management for localStorage and URL synchronization

import type { Unit } from './formulas.js';
import type { PlateConfig } from './plates.js';

export interface AppState {
  weight: number;
  reps: number;
  unit: Unit;
  bar: number;
  plateConfig: PlateConfig;
  lastCalculation?: {
    weight: number;
    reps: number;
    unit: Unit;
    best1RM: number;
  };
}

const STORAGE_KEY = 'onerepmax_state';
const DEFAULT_STATE: AppState = {
  weight: 100,
  reps: 5,
  unit: 'kg',
  bar: 20,
  plateConfig: {
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
  }
};

/**
 * Load state from localStorage
 */
export function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle missing properties
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load state from localStorage:', error);
  }
  return { ...DEFAULT_STATE };
}

/**
 * Save state to localStorage
 */
export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save state to localStorage:', error);
  }
}

/**
 * Parse URL query parameters into state
 */
export function parseURLState(): Partial<AppState> {
  const params = new URLSearchParams(window.location.search);
  const state: Partial<AppState> = {};

  const weight = parseFloat(params.get('w') || '');
  if (!isNaN(weight) && weight > 0) state.weight = weight;

  const reps = parseInt(params.get('r') || '');
  if (!isNaN(reps) && reps >= 1 && reps <= 20) state.reps = reps;

  const unit = params.get('unit');
  if (unit === 'kg' || unit === 'lb') state.unit = unit;

  const bar = parseFloat(params.get('bar') || '');
  if (!isNaN(bar) && bar > 0) state.bar = bar;

  // Parse plate availability
  const plates = params.get('plates');
  if (plates && state.unit) {
    try {
      const plateAvailability = JSON.parse(decodeURIComponent(plates));
      if (Array.isArray(plateAvailability)) {
        state.plateConfig = {
          ...DEFAULT_STATE.plateConfig,
          unit: state.unit,
          bar: state.bar || DEFAULT_STATE.bar,
          plates: plateAvailability.map((available, index) => ({
            weight: DEFAULT_STATE.plateConfig.plates[index]?.weight || 0,
            available: Boolean(available)
          }))
        };
      }
    } catch (error) {
      console.warn('Failed to parse plate availability:', error);
    }
  }

  return state;
}

/**
 * Generate URL with current state
 */
export function generateURL(state: AppState): string {
  const params = new URLSearchParams();
  
  params.set('w', state.weight.toString());
  params.set('r', state.reps.toString());
  params.set('unit', state.unit);
  params.set('bar', state.bar.toString());
  
  const plateAvailability = state.plateConfig.plates.map(p => p.available ? 1 : 0);
  params.set('plates', encodeURIComponent(JSON.stringify(plateAvailability)));
  
  return `${window.location.pathname}?${params.toString()}`;
}

/**
 * Update URL without page reload
 */
export function updateURL(state: AppState): void {
  const url = generateURL(state);
  window.history.replaceState({}, '', url);
}

/**
 * Merge URL state with stored state
 */
export function mergeStates(storedState: AppState, urlState: Partial<AppState>): AppState {
  return { ...storedState, ...urlState };
}
