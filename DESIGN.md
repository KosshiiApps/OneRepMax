# 1RM Calculator — Tailwind Design Spec

## Brand
- **Name:** One Rep Max
- **Tone:** Minimal, fast, trustworthy
- **Logo (text):** "1RM" in a rounded square, medium weight

## Colors
- **Background:** `#0B0F14` (near-black)
- **Surface:** `#0F172A` (slate-900-ish)
- **Card:** `#111827`
- **Primary:** `#60A5FA` (blue-400) for actions
- **Accent:** `#34D399` (emerald-400) for results/success
- **Text Primary:** `#E5E7EB` (gray-200)
- **Text Muted:** `#9CA3AF` (gray-400)
- **Border:** `#1F2937` (gray-800)
- **Focus Ring:** `#93C5FD` (blue-300)

> Tailwind usage: prefer built-ins (`bg-slate-950`, `bg-slate-900`, `text-gray-200`, etc.) but map to the vibe above.

## Typography
- **Font:** Inter for UI; JetBrains Mono for small numeric badges
- **Weights:** 400, 500, 600
- **Sizes:** `text-sm` base on mobile, `text-base` ≥ md
- **Headings:** `font-semibold`, tight leading (`leading-tight`)

## Layout
- **Container:** `mx-auto max-w-2xl px-4 sm:px-6`
- **Vertical rhythm:** `space-y-6` between major sections
- **Cards:** `rounded-2xl bg-slate-900/70 border border-slate-800 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] backdrop-blur`
- **Sections:** Hero → Calculator → Result → Tips/Percent Table → FAQ → Footer

## Components

### 1) App Shell
```html
<div class="min-h-screen bg-slate-950 text-gray-200 antialiased">
  <header class="border-b border-slate-800/80">
    <div class="mx-auto max-w-2xl px-4 sm:px-6 py-4 flex items-center justify-between">
      <a class="flex items-center gap-2" href="/">
        <div class="h-8 w-8 rounded-xl bg-blue-500/15 ring-1 ring-blue-400/30 grid place-items-center">
          <span class="text-blue-300 font-semibold">1RM</span>
        </div>
        <span class="font-semibold">One Rep Max</span>
      </a>
      <nav class="text-sm text-gray-400">
        <a href="#faq" class="hover:text-gray-200 transition">FAQ</a>
      </nav>
    </div>
  </header>
  <main class="mx-auto max-w-2xl px-4 sm:px-6 py-10 space-y-8">
    <!-- sections here -->
  </main>
  <footer class="py-10 text-center text-sm text-gray-500">
    <p>© {{year}} One Rep Max · <a class="underline hover:text-gray-300" href="/privacy">Privacy</a></p>
  </footer>
</div>
```

### 2) Hero
```html
<section class="text-center space-y-4">
  <h1 class="text-3xl sm:text-4xl font-semibold">Calculate Your One-Rep Max</h1>
  <p class="text-gray-400">Fast, accurate estimates using popular formulas (Epley, Brzycki, Lombardi).</p>
</section>
```

### 3) Calculator Card
```html
<section class="card rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-5">
  <form class="space-y-4" id="calc-form">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <label class="col-span-1 sm:col-span-2">
        <span class="block text-sm text-gray-400 mb-2">Weight Lifted</span>
        <div class="flex rounded-xl border border-slate-800 bg-slate-950/60 focus-within:ring-2 focus-within:ring-blue-300">
          <input type="number" inputmode="decimal" step="0.5" placeholder="e.g., 100"
                 class="w-full bg-transparent px-4 py-3 outline-none" id="weight">
          <select id="unit" class="bg-transparent px-3 border-l border-slate-800">
            <option>kg</option>
            <option>lb</option>
          </select>
        </div>
      </label>
      <label>
        <span class="block text-sm text-gray-400 mb-2">Reps</span>
        <input type="number" inputmode="numeric" min="1" max="20" placeholder="e.g., 5"
               class="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 focus:ring-2 focus:ring-blue-300 outline-none" id="reps">
      </label>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <label class="flex items-center gap-2">
        <input type="checkbox" id="use-epley" class="accent-blue-400" checked>
        <span class="text-sm text-gray-300">Epley</span>
      </label>
      <label class="flex items-center gap-2">
        <input type="checkbox" id="use-brzycki" class="accent-blue-400" checked>
        <span class="text-sm text-gray-300">Brzycki</span>
      </label>
      <label class="flex items-center gap-2">
        <input type="checkbox" id="use-lombardi" class="accent-blue-400" checked>
        <span class="text-sm text-gray-300">Lombardi</span>
      </label>
    </div>

    <button type="submit" class="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold transition">
      Calculate 1RM
    </button>
  </form>
</section>
```

### 4) Result Card
```html
<section id="result" class="hidden rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold">Estimated 1RM</h2>
    <span class="text-xs text-gray-400">Best estimate</span>
  </div>
  <div class="text-4xl font-semibold text-emerald-300" id="best-1rm">—</div>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
    <div class="rounded-xl border border-slate-800 p-3">
      <div class="text-gray-400">Epley</div>
      <div class="font-semibold" id="epley-val">—</div>
    </div>
    <div class="rounded-xl border border-slate-800 p-3">
      <div class="text-gray-400">Brzycki</div>
      <div class="font-semibold" id="brzycki-val">—</div>
    </div>
    <div class="rounded-xl border border-slate-800 p-3">
      <div class="text-gray-400">Lombardi</div>
      <div class="font-semibold" id="lombardi-val">—</div>
    </div>
  </div>
</section>
```

### 5) % of 1RM Table (auto-fills after calc)
```html
<section id="percentages" class="hidden rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4">
  <h3 class="font-semibold">Training Percentages</h3>
  <div class="grid sm:grid-cols-2 gap-3 text-sm">
    <!-- Repeat rows with JS -->
    <!-- Example row -->
    <div class="flex items-center justify-between rounded-lg border border-slate-800 p-3">
      <span class="text-gray-400">85% (5 reps)</span>
      <span class="font-semibold" data-percent="85">—</span>
    </div>
  </div>
  <p class="text-xs text-gray-500">Tip: most sets fall between 65–85% of 1RM depending on your goal.</p>
</section>
```

### 6) Tips & FAQ
```html
<section id="faq" class="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4">
  <h3 class="font-semibold">FAQ</h3>
  <details class="group rounded-lg border border-slate-800 p-4">
    <summary class="cursor-pointer font-medium text-gray-200 group-open:text-emerald-300">How accurate is a 1RM estimate?</summary>
    <p class="mt-2 text-gray-400">It's an estimate. Accuracy drops at high reps. Use lower-rep sets (≤10) for better results.</p>
  </details>
  <details class="group rounded-lg border border-slate-800 p-4">
    <summary class="cursor-pointer font-medium text-gray-200 group-open:text-emerald-300">Which formula should I use?</summary>
    <p class="mt-2 text-gray-400">Epley and Brzycki are common; Lombardi scales differently for high reps. We show all three.</p>
  </details>
</section>
```

## Interaction & States
Reveal #result and #percentages by removing hidden after a valid calculation.

Add a subtle "shake" on invalid input: `animate-[wiggle_0.2s_ease-in-out]` (define keyframe in Tailwind config).

## Accessibility
Use clear `<label for>` and `id` pairs.

Ensure focus outlines: `focus:ring-2 focus:ring-blue-300`.

Buttons must have 44×44px tap targets.

## SEO
Title: One Rep Max (1RM) Calculator — Fast & Accurate

Meta description: Free 1RM calculator with Epley, Brzycki, and Lombardi formulas. Get training percentages instantly.

Open Graph: set image preview with example result card.

Schema: SoftwareApplication with applicationCategory: FitnessApplication.

## Monetization (gentle)
Single unobtrusive affiliate block below table:

```html
<section class="rounded-2xl border border-slate-800 p-4 text-sm text-gray-300">
  <p class="mb-2">Recommended gear for strength training:</p>
  <ul class="list-disc pl-5 space-y-1">
    <li><a class="underline hover:text-gray-200" href="AFFILIATE_LINK">Weightlifting belt</a></li>
    <li><a class="underline hover:text-gray-200" href="AFFILIATE_LINK">Fractional plates</a></li>
    <li><a class="underline hover:text-gray-200" href="AFFILIATE_LINK">Chalk</a></li>
  </ul>
</section>
```

## Performance
Target < 40KB JS, lazy-load nothing, zero frameworks if possible.

Preload Inter font subset; avoid blocking CSS beyond Tailwind.

Lighthouse 95+ on mobile.

## Copy Guidelines
Keep labels short and specific: "Weight Lifted", "Reps".

Show helpful microcopy only after user input (e.g., "Tip: lower reps improve accuracy").

## Formulas (for your JS)
- **Epley:** 1RM = w * (1 + r/30)
- **Brzycki:** 1RM = w * (36 / (37 - r))
- **Lombardi:** 1RM = w * r^0.10

Convert to kg/lb based on unit toggle and round to 0.5 for kg, 1 for lb.
