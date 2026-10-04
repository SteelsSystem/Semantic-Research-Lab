import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  Volume2,
  Send,
  Search,
  Plus,
  RotateCcw,
  Sliders,
  BookOpen,
  Compass,
  Waves,
  Play,
  Square,
  Loader2,
  Cloud,
  Server,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Clock,
  Globe,
  Sparkles,
  Palette,
  CreditCard,
  FileText,
  Maximize2,
  Minimize2,
  Filter,
  PanelLeftClose,
  PanelLeftOpen,
  Columns
} from 'lucide-react';
import {
  AudioSpectrumMetrics,
  BranchingInquiry,
  DOMAIN_PROFILES,
  DomainProfile,
  MemoryConcept,
  ModelTelemetry,
  SessionModelType,
  TextModelType,
  TranscriptEntry,
  VisualState,
  VoicePersona,
  LanguageCode,
  ResearchCase,
  UserPersonalization,
  UserPlanTier
} from './types/cognitive';
import { DuplexAudioEngine } from './utils/audioEngine';
import { VaporSphereViewport } from './components/VaporSphereViewport';
import { oklabToHex, oklabToOklch } from './utils/oklab';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from './utils/i18n';
import { CaseManager } from './utils/caseManager';
import { EntryHubModal } from './components/EntryHubModal';
import { TopicsCaseBar } from './components/TopicsCaseBar';
import { PersonalisationTour } from './components/PersonalisationTour';
import { SubscriptionModal } from './components/SubscriptionModal';
import { DocumentationView } from './components/DocumentationView';
import { VoicePttController } from './components/VoicePttController';

const INITIAL_TRANSCRIPTS: TranscriptEntry[] = [
  {
    id: 'init-1',
    timestamp: '18:40:00',
    role: 'model',
    text: '[VISUAL_STATE: L=0.42, a=0.05, b=-0.15, turbulence=0.20, density=0.85]\nKognitivní rozhraní je inicializováno v režimu interdisciplinární sokratovské elenktiky. Částicové pole solidifikované páry je ukotveno pomocí ortogonální tangenciální projekce rychlostního pole Curl Noise a nelineárního radiálního stabilizátoru tanh. Předložte axiomatickou tezi nebo zahajte obousměrný hlasový tok Gemini Live API.',
    visualState: {
      L: 0.42,
      a: 0.05,
      b: -0.15,
      turbulence: 0.20,
      density: 0.85,
      domainLabel: 'Ontologie a hluboká metafyzika',
    },
    branchingInquiries: [
      {
        type: 'vertical',
        label: 'Vertikální prohloubení',
        question: 'Lze emergenci fenomenologického vědomí vysvětlit čistě topologií integrované informace (Φ) bez postulování nové ontologické kategorie?',
      },
      {
        type: 'lateral',
        label: 'Laterální extrapolace',
        question: 'Jak se termodynamika nerovnovážných disipativních struktur (Prigogine) projevuje při kolapsu institucionální regulace komplexních společností?',
      },
      {
        type: 'antithesis',
        label: 'Oponentská antiteze',
        question: 'Jak tomuto teleologickému rámci oponuje pozice radikálního eliminativního materialismu a dekonstrukce vědeckého realismu?',
      },
    ],
    deepAnalysis: {
      topicTitle: 'Ontologie vědomí a epistemická integrita',
      corePremises: ['Vědomí jako fundamentální kategorie vs. emergentní komputace'],
      hiddenAxioms: ['Předpoklad kauzálního uzavření fyzikálního světa'],
      structuralIsomorphisms: ['Kvantová teorie informace ↔ Fenomenologická redukce'],
      counterTheses: ['Eliminativní materialismus popírající ontologickou distinkci qualia'],
      keyQuestions: [
        {
          id: 'kq-init-1',
          question: 'Považujete v tomto pojetí subjektivní zkušenost (qualia) za kauzálně účinnou, nebo za epifenomén?',
          contextWhy: 'Definuje, zda se v další analýze zaměříme na interakcionistický dualismus či na funkční izomorfismus.',
          status: 'pending'
        },
        {
          id: 'kq-init-2',
          question: 'Do jakého vědního aparátu preferujete tezi ukotvit (neurobiologie, kvantová mechanika či analytická filosofie mysli)?',
          contextWhy: 'Určuje specifický terminologický aparát a navazující epistemologické mantinely.',
          status: 'pending'
        }
      ]
    },
  },
];

export default function App() {
  // Active Top Navigation Tab
  const [activeNav, setActiveNav] = useState<
    'arena' | 'physics' | 'colorimetry' | 'memory' | 'methodology' | 'cloud' | 'plans' | 'docs'
  >('arena');

  // Multi-Language Support (English default, Czech, Spanish, German, French, Japanese, Chinese, Arabic, Portuguese)
  const [lang, setLang] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('cognitive_lang_v2') as LanguageCode;
      if (saved && TRANSLATIONS[saved]) return saved;
    } catch {}
    return 'en'; // DEFAULT TO ENGLISH
  });

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Research Cases & Topics Management (Isolated Case History)
  const [cases, setCases] = useState<ResearchCase[]>(() => CaseManager.loadCases());
  const [activeCaseId, setActiveCaseId] = useState<string>(() => CaseManager.getActiveCaseId());

  // Personalisation & Theme Settings
  const [personalization, setPersonalization] = useState<UserPersonalization>(() => {
    try {
      const raw = localStorage.getItem('cognitive_personalization_v2');
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      themeAccent: 'cyan',
      dialecticRigour: 'academic',
      ambientAudio: false,
      ambientVolume: 0.12,
      language: 'en',
      userPlan: 'free',
      hasSeenWelcome: false,
      hasSeenTour: false,
      dailyUsageCount: 0,
    };
  });

  // Modal Control States
  const [entryHubOpen, setEntryHubOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);

  // Visual & Shader State (OKLab + Physics)
  const [visualState, setVisualState] = useState<VisualState>(() => {
    const active = cases.find((c) => c.id === activeCaseId);
    return active ? active.visualState : DOMAIN_PROFILES[0].state;
  });
  const [selectedProfileId, setSelectedProfileId] = useState<string>(DOMAIN_PROFILES[0].id);
  const [particleCount, setParticleCount] = useState<number>(120000);

  // Gemini Live API & Audio Engine State
  const audioEngineRef = useRef<DuplexAudioEngine | null>(null);
  if (!audioEngineRef.current) {
    audioEngineRef.current = new DuplexAudioEngine();
  }

  const wsRef = useRef<WebSocket | null>(null);
  const [liveConnected, setLiveConnected] = useState(false);
  const [liveConnecting, setLiveConnecting] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [simulatingVoice, setSimulatingVoice] = useState(false);
  const [selectedModel, setSelectedModel] = useState<SessionModelType>('gemini-3.8-live-extended-thinking');
  const [selectedVoice, setSelectedVoice] = useState<VoicePersona>('Zephyr');
  const [vadThreshold, setVadThreshold] = useState<number>(0.065);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Real-time Acoustic Telemetry State for UI Readouts
  const [spectrumUI, setSpectrumUI] = useState<AudioSpectrumMetrics>({
    lowBand: 0,
    midBand: 0,
    highBand: 0,
    rmsInput: 0,
    rmsOutput: 0,
    bargeInActive: false,
  });

  // Push-to-Talk (Hard default: true) & Sound Engineer DSP State
  const [isPttMode, setIsPttMode] = useState<boolean>(true);
  const [isPttActive, setIsPttActive] = useState<boolean>(false);
  const [dspEnabled, setDspEnabled] = useState<boolean>(true);

  const handlePttPressChange = useCallback((pressed: boolean) => {
    setIsPttActive(pressed);
    audioEngineRef.current?.setPttPressed(pressed);
  }, []);

  const handleTogglePttMode = useCallback((enabled: boolean) => {
    setIsPttMode(enabled);
    audioEngineRef.current?.setPttMode(enabled);
  }, []);

  const handleToggleDsp = useCallback((enabled: boolean) => {
    setDspEnabled(enabled);
    audioEngineRef.current?.setDspEnabled(enabled);
  }, []);

  // Dialectical Disputation & Context Injection State
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>(() => {
    const active = cases.find((c) => c.id === activeCaseId);
    return active && active.transcripts.length > 0 ? active.transcripts : INITIAL_TRANSCRIPTS;
  });
  const [inputTopicName, setInputTopicName] = useState(() => {
    const active = cases.find((c) => c.id === activeCaseId);
    return active ? active.title : '';
  });
  const [inputHypothesis, setInputHypothesis] = useState(() => {
    const active = cases.find((c) => c.id === activeCaseId);
    return active?.hypothesis || '';
  });
  const [inputMode, setInputMode] = useState<'structured' | 'fast'>('structured');
  const [answeringQuestions, setAnsweringQuestions] = useState<Record<string, string>>({});
  const [activeClarificationItem, setActiveClarificationItem] = useState<{ id: string; question: string } | null>(null);
  const [clarificationInput, setClarificationInput] = useState('');
  const [contextDirective, setContextDirective] = useState('Oponent vědecké práce v oboru teorie komplexních systémů');
  const [selectedTextModel, setSelectedTextModel] = useState<TextModelType>('gemini-3.8-flash');
  const [patientMode, setPatientMode] = useState<boolean>(true);
  const [highDemandResilient, setHighDemandResilient] = useState<boolean>(true);
  const [isSubmittingTurn, setIsSubmittingTurn] = useState(false);
  const [thinkingSeconds, setThinkingSeconds] = useState(0);
  const [synthesizeTtsOnText, setSynthesizeTtsOnText] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const activeAbortCtrlRef = useRef<AbortController | null>(null);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Ergonomic Workspace Layout & Visual Bloat Reduction States
  const [workspaceMode, setWorkspaceMode] = useState<'balanced' | 'deconstruct' | 'sphere'>(() => {
    try {
      return (localStorage.getItem('cognitive_workspace_mode_v2') as any) || 'deconstruct';
    } catch {
      return 'deconstruct';
    }
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [telemetryExpanded, setTelemetryExpanded] = useState<boolean>(false);
  const [filterDialogueOnly, setFilterDialogueOnly] = useState<boolean>(false);

  // Dual Persistent Memory State (Relational + Vector Embeddings)
  const [memories, setMemories] = useState<MemoryConcept[]>([]);
  const [memorySearchQuery, setMemorySearchQuery] = useState('');
  const [newConceptTitle, setNewConceptTitle] = useState('');
  const [newConceptDomain, setNewConceptDomain] = useState('');
  const [newConceptSummary, setNewConceptSummary] = useState('');
  const [isStoringMemory, setIsStoringMemory] = useState(false);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const ambientOscRef = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null);

  // Initial Open Onboarding: Check if user has seen welcome dialog
  useEffect(() => {
    if (!personalization.hasSeenWelcome) {
      setEntryHubOpen(true);
    }
  }, []);

  // Sync ambient focus audio generator
  useEffect(() => {
    if (personalization.ambientAudio) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, ctx.currentTime);
        gain.gain.setValueAtTime(personalization.ambientVolume || 0.1, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        ambientOscRef.current = { ctx, gain };
      } catch {}
    } else {
      if (ambientOscRef.current) {
        try {
          ambientOscRef.current.ctx.close();
        } catch {}
        ambientOscRef.current = null;
      }
    }
    return () => {
      if (ambientOscRef.current) {
        try {
          ambientOscRef.current.ctx.close();
        } catch {}
        ambientOscRef.current = null;
      }
    };
  }, [personalization.ambientAudio, personalization.ambientVolume]);

  const handleUpdatePersonalization = (settings: Partial<UserPersonalization>) => {
    setPersonalization((prev) => {
      const next = { ...prev, ...settings };
      try {
        localStorage.setItem('cognitive_personalization_v2', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleSelectLanguage = (code: LanguageCode) => {
    setLang(code);
    try {
      localStorage.setItem('cognitive_lang_v2', code);
    } catch {}
    handleUpdatePersonalization({ language: code });
  };

  const handleSelectCase = (caseId: string) => {
    setActiveCaseId(caseId);
    CaseManager.setActiveCaseId(caseId);
    const target = cases.find((c) => c.id === caseId);
    if (target) {
      setTranscripts(target.transcripts.length > 0 ? target.transcripts : INITIAL_TRANSCRIPTS);
      setVisualState(target.visualState);
      setInputTopicName(target.title);
      setInputHypothesis(target.hypothesis || '');
    }
  };

  const handleStartNewCase = (title: string, profile?: DomainProfile) => {
    const newCase = CaseManager.createCase({
      title,
      domainId: profile?.id,
      domainName: profile?.name,
      hypothesis: profile?.sampleHypothesis,
      initialVisualState: profile?.state,
    });
    const loaded = CaseManager.loadCases();
    setCases(loaded);
    setActiveCaseId(newCase.id);
    setTranscripts(newCase.transcripts);
    if (profile) {
      setVisualState(profile.state);
      setSelectedProfileId(profile.id);
      setInputHypothesis(profile.sampleHypothesis);
    } else {
      setInputHypothesis('');
    }
    setInputTopicName(title);
  };

  // Fetch initial semantic memories
  useEffect(() => {
    fetch('/api/memory')
      .then((r) => r.json())
      .then((data) => {
        if (data.memories) setMemories(data.memories);
      })
      .catch(() => {});

    // Listen to audio engine playback state changes to keep UI synchronized
    audioEngineRef.current?.setPlaybackStateListener((isPlaying, entryId) => {
      setPlayingMessageId(isPlaying ? entryId : null);
    });
  }, []);

  // Poll spectrum metrics at 20Hz for crisp tabular UI telemetry without re-rendering Three.js canvas
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioEngineRef.current) {
        const m = audioEngineRef.current.getSpectrumMetrics();
        setSpectrumUI(m);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getAudioMetrics = useCallback(() => {
    return audioEngineRef.current
      ? audioEngineRef.current.getSpectrumMetrics()
      : { lowBand: 0, midBand: 0, highBand: 0, rmsInput: 0, rmsOutput: 0, bargeInActive: false };
  }, []);

  // Parse inline [VISUAL_STATE: ...] tags from incoming text
  const parseAndApplyVisualTag = useCallback((text: string) => {
    const match = text.match(
      /\[VISUAL_STATE:\s*L=([\d.-]+),\s*a=([\d.-]+),\s*b=([\d.-]+),\s*turbulence=([\d.-]+),\s*density=([\d.-]+)\]/i
    );
    if (match) {
      const nextState: VisualState = {
        L: parseFloat(match[1]),
        a: parseFloat(match[2]),
        b: parseFloat(match[3]),
        turbulence: parseFloat(match[4]),
        density: parseFloat(match[5]),
        domainLabel: 'Dynamická telemetrie modelu',
      };
      setVisualState(nextState);
      return nextState;
    }
    return null;
  }, []);

  // Parse Branching Inquiries from model response
  const parseBranchingInquiries = (text: string): BranchingInquiry[] => {
    const branches: BranchingInquiry[] = [];
    const vMatch = text.match(/\[Vertikální prohloubení\]:?\s*([^\n\[]+)/i);
    const lMatch = text.match(/\[Laterální extrapolace\]:?\s*([^\n\[]+)/i);
    const aMatch = text.match(/\[Oponentská antiteze\]:?\s*([^\n\[]+)/i);

    if (vMatch) branches.push({ type: 'vertical', label: 'Vertikální prohloubení', question: vMatch[1].trim() });
    if (lMatch) branches.push({ type: 'lateral', label: 'Laterální extrapolace', question: lMatch[1].trim() });
    if (aMatch) branches.push({ type: 'antithesis', label: 'Oponentská antiteze', question: aMatch[1].trim() });
    return branches;
  };

  // Connect / Disconnect Bidirectional Gemini Live API WebSocket Session
  const toggleLiveSession = async () => {
    setStatusError(null);

    if (liveConnected || wsRef.current) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      audioEngineRef.current?.stopMicrophoneCapture();
      audioEngineRef.current?.clearPlaybackQueue();
      setLiveConnected(false);
      setLiveConnecting(false);
      setMicActive(false);
      return;
    }

    try {
      setLiveConnecting(true);
      await audioEngineRef.current?.initOutputContext();

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: 'setup',
            model: selectedModel,
            voiceName: selectedVoice,
            contextDirective,
          })
        );
      };

      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === 'session_ready') {
          setLiveConnecting(false);
          setLiveConnected(true);

          // Automatically start microphone AudioWorklet capture upon session ready
          try {
            await audioEngineRef.current?.startMicrophoneCapture(
              (base64Pcm) => {
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({ type: 'realtime_input', audio: base64Pcm }));
                }
              },
              () => {
                // Local VAD Barge-in triggered
                setTranscripts((prev) => [
                  ...prev,
                  {
                    id: `barge-${Date.now()}`,
                    timestamp: new Date().toLocaleTimeString('cs-CZ'),
                    role: 'system',
                    text: 'Lokální AudioWorklet VAD detekoval vokální aktivitu (Barge-in) — kruhový přehrávací buffer okamžitě vyprázdněn.',
                  },
                ]);
              }
            );
            setMicActive(true);
          } catch (micErr: any) {
            setStatusError(`Mikrofon nedostupný (${micErr?.message || 'povolte přístup'}). Relace Live API běží v režimu poslechu a kontextové injektáže.`);
          }
        } else if (msg.type === 'server_audio' && msg.audio) {
          await audioEngineRef.current?.enqueuePcm24kChunk(msg.audio);
        } else if (msg.type === 'interrupted') {
          audioEngineRef.current?.clearPlaybackQueue();
        } else if (msg.type === 'visual_state_update' && msg.visualState) {
          setVisualState(msg.visualState);
          setTranscripts((prev) => [
            ...prev,
            {
              id: `vs-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString('cs-CZ'),
              role: 'tool',
              text: `GPU Shader aktualizován (NON_BLOCKING RPC): L=${msg.visualState.L.toFixed(2)}, a=${msg.visualState.a.toFixed(2)}, b=${msg.visualState.b.toFixed(2)}, μ=${msg.visualState.turbulence.toFixed(2)}, σ=${msg.visualState.density.toFixed(2)}`,
              visualState: msg.visualState,
            },
          ]);
        } else if (msg.type === 'output_transcription' || msg.type === 'server_text') {
          const textChunk = msg.text || '';
          parseAndApplyVisualTag(textChunk);
          const branches = parseBranchingInquiries(textChunk);

          setTranscripts((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'model' && Date.now() - parseInt(last.id.split('-')[1] || '0', 10) < 15000) {
              const combined = `${last.text} ${textChunk}`.trim();
              const updatedBranches = parseBranchingInquiries(combined);
              return [
                ...prev.slice(0, -1),
                {
                  ...last,
                  text: combined,
                  branchingInquiries: updatedBranches.length ? updatedBranches : last.branchingInquiries,
                },
              ];
            }
            return [
              ...prev,
              {
                id: `mod-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString('cs-CZ'),
                role: 'model',
                text: textChunk,
                branchingInquiries: branches.length ? branches : undefined,
              },
            ];
          });
        } else if (msg.type === 'input_transcription' && msg.text) {
          setTranscripts((prev) => [
            ...prev,
            {
              id: `usr-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString('cs-CZ'),
              role: 'user',
              text: msg.text,
            },
          ]);
        } else if (msg.type === 'error') {
          setStatusError(msg.message);
          setLiveConnecting(false);
        } else if (msg.type === 'session_closed') {
          setLiveConnected(false);
          setMicActive(false);
        }
      };

      ws.onerror = () => {
        setStatusError('WebSocket spojení s multiplexním uzlem selhalo.');
        setLiveConnecting(false);
      };

      ws.onclose = () => {
        setLiveConnected(false);
        setLiveConnecting(false);
        setMicActive(false);
      };
    } catch (err: any) {
      setStatusError(err?.message || 'Nepodařilo se inicializovat Gemini Live API.');
      setLiveConnecting(false);
    }
  };

  // Inject Dynamic Context ([EXTEND_CONTEXT: ...]) with turn_complete: false
  const handleInjectContext = () => {
    if (!contextDirective.trim()) return;
    const directiveTag = `[EXTEND_CONTEXT: ${contextDirective.trim()}]`;

    if (liveConnected && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'client_content',
          text: directiveTag,
          turnComplete: false,
        })
      );
    }

    setTranscripts((prev) => [
      ...prev,
      {
        id: `ctx-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('cs-CZ'),
        role: 'system',
        text: `Injektáž kontextu za běhu relace (turn_complete: false): ${directiveTag}`,
        contextDirective: contextDirective.trim(),
      },
    ]);
  };

  // Submit Socratic Disputation Turn (via Live WebSocket if active, or REST Dialectic + 24kHz PCM TTS)
  const submitDialecticalTurn = async (customPrompt?: string, clarifyingForQuestion?: string) => {
    let textToSend = customPrompt;
    if (!textToSend) {
      if (inputTopicName.trim() && inputHypothesis.trim()) {
        textToSend = `TÉMA: ${inputTopicName.trim()}\n\nPOPIS A TEZE:\n${inputHypothesis.trim()}`;
      } else if (inputTopicName.trim()) {
        textToSend = `TÉMA K HLUBOKÉ ANALÝZE: ${inputTopicName.trim()}`;
      } else {
        textToSend = inputHypothesis.trim();
      }
    }

    if (!textToSend || isSubmittingTurn) return;

    setStatusError(null);
    if (!customPrompt) {
      setInputHypothesis('');
      setInputTopicName('');
    }

    const userEntry: TranscriptEntry = {
      id: `u-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('cs-CZ'),
      role: 'user',
      text: clarifyingForQuestion
        ? `[DOPLNĚNÍ INSTRUKCÍ K OTÁZCE: "${clarifyingForQuestion}"]\n\n${textToSend}`
        : textToSend,
    };
    setTranscripts((prev) => [...prev, userEntry]);

    // If Live WebSocket is connected, send via client_content with turnComplete: true
    if (liveConnected && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'client_content',
          text: userEntry.text,
          turnComplete: true,
        })
      );
      return;
    }

    // Otherwise execute full Socratic turn + deterministic 24kHz PCM TTS playback through AnalyserNode
    const controller = new AbortController();
    activeAbortCtrlRef.current = controller;
    setThinkingSeconds(0);
    const timerInterval = setInterval(() => {
      setThinkingSeconds((s) => s + 1);
    }, 1000);

    // 180s generous timeout (3 min) for deep reasoning without cutting off structure
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 180000);

    try {
      setIsSubmittingTurn(true);
      await audioEngineRef.current?.initOutputContext();

      const historyPayload = transcripts
        .filter((t) => t.role === 'user' || t.role === 'model')
        .slice(-6)
        .map((t) => ({ role: t.role, text: t.text }));

      const res = await fetch('/api/dialectic/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: userEntry.text,
          history: historyPayload,
          contextDirective,
          voiceName: selectedVoice,
          synthesizeAudio: synthesizeTtsOnText,
          modelName: selectedTextModel,
          patientMode: patientMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Chyba při generování dialektické repliky.');
      }

      if (data.visualState) {
        setVisualState({
          ...data.visualState,
          domainLabel: 'Afektivní syntéza modelu',
        });
      } else {
        parseAndApplyVisualTag(data.text || '');
      }

      const modelEntry: TranscriptEntry = {
        id: `m-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('cs-CZ'),
        role: 'model',
        text: data.text,
        visualState: data.visualState || undefined,
        branchingInquiries: data.branchingInquiries?.length ? data.branchingInquiries : undefined,
        wavBase64: data.wavBase64 || undefined,
        modelTelemetry: data.modelTelemetry || undefined,
        deepAnalysis: data.keyQuestions?.length
          ? {
              topicTitle: inputTopicName || 'Dekonstruované téma',
              corePremises: [],
              hiddenAxioms: [],
              structuralIsomorphisms: [],
              counterTheses: [],
              keyQuestions: data.keyQuestions,
            }
          : undefined,
      };

      setTranscripts((prev) => [...prev, modelEntry]);

      // Persist turn history into active research case
      const updatedCases = CaseManager.updateCase(activeCaseId, (prev) => ({
        ...prev,
        transcripts: [...prev.transcripts, userEntry, modelEntry],
        visualState: data.visualState || prev.visualState,
      }));
      setCases(updatedCases);

      // Increment daily usage count for plan balancing
      setPersonalization((prev) => {
        const next = { ...prev, dailyUsageCount: prev.dailyUsageCount + 1 };
        try {
          localStorage.setItem('cognitive_personalization_v2', JSON.stringify(next));
        } catch {}
        return next;
      });

      // Play audio response directly if auto-synthesize is enabled
      if (synthesizeTtsOnText && audioEngineRef.current) {
        if (data.wavBase64) {
          await audioEngineRef.current.playWavBase64(data.wavBase64, modelEntry.id);
        } else if (data.cleanText || data.text) {
          await audioEngineRef.current.playSpeechSynthesis(data.cleanText || data.text, modelEntry.id);
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setStatusError('Dotaz byl přerušen na žádost uživatele nebo po vypršení 180s časového limitu.');
      } else {
        setStatusError(err.message || 'Chyba komunikace se serverem.');
      }
    } finally {
      clearInterval(timerInterval);
      clearTimeout(timeoutId);
      setIsSubmittingTurn(false);
      activeAbortCtrlRef.current = null;
    }
  };

  const handleCancelTurn = useCallback(() => {
    if (activeAbortCtrlRef.current) {
      activeAbortCtrlRef.current.abort();
      activeAbortCtrlRef.current = null;
    }
    setIsSubmittingTurn(false);
  }, []);

  /**
   * Deterministically plays or stops audio for ANY generated text or chat component in the app:
   * - Entire message replies
   * - Specific key clarification questions
   * - Proactive branching inquiry questions
   * - Active question in the clarification drawer
   *
   * Strict anti-chaos guarantee: Immediately halts any ongoing speech or simulation,
   * cancels any in-flight HTTP TTS synthesis via AbortController, and ensures only one audio stream plays.
   */
  const handleTogglePlayAudio = async (
    uniqueId: string,
    textToSpeak: string,
    existingWav?: string
  ) => {
    if (!audioEngineRef.current) return;

    // 1. If this exact element is already playing or loading, stop it immediately (toggle off)
    if (playingMessageId === uniqueId || loadingAudioId === uniqueId) {
      if (activeAbortCtrlRef.current) {
        activeAbortCtrlRef.current.abort();
        activeAbortCtrlRef.current = null;
      }
      audioEngineRef.current.stopAllAudio();
      setPlayingMessageId(null);
      setLoadingAudioId(null);
      return;
    }

    // 2. Abort any previous pending TTS fetch to prevent delayed playback
    if (activeAbortCtrlRef.current) {
      activeAbortCtrlRef.current.abort();
      activeAbortCtrlRef.current = null;
    }

    // 3. Immediately halt any active audio source or simulation (Anti-Chaos guarantee)
    audioEngineRef.current.stopAllAudio();
    setSimulatingVoice(false);
    setPlayingMessageId(null);

    // 4. If audio WAV is already in memory or entry cache, play immediately
    const cachedWav = existingWav || audioCacheRef.current.get(uniqueId);
    if (cachedWav) {
      setLoadingAudioId(null);
      await audioEngineRef.current.playWavBase64(cachedWav, uniqueId);
      return;
    }

    // 5. Fetch synthesized 24kHz PCM WAV from server with AbortController
    const abortCtrl = new AbortController();
    activeAbortCtrlRef.current = abortCtrl;
    setLoadingAudioId(uniqueId);

    try {
      await audioEngineRef.current.initOutputContext();

      const res = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          voiceName: selectedVoice,
        }),
        signal: abortCtrl.signal,
      });

      const data = await res.json();
      if (!res.ok || data.useClientTts || !data.wavBase64) {
        if (activeAbortCtrlRef.current === abortCtrl) {
          activeAbortCtrlRef.current = null;
          setLoadingAudioId(null);
          await audioEngineRef.current.playSpeechSynthesis(data?.cleanSpeech || textToSpeak, uniqueId);
        }
        return;
      }

      // Store in memory cache
      audioCacheRef.current.set(uniqueId, data.wavBase64);

      // If matches a transcript entry ID, cache on that transcript item as well
      setTranscripts((prev) =>
        prev.map((t) => (t.id === uniqueId ? { ...t, wavBase64: data.wavBase64 } : t))
      );

      // Verify request wasn't superseded while fetching
      if (activeAbortCtrlRef.current === abortCtrl) {
        activeAbortCtrlRef.current = null;
        setLoadingAudioId(null);
        await audioEngineRef.current.playWavBase64(data.wavBase64, uniqueId);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // gracefully cancelled by another user action
      }
      console.warn('Playback error, falling back to client voice:', err);
      if (activeAbortCtrlRef.current === abortCtrl) {
        activeAbortCtrlRef.current = null;
        setLoadingAudioId(null);
        await audioEngineRef.current.playSpeechSynthesis(textToSpeak, uniqueId);
      }
    }
  };

  /**
   * Immediate silence kill-switch: stops any voice, simulation, or live stream with zero delay
   */
  const handleStopAllAudio = () => {
    if (activeAbortCtrlRef.current) {
      activeAbortCtrlRef.current.abort();
      activeAbortCtrlRef.current = null;
    }
    audioEngineRef.current?.stopAllAudio();
    setPlayingMessageId(null);
    setLoadingAudioId(null);
    setSimulatingVoice(false);
  };

  // Helper for message-level toggle
  const handleTogglePlayMessage = (entry: TranscriptEntry) => {
    handleTogglePlayAudio(entry.id, entry.text, entry.wavBase64);
  };

  // Toggle synthetic multi-band PCM voice excitation for immediate shader testing
  const handleToggleAcousticSim = async () => {
    if (!audioEngineRef.current) return;
    const active = await audioEngineRef.current.toggleAcousticSimulation();
    setSimulatingVoice(active);
  };

  // Apply Thematic Domain Profile
  const handleSelectDomainProfile = (profile: DomainProfile) => {
    setSelectedProfileId(profile.id);
    setVisualState(profile.state);
  };

  // Semantic Vector Memory Search
  const handleSearchMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/memory/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: memorySearchQuery }),
      });
      const data = await res.json();
      if (data.results) setMemories(data.results);
    } catch {}
  };

  // Store new concept in vector memory
  const handleStoreMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConceptTitle.trim() || !newConceptSummary.trim()) return;
    setIsStoringMemory(true);
    try {
      const res = await fetch('/api/memory/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: newConceptTitle,
          domain: newConceptDomain || 'Interdisciplinární izomorfismus',
          summary: newConceptSummary,
          isomorphismLink: contextDirective,
        }),
      });
      const data = await res.json();
      if (data.memory) {
        setMemories((prev) => [data.memory, ...prev]);
        setNewConceptTitle('');
        setNewConceptDomain('');
        setNewConceptSummary('');
      }
    } finally {
      setIsStoringMemory(false);
    }
  };

  const lch = oklabToOklch(visualState.L, visualState.a, visualState.b);
  const currentHex = oklabToHex(visualState.L, visualState.a, visualState.b);

  // Dynamic Workspace Column Allocation for Information Efficiency
  let sidebarClasses = 'lg:col-span-3';
  let centerClasses = 'lg:col-span-5';
  let arenaClasses = 'lg:col-span-4';

  if (workspaceMode === 'deconstruct') {
    if (sidebarCollapsed) {
      sidebarClasses = 'hidden';
      centerClasses = 'lg:col-span-4';
      arenaClasses = 'lg:col-span-8'; // 67% screen width for Deconstruction!
    } else {
      sidebarClasses = 'lg:col-span-3';
      centerClasses = 'lg:col-span-3';
      arenaClasses = 'lg:col-span-6'; // 50% screen width!
    }
  } else if (workspaceMode === 'sphere') {
    if (sidebarCollapsed) {
      sidebarClasses = 'hidden';
      centerClasses = 'lg:col-span-8'; // 67% screen width for sphere!
      arenaClasses = 'lg:col-span-4';
    } else {
      sidebarClasses = 'lg:col-span-2';
      centerClasses = 'lg:col-span-7';
      arenaClasses = 'lg:col-span-3';
    }
  } else {
    // balanced
    if (sidebarCollapsed) {
      sidebarClasses = 'hidden';
      centerClasses = 'lg:col-span-6';
      arenaClasses = 'lg:col-span-6';
    } else {
      sidebarClasses = 'lg:col-span-3';
      centerClasses = 'lg:col-span-5';
      arenaClasses = 'lg:col-span-4';
    }
  }

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="flex flex-col h-screen w-screen overflow-hidden bg-[#07090E] text-slate-100 select-none"
    >
      {/* 1. Dedicated Top Topics & Cases History Bar */}
      <TopicsCaseBar
        cases={cases}
        activeCaseId={activeCaseId}
        lang={lang}
        onSelectCase={handleSelectCase}
        onNewCase={(title) => handleStartNewCase(title)}
        onUpdateCases={(updated) => setCases(updated)}
        onOpenEntryHub={() => setEntryHubOpen(true)}
      />

      {/* 2. Top Header Navigation Bar */}
      <header className="flex items-center justify-between px-4 h-12 border-b border-slate-800/90 bg-[#07090E] shrink-0 gap-3">
        {/* Zone 1: Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveNav('arena');
          }}
          className="font-display text-sm sm:text-base font-bold tracking-tight text-slate-100 whitespace-nowrap flex items-center gap-2"
        >
          <span className="text-cyan-400">✦</span>
          <span>{t.appName}</span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveNav('arena')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeNav === 'arena'
                ? 'text-cyan-400 underline underline-offset-4 font-semibold'
                : 'hover:text-slate-100'
            }`}
          >
            {t.navArena}
          </button>
          <button
            onClick={() => setActiveNav('physics')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeNav === 'physics'
                ? 'text-cyan-400 underline underline-offset-4 font-semibold'
                : 'hover:text-slate-100'
            }`}
          >
            {t.navPhysics}
          </button>
          <button
            onClick={() => setActiveNav('colorimetry')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeNav === 'colorimetry'
                ? 'text-cyan-400 underline underline-offset-4 font-semibold'
                : 'hover:text-slate-100'
            }`}
          >
            {t.navColorimetry}
          </button>
          <button
            onClick={() => setActiveNav('memory')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeNav === 'memory'
                ? 'text-cyan-400 underline underline-offset-4 font-semibold'
                : 'hover:text-slate-100'
            }`}
          >
            {t.navMemory}
          </button>
          <button
            onClick={() => setActiveNav('methodology')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeNav === 'methodology'
                ? 'text-cyan-400 underline underline-offset-4 font-semibold'
                : 'hover:text-slate-100'
            }`}
          >
            {t.navMethodology}
          </button>
          <button
            onClick={() => setActiveNav('cloud')}
            className={`py-1 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeNav === 'cloud'
                ? 'text-cyan-400 underline underline-offset-4 font-semibold'
                : 'hover:text-slate-100 text-slate-300'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.navCloud}</span>
          </button>
          <button
            onClick={() => setSubscriptionOpen(true)}
            className="py-1 transition-colors whitespace-nowrap flex items-center gap-1 text-slate-300 hover:text-cyan-300"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.navPlans}</span>
          </button>
          <button
            onClick={() => setActiveNav('docs')}
            className={`py-1 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeNav === 'docs'
                ? 'text-cyan-400 underline underline-offset-4 font-semibold'
                : 'hover:text-slate-100 text-slate-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.navDocs}</span>
          </button>
        </nav>

        {/* Zone 3: Workspace Layout Switcher + Language Selector + Tour + Audio Actions */}
        <div className="flex items-center gap-2">
          {/* Workspace Mode Switcher: Maximize Deconstructive Analysis / Balanced / Fluid Zen */}
          {activeNav === 'arena' && (
            <div className="hidden lg:flex items-center gap-1 bg-[#090D16] border border-slate-800 rounded p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  setWorkspaceMode('deconstruct');
                  setSidebarCollapsed(true);
                  try { localStorage.setItem('cognitive_workspace_mode_v2', 'deconstruct'); } catch {}
                }}
                title="Režim hloubkové dekonstrukce: Maximalizuje šířku sokratovské disputace na 67% obrazovky"
                className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                  workspaceMode === 'deconstruct'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Maximize2 className="w-3 h-3" />
                <span>Dekonstrukce</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setWorkspaceMode('balanced');
                  setSidebarCollapsed(false);
                  try { localStorage.setItem('cognitive_workspace_mode_v2', 'balanced'); } catch {}
                }}
                title="Vyvážená konzole: Standardní 3-sloupcové rozvržení"
                className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                  workspaceMode === 'balanced'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Columns className="w-3 h-3" />
                <span>Vyvážený</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setWorkspaceMode('sphere');
                  setSidebarCollapsed(true);
                  try { localStorage.setItem('cognitive_workspace_mode_v2', 'sphere'); } catch {}
                }}
                title="Vizuální fokus: Dominantní 3D OKLab fluidní sféra"
                className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                  workspaceMode === 'sphere'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Waves className="w-3 h-3" />
                <span>Sféra</span>
              </button>
            </div>
          )}

          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-1 bg-[#090D16] border border-slate-800 rounded px-2 py-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={lang}
              onChange={(e) => handleSelectLanguage(e.target.value as LanguageCode)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((opt) => (
                <option key={opt.code} value={opt.code} className="bg-[#090D16] text-white">
                  {opt.flag} {opt.code.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Tour Button */}
          <button
            onClick={() => setTourOpen(true)}
            className="hidden sm:flex px-2.5 py-1 text-xs font-medium rounded border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors items-center gap-1 font-mono"
          >
            <Sparkles className="w-3 h-3" />
            <span>Tour</span>
          </button>

          {/* Instant Silence Kill-Switch */}
          <button
            onClick={handleStopAllAudio}
            title={t.stopAllAudio}
            className="px-2 py-1 text-xs font-medium rounded border border-rose-900/60 bg-rose-950/40 text-rose-300 hover:bg-rose-950/80 transition-colors flex items-center gap-1 font-mono shrink-0"
          >
            <Square className="w-3 h-3 fill-rose-400 text-rose-400" />
            <span className="hidden md:inline text-[11px]">{t.stopAllAudio}</span>
          </button>

          {/* Acoustic simulation toggle */}
          <button
            onClick={handleToggleAcousticSim}
            className={`hidden md:flex px-2.5 py-1 text-xs font-medium rounded border transition-colors whitespace-nowrap items-center gap-1.5 ${
              simulatingVoice
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>{simulatingVoice ? t.stopAcoustic : t.testAcoustic}</span>
          </button>

          {/* Gemini Live API Toggle */}
          <button
            onClick={toggleLiveSession}
            disabled={liveConnecting}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              liveConnected
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
            }`}
          >
            {liveConnected ? <MicOff className="w-3.5 h-3.5" /> : <Radio className="w-3.5 h-3.5" />}
            <span>
              {liveConnecting
                ? t.handshakeLive
                : liveConnected
                ? t.endLive
                : t.startLive}
            </span>
          </button>
        </div>
      </header>

      {/* Main Asymmetric Split Console Workspace with Dynamic Column Math */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden relative">
            {/* Quick Uncollapse Button when sidebar is hidden */}
            {sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                title="Rozbalit panel parametrů a kalibrace"
                className="absolute top-3 left-3 z-30 px-2 py-1 rounded bg-[#0B0E17]/95 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500 shadow-xl backdrop-blur transition-all flex items-center gap-1.5 text-xs font-mono"
              >
                <PanelLeftOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Parametry</span>
              </button>
            )}

            {/* Left Control & Parameter Column */}
            <aside className={`${sidebarClasses} border-r border-slate-800/90 bg-[#0B0E17] flex flex-col min-h-0 overflow-y-auto p-4 space-y-5 transition-all`}>
              {/* Header with quick collapse affordance */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-[11px] font-mono font-semibold text-slate-300">
                  PARAMETRY & KALIBRACE
                </span>
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(true)}
                  title="Sbalit panel pro zvětšení šířky dekonstrukce"
                  className="px-1.5 py-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px] font-mono"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                  <span>Sbalit</span>
                </button>
              </div>
          {/* Section 1: Duplex Audio & Live API Configuration */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-wide text-slate-300">
                01. Konfigurace Gemini Live API
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                {liveConnected ? '● AKTIVNÍ TOK' : '○ PŘIPRAVENO'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Architektura modelu</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as SessionModelType)}
                  disabled={liveConnected}
                  className="w-full bg-[#07090E] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="gemini-3.8-live-extended-thinking">
                    gemini-3.8-live-extended-thinking
                  </option>
                  <option value="gemini-3.8-live">gemini-3.8-live (Nízká latence)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Hlasový syntetizér</label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value as VoicePersona)}
                    disabled={liveConnected}
                    className="w-full bg-[#07090E] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Zephyr">Zephyr (Analytický)</option>
                    <option value="Fenrir">Fenrir (Baryton)</option>
                    <option value="Kore">Kore (Exaktní)</option>
                    <option value="Charon">Charon (Hluboký)</option>
                    <option value="Puck">Puck (Dynamický)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Počet částic GPU</label>
                  <select
                    value={particleCount}
                    onChange={(e) => setParticleCount(Number(e.target.value))}
                    className="w-full bg-[#07090E] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value={100000}>100 000 částic</option>
                    <option value={120000}>120 000 částic</option>
                    <option value={180000}>180 000 částic</option>
                    <option value={250000}>250 000 částic</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Lokální práh VAD (Barge-in RMS)</span>
                  <span className="font-mono tabular-nums text-cyan-400">
                    {vadThreshold.toFixed(3)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.02}
                  max={0.2}
                  step={0.005}
                  value={vadThreshold}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setVadThreshold(val);
                    audioEngineRef.current?.setBargeInThreshold(val);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
                />
              </div>

              {/* Push-to-Talk (Default) & Sound Engineer DSP Status */}
              <div className="p-2.5 rounded bg-[#07090E] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium text-[11px] flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Push-to-Talk (Výchozí)</span>
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPttMode}
                      onChange={(e) => handleTogglePttMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
                <p className="text-slate-400 text-[10px] leading-tight">
                  {isPttMode
                    ? 'Mikrofon je ve výchozím stavu ztlumen. Zvuk se přenáší pouze při stisku mezerníku nebo tlačítka mikrofónu.'
                    : 'Open Mic: Zvuk ze vstupu je nepřetržitě streamován bez nutnosti stisku.'}
                </p>

                <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-cyan-400">
                  <div className="flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-cyan-400" />
                    <span>DSP Expander & Limiter</span>
                  </div>
                  <span className={dspEnabled ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {dspEnabled ? 'AKTIVNÍ' : 'BYPASS'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-800/80" />

          {/* Section 2: AI Model Selection & High Demand Resilience */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-wide text-slate-300">
                02. Volba AI modelu & Odolnost
              </h2>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>RESILIENT</span>
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400">Model textové disputace</label>
                  <span className="font-mono text-[10px] text-cyan-400">Multi-Model</span>
                </div>
                <select
                  value={selectedTextModel}
                  onChange={(e) => setSelectedTextModel(e.target.value as TextModelType)}
                  className="w-full bg-[#07090E] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Rychlý & reaktivní — výchozí)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Vysoká propustnost & stabilita)</option>
                  <option value="gemini-flash-latest">gemini-flash-latest (Nejnovější stabilní Flash)</option>
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Hluboké Pro uvažování)</option>
                  <option value="auto-resilient">auto-resilient (Inteligentní adaptivní volba)</option>
                </select>
              </div>

              {/* High Demand Resilience Options */}
              <div className="p-2.5 rounded bg-[#07090E] border border-slate-800 space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={highDemandResilient}
                    onChange={(e) => setHighDemandResilient(e.target.checked)}
                    className="accent-cyan-400 rounded mt-0.5"
                  />
                  <div className="text-[11px] leading-tight">
                    <span className="font-medium text-slate-200 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Ochrana proti přetížení (High Demand Failover)</span>
                    </span>
                    <p className="text-slate-400 text-[10px] mt-0.5">
                      Při 429/503 nebo přetížení serverů automaticky aplikuje exponenciální odklad a přepne na záložní model v řetězci.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer pt-1.5 border-t border-slate-800/80">
                  <input
                    type="checkbox"
                    checked={patientMode}
                    onChange={(e) => setPatientMode(e.target.checked)}
                    className="accent-cyan-400 rounded mt-0.5"
                  />
                  <div className="text-[11px] leading-tight">
                    <span className="font-medium text-slate-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>Trpělivý režim (Vyšší limit na uvažování)</span>
                    </span>
                    <p className="text-slate-400 text-[10px] mt-0.5">
                      Povoluje delší časový limit a více pokusů pro komplexní uvažování u pomalejších modelů bez přerušení.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </section>

          <hr className="border-slate-800/80" />

          {/* Section 2: Thematic & Affective OKLab Profiles */}
          <section className="space-y-2.5">
            <h2 className="text-xs font-semibold tracking-wide text-slate-300">
              02. Tematické a afektivní domény (OKLab)
            </h2>
            <div className="space-y-1.5">
              {DOMAIN_PROFILES.map((prof) => {
                const hex = oklabToHex(prof.state.L, prof.state.a, prof.state.b);
                const isSelected = selectedProfileId === prof.id;
                return (
                  <button
                    key={prof.id}
                    onClick={() => handleSelectDomainProfile(prof)}
                    className={`w-full text-left p-2.5 rounded border transition-colors ${
                      isSelected
                        ? 'bg-slate-900/90 border-cyan-500/60'
                        : 'bg-[#07090E]/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="text-xs font-medium text-slate-100 truncate">
                          {prof.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono tabular-nums text-slate-400 shrink-0">
                        L={prof.state.L.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                      <span>{prof.subtitle}</span>
                      <span aria-hidden="true">·</span>
                      <span>C={prof.chroma.toFixed(2)}</span>
                      <span aria-hidden="true">·</span>
                      <span>μ={prof.state.turbulence.toFixed(2)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <hr className="border-slate-800/80" />

          {/* Section 3: Fine-Grained OKLab & Hydrodynamic Shader Scrubbers */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-wide text-slate-300">
                03. Kalibrace shaderu a prostoru OKLab
              </h2>
              <span
                className="w-3 h-3 rounded-sm border border-white/20"
                style={{ backgroundColor: currentHex }}
              />
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-400">Percepční světlost (L)</span>
                  <span className="font-mono tabular-nums text-slate-200">
                    {visualState.L.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={0.95}
                  step={0.01}
                  value={visualState.L}
                  onChange={(e) =>
                    setVisualState((s) => ({ ...s, L: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-slate-400">Osa a (Z–Č)</span>
                    <span className="font-mono tabular-nums text-slate-200">
                      {visualState.a.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-0.35}
                    max={0.35}
                    step={0.01}
                    value={visualState.a}
                    onChange={(e) =>
                      setVisualState((s) => ({ ...s, a: parseFloat(e.target.value) }))
                    }
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-slate-400">Osa b (M–Ž)</span>
                    <span className="font-mono tabular-nums text-slate-200">
                      {visualState.b.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-0.35}
                    max={0.35}
                    step={0.01}
                    value={visualState.b}
                    onChange={(e) =>
                      setVisualState((s) => ({ ...s, b: parseFloat(e.target.value) }))
                    }
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-slate-400">Turbulence (μ₀)</span>
                    <span className="font-mono tabular-nums text-slate-200">
                      {visualState.turbulence.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={1.0}
                    step={0.01}
                    value={visualState.turbulence}
                    onChange={(e) =>
                      setVisualState((s) => ({
                        ...s,
                        turbulence: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-slate-400">Hustota (σ / k)</span>
                    <span className="font-mono tabular-nums text-slate-200">
                      {visualState.density.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.15}
                    max={1.0}
                    step={0.01}
                    value={visualState.density}
                    onChange={(e) =>
                      setVisualState((s) => ({
                        ...s,
                        density: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
                  />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-800/80" />

          {/* Section 4: Dynamic Context Injection Engine (client_content) */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold tracking-wide text-slate-300">
              04. Dynamické programování kontextu
            </h2>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Vloží direktivu <code className="text-cyan-400 font-mono">[EXTEND_CONTEXT]</code> do
              paměťového okna modelu s příznakem <code className="font-mono">turn_complete: false</code>.
            </p>
            <textarea
              rows={2}
              value={contextDirective}
              onChange={(e) => setContextDirective(e.target.value)}
              placeholder="Např. Člen bioetické komise analyzující CRISPR-Cas9..."
              className="w-full bg-[#07090E] border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
            />
            <button
              onClick={handleInjectContext}
              className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium rounded transition-colors whitespace-nowrap"
            >
              Injektovat kontext za běhu relace
            </button>
          </section>
        </aside>

        {/* Center Viewport & Bottom Acoustic Envelope Tray (5 cols on 12-col grid) */}
        <main className="lg:col-span-5 flex flex-col min-h-0 border-r border-slate-800/90 bg-[#07090E]">
          {/* Dedicated Contained 3D Particle Sphere Stage (overflow: hidden) */}
          <div className="flex-1 min-h-0 relative overflow-hidden">
            <VaporSphereViewport
              visualState={visualState}
              getAudioMetrics={getAudioMetrics}
              particleCount={particleCount}
            />

            {/* Universal Voice & PTT Controller HUD */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-auto z-20 px-3">
              <VoicePttController
                isLiveConnected={liveConnected}
                isPttMode={isPttMode}
                isPttActive={isPttActive}
                dspEnabled={dspEnabled}
                rmsInput={spectrumUI.rmsInput}
                onPttPressChange={handlePttPressChange}
                onTogglePttMode={handleTogglePttMode}
                onToggleDsp={handleToggleDsp}
                onStartLive={toggleLiveSession}
                lang={lang}
              />
            </div>
          </div>

          {/* Bottom Time-Series & Asymmetric Envelope Follower Telemetry Tray */}
          <div className="h-52 border-t border-slate-800/90 bg-[#0B0E17] p-4 flex flex-col justify-between shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-200">
                  Spektrální analýza (FFT = 1024) & Asymetrický obálkový sledovač
                </span>
                <span className="text-slate-500">·</span>
                <span className="font-mono text-[11px] text-slate-400">
                  A[n] = α·A[n−1] + (1−α)·E[n]
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono tabular-nums">
                <span className="text-slate-400">
                  Vstup RMS: <strong className="text-slate-200">{(spectrumUI.rmsInput * 100).toFixed(1)}%</strong>
                </span>
                <span className="text-slate-600">·</span>
                <span
                  className={
                    spectrumUI.bargeInActive ? 'text-amber-400 font-semibold' : 'text-emerald-400'
                  }
                >
                  {spectrumUI.bargeInActive ? '▲ BARGE-IN PŘERUŠENÍ' : '● DUPLEX NOMINÁLNÍ'}
                </span>
              </div>
            </div>

            {/* 3 Physiological Speech Frequency Bands with Attack/Decay Ballistics */}
            <div className="grid grid-cols-3 gap-3 my-1">
              {/* Band 1: 0 - 250 Hz */}
              <div className="bg-[#07090E] border border-slate-800/90 rounded p-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Sub-basy & F₀ (0–250 Hz)</span>
                  <span className="font-mono text-slate-500">10ms / 120ms</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-lg font-mono font-semibold tabular-nums text-cyan-400">
                    {(spectrumUI.lowBand * 100).toFixed(1)}
                    <span className="text-xs text-slate-400 ml-1">%</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">→ uLowFreq R(t)</span>
                </div>
                <div className="mt-1.5 w-full h-1.5 bg-slate-900 rounded overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-transform duration-75 origin-left"
                    style={{ transform: `scaleX(${Math.max(0.02, spectrumUI.lowBand)})` }}
                  />
                </div>
              </div>

              {/* Band 2: 250 - 2500 Hz */}
              <div className="bg-[#07090E] border border-slate-800/90 rounded p-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Formanty F₁, F₂ (250–2500 Hz)</span>
                  <span className="font-mono text-slate-500">20ms / 150ms</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-lg font-mono font-semibold tabular-nums text-emerald-400">
                    {(spectrumUI.midBand * 100).toFixed(1)}
                    <span className="text-xs text-slate-400 ml-1">%</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">→ uMidFreq (μ)</span>
                </div>
                <div className="mt-1.5 w-full h-1.5 bg-slate-900 rounded overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-transform duration-75 origin-left"
                    style={{ transform: `scaleX(${Math.max(0.02, spectrumUI.midBand)})` }}
                  />
                </div>
              </div>

              {/* Band 3: 2500 - 8000 Hz */}
              <div className="bg-[#07090E] border border-slate-800/90 rounded p-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Sykavky F₃, F₄ (2.5–8 kHz)</span>
                  <span className="font-mono text-slate-500">5ms / 80ms</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-lg font-mono font-semibold tabular-nums text-amber-400">
                    {(spectrumUI.highBand * 100).toFixed(1)}
                    <span className="text-xs text-slate-400 ml-1">%</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">→ uDispersion (σ)</span>
                </div>
                <div className="mt-1.5 w-full h-1.5 bg-slate-900 rounded overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-transform duration-75 origin-left"
                    style={{ transform: `scaleX(${Math.max(0.02, spectrumUI.highBand)})` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>
                Signálová topologie: <strong className="text-slate-300 font-mono">AudioBufferSourceNode → GainNode → AnalyserNode (24 kHz PCM)</strong>
              </span>
              <button
                onClick={() => audioEngineRef.current?.clearPlaybackQueue()}
                className="text-slate-300 hover:text-white font-mono flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Vyprázdnit audio frontu</span>
              </button>
            </div>
          </div>
        </main>

        {/* Right Column: Socratic Disputation Arena / Tab Inspector (4 cols on 12-col grid) */}
        <section className="lg:col-span-4 flex flex-col min-h-0 bg-[#0B0E17]">
          {activeNav === 'arena' && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Arena Header */}
              <div className="px-4 py-3 border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">
                    Sokratovská dialektická disputace
                  </h2>
                  <p className="text-xs text-slate-400">
                    Elenktika · Strukturální izomorfismus · Steelmanning · Rozcestník tázání
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(playingMessageId !== null || simulatingVoice || loadingAudioId !== null) && (
                    <button
                      type="button"
                      onClick={handleStopAllAudio}
                      title="Okamžitě utišit veškeré audio a vyprázdnit frontu"
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded flex items-center gap-1.5 shadow-md shadow-amber-500/20 animate-pulse transition-all"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>Zastavit veškerý zvuk</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const lastModel = [...transcripts].reverse().find((t) => t.role === 'model');
                      if (lastModel) {
                        handleTogglePlayAudio(lastModel.id, lastModel.text, lastModel.wavBase64);
                      }
                    }}
                    title="Přehrát celou poslední repliku modelu"
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs flex items-center gap-1 transition-colors"
                  >
                    <Play className="w-2.5 h-2.5 fill-current text-cyan-400" />
                    <span>Přehrát repliku</span>
                  </button>

                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer pl-1 border-l border-slate-800">
                    <input
                      type="checkbox"
                      checked={synthesizeTtsOnText}
                      onChange={(e) => setSynthesizeTtsOnText(e.target.checked)}
                      className="accent-cyan-400 rounded"
                    />
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Auto-PCM</span>
                  </label>
                </div>
              </div>

              {statusError && (
                <div className="mx-4 mt-3 p-2.5 bg-rose-950/60 border border-rose-800/80 rounded text-xs text-rose-200 flex items-center justify-between">
                  <span>{statusError}</span>
                  <button
                    onClick={() => setStatusError(null)}
                    className="text-rose-400 hover:text-rose-200 ml-2 font-mono"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Quick Sample Hypothesis Loader from Selected Domain */}
              <div className="px-4 py-2 bg-[#07090E]/60 border-b border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 truncate">
                  Axióm domény:{' '}
                  <strong className="text-slate-200">
                    {DOMAIN_PROFILES.find((d) => d.id === selectedProfileId)?.name}
                  </strong>
                </span>
                <button
                  onClick={() => {
                    const prof = DOMAIN_PROFILES.find((d) => d.id === selectedProfileId);
                    if (prof) {
                      setInputTopicName(prof.name);
                      setInputHypothesis(prof.sampleHypothesis);
                    }
                  }}
                  className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 whitespace-nowrap shrink-0"
                >
                  Vložit vzorové téma k rozboru →
                </button>
              </div>

              {/* Conversation Stream & Proactive Branching Inquiries */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {transcripts.map((entry) => (
                  <article
                    key={entry.id}
                    className={`rounded border p-3.5 text-xs leading-relaxed ${
                      entry.role === 'user'
                        ? 'bg-slate-900/80 border-slate-700/80 text-slate-100 ml-4'
                        : entry.role === 'system' || entry.role === 'tool'
                        ? 'bg-[#07090E] border-slate-800/90 text-slate-400 font-mono text-[11px]'
                        : 'bg-[#07090E] border-slate-800 text-slate-200'
                    }`}
                  >
                    {/* Clean unboxed metadata header with typographic separators & single-track audio play button */}
                    <div className="flex items-center justify-between gap-2 mb-2 font-mono text-[11px]">
                      <div className="flex items-center gap-2 text-slate-400 min-w-0 truncate">
                        <span className="font-semibold text-slate-300">
                          {entry.role === 'user'
                            ? 'Uživatel (Teze)'
                            : entry.role === 'model'
                            ? 'Dialektický partner'
                            : entry.role === 'tool'
                            ? 'Telemetrie GPU'
                            : 'Systémový orchestrátor'}
                        </span>
                        {entry.modelTelemetry && (
                          <span
                            className={`px-1.5 py-0.5 rounded font-mono text-[10px] flex items-center gap-1 ${
                              entry.modelTelemetry.fallbackUsed
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                                : 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60'
                            }`}
                            title={`Požadovaný: ${entry.modelTelemetry.requestedModel} | Běžící: ${entry.modelTelemetry.usedModel}`}
                          >
                            {entry.modelTelemetry.fallbackUsed ? <Zap className="w-2.5 h-2.5 text-amber-400" /> : null}
                            <span>{entry.modelTelemetry.usedModel}</span>
                            {entry.modelTelemetry.latencyMs && (
                              <span className="text-slate-400 font-normal">
                                · {(entry.modelTelemetry.latencyMs / 1000).toFixed(1)}s
                              </span>
                            )}
                          </span>
                        )}
                        <span aria-hidden="true">·</span>
                        <span>{entry.timestamp}</span>
                        {entry.visualState && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-cyan-400 truncate">
                              OKLab({entry.visualState.L.toFixed(2)}, {entry.visualState.a.toFixed(2)},{' '}
                              {entry.visualState.b.toFixed(2)})
                            </span>
                          </>
                        )}
                      </div>

                      {/* On-demand Play / Stop Audio Button for this specific message */}
                      {entry.text && entry.role !== 'tool' && (
                        <button
                          type="button"
                          onClick={() => handleTogglePlayMessage(entry)}
                          disabled={loadingAudioId === entry.id}
                          title={
                            playingMessageId === entry.id
                              ? 'Zastavit přehrávání'
                              : 'Přehrát zprávu hlasem (24 kHz PCM)'
                          }
                          className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition-colors shrink-0 ${
                            playingMessageId === entry.id
                              ? 'bg-amber-500 text-slate-950 font-semibold'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                          }`}
                        >
                          {loadingAudioId === entry.id ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                              <span className="text-slate-400">Syntéza...</span>
                            </>
                          ) : playingMessageId === entry.id ? (
                            <>
                              <Square className="w-2.5 h-2.5 fill-current" />
                              <span>Zastavit</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-2.5 h-2.5 fill-current text-cyan-400" />
                              <span>Přehrát hlasem</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {entry.modelTelemetry?.notice && (
                      <div className="mb-2 p-2 rounded bg-amber-950/40 border border-amber-800/60 text-[11px] text-amber-200 flex items-center gap-1.5 font-mono">
                        <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{entry.modelTelemetry.notice}</span>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap">
                      {entry.text.replace(/\[VISUAL_STATE:[^\]]+\]/gi, '').trim()}
                    </div>

                    {/* Key Clarification Questions Interactive Block */}
                    {entry.deepAnalysis?.keyQuestions && entry.deepAnalysis.keyQuestions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Klíčové otázky pro upřesnění tématu a doplnění instrukcí:</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Zvolte otázku k doplnění
                          </span>
                        </div>
                        <div className="space-y-2">
                          {entry.deepAnalysis.keyQuestions.map((kq) => (
                            <div
                              key={kq.id}
                              className="p-2.5 rounded bg-slate-900/90 border border-amber-900/40 space-y-1.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-medium text-slate-100 flex-1">{kq.question}</p>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleTogglePlayAudio(
                                        `kq-${kq.id}`,
                                        `Klíčová otázka k tématu: ${kq.question}. Kontext: ${kq.contextWhy}`
                                      )
                                    }
                                    disabled={loadingAudioId === `kq-${kq.id}`}
                                    title={
                                      playingMessageId === `kq-${kq.id}`
                                        ? 'Zastavit přehrávání'
                                        : 'Přehrát tuto otázku hlasem (24 kHz PCM)'
                                    }
                                    className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                                      playingMessageId === `kq-${kq.id}`
                                        ? 'bg-amber-500 text-slate-950 font-semibold'
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                    }`}
                                  >
                                    {loadingAudioId === `kq-${kq.id}` ? (
                                      <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                                    ) : playingMessageId === `kq-${kq.id}` ? (
                                      <>
                                        <Square className="w-2.5 h-2.5 fill-current" />
                                        <span>Zastavit</span>
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-2.5 h-2.5 fill-current text-cyan-400" />
                                        <span>Poslechnout</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveClarificationItem(kq);
                                      setClarificationInput(answeringQuestions[kq.id] || '');
                                    }}
                                    className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 whitespace-nowrap shrink-0 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 hover:border-cyan-500"
                                  >
                                    Doplnit instrukce →
                                  </button>
                                </div>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-snug">
                                <span className="text-slate-500 font-mono">Kontext:</span> {kq.contextWhy}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Proactive Branching Inquiries Triad */}
                    {entry.branchingInquiries && entry.branchingInquiries.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                        <div className="text-[11px] font-semibold text-slate-300">
                          Proaktivní rozcestník tázání (zvolte směr disputace):
                        </div>
                        <div className="space-y-1.5">
                          {entry.branchingInquiries.map((branch, idx) => (
                            <div
                              key={idx}
                              className="w-full text-left p-2 rounded bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 transition-colors group flex items-start justify-between gap-2"
                            >
                              <button
                                type="button"
                                onClick={() => submitDialecticalTurn(branch.question)}
                                disabled={isSubmittingTurn}
                                className="flex-1 text-left"
                              >
                                <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-0.5">
                                  <span>[{branch.label}]</span>
                                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                                    Rozvinout větev →
                                  </span>
                                </div>
                                <p className="text-xs text-slate-300 group-hover:text-white leading-snug">
                                  {branch.question}
                                </p>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleTogglePlayAudio(
                                    `branch-${entry.id}-${idx}`,
                                    `${branch.label}: ${branch.question}`
                                  )
                                }
                                disabled={loadingAudioId === `branch-${entry.id}-${idx}`}
                                title={
                                  playingMessageId === `branch-${entry.id}-${idx}`
                                    ? 'Zastavit'
                                    : 'Přehrát otázku větve hlasem'
                                }
                                className={`px-1.5 py-1 rounded text-[11px] font-medium shrink-0 flex items-center gap-1 transition-colors mt-0.5 ${
                                  playingMessageId === `branch-${entry.id}-${idx}`
                                    ? 'bg-amber-500 text-slate-950 font-semibold'
                                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                }`}
                              >
                                {loadingAudioId === `branch-${entry.id}-${idx}` ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                                ) : playingMessageId === `branch-${entry.id}-${idx}` ? (
                                  <Square className="w-2.5 h-2.5 fill-current" />
                                ) : (
                                  <Play className="w-2.5 h-2.5 fill-current text-cyan-400" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                ))}
                <div ref={transcriptEndRef} />
              </div>

              {/* Clarification Input Modal/Drawer when user responds to a key question */}
              {activeClarificationItem && (
                <div className="p-3 bg-amber-950/40 border-t border-amber-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Doplnění instrukcí k otázce:</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleTogglePlayAudio(
                            `active-kq-${activeClarificationItem.id}`,
                            `Doplňující otázka: ${activeClarificationItem.question}`
                          )
                        }
                        disabled={loadingAudioId === `active-kq-${activeClarificationItem.id}`}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 ${
                          playingMessageId === `active-kq-${activeClarificationItem.id}`
                            ? 'bg-amber-500 text-slate-950 font-semibold'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {loadingAudioId === `active-kq-${activeClarificationItem.id}` ? (
                          <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                        ) : playingMessageId === `active-kq-${activeClarificationItem.id}` ? (
                          <>
                            <Square className="w-2.5 h-2.5 fill-current" />
                            <span>Zastavit</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-2.5 h-2.5 fill-current text-cyan-400" />
                            <span>Poslechnout</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveClarificationItem(null)}
                        className="text-xs text-slate-400 hover:text-slate-200"
                      >
                        ✕ Zrušit
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">
                    {activeClarificationItem.question}
                  </p>
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={clarificationInput}
                      onChange={(e) => setClarificationInput(e.target.value)}
                      placeholder="Doplňte další relevantní instrukce, specifika nebo premisy k tomuto bodu..."
                      className="flex-1 bg-[#07090E] border border-amber-800/80 rounded p-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 resize-none"
                    />
                    <button
                      type="button"
                      disabled={isSubmittingTurn || !clarificationInput.trim()}
                      onClick={() => {
                        const ans = clarificationInput.trim();
                        const q = activeClarificationItem.question;
                        setActiveClarificationItem(null);
                        setClarificationInput('');
                        submitDialecticalTurn(ans, q);
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-semibold text-xs rounded transition-colors self-end flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Odeslat doplnění</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Text Input Form: Topic Name + Detailed Description / Complex Text */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitDialecticalTurn();
                }}
                className="p-3 border-t border-slate-800/90 bg-[#07090E] space-y-2.5"
              >
                {/* Segmented control for input mode */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setInputMode('structured')}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                        inputMode === 'structured'
                          ? 'bg-slate-800 text-cyan-400 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Jméno tématu + Popis
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('fast')}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                        inputMode === 'fast'
                          ? 'bg-slate-800 text-cyan-400 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Komplexní volný text
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    Textová analýza klávesnicí
                  </span>
                </div>

                {inputMode === 'structured' ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={inputTopicName}
                      onChange={(e) => setInputTopicName(e.target.value)}
                      placeholder="Jméno tématu (např. Vědomí jako kvantový kolaps, Termodynamická sociologie...)"
                      className="w-full bg-[#0B0E17] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <textarea
                      rows={3}
                      value={inputHypothesis}
                      onChange={(e) => setInputHypothesis(e.target.value)}
                      placeholder="Popis, hypotéza nebo rozvedení tématu k hlubokému rozebrání..."
                      className="w-full bg-[#0B0E17] border border-slate-800 rounded p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>
                ) : (
                  <textarea
                    rows={4}
                    value={inputHypothesis}
                    onChange={(e) => setInputHypothesis(e.target.value)}
                    placeholder="Vložte jakkoliv složitý text, úryvek vědecké práce, argumentaci nebo tezi k dekonstrukci..."
                    className="w-full bg-[#0B0E17] border border-slate-800 rounded p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                )}

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-cyan-400 font-medium">
                      <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{selectedTextModel}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-400">{patientMode ? 'Trpělivý limit' : 'Standard'}</span>
                    {highDemandResilient && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-400 font-medium">Failover aktivní</span>
                      </>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingTurn || (!inputHypothesis.trim() && !inputTopicName.trim())}
                    className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-semibold text-xs rounded transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    {isSubmittingTurn ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Hluboká analýza ({selectedTextModel})...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Rozebrat téma</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeNav === 'physics' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs leading-relaxed">
              <div>
                <h2 className="text-base font-display font-bold text-slate-100">
                  Fyzika částicového pole a kamerový komolý jehlan
                </h2>
                <p className="text-slate-400 mt-1">
                  Matematické ukotvení solidifikované parní sféry, tangenciální projekce Curl Noise a
                  nelineární radiální stabilizace.
                </p>
              </div>

              <div className="p-3.5 bg-[#07090E] border border-slate-800 rounded space-y-2">
                <h3 className="font-semibold text-slate-200">
                  1. Ortogonální tangenciální projekce rychlostního pole Curl Noise
                </h3>
                <p className="text-slate-400">
                  Aby nedocházelo k odstředivému úniku mikročástic do prostoru, je bezdivergenční
                  pole <code className="text-cyan-400 font-mono">∇ · v_curl = 0</code> ortogonálně
                  promítnuto do tečné roviny lokálního sférického povrchu s jednotkovou normálou{' '}
                  <code className="font-mono text-slate-200">n = x / ∥x∥</code>:
                </p>
                <div className="p-2.5 bg-[#0B0E17] border border-slate-800/80 rounded font-mono text-cyan-300 text-center">
                  v_tangent = v_curl − (v_curl · n) n
                </div>
              </div>

              <div className="p-3.5 bg-[#07090E] border border-slate-800 rounded space-y-2">
                <h3 className="font-semibold text-slate-200">
                  2. Elastická sférická vazba s nelineárním tlumením (tanh)
                </h3>
                <p className="text-slate-400">
                  Radiální vzdálenost částice je omezena na dynamicky modulovanou skořepinu{' '}
                  <code className="font-mono text-slate-200">R(t) = R₀ + ΔR_audio</code> pomocí
                  hyperbolického tangens s maximální tloušťkou korony{' '}
                  <code className="font-mono text-slate-200">δ_max = 0.65</code>:
                </p>
                <div className="p-2.5 bg-[#0B0E17] border border-slate-800/80 rounded font-mono text-emerald-300 text-center">
                  r_bound = R(t) + δ_max · tanh((r_raw − R(t)) / δ_max)
                </div>
                <div className="p-2.5 bg-[#0B0E17] border border-slate-800/80 rounded font-mono text-slate-200 text-center">
                  x_final = n · r_bound + v_tangent · (μ₀ + Δμ_audio)
                </div>
              </div>

              <div className="p-3.5 bg-[#07090E] border border-slate-800 rounded space-y-2">
                <h3 className="font-semibold text-slate-200">
                  3. Analytické zarámování kamery (Frustum Fitting)
                </h3>
                <p className="text-slate-400">
                  Pro maximální poloměr <code className="font-mono">R_max = 3.6</code>, bezpečnostní
                  okraj <code className="font-mono">p = 0.15</code> a vertikální úhel{' '}
                  <code className="font-mono">θ_v = 45°</code> je vzdálenost kamery{' '}
                  <code className="font-mono">d = max(d_v, d_h)</code> počítána v reálném čase přes{' '}
                  <code className="font-mono">ResizeObserver</code>:
                </p>
                <table className="w-full text-left border-collapse font-mono text-[11px] mt-2">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-1.5">Profil</th>
                      <th className="py-1.5">Poměr α</th>
                      <th className="py-1.5">Odstup d</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr>
                      <td className="py-1.5">Širokoúhlý (16:9)</td>
                      <td className="py-1.5">1.78</td>
                      <td className="py-1.5 text-cyan-400">11.07 (Vertikální limit)</td>
                    </tr>
                    <tr>
                      <td className="py-1.5">Čtvercový (1:1)</td>
                      <td className="py-1.5">1.00</td>
                      <td className="py-1.5 text-cyan-400">11.07 (Izotropní limit)</td>
                    </tr>
                    <tr>
                      <td className="py-1.5">Mobilní (9:16)</td>
                      <td className="py-1.5">0.56</td>
                      <td className="py-1.5 text-amber-400">18.66 (Horizontální limit)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeNav === 'colorimetry' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs leading-relaxed">
              <div>
                <h2 className="text-base font-display font-bold text-slate-100">
                  Percepční kolorimetrie v prostoru OKLab a OKLCh
                </h2>
                <p className="text-slate-400 mt-1">
                  Transformace přes kubickou nelinearitu čípků LMS eliminuje šedé desaturované zóny
                  při míchání barev ve fragmentovém shaderu.
                </p>
              </div>

              <div className="p-3.5 bg-[#07090E] border border-slate-800 rounded space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Aktuální chromatický vektor</span>
                  <span className="font-mono text-cyan-400">{currentHex}</span>
                </div>
                <div
                  className="h-10 w-full rounded border border-white/10"
                  style={{ backgroundColor: currentHex }}
                />
                <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-300 pt-1">
                  <div>L (Světlost): {visualState.L.toFixed(3)}</div>
                  <div>C (Chroma): {lch.C.toFixed(3)}</div>
                  <div>h (Odstín): {lch.h.toFixed(1)}°</div>
                </div>
              </div>

              <div className="space-y-2.5">
                <h3 className="font-semibold text-slate-200">
                  Přehled afektivně-tematických profilů
                </h3>
                {DOMAIN_PROFILES.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectDomainProfile(p)}
                    className="p-3 bg-[#07090E] border border-slate-800 hover:border-slate-700 rounded cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{p.name}</span>
                      <span className="font-mono text-[11px] text-cyan-400">{p.subtitle}</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{p.visualBehavior}</p>
                    <p className="text-slate-500 text-[11px] font-mono">{p.acousticResponse}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNav === 'memory' && (
            <div className="flex-1 flex flex-col min-h-0 p-4 space-y-4 text-xs">
              <div>
                <h2 className="text-sm font-semibold text-slate-100">
                  Duální sémantická paměť & Vektorová vnoření
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Indexace konceptů a strukturálních izomorfismů pomocí modelu{' '}
                  <code className="font-mono text-cyan-400">gemini-embedding-2-preview</code>.
                </p>
              </div>

              <form onSubmit={handleSearchMemory} className="flex gap-2">
                <input
                  type="text"
                  value={memorySearchQuery}
                  onChange={(e) => setMemorySearchQuery(e.target.value)}
                  placeholder="Vyhledat sémantický koncept nebo izomorfismus..."
                  className="flex-1 bg-[#07090E] border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Hledat</span>
                </button>
              </form>

              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {memories.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-[#07090E] border border-slate-800 rounded space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-100">{m.concept}</span>
                      {m.similarity !== undefined && (
                        <span className="font-mono text-[11px] text-emerald-400 shrink-0">
                          cos(θ) = {m.similarity.toFixed(3)}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-cyan-400">{m.domain}</div>
                    <p className="text-slate-300 leading-relaxed">{m.summary}</p>
                    {m.isomorphismLink && (
                      <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
                        Izomorfismus: {m.isomorphismLink}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleStoreMemory}
                className="p-3 bg-[#07090E] border border-slate-800 rounded space-y-2"
              >
                <div className="font-semibold text-slate-200">
                  Archivovat nový koncept do vektorového indexu
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newConceptTitle}
                    onChange={(e) => setNewConceptTitle(e.target.value)}
                    placeholder="Název konceptu / teze"
                    className="bg-[#0B0E17] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100"
                  />
                  <input
                    type="text"
                    value={newConceptDomain}
                    onChange={(e) => setNewConceptDomain(e.target.value)}
                    placeholder="Mezioborová doména"
                    className="bg-[#0B0E17] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100"
                  />
                </div>
                <textarea
                  rows={2}
                  value={newConceptSummary}
                  onChange={(e) => setNewConceptSummary(e.target.value)}
                  placeholder="Formální definice a syntéza strukturálního izomorfismu..."
                  className="w-full bg-[#0B0E17] border border-slate-800 rounded p-2 text-xs text-slate-100 resize-none"
                />
                <button
                  type="submit"
                  disabled={isStoringMemory || !newConceptTitle.trim()}
                  className="w-full py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-semibold rounded flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {isStoringMemory ? 'Generování vektorového vnoření...' : 'Uložit do vektorové paměti'}
                  </span>
                </button>
              </form>
            </div>
          )}

          {activeNav === 'methodology' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs leading-relaxed">
              <div>
                <h2 className="text-base font-display font-bold text-slate-100">
                  Metodika hluboké interdisciplinární disputace
                </h2>
                <p className="text-slate-400 mt-1">
                  Produkční systémová konfigurace vkládaná do rámce{' '}
                  <code className="font-mono text-cyan-400">BidiGenerateContentSetup</code>.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-[#07090E] border border-slate-800 rounded">
                  <h3 className="font-semibold text-slate-100">01. Sokratovská elenktika</h3>
                  <p className="text-slate-400 mt-1">
                    Model neposuzuje pouze povrchovou pravdivost výroku, nýbrž odhaluje skryté
                    ontologické a normativní předpoklady, na nichž argument spočívá, a formuluje
                    cílené otázky demonstrující jejich vnitřní kontradikce.
                  </p>
                </div>

                <div className="p-3.5 bg-[#07090E] border border-slate-800 rounded">
                  <h3 className="font-semibold text-slate-100">
                    02. Mezioborový strukturální izomorfismus
                  </h3>
                  <p className="text-slate-400 mt-1">
                    Cílený přenos formálních konceptů mezi disjunktními doménami — např. aplikace
                    termodynamiky nerovnovážných systémů a teorie bifurkací na institucionální krize,
                    nebo konfrontace bioetiky s kvantovou teorií informace.
                  </p>
                </div>

                <div className="p-3.5 bg-[#07090E] border border-slate-800 rounded">
                  <h3 className="font-semibold text-slate-100">
                    03. Princip nejsilnější interpretace (Steelmanning)
                  </h3>
                  <p className="text-slate-400 mt-1">
                    Před kritikou uživatelovy hypotézy model nejprve tezi přeformuluje v její
                    nejrobustnější, argumentačně nejsilnější podobě, čímž eliminuje povrchní klamy.
                  </p>
                </div>

                <div className="p-3.5 bg-[#07090E] border border-slate-800 rounded">
                  <h3 className="font-semibold text-slate-100">
                    04. Proaktivní rozcestník tázání (Triáda)
                  </h3>
                  <p className="text-slate-400 mt-1">
                    Každý obrat je zakončen třemi rigorózními směry: Vertikální prohloubení
                    (fundamentální mechanismy), Laterální extrapolace (přenos do jiného oboru) a
                    Oponentská antiteze (nejsilnější protiargument konkurenční školy).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeNav === 'cloud' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs leading-relaxed">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1 rounded bg-cyan-500/20 text-cyan-400">
                    <Cloud className="w-4 h-4" />
                  </span>
                  <h2 className="text-base font-display font-bold text-slate-100">
                    Google Cloud Platform & Cloud Run Architektura
                  </h2>
                </div>
                <p className="text-slate-400">
                  Tato aplikace je plně kontejnerizována a nativně připravena pro bezserverový provoz na{' '}
                  <strong className="text-slate-200">Google Cloud Run</strong> s obousměrným streamováním duplexních WebSocketů a ochranou API klíče na straně serveru.
                </p>
              </div>

              {/* Live Instance Status Badge */}
              <div className="p-3.5 bg-[#07090E] border border-cyan-900/50 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Aktivní Google Cloud Run běhové prostředí</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    PRODUKČNÍ REŽIM
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500">Cloud Region:</span> europe-west1
                  </div>
                  <div>
                    <span className="text-slate-500">WebSocket Timeout:</span> 3600s (Duplex)
                  </div>
                  <div>
                    <span className="text-slate-500">Kontejner:</span> Node 22 LTS Alpine/Slim
                  </div>
                  <div>
                    <span className="text-slate-500">Audio Port:</span> 24 kHz L16 PCM
                  </div>
                </div>
              </div>

              {/* 1-Click Deployment Commands */}
              <div className="space-y-2.5">
                <h3 className="font-semibold text-slate-200 flex items-center justify-between">
                  <span>Nasazení do Vašeho Google Cloud projektu</span>
                  <span className="text-[11px] text-slate-500 font-mono">Příkazový řádek gcloud CLI</span>
                </h3>

                {/* Command 1: Quick deploy */}
                <div className="p-3 bg-[#07090E] border border-slate-800 rounded space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-cyan-400">01. Přímé nasazení ze zdrojových kódů (Doporučeno)</span>
                    <button
                      type="button"
                      onClick={() => {
                        const cmd = 'gcloud run deploy multimodal-cognitive --source . --region europe-west1 --platform managed --allow-unauthenticated --timeout 3600 --set-env-vars GEMINI_API_KEY="VÁŠ_KLÍČ"';
                        navigator.clipboard.writeText(cmd);
                        setCopiedCommand('cmd1');
                        setTimeout(() => setCopiedCommand(null), 2500);
                      }}
                      className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-[10px]"
                    >
                      {copiedCommand === 'cmd1' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Zkopírováno!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Kopírovat příkaz</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-2.5 bg-[#0B0E17] border border-slate-800 rounded font-mono text-[11px] text-slate-200 overflow-x-auto whitespace-pre-wrap select-all">
{`gcloud run deploy multimodal-cognitive \\
  --source . \\
  --region europe-west1 \\
  --platform managed \\
  --allow-unauthenticated \\
  --timeout 3600 \\
  --set-env-vars GEMINI_API_KEY="VÁŠ_KLÍČ"`}
                  </pre>
                </div>

                {/* Command 2: Shell script */}
                <div className="p-3 bg-[#07090E] border border-slate-800 rounded space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-emerald-400">02. Automatizovaný skript v repozitáři</span>
                    <button
                      type="button"
                      onClick={() => {
                        const cmd = 'chmod +x ./deploy-cloud-run.sh && ./deploy-cloud-run.sh';
                        navigator.clipboard.writeText(cmd);
                        setCopiedCommand('cmd2');
                        setTimeout(() => setCopiedCommand(null), 2500);
                      }}
                      className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-[10px]"
                    >
                      {copiedCommand === 'cmd2' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Zkopírováno!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Kopírovat příkaz</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-2.5 bg-[#0B0E17] border border-slate-800 rounded font-mono text-[11px] text-slate-200 overflow-x-auto select-all">
chmod +x ./deploy-cloud-run.sh && ./deploy-cloud-run.sh
                  </pre>
                </div>
              </div>

              {/* Technical Specifications for Google Cloud */}
              <div className="p-3.5 bg-[#07090E] border border-slate-800 rounded space-y-2.5">
                <h3 className="font-semibold text-slate-200">
                  Technické vlastnosti kontejneru pro Cloud Run
                </h3>
                <ul className="space-y-1.5 text-slate-400 text-[11px] list-disc list-inside">
                  <li>
                    <strong className="text-slate-200">Nativní podpora WebSockets:</strong> Cloud Run podporuje plně duplexní streamování s nastaveným limitem <code className="font-mono text-cyan-400">--timeout 3600</code> pro nepřetržitý hovor přes Gemini Live API.
                  </li>
                  <li>
                    <strong className="text-slate-200">Bezpečný serverový proxy:</strong> Gemini API klíč nikdy nevstupuje do klientského prohlížeče; veškeré audio a texty prochází přes zabezpečený Express server na portu <code className="font-mono text-cyan-400">0.0.0.0:${'{PORT:-8080}'}</code>.
                  </li>
                  <li>
                    <strong className="text-slate-200">Vícefázový Dockerfile:</strong> Oddělený build krok pro Vite s produkční minimalizací a distribucí statických aktiv.
                  </li>
                  <li>
                    <strong className="text-slate-200">Automatické škálování:</strong> Škálování z nuly na vyžádání bez fixních nákladů na infrastrukturu.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeNav === 'docs' && <DocumentationView lang={lang} />}

          {activeNav === 'plans' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>{t.plansTitle}</span>
                  </h2>
                  <button
                    onClick={() => setSubscriptionOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors"
                  >
                    Open Subscription & Admin Console
                  </button>
                </div>
                <p className="text-xs text-slate-400">{t.plansSubtitle}</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* 3. Entry Hub Modal (Onboarding & Quick Paradigms) */}
      <EntryHubModal
        isOpen={entryHubOpen}
        onClose={() => setEntryHubOpen(false)}
        lang={lang}
        cases={cases}
        activeCaseId={activeCaseId}
        onSelectCase={handleSelectCase}
        onStartNewCase={(title, profile) => handleStartNewCase(title, profile)}
        onStartTour={() => setTourOpen(true)}
        onOpenDocs={() => setActiveNav('docs')}
        dontShowAgain={personalization.hasSeenWelcome}
        onToggleDontShowAgain={(val) => {
          handleUpdatePersonalization({ hasSeenWelcome: val });
        }}
        onSelectLanguage={handleSelectLanguage}
      />

      {/* 4. Guided Personalisation & Customisation Tour */}
      <PersonalisationTour
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
        lang={lang}
        personalization={personalization}
        onUpdatePersonalization={handleUpdatePersonalization}
        onOpenPlans={() => setSubscriptionOpen(true)}
      />

      {/* 5. Subscription & Service Mesh Coordination Modal */}
      <SubscriptionModal
        isOpen={subscriptionOpen}
        onClose={() => setSubscriptionOpen(false)}
        lang={lang}
        currentPlan={personalization.userPlan}
        onSelectPlan={(plan) => handleUpdatePersonalization({ userPlan: plan })}
        dailyUsageCount={personalization.dailyUsageCount}
        onResetUsage={() => handleUpdatePersonalization({ dailyUsageCount: 0 })}
      />
    </div>
  );
}
