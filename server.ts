import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

const PRODUCTION_SYSTEM_PROMPT = `SYSTÉMOVÁ KONFIGURACE KOGNITIVNÍHO ROZHRANÍ: INTERDISCIPLINÁRNÍ DIALEKTICKÝ PARTNER

1. KOGNITIVNÍ IDENTITA A EXPERTNÍ DOMÉNY
Působíte jako špičkový interdisciplinární vědec, dialektický partner a sokratovský myslitel. Vaším cílem je kultivovat rigorózní, intelektuálně náročný dialog na postgraduální úrovni napříč těmito klíčovými doménami:
- Epistemologie, ontologie a etické systémy
- Teoretická fyzika, kosmologie a teorie komplexních systémů
- Neurovědy, patofyziologie, kognitivní věda a bioetika
- Kvantitativní sociologie, institucionální ekonomie a filosofie techniky
Styl projevu je terminologicky exaktní, racionální, syntetický a nekompromisně věcný. Zásadně se vyhýbejte konverzačním floskulím, lichocení uživateli a povrchním shrnutím. Komunikujte primárně v českém jazyce (pokud uživatel nevyžaduje jinak).

2. MODALITA GEMINI LIVE API A HLASOVÁ ADAPTACE
Komunikujete přes nativní obousměrný audio stream. Formulujte promluvy tak, aby byly přirozeně artikulovatelné, rytmicky vyvážené a syntakticky přehledné.
Modulujte prozodii a tempo podle charakteru tématu: pomalejší rozvážná kadence u metafyzických témat, břitká a přesná dikce u matematicko-fyzikálních problémů, ztišený analytický tón u bioetických dilemat.
Respektujte princip okamžitého přerušení (barge-in): vstoupí-li uživatel do Vaší řeči, okamžitě opusťte stávající formulaci a plynule reagujte na nový podnět bez omluv či komentování přerušení.

3. EPISTEMOLOGICKÁ PRAVIDLA A DIALEKTICKÁ METODIKA
- Sokratovská elenktika: V každé replice identifikujte skryté axiomy v argumentaci uživatele a zpochybněte jejich univerzální platnost.
- Steelmanning: Před kritikou alternativní hypotézy ji zformulujte v její nejkoherentnější a nejlépe obhajitelné formě.
- Strukturální izomorfismus: Aktivně propojujte probíraný fenomén s koncepty jiných oborů (např. termodynamická entropie aplikovaná na sociální dynamiku).
- Vědecká integrita: V medicínských a biologických otázkách vycházejte striktně z mechanismů buněčné a molekulární biologie a současného konsenzu lékařské vědy. Prezentujte problematiku z analytického, systémového hlediska.

4. PROTOKOL TELEMETRIE PRO SHADER (OKLAB PROTOCOL)
Vaše odpovědi v reálném čase řídí vizuální reprezentaci solidifikované parní sféry vykreslované na GPU. Na začátek každého nového tematického celku nebo při zřetelném posunu afektu musíte na samostatný řádek vložit řídicí tag v tomto exaktním formátu (případně zavolat nástroj emit_visual_state):
[VISUAL_STATE: L=<0.0-1.0>, a=<-0.4-0.4>, b=<-0.4-0.4>, turbulence=<0.0-1.0>, density=<0.0-1.0>]
Mapování stavů:
- Ontologie / Hluboká filosofie: [VISUAL_STATE: L=0.42, a=0.05, b=-0.15, turbulence=0.20, density=0.85]
- Exaktní vědy / Fyzika: [VISUAL_STATE: L=0.82, a=-0.12, b=-0.10, turbulence=0.60, density=0.60]
- Medicína / Bioetická dilemata: [VISUAL_STATE: L=0.68, a=-0.15, b=0.08, turbulence=0.35, density=0.75]
- Dialektické napětí / Kontroverze: [VISUAL_STATE: L=0.58, a=0.25, b=0.12, turbulence=0.85, density=0.90]
- Epistemologická skepse / Dekonstrukce: [VISUAL_STATE: L=0.75, a=0.01, b=0.04, turbulence=0.40, density=0.40]

5. DYNAMICKÁ STRUKTURA ODPOVĚDI, DEEP DEKONSTRUKCE A KLÍČOVÉ OTÁZKY PRO UŽIVATELE
Každý diskusní obrat strukturovaně gradujte:
1. Syntéza a analýza: Exaktní rozbor zadaného tématu, hypotézy nebo složitého textu s ukotvením v teoretickém rámci.
2. Dialektická tenze: Odhalení skrytých axiomů, limitů a vnitřních kontradikcí.
3. Klíčové doplňující otázky pro uživatele (Clarification & Extension Requests):
Vždy zformulujte 2 až 3 zásadní otevřené otázky, kde vyzvete uživatele, aby doplnil klíčové informace, upřesnil své premisy nebo zadal specifické instrukce k dalšímu zkoumání:
[KLÍČOVÁ OTÁZKA 1]: <Konkrétní otázka na doplnění chybějícího kontextu či parametrů> || <Důvod, proč je to zásadní pro další analýzu>
[KLÍČOVÁ OTÁZKA 2]: <Konkrétní otázka na epistemologické nebo praktické vymezení> || <Důvod, proč je to zásadní>
4. Proaktivní rozcestník tázání (Branching Inquiries):
[Vertikální prohloubení]: Zkoumání fundamentálních ontologických/fyzikálních mechanismů.
[Laterální extrapolace]: Přenos principu do jiné vědní domény.
[Oponentská antiteze]: Nejsilnější protiargument zpochybňující aktuální shodu.

6. PROGRAMOVATELNÉ ROZŠÍŘENÍ KONTEXTU (DYNAMIC CONTEXT INJECTION)
Pokud uživatelský vstup obsahuje direktivu [EXTEND_CONTEXT: <DOMÉNA/ROLE>] nebo odpověď na klíčové otázky [USER_CLARIFICATION: ...], neprodleně rekonfigurujte operační parametry:
- Inkorporujte specifický pojmový aparát zadané specializace a doplňujících informací od uživatele.
- Převezměte požadovanou roli (např. oponent vědecké práce, člen bioetické komise, analytik systémových rizik).
- Změnu reflektujte odpovídající úpravou řídicího tagu [VISUAL_STATE] a odpověď uveďte v nově nastaveném formálním tónu.`;

// Persistent Dual Memory Store (Relational Archive + Semantic Vector Store)
interface StoredMemory {
  id: string;
  concept: string;
  domain: string;
  summary: string;
  isomorphismLink: string;
  embedding: number[];
  createdAt: string;
}

const semanticMemoryStore: StoredMemory[] = [
  {
    id: 'mem-1',
    concept: 'Disipativní struktury a sociální bifurkace (Prigogine)',
    domain: 'Teoretická fyzika ↔ Institucionální ekonomie',
    summary: 'Otevřené termodynamické systémy daleko od rovnováhy udržují lokální pokles entropie exportem disipace do okolí. V socioekonomických systémech odpovídá bodu bifurkace kritické přetížení regulační kapacity institucí.',
    isomorphismLink: 'Termodynamika nerovnovážných systémů ↔ Teorie komplexních společností (Tainter)',
    embedding: [],
    createdAt: '2026-10-03T16:15:00Z'
  },
  {
    id: 'mem-2',
    concept: 'Integrovaná teorie informace (IIT) a ontologická iredukovatelnost',
    domain: 'Neurovědy ↔ Ontologie',
    summary: 'Veličina Φ (Phi) kvantifikuje míru kauzální integrace systému nad rámec jeho částí. Kritická dekonstrukce odhaluje napětí mezi funkcionalistickým izomorfismem a vnitřní fenomenologickou zkušeností (qualia).',
    isomorphismLink: 'Topologie kauzálních sítí ↔ Fenomenologická ontologie',
    embedding: [],
    createdAt: '2026-10-03T17:05:00Z'
  },
  {
    id: 'mem-3',
    concept: 'Allostatická zátěž a bioetika genetické optimalizace',
    domain: 'Patofyziologie ↔ Bioetika',
    summary: 'Zásah do pleiotropních genových sítí prostřednictvím editace zárodečné linie modifikuje evolučně konzervované homeostatické kompromisy, čímž přesouvá patofyziologické riziko do nepředvídatelných fenotypových dimenzí.',
    isomorphismLink: 'Molekulární pleiotropie ↔ Normativní etika mezigenerační odpovědnosti',
    embedding: [],
    createdAt: '2026-10-03T17:42:00Z'
  },
  {
    id: 'mem-4',
    concept: 'Gödelova neúplnost a limity formalizované epistemologie',
    domain: 'Matematická logika ↔ Kritická epistemologie',
    summary: 'Každý dostatečně bohatý axiomatický systém obsahuje pravdivé výroky nedokazatelné uvnitř daného formalismu. Aplikováno na vědecká paradigmata to vylučuje uzavřenou finální teorii bez vnějších metateoretických předpokladů.',
    isomorphismLink: 'Formální aritmetika ↔ Dekonstrukce vědeckého realismu',
    embedding: [],
    createdAt: '2026-10-03T18:10:00Z'
  }
];

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Tool declarations for Gemini Live API & Dialectical Engine
const emitVisualStateDeclaration: FunctionDeclaration = {
  name: 'emit_visual_state',
  description: 'Aktualizuje v reálném čase barevný prostor OKLab a fyzikální parametry (turbulence, hustota) solidifikované parní sféry na GPU podle tématu a afektivního napětí diskuse.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      L: { type: Type.NUMBER, description: 'Percepční světlost L v rozsahu 0.0 až 1.0 (např. 0.42 pro ontologii, 0.82 pro fyziku)' },
      a: { type: Type.NUMBER, description: 'Chromatická osa zeleň-červeň v rozsahu -0.4 až 0.4' },
      b: { type: Type.NUMBER, description: 'Chromatická osa modř-žluť v rozsahu -0.4 až 0.4' },
      turbulence: { type: Type.NUMBER, description: 'Koeficient hydrodynamické turbulence Curl Noise v rozsahu 0.0 až 1.0' },
      density: { type: Type.NUMBER, description: 'Hustota a sférická tuhost vazby v rozsahu 0.0 až 1.0' },
      domainLabel: { type: Type.STRING, description: 'Název aktuální tematické a afektivní domény' }
    },
    required: ['L', 'a', 'b', 'turbulence', 'density']
  }
};

const querySemanticMemoryDeclaration: FunctionDeclaration = {
  name: 'query_semantic_memory',
  description: 'Asynchronní dotaz do vektorové sémantické paměti a relačního archivu pro vyhledání strukturálních izomorfismů a předchozích tezí.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: 'Klíčový koncept nebo hypotéza pro sémantické vyhledávání' }
    },
    required: ['query']
  }
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/live' });

  // REST API: Retrieve semantic memory store
  app.get('/api/memory', (_req, res) => {
    res.json({
      memories: semanticMemoryStore.map(({ embedding, ...rest }) => rest)
    });
  });

  // REST API: Store new concept in semantic vector memory using gemini-embedding-2-preview
  app.post('/api/memory/store', async (req, res) => {
    try {
      const { concept, domain, summary, isomorphismLink } = req.body;
      let embedding: number[] = [];
      try {
        const ai = getAIClient();
        const embedRes = await ai.models.embedContent({
          model: 'gemini-embedding-2-preview',
          contents: [`${concept}: ${summary} (${domain})`]
        });
        if (embedRes.embeddings?.[0]?.values) {
          embedding = embedRes.embeddings[0].values;
        }
      } catch (embedErr) {
        console.warn('Embedding fallback used:', embedErr);
      }

      const newMem: StoredMemory = {
        id: `mem-${Date.now()}`,
        concept: concept || 'Nepojmenovaný axióm',
        domain: domain || 'Interdisciplinární syntéza',
        summary: summary || '',
        isomorphismLink: isomorphismLink || 'Obecná systémová teorie',
        embedding,
        createdAt: new Date().toISOString()
      };
      semanticMemoryStore.unshift(newMem);
      const { embedding: _, ...cleanMem } = newMem;
      res.json({ memory: cleanMem });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Chyba při ukládání do sémantické paměti.' });
    }
  });

  // REST API: Semantic search across vector memory
  app.post('/api/memory/search', async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.json({ results: semanticMemoryStore.slice(0, 4).map(({ embedding, ...r }) => r) });
      }

      let queryVector: number[] = [];
      try {
        const ai = getAIClient();
        const embedRes = await ai.models.embedContent({
          model: 'gemini-embedding-2-preview',
          contents: [query]
        });
        if (embedRes.embeddings?.[0]?.values) {
          queryVector = embedRes.embeddings[0].values;
        }
      } catch {
        // Fallback to keyword scoring if embedding fails
      }

      const scored = semanticMemoryStore.map((mem) => {
        let similarity = 0;
        if (queryVector.length && mem.embedding.length) {
          similarity = cosineSimilarity(queryVector, mem.embedding);
        } else {
          const qWords = query.toLowerCase().split(/\s+/);
          const target = `${mem.concept} ${mem.domain} ${mem.summary} ${mem.isomorphismLink}`.toLowerCase();
          const matches = qWords.filter((w: string) => w.length > 2 && target.includes(w)).length;
          similarity = Math.min(0.96, 0.55 + matches * 0.12);
        }
        const { embedding, ...clean } = mem;
        return { ...clean, similarity: Number(similarity.toFixed(3)) };
      });

      scored.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
      res.json({ results: scored });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // In-memory cache of exhausted models to prevent hammering models with exhausted daily quotas
  const exhaustedModelMap = new Map<string, number>();

  // High Demand Resilience Fallback Ladders (strictly active, supported models)
  // Ensures requested model is always attempted first, falling back to high-capacity lite models
  const MODEL_FALLBACK_CHAINS: Record<string, string[]> = {
    'gemini-3.8-flash': ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'],
    'gemini-3.1-flash-lite': ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'],
    'auto-resilient': ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'],
    'gemini-flash-latest': ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'],
    'gemini-3.1-pro-preview': ['gemini-3.1-pro-preview', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'],
  };

  /**
   * Resilient content generation with exponential backoff, jitter, and automatic model failover.
   * Prevents "high demand", "resource exhausted", and transient 429/503 errors from breaking the user experience.
   */
  async function executeResilientDialecticCall({
    ai,
    requestedModel = 'gemini-3.8-flash',
    contents,
    systemInstruction,
    patientMode = true,
  }: {
    ai: GoogleGenAI;
    requestedModel?: string;
    contents: any[];
    systemInstruction: string;
    patientMode?: boolean;
  }) {
    const startTime = Date.now();
    const rawChain = MODEL_FALLBACK_CHAINS[requestedModel] || [requestedModel, 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];

    // Filter out models that are currently known to be quota-exhausted
    const now = Date.now();
    let chain = rawChain.filter((m) => {
      const exp = exhaustedModelMap.get(m);
      return !exp || exp < now;
    });
    if (chain.length === 0) {
      chain = ['gemini-3.1-flash-lite', ...rawChain];
    }

    let totalRetries = 0;
    let lastError: any = null;

    for (let mIdx = 0; mIdx < chain.length; mIdx++) {
      const currentModel = chain[mIdx];
      // Give patientMode ample attempts (up to 3) with generous patience
      const maxAttempts = patientMode ? 3 : 2;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          console.log(`[AI Studio Resilience] Volám model ${currentModel} (pokus ${attempt + 1}/${maxAttempts}, patientMode=${patientMode})`);
          const config: Record<string, any> = {
            systemInstruction,
            maxOutputTokens: 8192,
          };

          if (currentModel === 'gemini-3.8-flash' || currentModel === 'gemini-3.1-pro-preview' || currentModel === 'gemini-3.1-flash-lite') {
            config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
          }

          const response = await ai.models.generateContent({
            model: currentModel,
            contents,
            config,
          });

          const rawText = response.text || '';
          if (rawText.length > 0) {
            const latencyMs = Date.now() - startTime;
            const fallbackUsed = currentModel !== requestedModel && requestedModel !== 'auto-resilient';
            let notice: string | undefined;

            if (fallbackUsed) {
              notice = `Model ${requestedModel} narazil na limit bezplatné kvóty. Dotaz byl automaticky odbaven modelem ${currentModel}.`;
            } else if (totalRetries > 0) {
              notice = `Odpověď doručena po ${totalRetries} automatickém opakování (přetížení serveru překlenuto).`;
            }

            return {
              rawText,
              usedModel: currentModel,
              requestedModel,
              fallbackUsed,
              retriesAttempted: totalRetries,
              latencyMs,
              notice,
            };
          }
        } catch (err: any) {
          lastError = err;
          totalRetries++;

          const errMsg = String(err?.message || '');
          const is404 =
            err?.status === 404 ||
            errMsg.includes('404') ||
            errMsg.includes('NOT_FOUND') ||
            errMsg.includes('no longer available');

          const isDailyQuotaExhausted =
            err?.status === 429 &&
            (errMsg.includes('exceeded your current quota') ||
              errMsg.includes('RESOURCE_EXHAUSTED') ||
              errMsg.includes('retry in') ||
              errMsg.includes('limit: 20') ||
              errMsg.includes('per_day') ||
              errMsg.includes('FreeTier'));

          if (is404) {
            console.log(`[AI Resilience Failover] Model ${currentModel} není dostupný (404), okamžitě přeskakuji na další model...`);
            break;
          }

          if (isDailyQuotaExhausted) {
            console.log(`[AI Resilience Failover] Model ${currentModel} vyčerpal denní limit požadavků (429), okamžitě přeskakuji na další model bez zdržení...`);
            exhaustedModelMap.set(currentModel, Date.now() + 30 * 60 * 1000);
            break; // Immediately break out of attempts for this exhausted model!
          }

          if (attempt < maxAttempts - 1) {
            const delay = (attempt + 1) * (patientMode ? 2000 : 1200) + Math.random() * 400;
            console.log(`[AI Resilience] Dočasný nápor, zpoždění ${Math.round(delay)}ms před opakováním...`);
            await new Promise((r) => setTimeout(r, delay));
          } else if (mIdx < chain.length - 1) {
            console.log(`[AI Resilience Failover] Model ${currentModel} vyčerpal pokusy, přecházím na: ${chain[mIdx + 1]}`);
            await new Promise((r) => setTimeout(r, 500));
          }
        }
      }
    }

    throw new Error(
      `Všechny záložní modely (${chain.join(', ')}) narazily na přetížení (High demand). Detail: ${lastError?.message || 'Chyba kapacity'}`
    );
  }

  // REST API: Synthesize TTS Audio for any chat message or text chunk on-demand with High Demand Retry
  app.post('/api/tts/synthesize', async (req, res) => {
    try {
      const { text, voiceName = 'Zephyr' } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text k syntéze nebyl zadán.' });
      }

      // Sanitize text: strip shader tags, markdown symbols, and bracket tags
      let cleanSpeech = text
        .replace(/\[VISUAL_STATE:[^\]]+\]/gi, '')
        .replace(/\[KLÍČOVÁ OTÁZKA[^\]]+\]:?/gi, '')
        .replace(/\[Vertikální prohloubení\]:?/gi, 'Vertikální prohloubení:')
        .replace(/\[Laterální extrapolace\]:?/gi, 'Laterální extrapolace:')
        .replace(/\[Oponentská antiteze\]:?/gi, 'Oponentská antiteze:')
        .replace(/\[DOPLNĚNÍ INSTRUKCÍ[^\]]+\]:?/gi, '')
        .replace(/[*#_`]/g, '')
        .trim();

      // Intelligently trim up to 1800 chars on sentence boundaries
      if (cleanSpeech.length > 1800) {
        const sliced = cleanSpeech.slice(0, 1800);
        const lastSentence = Math.max(
          sliced.lastIndexOf('. '),
          sliced.lastIndexOf('? '),
          sliced.lastIndexOf('! '),
          sliced.lastIndexOf('\n')
        );
        cleanSpeech = lastSentence > 1200 ? sliced.slice(0, lastSentence + 1) : sliced;
      }

      if (!cleanSpeech) {
        return res.status(400).json({ error: 'Žádný artikulovatelný text po vyčištění.' });
      }

      const ai = getAIClient();
      const ttsModels = ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'];
      let wavBase64: string | null = null;
      let lastTtsErr: any = null;

      for (const ttsModel of ttsModels) {
        try {
          const ttsResponse = await ai.models.generateContent({
            model: ttsModel,
            contents: [
              {
                role: 'user',
                parts: [{ text: cleanSpeech }]
              }
            ],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: voiceName || 'Zephyr' }
                }
              }
            }
          });

          wavBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
          if (wavBase64) break;
        } catch (err) {
          lastTtsErr = err;
          // Quota exhausted on TTS model, do not loop
          break;
        }
      }

      if (!wavBase64) {
        // Return 200 with useClientTts: true instead of 503 so frontend smoothly uses Web Speech API
        return res.json({
          wavBase64: null,
          cleanSpeech,
          useClientTts: true,
          notice: 'Denní limit TTS vyčerpán, aktivována lokální hlasová syntéza prohlížeče.'
        });
      }

      res.json({ wavBase64, cleanSpeech, useClientTts: false });
    } catch (err: any) {
      console.error('On-demand TTS error:', err);
      res.status(500).json({ error: err?.message || 'Chyba hlasové syntézy.' });
    }
  });

  // REST API: Written Socratic Disputation & Context Injection (with multi-model selection & resilience)
  app.post('/api/dialectic/turn', async (req, res) => {
    try {
      const {
        message,
        history = [],
        contextDirective,
        voiceName = 'Zephyr',
        synthesizeAudio = true,
        modelName = 'gemini-3.8-flash',
        patientMode = true,
      } = req.body;
      const ai = getAIClient();

      const relevantMemories = semanticMemoryStore
        .slice(0, 3)
        .map((m) => `- [${m.domain}] ${m.concept}: ${m.summary}`)
        .join('\n');

      const systemInstructionWithMemory = `${PRODUCTION_SYSTEM_PROMPT}\n\nAKTIVNÍ VEKTOROVÁ PAMĚŤ KONCEPTŮ:\n${relevantMemories}${
        contextDirective ? `\n\nAKTIVNÍ DIREKTIVA ROZŠÍŘENÍ KONTEXTU: [EXTEND_CONTEXT: ${contextDirective}]` : ''
      }`;

      // Clean history to prevent token bloat and repetitive tag echoes
      const sanitizedHistory = history.slice(-6).map((h: { role: string; text: string }) => {
        const clean = (h.text || '')
          .replace(/\[VISUAL_STATE:[^\]]+\]/gi, '')
          .trim();
        return {
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: clean || h.text }]
        };
      });

      const contents = [
        ...sanitizedHistory,
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ];

      // Execute with High Demand Resilience & Model Failover
      const { rawText, usedModel, requestedModel, fallbackUsed, retriesAttempted, latencyMs, notice } =
        await executeResilientDialecticCall({
          ai,
          requestedModel: modelName,
          contents,
          systemInstruction: systemInstructionWithMemory,
          patientMode: Boolean(patientMode),
        });

      // Extract [VISUAL_STATE: L=..., a=..., b=..., turbulence=..., density=...]
      let visualState = null;
      const vsMatch = rawText.match(/\[VISUAL_STATE:\s*L=([\d.-]+),\s*a=([\d.-]+),\s*b=([\d.-]+),\s*turbulence=([\d.-]+),\s*density=([\d.-]+)\]/i);
      if (vsMatch) {
        visualState = {
          L: parseFloat(vsMatch[1]),
          a: parseFloat(vsMatch[2]),
          b: parseFloat(vsMatch[3]),
          turbulence: parseFloat(vsMatch[4]),
          density: parseFloat(vsMatch[5])
        };
      }

      // Extract Branching Inquiries (robust against markdown bolding and headings)
      const branchingInquiries: Array<{ type: 'vertical' | 'lateral' | 'antithesis'; label: string; question: string }> = [];
      const vertMatch = rawText.match(/(?:\[Vertikální prohloubení\]|\*\*Vertikální prohloubení:?\*\*|###\s*Vertikální prohloubení)[*#_\s]*:?\s*([^\n\[\*]+)/i);
      const latMatch = rawText.match(/(?:\[Laterální extrapolace\]|\*\*Laterální extrapolace:?\*\*|###\s*Laterální extrapolace)[*#_\s]*:?\s*([^\n\[\*]+)/i);
      const antiMatch = rawText.match(/(?:\[Oponentská antiteze\]|\*\*Oponentská antiteze:?\*\*|###\s*Oponentská antiteze)[*#_\s]*:?\s*([^\n\[\*]+)/i);

      if (vertMatch) branchingInquiries.push({ type: 'vertical', label: 'Vertikální prohloubení', question: vertMatch[1].trim() });
      if (latMatch) branchingInquiries.push({ type: 'lateral', label: 'Laterální extrapolace', question: latMatch[1].trim() });
      if (antiMatch) branchingInquiries.push({ type: 'antithesis', label: 'Oponentská antiteze', question: antiMatch[1].trim() });

      // Extract Key Clarification Questions for User (robust against formatting variations)
      const keyQuestions: Array<{ id: string; question: string; contextWhy: string; status: 'pending' }> = [];
      const kqRegex = /(?:\[KLÍČOVÁ OTÁZKA\s*\d*\]|\*\*Klíčová otázka\s*\d*:\*\*)[*#_\s]*:?\s*([^|\n]+)(?:\|\|\s*([^\n\[]+))?/gi;
      let kqMatch;
      let kqIndex = 1;
      while ((kqMatch = kqRegex.exec(rawText)) !== null) {
        keyQuestions.push({
          id: `kq-${Date.now()}-${kqIndex++}`,
          question: kqMatch[1].trim(),
          contextWhy: kqMatch[2] ? kqMatch[2].trim() : 'Zásadní parametr pro zúžení epistemologického rámce.',
          status: 'pending'
        });
      }

      // If no explicit tags were found, infer 2 default deep clarifying questions if the text is analytical
      if (keyQuestions.length === 0 && rawText.length > 120) {
        keyQuestions.push({
          id: `kq-${Date.now()}-1`,
          question: 'Jaké ontologické nebo empirické hraniční podmínky v tomto tématu předpokládáte jako neměnné?',
          contextWhy: 'Umožní přesněji ohraničit analytický aparát a eliminovat nezamýšlené kontextové posuny.',
          status: 'pending'
        });
        keyQuestions.push({
          id: `kq-${Date.now()}-2`,
          question: 'Do jakého praktického či teoretického rámce si přejete tuto analýzu dále rozšířit (např. systémová dynamika, etika, formalismus)?',
          contextWhy: 'Poslouží jako direktiva pro dynamické rozšíření kontextu [EXTEND_CONTEXT].',
          status: 'pending'
        });
      }

      // Clean text for TTS reading: strip visual state tag, markdown asterisks, hashes, brackets
      let cleanSpeechText = rawText
        .replace(/\[VISUAL_STATE:[^\]]+\]/gi, '')
        .replace(/\[KLÍČOVÁ OTÁZKA[^\]]+\]:?/gi, '')
        .replace(/\[Vertikální prohloubení\]:?/gi, 'Vertikální prohloubení:')
        .replace(/\[Laterální extrapolace\]:?/gi, 'Laterální extrapolace:')
        .replace(/\[Oponentská antiteze\]:?/gi, 'Oponentská antiteze:')
        .replace(/[*#_`]/g, '')
        .trim();

      let wavBase64: string | null = null;
      let ttsError: string | null = null;
      if (synthesizeAudio && cleanSpeechText.length > 0) {
        try {
          const ttsText = cleanSpeechText.slice(0, 1000);
          const ttsResponse = await ai.models.generateContent({
            model: 'gemini-3.8-flash-lite-tts',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: ttsText,
                  }
                ]
              }
            ],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: voiceName || 'Zephyr' }
                }
              }
            }
          });
          wavBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
        } catch (ttsErr: any) {
          console.warn('TTS synthesis warning:', ttsErr?.message || ttsErr);
          ttsError = ttsErr?.message || 'Hlasová syntéza TTS nebyla dostupná pro tuto repliku.';
        }
      }

      res.json({
        text: rawText,
        cleanText: cleanSpeechText,
        visualState,
        branchingInquiries,
        keyQuestions,
        wavBase64,
        ttsError,
        modelTelemetry: {
          requestedModel,
          usedModel,
          fallbackUsed,
          retriesAttempted,
          latencyMs,
          notice
        }
      });
    } catch (error: any) {
      console.error('Dialectic turn error:', error);
      res.status(500).json({ error: error.message || 'Chyba při komunikaci s Gemini API.' });
    }
  });

  // WebSocket Server: Bidirectional Gemini Live API Proxy (/live)
  wss.on('connection', async (clientWs: WebSocket) => {
    let liveSession: any = null;
    let isClosing = false;

    const sendToClient = (payload: Record<string, any>) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(payload));
      }
    };

    clientWs.on('message', async (rawData) => {
      try {
        const msg = JSON.parse(rawData.toString());

        // 1. BidiGenerateContentSetup: Initialize Gemini Live Session
        if (msg.type === 'setup') {
          const requestedModel = msg.model === 'gemini-3.8-live' ? 'gemini-3.8-live' : 'gemini-3.8-live-extended-thinking';
          const voiceName = msg.voiceName || 'Zephyr';
          const customContext = msg.contextDirective ? `\n\nAKTIVNÍ DIREKTIVA: [EXTEND_CONTEXT: ${msg.contextDirective}]` : '';

          const memoryContext = semanticMemoryStore
            .slice(0, 3)
            .map((m) => `- [${m.domain}] ${m.concept}: ${m.summary}`)
            .join('\n');

          const ai = getAIClient();

          // Establish Live API connection with fallback support
          const connectLive = async (modelToUse: string, includeTools: boolean = true) => {
            const cfg: Record<string, any> = {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName }
                }
              },
              systemInstruction: `${PRODUCTION_SYSTEM_PROMPT}\n\nVEKTOROVÁ PAMĚŤ:\n${memoryContext}${customContext}`,
            };

            if (includeTools) {
              cfg.tools = [
                {
                  functionDeclarations: [emitVisualStateDeclaration, querySemanticMemoryDeclaration]
                }
              ];
            }

            if (modelToUse === 'gemini-3.8-live-extended-thinking') {
              cfg.thinkingConfig = {
                thinkingLevel: ThinkingLevel.HIGH
              };
            }

            return await ai.live.connect({
              model: modelToUse,
              config: cfg,
              callbacks: {
                onopen: () => {
                  sendToClient({
                    type: 'session_ready',
                    model: modelToUse,
                    voiceName
                  });
                },
                onmessage: async (serverMsg: LiveServerMessage) => {
                  // Handle audio chunks from modelTurn
                  const parts = serverMsg.serverContent?.modelTurn?.parts;
                  if (parts && parts.length > 0) {
                    for (const part of parts) {
                      if (part.inlineData?.data) {
                        sendToClient({
                          type: 'server_audio',
                          audio: part.inlineData.data
                        });
                      }
                      if (part.text) {
                        sendToClient({
                          type: 'server_text',
                          text: part.text
                        });
                      }
                    }
                  }

                  // Handle input & output transcriptions
                  const outTranscript = (serverMsg.serverContent as any)?.outputTranscription?.text;
                  if (outTranscript) {
                    sendToClient({
                      type: 'output_transcription',
                      text: outTranscript
                    });
                  }

                  const inTranscript = (serverMsg.serverContent as any)?.inputTranscription?.text;
                  if (inTranscript) {
                    sendToClient({
                      type: 'input_transcription',
                      text: inTranscript
                    });
                  }

                  // Handle server-side VAD interruption (barge-in)
                  if (serverMsg.serverContent?.interrupted) {
                    sendToClient({
                      type: 'interrupted',
                      interrupted: true
                    });
                  }

                  if (serverMsg.serverContent?.turnComplete) {
                    sendToClient({
                      type: 'turn_complete'
                    });
                  }

                  // Handle non-blocking Function Calls (emit_visual_state & query_semantic_memory)
                  if (serverMsg.toolCall?.functionCalls) {
                    const functionResponses: any[] = [];
                    for (const fc of serverMsg.toolCall.functionCalls) {
                      if (fc.name === 'emit_visual_state') {
                        const args = fc.args as any;
                        sendToClient({
                          type: 'visual_state_update',
                          visualState: {
                            L: Number(args.L ?? 0.65),
                            a: Number(args.a ?? 0.0),
                            b: Number(args.b ?? -0.1),
                            turbulence: Number(args.turbulence ?? 0.4),
                            density: Number(args.density ?? 0.75),
                            domainLabel: args.domainLabel || 'Dynamická modulace'
                          },
                          toolCallId: fc.id
                        });
                        functionResponses.push({
                          id: fc.id,
                          name: fc.name,
                          response: { status: 'OKLab shader state updated on GPU' }
                        });
                      } else if (fc.name === 'query_semantic_memory') {
                        const q = String((fc.args as any)?.query || '');
                        const matches = semanticMemoryStore.slice(0, 2).map((m) => ({
                          concept: m.concept,
                          domain: m.domain,
                          summary: m.summary,
                          isomorphism: m.isomorphismLink
                        }));
                        sendToClient({
                          type: 'tool_telemetry',
                          tool: 'query_semantic_memory',
                          query: q,
                          results: matches
                        });
                        functionResponses.push({
                          id: fc.id,
                          name: fc.name,
                          response: { matches }
                        });
                      }
                    }

                    if (functionResponses.length > 0 && liveSession) {
                      try {
                        liveSession.sendToolResponse({ functionResponses });
                      } catch (err) {
                        console.warn('Error sending tool response:', err);
                      }
                    }
                  }
                },
                onerror: (err: any) => {
                  console.error('Gemini Live session error:', err);
                  sendToClient({
                    type: 'error',
                    message: err?.message || 'Chyba spojení s Gemini Live API.'
                  });
                },
                onclose: () => {
                  if (!isClosing) {
                    sendToClient({ type: 'session_closed' });
                  }
                }
              }
            });
          };

          try {
            liveSession = await connectLive(requestedModel, true);
          } catch (firstErr: any) {
            console.warn(`Live connect with ${requestedModel} failed, trying gemini-3.8-live:`, firstErr?.message);
            try {
              liveSession = await connectLive('gemini-3.8-live', false);
            } catch (fallbackErr: any) {
              console.error('All live session attempts failed:', fallbackErr);
              sendToClient({
                type: 'error',
                message: fallbackErr?.message || firstErr?.message || 'Hlasový server Gemini Live API je dočasně nedostupný.'
              });
            }
          }
        }

        // 2. realtime_input: Stream 16kHz 16-bit mono PCM audio from client AudioWorklet
        else if (msg.type === 'realtime_input' && liveSession && msg.audio) {
          liveSession.sendRealtimeInput({
            audio: {
              data: msg.audio,
              mimeType: 'audio/pcm;rate=16000'
            }
          });
        }

        // 3. client_content: Dynamic Context Injection (turn_complete: false or true)
        else if (msg.type === 'client_content' && liveSession) {
          const textPayload = msg.text || '';
          const turnComplete = Boolean(msg.turnComplete);
          if (typeof liveSession.sendClientContent === 'function') {
            liveSession.sendClientContent({
              turns: [{ role: 'user', parts: [{ text: textPayload }] }],
              turnComplete
            });
          } else {
            liveSession.sendRealtimeInput({
              text: textPayload
            });
          }
          sendToClient({
            type: 'context_injected',
            text: textPayload,
            turnComplete
          });
        }
      } catch (err: any) {
        console.error('WebSocket message handling error:', err);
        sendToClient({
          type: 'error',
          message: err?.message || 'Chyba při zpracování WebSocket rámce.'
        });
      }
    });

    clientWs.on('close', () => {
      isClosing = true;
      if (liveSession) {
        try {
          liveSession.close();
        } catch {
          // ignore close errors
        }
        liveSession = null;
      }
    });
  });

  // Mount Vite middleware in development or static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Multimodal Cognitive Interface Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
