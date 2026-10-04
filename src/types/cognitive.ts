export interface VisualState {
  L: number;          // Lightness: 0.0 - 1.0
  a: number;          // Green-Red axis: -0.4 - 0.4
  b: number;          // Blue-Yellow axis: -0.4 - 0.4
  turbulence: number; // Curl noise turbulence mu: 0.0 - 1.0
  density: number;    // Radial density sigma & stiffness k: 0.0 - 1.0
  domainLabel?: string;
}

export interface DomainProfile {
  id: string;
  name: string;
  subtitle: string;
  state: VisualState;
  chroma: number;
  hueDeg: number;
  visualBehavior: string;
  acousticResponse: string;
  sampleHypothesis: string;
}

export const DOMAIN_PROFILES: DomainProfile[] = [
  {
    id: 'ontology',
    name: 'Ontologie a hluboká metafyzika',
    subtitle: '285° Hluboké indigo',
    state: { L: 0.42, a: 0.05, b: -0.15, turbulence: 0.20, density: 0.85, domainLabel: 'Ontologie a hluboká metafyzika' },
    chroma: 0.12,
    hueDeg: 285,
    visualBehavior: 'Vysoká hustota jádra, potlačená vnější turbulence, laminární vnitřní rotace filamentů.',
    acousticResponse: 'Pomalé radiální dýchání modulované sub-basy; minimální rozptyl mikrozrn.',
    sampleHypothesis: 'Vědomí není emergentní vlastností komplexní výpočetní sítě, nýbrž fundamentální ontologickou kategorií iredukovatelnou na fyzikalistický popis.'
  },
  {
    id: 'physics',
    name: 'Exaktní vědy a teoretická fyzika',
    subtitle: '190° Krystalický azur',
    state: { L: 0.82, a: -0.12, b: -0.10, turbulence: 0.60, density: 0.60, domainLabel: 'Exaktní vědy a teoretická fyzika' },
    chroma: 0.15,
    hueDeg: 190,
    visualBehavior: 'Ostré partikulární shluky, vysoká koherence obvodové krusty, zřetelná zrnitost páry.',
    acousticResponse: 'Citlivost na středové formanty; sykavky vyvolávají jiskřivou interferenci na povrchu.',
    sampleHypothesis: 'Šipka času a makroskopická ireverzibilita jsou pouze důsledkem nízké entropie počátečního hraničního stavu vesmíru, nikoliv fundamentální asymetrie dynamických zákonů.'
  },
  {
    id: 'bioethics',
    name: 'Medicína a bioetická dilemata',
    subtitle: '145° → 35° Smaragd / Jantar',
    state: { L: 0.68, a: -0.15, b: 0.08, turbulence: 0.35, density: 0.75, domainLabel: 'Medicína a bioetická dilemata' },
    chroma: 0.18,
    hueDeg: 145,
    visualBehavior: 'Pulzující organické filamenty; plynulý přechod do teplého jantaru při etickém napětí.',
    acousticResponse: 'Rytmické modulace základního poloměru R0 kopírující kadenci a intonaci hlasu.',
    sampleHypothesis: 'Editace zárodečné linie pomocí CRISPR-Cas9 za účelem eliminace polygenních predispozic k neurodegenerativním chorobám narušuje princip druhové autonomie.'
  },
  {
    id: 'socioeconomics',
    name: 'Socioekonomie a institucionální teorie',
    subtitle: '15° ↔ 240° Terakota / Kobalt',
    state: { L: 0.58, a: 0.25, b: 0.12, turbulence: 0.85, density: 0.90, domainLabel: 'Dialektické napětí / Socioekonomie' },
    chroma: 0.22,
    hueDeg: 15,
    visualBehavior: 'Bipolární gradienty tvořící protiběžné víry; separace hustoty mezi póly sféry.',
    acousticResponse: 'Asymetrické vlnění generované dynamickým rozsahem vokálního projevu.',
    sampleHypothesis: 'Komplexní institucionální hierarchie podléhají klesajícím mezním výnosům z investic do řešení problémů, což deterministicky vede k bifurkaci a systémovému kolapsu.'
  },
  {
    id: 'epistemology',
    name: 'Kritická epistemologie a dekonstrukce',
    subtitle: '85° Bledá platina',
    state: { L: 0.75, a: 0.01, b: 0.04, turbulence: 0.40, density: 0.40, domainLabel: 'Kritická epistemologie a dekonstrukce' },
    chroma: 0.08,
    hueDeg: 85,
    visualBehavior: 'Dočasný rozpad koherentní sféry do difuzního mlžného mračna; vysoká transparence.',
    acousticResponse: 'Rozpínání mračna do prostoru při formulaci otevřených otázek a paradoxů.',
    sampleHypothesis: 'Každé vědecké paradigma obsahuje neformální metajazykové předpoklady, které nelze verifikovat ani falzifikovat uvnitř jeho vlastního axiomatického aparátu.'
  }
];

export interface BranchingInquiry {
  type: 'vertical' | 'lateral' | 'antithesis';
  label: string;
  question: string;
}

export interface KeyClarificationQuestion {
  id: string;
  question: string;
  contextWhy: string;
  userAnswer?: string;
  status?: 'pending' | 'answered' | 'skipped';
}

export interface DeepAnalysisData {
  topicTitle: string;
  corePremises: string[];
  hiddenAxioms: string[];
  structuralIsomorphisms: string[];
  counterTheses: string[];
  keyQuestions: KeyClarificationQuestion[];
}

export interface TranscriptEntry {
  id: string;
  timestamp: string;
  role: 'user' | 'model' | 'system' | 'tool';
  text: string;
  visualState?: VisualState;
  branchingInquiries?: BranchingInquiry[];
  deepAnalysis?: DeepAnalysisData;
  contextDirective?: string;
  wavBase64?: string;
  audioLoading?: boolean;
  isPlaying?: boolean;
  modelTelemetry?: ModelTelemetry;
}

export interface ModelTelemetry {
  requestedModel: string;
  usedModel: string;
  fallbackUsed: boolean;
  retriesAttempted?: number;
  latencyMs?: number;
  notice?: string;
}

export interface MemoryConcept {
  id: string;
  concept: string;
  domain: string;
  summary: string;
  similarity?: number;
  createdAt: string;
  isomorphismLink?: string;
}

export interface AudioSpectrumMetrics {
  lowBand: number;    // 0 - 250 Hz (Fundamental pitch & vocal energy -> modulates R0 & k)
  midBand: number;    // 250 - 2500 Hz (Formant frequencies -> modulates curl turbulence mu)
  highBand: number;   // 2500 - 12000 Hz (Sibilants & transients -> stochastic vertex jitter)
  rmsInput: number;   // Client mic RMS for local VAD barge-in
  rmsOutput: number;  // Model output RMS
  bargeInActive: boolean;
}

export type TextModelType =
  | 'gemini-3.8-flash'
  | 'gemini-3.1-flash-lite'
  | 'gemini-flash-latest'
  | 'gemini-3.1-pro-preview'
  | 'auto-resilient';

export type SessionModelType = 'gemini-3.8-live-extended-thinking' | 'gemini-3.8-live';
export type VoicePersona = 'Zephyr' | 'Fenrir' | 'Kore' | 'Charon' | 'Puck';

// Research Case / Topic History Architecture
export interface ResearchCase {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  domainId: string;
  domainName: string;
  hypothesis: string;
  summary?: string;
  tags: string[];
  transcripts: TranscriptEntry[];
  visualState: VisualState;
  isPinned?: boolean;
  status: 'active' | 'completed' | 'archived';
}

// User Subscription & Service Mesh Plans
export type UserPlanTier = 'free' | 'pro' | 'unlimited' | 'admin';

export interface PlanFeature {
  name: string;
  free: string | boolean;
  pro: string | boolean;
  unlimited: string | boolean;
  admin: string | boolean;
  description: string;
}

// Languages Supported (Default English + Czech + Most widely used)
export type LanguageCode = 'en' | 'cs' | 'es' | 'de' | 'fr' | 'ja' | 'zh' | 'ar' | 'pt';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  flag: string;
  direction?: 'ltr' | 'rtl';
}

export interface UserPersonalization {
  themeAccent: 'cyan' | 'emerald' | 'amber' | 'violet' | 'rose';
  dialecticRigour: 'academic' | 'socratic' | 'peer_review' | 'accessible';
  ambientAudio: boolean;
  ambientVolume: number;
  language: LanguageCode;
  userPlan: UserPlanTier;
  hasSeenWelcome: boolean;
  hasSeenTour: boolean;
  dailyUsageCount: number;
}
