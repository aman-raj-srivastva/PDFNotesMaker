// ─── AI Settings Store ──────────────────────────────────────────────────────────
//  Persists the user's chosen provider + API key + model in localStorage.
//  BYOK: the key lives only in this browser and is sent only to the chosen
//  provider's API. Nothing is uploaded to any server we control.

import type { ProviderId } from './aiProviders';

export interface AiSettings {
  provider: ProviderId;
  apiKey: string;
  model: string;
}

const STORAGE_KEY = 'pdf_notes_ai_settings';

const DEPRECATED_GROQ_MODELS = new Set([
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile',
  'llama3-70b-8192',
  'llama3-8b-8192',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
  'gemma-7b-it',
]);

const DEPRECATED_GEMINI_MODELS = new Set([
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
  'gemini-1.0-pro',
]);

export function loadAiSettings(): AiSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AiSettings>;
    if (parsed.provider && parsed.apiKey && parsed.model) {
      let model = parsed.model;
      if (parsed.provider === 'groq' && (DEPRECATED_GROQ_MODELS.has(model) || model.startsWith('llama-') || model.startsWith('llama3'))) {
        model = 'openai/gpt-oss-20b';
        saveAiSettings({ provider: parsed.provider, apiKey: parsed.apiKey, model });
      } else if (parsed.provider === 'gemini' && DEPRECATED_GEMINI_MODELS.has(model)) {
        model = 'gemini-3.8-flash';
        saveAiSettings({ provider: parsed.provider, apiKey: parsed.apiKey, model });
      }
      return { provider: parsed.provider, apiKey: parsed.apiKey, model };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveAiSettings(settings: AiSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function clearAiSettings(): void {
  localStorage.removeItem(STORAGE_KEY);
}
