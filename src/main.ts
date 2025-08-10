// Main application module - wires up all components and handles events

import { calculate1RM, validateInputs, roundWeight, type Unit } from './formulas.js';

import { generateWarmupPlan, type WarmupPlan } from './warmup.js';
import { loadState, saveState, parseURLState, mergeStates, updateURL, type AppState } from './state.js';
import { initConsent } from './consent.js';

// DOM elements
let elements: {
  form: HTMLFormElement;
  weight: HTMLInputElement;
  unit: HTMLSelectElement;
  reps: HTMLInputElement;
  result: HTMLElement;
  best1RM: HTMLElement;
  percentages: HTMLElement;
  percentagesGrid: HTMLElement;
  
  warmup: HTMLElement;
  warmupInput: HTMLInputElement;
  warmupResult: HTMLElement;
  shareButton: HTMLButtonElement;
  errorAlert: HTMLElement;
} | null = null;

// Application state
let appState: AppState;

// Training percentages configuration
const PERCENTAGES = [
  { percent: 95, reps: '2-3', description: 'Maximal strength' },
  { percent: 90, reps: '3-4', description: 'Heavy strength' },
  { percent: 85, reps: '5-6', description: 'Strength endurance' },
  { percent: 80, reps: '7-8', description: 'Hypertrophy' },
  { percent: 75, reps: '8-10', description: 'Muscle building' },
  { percent: 70, reps: '10-12', description: 'Endurance' },
  { percent: 65, reps: '12-15', description: 'Light endurance' },
  { percent: 60, reps: '15+', description: 'Technique work' },
  { percent: 50, reps: 'Technique', description: 'Form practice' }
];

/**
 * Initialize the application
 */
function init(): void {
  // Initialize consent management
  initConsent();
  
  // Load and merge state
  const storedState = loadState();
  const urlState = parseURLState();
  appState = mergeStates(storedState, urlState);
  
  // Cache DOM elements
  cacheElements();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize UI with current state
  updateUI();
  
  // Update URL to reflect current state
  updateURL(appState);
  
  // Show default warm-up message
  if (elements?.warmupResult) {
    // Generate a default warm-up plan with example weight (100 kg)
    const defaultWeight = 100;
    const defaultWarmupPlan = generateWarmupPlan(defaultWeight, appState.unit, appState.plateConfig);
    
    elements.warmupResult.innerHTML = `
      <div class="text-center text-gray-400 py-4 mb-4">
        <div class="text-sm">Example warm-up plan (100 ${appState.unit})</div>
      </div>
    `;
    
    // Show the default warm-up sets
    updateWarmupDisplay(defaultWarmupPlan);
  }
}

/**
 * Cache DOM elements for performance
 */
function cacheElements(): void {
  elements = {
    form: document.getElementById('calc-form') as HTMLFormElement,
    weight: document.getElementById('weight') as HTMLInputElement,
    unit: document.getElementById('unit') as HTMLSelectElement,
    reps: document.getElementById('reps') as HTMLInputElement,
    result: document.getElementById('result') as HTMLElement,
    best1RM: document.getElementById('best-1rm') as HTMLElement,
    percentages: document.getElementById('percentages') as HTMLElement,
    percentagesGrid: document.getElementById('percentages-grid') as HTMLElement,
    
    warmup: document.getElementById('warmup') as HTMLElement,
    warmupInput: document.getElementById('warmup-input') as HTMLInputElement,
    warmupResult: document.getElementById('warmup-result') as HTMLElement,
    shareButton: document.getElementById('share-button') as HTMLButtonElement,
    errorAlert: document.getElementById('error-alert') as HTMLElement
  };
}

/**
 * Set up event listeners
 */
function setupEventListeners(): void {
  if (!elements) return;

  // Form submission
  elements.form.addEventListener('submit', handleFormSubmit);
  
  // Input changes
  elements.weight.addEventListener('input', handleWeightChange);
  elements.unit.addEventListener('change', handleUnitChange);
  elements.reps.addEventListener('input', handleRepsChange);
  

  
  // Warm-up
  elements.warmupInput.addEventListener('input', handleWarmupInput);
  
  // Share button
  elements.shareButton.addEventListener('click', handleShare);
}

/**
 * Handle form submission
 */
function handleFormSubmit(e: Event): void {
  e.preventDefault();
  
  if (!elements) return;
  
  const weight = parseFloat(elements.weight.value);
  const reps = parseInt(elements.reps.value);
  
  // Validate inputs
  const error = validateInputs(weight, reps);
  if (error) {
    showError(error);
    return;
  }
  
  // Update state
  appState.weight = weight;
  appState.reps = reps;
  
  // Calculate 1RM
  const result = calculate1RM(weight, reps, ['epley', 'brzycki', 'lombardi']);
  
  // Update state with calculation
  appState.lastCalculation = {
    weight,
    reps,
    unit: appState.unit,
    best1RM: result.best
  };
  
  // Save state and update UI
  saveState(appState);
  updateURL(appState);
  updateUI();
  
  // Hide error if previously shown
  hideError();
}

/**
 * Handle weight input change
 */
function handleWeightChange(): void {
  if (!elements) return;
  appState.weight = parseFloat(elements.weight.value) || 0;
  updateURL(appState);
}

/**
 * Handle unit change
 */
function handleUnitChange(): void {
  if (!elements) return;
  
  const newUnit = elements.unit.value as Unit;
  const oldUnit = appState.unit;
  
  if (newUnit !== oldUnit) {
    // Convert weight and bar
    appState.weight = Math.round(appState.weight * (newUnit === 'kg' ? 0.453592 : 2.20462));
    appState.bar = newUnit === 'kg' ? 20 : 45;
    
    // Update plate config
    appState.plateConfig.unit = newUnit;
    appState.plateConfig.bar = appState.bar;
    
    // Save and update
    saveState(appState);
    updateURL(appState);
    updateUI();
  }
}

/**
 * Handle reps input change
 */
function handleRepsChange(): void {
  if (!elements) return;
  appState.reps = parseInt(elements.reps.value) || 0;
  updateURL(appState);
}



/**
 * Handle warm-up input
 */
function handleWarmupInput(): void {
  if (!elements) return;
  
  const workingWeight = parseFloat(elements.warmupInput.value);
  if (isNaN(workingWeight) || workingWeight <= 0) {
    elements.warmupResult.innerHTML = '';
    return;
  }
  
  const warmupPlan = generateWarmupPlan(workingWeight, appState.unit, appState.plateConfig);
  updateWarmupDisplay(warmupPlan);
}

/**
 * Handle share button click
 */
async function handleShare(): Promise<void> {
  if (!elements) return;
  
  if (!appState.lastCalculation) {
    showError('No calculation to share');
    return;
  }
  
  const { weight, reps, unit, best1RM } = appState.lastCalculation;
  const rounded1RM = roundWeight(best1RM, unit);
  
  // Create detailed share text
  const shareText = `1RM Calculator Results:
• Weight: ${weight} ${unit} × ${reps} reps
• Estimated 1RM: ${rounded1RM} ${unit}
• Key percentages:
  - 80%: ${roundWeight(best1RM * 0.8, unit)} ${unit} (3-5 reps)
  - 85%: ${roundWeight(best1RM * 0.85, unit)} ${unit} (2-3 reps)
  - 90%: ${roundWeight(best1RM * 0.9, unit)} ${unit} (1-2 reps)
  - 95%: ${roundWeight(best1RM * 0.95, unit)} ${unit} (1 rep)`;
  
  try {
    if (navigator.share) {
      await navigator.share({
        title: 'My 1RM Calculation Results',
        text: shareText,
        url: window.location.href
      });
    } else {
      // Copy detailed text to clipboard
      await navigator.clipboard.writeText(shareText);
      showShareSuccess();
    }
  } catch (error) {
    console.warn('Share failed:', error);
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      showShareSuccess();
    } catch (clipboardError) {
      console.error('Clipboard fallback failed:', clipboardError);
    }
  }
}

/**
 * Show share success message
 */
function showShareSuccess(): void {
  if (!elements?.shareButton) return;
  
  const originalText = elements.shareButton.textContent;
  elements.shareButton.textContent = 'Copied!';
  elements.shareButton.classList.add('bg-emerald-500');
  
  setTimeout(() => {
    if (elements?.shareButton) {
      elements.shareButton.textContent = originalText;
      elements.shareButton.classList.remove('bg-emerald-500');
    }
  }, 2000);
}

/**
 * Show error message
 */
function showError(message: string): void {
  if (!elements?.errorAlert) return;
  
  elements.errorAlert.textContent = message;
  elements.errorAlert.classList.remove('hidden');
  
  // Add shake animation if motion is not reduced
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.errorAlert.classList.add('animate-wiggle');
    setTimeout(() => {
      if (elements?.errorAlert) {
        elements.errorAlert.classList.remove('animate-wiggle');
      }
    }, 200);
  }
}

/**
 * Hide error message
 */
function hideError(): void {
  if (!elements?.errorAlert) return;
  elements.errorAlert.classList.add('hidden');
}

/**
 * Update the entire UI based on current state
 */
function updateUI(): void {
  if (!elements) return;
  
  // Update form inputs
  elements.weight.value = appState.weight.toString();
  elements.unit.value = appState.unit;
  elements.reps.value = appState.reps.toString();
  
  // Update results if we have a calculation
  if (appState.lastCalculation) {
    const result = calculate1RM(
      appState.lastCalculation.weight,
      appState.lastCalculation.reps,
      ['epley', 'brzycki', 'lombardi']
    );
    
    updateResultDisplay(result);
    updatePercentagesTable(result.best);
    
    // Show result sections
    elements.result.classList.remove('hidden');
    elements.percentages.classList.remove('hidden');
    elements.warmup.classList.remove('hidden');
    
    // Pre-fill warm-up input with calculated 1RM and generate plan
    if (elements.warmupInput) {
      elements.warmupInput.value = result.best.toString();
      const warmupPlan = generateWarmupPlan(result.best, appState.unit, appState.plateConfig);
      updateWarmupDisplay(warmupPlan);
    }
  } else {
    // Hide result sections
    elements.result.classList.add('hidden');
    elements.percentages.classList.add('hidden');
    elements.warmup.classList.add('hidden');
  }
}

/**
 * Update result display
 */
function updateResultDisplay(result: any): void {
  if (!elements) return;
  
  const unit = appState.unit;
  
  // Update best estimate
  const roundedBest = roundWeight(result.best, unit);
  elements.best1RM.textContent = `${roundedBest} ${unit}`;
  elements.best1RM.title = `Exact: ${result.best.toFixed(2)} ${unit}`;
}

/**
 * Update percentages table
 */
function updatePercentagesTable(best1RM: number): void {
  if (!elements?.percentagesGrid) return;
  
  const unit = appState.unit;
  elements.percentagesGrid.innerHTML = '';
  
  PERCENTAGES.forEach(({ percent, reps, description }) => {
    const weight = (best1RM * percent) / 100;
    const roundedWeight = roundWeight(weight, unit);
    
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between rounded-lg border border-slate-800 p-3';
    row.innerHTML = `
      <div>
        <span class="text-gray-400">${percent}% (${reps})</span>
        <div class="text-xs text-gray-500">${description}</div>
      </div>
      <span class="font-semibold" data-percent="${percent}">${roundedWeight} ${unit}</span>
    `;
    
    if (elements?.percentagesGrid) {
      elements.percentagesGrid.appendChild(row);
    }
  });
}



/**
 * Update warm-up display
 */
function updateWarmupDisplay(warmupPlan: WarmupPlan): void {
  if (!elements?.warmupResult) return;
  
  elements.warmupResult.innerHTML = '';
  
  warmupPlan.sets.forEach(set => {
    const setElement = document.createElement('div');
    setElement.className = 'flex items-center justify-between rounded-lg border border-slate-800 p-3';
    setElement.innerHTML = `
      <div>
        <div class="font-medium">${set.percentage === 0 ? 'Empty bar' : `${set.percentage}%`} × ${set.reps}</div>
        <div class="text-sm text-gray-400">${set.description}</div>
      </div>
      <div class="text-right">
        <div class="font-semibold">${set.weight} ${warmupPlan.unit}</div>
        <div class="text-sm text-gray-400">${set.plates}</div>
      </div>
    `;
    
    if (elements?.warmupResult) {
      elements.warmupResult.appendChild(setElement);
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
