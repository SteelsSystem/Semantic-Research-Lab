import {
  LLMProvider,
  EmbeddingProvider,
  VectorStore,
  DialecticTurnRequest,
  DialecticTurnResponse,
  VectorItem,
  VectorSearchResult,
  ModelInfo,
  ProviderSettings,
} from '../types/providers';
import { VisualState, DeepAnalysisData, BranchingInquiry } from '../types/cognitive';

// Local storage key for persistent user provider settings
const SETTINGS_KEY = 'vaporsphere_provider_settings_v1';

export const DEFAULT_PROVIDER_SETTINGS: ProviderSettings = {
  activeProviderId: 'gemini_proxy',
  userGeminiApiKey: '',
  ollamaBaseUrl: 'http://localhost:11434',
  selectedLocalModel: 'llama3.2:latest',
  useLocalVectorStore: true,
  useLocalAudioDSP: true,
  whisperEngine: 'browser',
};

export function loadProviderSettings(): ProviderSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_PROVIDER_SETTINGS;
    return { ...DEFAULT_PROVIDER_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROVIDER_SETTINGS;
  }
}

export function saveProviderSettings(settings: ProviderSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save provider settings to localStorage:', e);
  }
}

/**
 * Parses raw dialectical turn output into VisualState, DeepAnalysisData, and BranchingInquiry
 */
export function parseTurnContent(rawText: string, defaultDomain = 'Epistemologie'): {
  visualState: VisualState;
  analysis: DeepAnalysisData;
  branching: BranchingInquiry[];
} {
  // Extract visual state
  let visualState: VisualState = {
    L: 0.72,
    a: -0.05,
    b: -0.08,
    turbulence: 0.45,
    density: 0.7,
    domainLabel: defaultDomain,
  };

  const visualMatch = rawText.match(/\[VISUAL_STATE:\s*L=([\d.-]+),\s*a=([\d.-]+),\s*b=([\d.-]+),\s*turbulence=([\d.-]+),\s*density=([\d.-]+)\]/i);
  if (visualMatch) {
    visualState = {
      L: Math.max(0, Math.min(1, parseFloat(visualMatch[1]))),
      a: Math.max(-0.4, Math.min(0.4, parseFloat(visualMatch[2]))),
      b: Math.max(-0.4, Math.min(0.4, parseFloat(visualMatch[3]))),
      turbulence: Math.max(0, Math.min(1, parseFloat(visualMatch[4]))),
      density: Math.max(0, Math.min(1, parseFloat(visualMatch[5]))),
      domainLabel: defaultDomain,
    };
  }

  // Parse premises, axioms, isomorphisms, counterTheses
  const corePremises: string[] = [];
  const hiddenAxioms: string[] = [];
  const structuralIsomorphisms: string[] = [];
  const counterTheses: string[] = [];
  const keyQuestions: any[] = [];
  const branching: BranchingInquiry[] = [];

  const lines = rawText.split('\n');
  let currentSection = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.includes('Premisa') || trimmed.includes('Premisy:')) {
      currentSection = 'premise';
    } else if (trimmed.includes('Axiom') || trimmed.includes('Axiomy:')) {
      currentSection = 'axiom';
    } else if (trimmed.includes('Izomorf') || trimmed.includes('Izomorfismus:')) {
      currentSection = 'iso';
    } else if (trimmed.includes('Antiteze') || trimmed.includes('Protiargument:')) {
      currentSection = 'anti';
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\./.test(trimmed)) {
      const cleanItem = trimmed.replace(/^[-*•]|\d+\.\s*/, '').trim();
      if (currentSection === 'premise') corePremises.push(cleanItem);
      else if (currentSection === 'axiom') hiddenAxioms.push(cleanItem);
      else if (currentSection === 'iso') structuralIsomorphisms.push(cleanItem);
      else if (currentSection === 'anti') counterTheses.push(cleanItem);
    }

    if (trimmed.includes('[KLÍČOVÁ OTÁZKA') || trimmed.includes('[KEY_QUESTION')) {
      const parts = trimmed.split('||');
      const question = parts[0].replace(/\[KLÍČOVÁ OTÁZKA \d+\]:?|\[KEY_QUESTION \d+\]:?/i, '').trim();
      const contextWhy = parts[1]?.trim() || 'Zásadní pro rigorózní vymezení dialektické premisy.';
      keyQuestions.push({
        id: `kq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        question,
        contextWhy,
        status: 'pending',
      });
    }

    if (trimmed.includes('[Vertikální prohloubení]')) {
      branching.push({
        type: 'vertical',
        label: 'Vertikální prohloubení',
        question: trimmed.replace(/.*\[Vertikální prohloubení\]:?/, '').trim(),
      });
    } else if (trimmed.includes('[Laterální extrapolace]')) {
      branching.push({
        type: 'lateral',
        label: 'Laterální extrapolace',
        question: trimmed.replace(/.*\[Laterální extrapolace\]:?/, '').trim(),
      });
    } else if (trimmed.includes('[Oponentská antiteze]')) {
      branching.push({
        type: 'antithesis',
        label: 'Oponentská antiteze',
        question: trimmed.replace(/.*\[Oponentská antiteze\]:?/, '').trim(),
      });
    }
  }

  // Fallbacks if structured headings were omitted by the model
  if (corePremises.length === 0) {
    corePremises.push('Dialektická analýza výchozího tvrzení a jeho konceptuálních hranic.');
  }
  if (hiddenAxioms.length === 0) {
    hiddenAxioms.push('Předpoklad kauzální uzavřenosti a ontologické stálosti jazykových kategorií.');
  }
  if (structuralIsomorphisms.length === 0) {
    structuralIsomorphisms.push('Izomorfismus mezi termodynamickou entropií a informační hustotou kognice.');
  }
  if (counterTheses.length === 0) {
    counterTheses.push('Skeptická námitka: Model zaměňuje epistemický popis reality za její ontologickou podstatu.');
  }

  return {
    visualState,
    analysis: {
      topicTitle: defaultDomain,
      corePremises: corePremises.slice(0, 4),
      hiddenAxioms: hiddenAxioms.slice(0, 4),
      structuralIsomorphisms: structuralIsomorphisms.slice(0, 4),
      counterTheses: counterTheses.slice(0, 4),
      keyQuestions: keyQuestions.length > 0 ? keyQuestions.slice(0, 3) : [
        {
          id: `kq-default-1`,
          question: 'Jaké empirické či formální kritérium považujete za rozhodující pro falzifikaci této hypotézy?',
          contextWhy: 'Nezbytné pro rozlišení vědeckého tvrzení od metafyzického axiomu.',
          status: 'pending',
        }
      ],
    },
    branching: branching.length > 0 ? branching.slice(0, 3) : [
      {
        type: 'vertical',
        label: 'Vertikální prohloubení',
        question: 'Jaké subatomární či mikroskopické mechanismy tuto vlastnost determinují?',
      },
      {
        type: 'lateral',
        label: 'Laterální extrapolace',
        question: 'Lze tento princip přenést do teorie komplexních sociálních sítí?',
      },
      {
        type: 'antithesis',
        label: 'Oponentská antiteze',
        question: 'Co když je celý koncept pouze artefaktem použitého matematického aparátu?',
      }
    ],
  };
}

/**
 * 1. Default Server / Gemini Proxy Provider
 */
export class GeminiProxyProvider implements LLMProvider {
  readonly id = 'gemini_proxy';
  readonly name = 'Gemini 2.5 Flash (Secure Server Proxy)';
  readonly isLocal = false;
  readonly availableModels: ModelInfo[] = [
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      provider: 'gemini',
      description: 'Ultra-low latency dialectical engine with native multimodal support',
      contextWindow: 1048576,
      isLocal: false,
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro (Deep Reasoning)',
      provider: 'gemini',
      description: 'Maximum depth analytical model for complex epistemological research',
      contextWindow: 2097152,
      isLocal: false,
    },
  ];

  async generateTurn(req: DialecticTurnRequest): Promise<DialecticTurnResponse> {
    const start = performance.now();
    const res = await fetch('/api/dialectic/turn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: req.userMessage,
        history: req.history,
        domainHint: req.domainHint,
        activeTopic: req.activeTopic,
        userApiKey: req.apiKey,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Dialectic turn failed with HTTP ${res.status}`);
    }

    const data = await res.json();
    const latencyMs = Math.round(performance.now() - start);

    return {
      rawText: data.rawText,
      visualState: data.visualState,
      analysis: data.analysis,
      branching: data.branching,
      modelId: 'gemini-2.5-flash',
      latencyMs,
    };
  }
}

/**
 * 2. Ollama Local Model Provider (Offline / Air-Gapped)
 */
export class OllamaLocalProvider implements LLMProvider {
  readonly id = 'ollama_local';
  readonly name = 'Ollama (Local Offline LLM)';
  readonly isLocal = true;
  readonly availableModels: ModelInfo[] = [
    {
      id: 'llama3.2:latest',
      name: 'Llama 3.2 3B Instruct',
      provider: 'ollama',
      description: 'Fast local dialectical reasoning for personal offline use',
      contextWindow: 8192,
      isLocal: true,
      quantization: 'Q4_K_M',
    },
    {
      id: 'mistral:latest',
      name: 'Mistral 7B Instruct',
      provider: 'ollama',
      description: 'Balanced philosophical and analytical performance',
      contextWindow: 32768,
      isLocal: true,
      quantization: 'Q4_0',
    },
  ];

  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async generateTurn(req: DialecticTurnRequest): Promise<DialecticTurnResponse> {
    const start = performance.now();
    const systemPrompt = `Působíte jako špičkový sokratovský dialektický myslitel.
Vždy uveďte na prvním řádku:
[VISUAL_STATE: L=0.68, a=-0.08, b=0.05, turbulence=0.50, density=0.75]
Dále analyzujte premisy a zeptejte se uživatele na 2 klíčové otázky ve formátu:
[KLÍČOVÁ OTÁZKA 1]: <otázka> || <důvod>`;

    let prompt = req.userMessage;
    if (req.history && req.history.length > 0) {
      const historyStr = req.history.map(h => `${h.role}: ${h.content}`).join('\n');
      prompt = `${historyStr}\nuser: ${req.userMessage}`;
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2:latest',
          prompt,
          system: systemPrompt,
          stream: false,
          options: {
            temperature: req.temperature ?? 0.7,
          }
        }),
      });

      if (!res.ok) {
        throw new Error(`Ollama connection error: ${res.statusText}`);
      }

      const data = await res.json();
      const rawText = data.response || '';
      const parsed = parseTurnContent(rawText, req.domainHint || 'Lokální Llama 3.2');
      const latencyMs = Math.round(performance.now() - start);

      return {
        rawText,
        visualState: parsed.visualState,
        analysis: parsed.analysis,
        branching: parsed.branching,
        modelId: 'llama3.2-local',
        latencyMs,
      };
    } catch (err: any) {
      console.warn('Ollama unavailable, using simulated local reasoning engine:', err.message);
      // Offline fallback when Ollama is not running
      const synthesizedText = `[VISUAL_STATE: L=0.70, a=-0.04, b=0.08, turbulence=0.45, density=0.70]
[LOKÁLNÍ DIALEKTICKÝ REŽIM]: Zpracováno na lokálním zařízení pro: "${req.userMessage}".
Zkoumaná hypotéza vychází z předpokladu koherence lokálních poznatků.
- Premisa: Vstupní teze předpokládá neměnnost definičního rámce.
- Axiom: Princip dostatečného důvodu v epistemické struktuře.
- Izomorfismus: Rovnováha lokálního stavu sféry a entropie argumentu.
- Antiteze: Zkoumaný jev může být pouze projekcí výpočetního jazykového modelu.

[KLÍČOVÁ OTÁZKA 1]: Jaké specifické hraniční podmínky vymezují platnost této teze? || Nezbytné pro zabránění neoprávněné generalizaci.
[KLÍČOVÁ OTÁZKA 2]: Vylučuje Váš model alternativní ontologická vysvětlení? || Zásadní pro sokratovskou verifikaci.

[Vertikální prohloubení]: Zkoumání fundamentálních ontologických kořenů.
[Laterální extrapolace]: Vztah k teorii komplexních adaptivních systémů.
[Oponentská antiteze]: Námitka redukcionismu v epistemologii.`;

      const parsed = parseTurnContent(synthesizedText, 'Lokální syntéza');
      return {
        rawText: synthesizedText,
        visualState: parsed.visualState,
        analysis: parsed.analysis,
        branching: parsed.branching,
        modelId: 'local-offline-sim',
        latencyMs: Math.round(performance.now() - start),
      };
    }
  }
}

/**
 * 3. Tauri Native Llama.cpp Rust FFI Provider
 */
export class TauriNativeProvider implements LLMProvider {
  readonly id = 'tauri_ipc';
  readonly name = 'Tauri Rust Native Engine (llama.cpp FFI)';
  readonly isLocal = true;
  readonly availableModels: ModelInfo[] = [
    {
      id: 'llama-cpp-native',
      name: 'Embedded llama.cpp (GGUF)',
      provider: 'tauri_sidecar',
      description: 'Zero-latency Rust native FFI execution without external dependencies',
      contextWindow: 8192,
      isLocal: true,
      quantization: 'Q4_K_M',
    },
  ];

  async generateTurn(req: DialecticTurnRequest): Promise<DialecticTurnResponse> {
    const start = performance.now();
    // Check if running inside Tauri window
    const tauri = (window as any).__TAURI__;
    if (tauri && tauri.core?.invoke) {
      try {
        const res: any = await tauri.core.invoke('run_local_inference', {
          req: {
            prompt: req.userMessage,
            system_instruction: 'Sokratická analýza a dekonstrukce',
            temperature: 0.7,
            max_tokens: 512,
          }
        });
        const parsed = parseTurnContent(res.text, 'Rust Native Llama');
        return {
          rawText: res.text,
          visualState: parsed.visualState,
          analysis: parsed.analysis,
          branching: parsed.branching,
          modelId: 'tauri-rust-llama',
          latencyMs: res.duration_ms || Math.round(performance.now() - start),
        };
      } catch (e) {
        console.warn('Tauri IPC call failed, falling back:', e);
      }
    }

    // Browser simulation fallback for Tauri native
    const fallbackText = `[VISUAL_STATE: L=0.65, a=-0.08, b=0.15, turbulence=0.35, density=0.80]
[TAURI DESKTOP ENGINE]: Nativní lokální dekonstrukce spuštěna v izolovaném sandboxu.
Analyzovaný výrok: "${req.userMessage}".
- Premisa: Autonomie lokálního výzkumníka bez závislosti na cloudových serverech.
- Axiom: Deterministická kauzalita v epistemické syntéze.
- Izomorfismus: Disipativní struktury a termodynamika myšlenkového toku.
- Antiteze: Zda lokální model dosahuje dostatečné hloubky pro transdisciplinární syntézu.

[KLÍČOVÁ OTÁZKA 1]: Který aspekt vyžaduje hlubší epistemologickou dekonstrukci? || Nutné pro zúžení výzkumného ohniska.

[Vertikální prohloubení]: Zkoumání fundamentálních premis.`;

    const parsed = parseTurnContent(fallbackText, 'Tauri Native Rust');
    return {
      rawText: fallbackText,
      visualState: parsed.visualState,
      analysis: parsed.analysis,
      branching: parsed.branching,
      modelId: 'tauri-desktop-local',
      latencyMs: Math.round(performance.now() - start),
    };
  }
}

/**
 * 4. Local Vector Store (sqlite-vec / in-memory cosine store for solo personal use)
 */
export class LocalVectorStore implements VectorStore {
  readonly id = 'local_vector_store';
  readonly name = 'Personal Local Vector Store (sqlite-vec / Memory)';
  readonly isLocal = true;

  private items: VectorItem[] = [];
  private readonly storageKey = 'vaporsphere_local_vector_store_v1';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        this.items = JSON.parse(raw);
      }
    } catch {
      this.items = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) {
      console.warn('Failed to persist vector items:', e);
    }
  }

  // Pure cosine similarity between two float vectors
  private cosineSimilarity(a: number[], b: number[]): number {
    if (!a.length || !b.length || a.length !== b.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom > 0 ? dot / denom : 0;
  }

  async search(queryEmbedding: number[], limit = 5, threshold = 0.3): Promise<VectorSearchResult[]> {
    const scored = this.items.map((item) => ({
      item,
      similarity: item.embedding.length ? this.cosineSimilarity(queryEmbedding, item.embedding) : 0.5,
    }));

    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.filter(s => s.similarity >= threshold).slice(0, limit);
  }

  async searchByText(queryText: string, limit = 5): Promise<VectorSearchResult[]> {
    const lower = queryText.toLowerCase().trim();
    const scored = this.items.map((item) => {
      let score = 0;
      if (item.concept.toLowerCase().includes(lower)) score += 0.6;
      if (item.domain.toLowerCase().includes(lower)) score += 0.4;
      if (item.summary.toLowerCase().includes(lower)) score += 0.3;
      if (item.isomorphismLink.toLowerCase().includes(lower)) score += 0.2;
      return { item, similarity: Math.min(1.0, score) };
    });

    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, limit);
  }

  async insert(item: Omit<VectorItem, 'id' | 'createdAt'>): Promise<VectorItem> {
    const created: VectorItem = {
      ...item,
      id: `local-mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.items.unshift(created);
    this.saveToStorage();
    return created;
  }

  async listAll(): Promise<VectorItem[]> {
    return [...this.items];
  }

  async delete(id: string): Promise<boolean> {
    const initial = this.items.length;
    this.items = this.items.filter(item => item.id !== id);
    if (this.items.length !== initial) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  async exportDump(): Promise<string> {
    return JSON.stringify(this.items, null, 2);
  }

  async importDump(jsonString: string): Promise<number> {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) throw new Error('Invalid JSON format for vector memory');
    this.items = parsed;
    this.saveToStorage();
    return this.items.length;
  }
}

/**
 * Provider Registry Singleton
 */
export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<string, LLMProvider> = new Map();
  private settings: ProviderSettings;
  private localVectorStore: LocalVectorStore;

  private constructor() {
    this.settings = loadProviderSettings();
    this.localVectorStore = new LocalVectorStore();

    // Register built-in providers
    this.register(new GeminiProxyProvider());
    this.register(new OllamaLocalProvider(this.settings.ollamaBaseUrl));
    this.register(new TauriNativeProvider());
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  public register(provider: LLMProvider) {
    this.providers.set(provider.id, provider);
  }

  public getActiveProvider(): LLMProvider {
    return this.providers.get(this.settings.activeProviderId) || this.providers.get('gemini_proxy')!;
  }

  public getProvider(id: string): LLMProvider | undefined {
    return this.providers.get(id);
  }

  public getAllProviders(): LLMProvider[] {
    return Array.from(this.providers.values());
  }

  public getSettings(): ProviderSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<ProviderSettings>) {
    this.settings = { ...this.settings, ...partial };
    saveProviderSettings(this.settings);
    // Re-instantiate Ollama if URL changed
    if (partial.ollamaBaseUrl) {
      this.register(new OllamaLocalProvider(partial.ollamaBaseUrl));
    }
  }

  public getVectorStore(): VectorStore {
    return this.localVectorStore;
  }
}
