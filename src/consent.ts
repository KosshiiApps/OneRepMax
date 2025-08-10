// Consent management for GDPR-compliant analytics

const CONSENT_KEY = 'onerepmax_analytics_consent';
const PLAUSIBLE_DOMAIN = 'repmax.app';

export interface ConsentState {
  analytics: boolean;
  timestamp: number;
}

/**
 * Load consent state from localStorage
 */
export function loadConsent(): ConsentState | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load consent state:', error);
  }
  return null;
}

/**
 * Save consent state to localStorage
 */
export function saveConsent(consent: ConsentState): void {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } catch (error) {
    console.warn('Failed to save consent state:', error);
  }
}

/**
 * Check if user has given consent
 */
export function hasConsent(): boolean {
  const consent = loadConsent();
  return consent?.analytics === true;
}

/**
 * Load Plausible analytics script
 */
export function loadAnalytics(): void {
  if (!hasConsent()) return;

  const script = document.createElement('script');
  script.defer = true;
  script.setAttribute('data-domain', PLAUSIBLE_DOMAIN);
  script.src = 'https://plausible.io/js/script.js';
  
  // Remove existing script if present
  const existing = document.querySelector('script[data-domain="' + PLAUSIBLE_DOMAIN + '"]');
  if (existing) {
    existing.remove();
  }
  
  document.head.appendChild(script);
}

/**
 * Revoke consent and remove analytics
 */
export function revokeConsent(): void {
  saveConsent({ analytics: false, timestamp: Date.now() });
  
  // Remove Plausible script
  const script = document.querySelector('script[data-domain="' + PLAUSIBLE_DOMAIN + '"]');
  if (script) {
    script.remove();
  }
}

/**
 * Show consent banner if no consent given
 */
export function showConsentBanner(): void {
  if (hasConsent()) return;

  const banner = document.createElement('div');
  banner.id = 'consent-banner';
  banner.className = 'fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 z-50';
  banner.innerHTML = `
    <div class="mx-auto max-w-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div class="flex-1">
        <p class="text-sm text-gray-300">
          We use privacy-friendly analytics to improve our service. 
          <a href="/privacy" class="underline hover:text-gray-200">Learn more</a>
        </p>
      </div>
      <div class="flex gap-2">
        <button id="consent-accept" class="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-medium rounded-lg transition">
          Accept
        </button>
        <button id="consent-decline" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 font-medium rounded-lg transition">
          Decline
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  // Event listeners
  document.getElementById('consent-accept')?.addEventListener('click', () => {
    const consent: ConsentState = { analytics: true, timestamp: Date.now() };
    saveConsent(consent);
    banner.remove();
    loadAnalytics();
  });

  document.getElementById('consent-decline')?.addEventListener('click', () => {
    const consent: ConsentState = { analytics: false, timestamp: Date.now() };
    saveConsent(consent);
    banner.remove();
  });
}

/**
 * Initialize consent management
 */
export function initConsent(): void {
  // Show banner on first load if no consent
  if (!hasConsent()) {
    showConsentBanner();
  } else {
    // Load analytics if consent already given
    loadAnalytics();
  }
}
