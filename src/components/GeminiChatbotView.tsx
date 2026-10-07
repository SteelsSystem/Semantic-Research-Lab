import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  Volume2,
  Copy,
  Check,
  Download,
  Sliders,
  Cpu,
  Trash2,
  RefreshCw,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { LanguageCode } from '../types/cognitive';
import { DuplexAudioEngine } from '../utils/audioEngine';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  latencyMs?: number;
  securityThreatLevel?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  securityFlags?: string[];
}

const PRESET_ROLES = [
  {
    id: 'socratic-opponent',
    name: 'Sokratovský oponent (Socratic Opponent)',
    desc: 'Neúprosná sokratovská elenktika, zpochybňování skrytých axiomů a formulace silných antitezí.',
    prompt: 'Působíte jako přísný sokratovský dialektický oponent. V každé odpovědi odhalte skryté axiomy, poukažte na vnitřní rozpory a formulujte 2 provokativní otázky.',
  },
  {
    id: 'epistemic-analyst',
    name: 'Epistemologický analytik (Epistemic Analyst)',
    desc: 'Analýza kritérií pravdivosti, falzifikovatelnosti (Popper) a hranic vědeckého realismu.',
    prompt: 'Působíte jako profesor analytické epistemologie. Zkoumejte hranice poznání, rozlišujte ontologická tvrzení od epistemických modelů a navrhujte kritéria falzifikace.',
  },
  {
    id: 'physics-theorist',
    name: 'Teoretický fyzik & Komplexní systémy (Theoretical Physics)',
    desc: 'Termodynamika nerovnovážných stavů (Prigogine), kvantová informace a nelineární dynamika.',
    prompt: 'Působíte jako teoretický fyzik zabývající se disipativními strukturami, teorií chaosu a emergentními jevy v komplexních sítích.',
  },
  {
    id: 'bioethics-auditor',
    name: 'Bioetický auditor & Systémová rizika (Bioethics & Risk)',
    desc: 'Normativní etika, genetická editace, allostatická zátěž a mezigenerační odpovědnost.',
    prompt: 'Působíte jako předseda mezinárodní bioetické komise pro hodnocení systémových a mezigeneračních rizik nových technologií.',
  },
  {
    id: 'custom',
    name: 'Vlastní definice role (Custom Role)',
    desc: 'Zadejte vlastní systémovou instrukci pro specifický oborový výzkum.',
    prompt: 'Působíte jako nezávislý interdisciplinární vědec.',
  },
];

interface GeminiChatbotViewProps {
  lang: LanguageCode;
  audioEngine?: DuplexAudioEngine | null;
  onBackToDashboard: () => void;
}

export const GeminiChatbotView: React.FC<GeminiChatbotViewProps> = ({
  lang,
  audioEngine,
  onBackToDashboard,
}) => {
  const isCs = lang === 'cs';

  // Multi-turn message state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('vaporsphere_chat_history_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'msg-init',
        role: 'model',
        text: isCs
          ? 'Kognitivní dialogové rozhraní Gemini je připraveno. Vyberte specializovanou roli a model pro dialektický rozbor Vaší teze.'
          : 'Gemini cognitive chat interface is initialized. Select a specialized role and model to dissect your thesis.',
        timestamp: new Date().toLocaleTimeString(),
        modelUsed: 'gemini-3.5-flash',
        securityThreatLevel: 'NONE',
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Model selection per instruction:
  // - gemini-3.1-pro-preview for particularly complex tasks
  // - gemini-3.5-flash for general tasks
  // - gemini-3.1-flash-lite for tasks that should happen fast
  const [selectedModel, setSelectedModel] = useState<'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');

  // Role and system instructions
  const [selectedRoleId, setSelectedRoleId] = useState<string>('socratic-opponent');
  const [customSystemPrompt, setCustomSystemPrompt] = useState<string>(PRESET_ROLES[0].prompt);
  const [roleSettingsOpen, setRoleSettingsOpen] = useState(false);

  // UI state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save conversation history to local storage
  useEffect(() => {
    try {
      localStorage.setItem('vaporsphere_chat_history_v1', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    const preset = PRESET_ROLES.find((r) => r.id === roleId);
    if (preset) {
      setCustomSystemPrompt(preset.prompt);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const activeRole = PRESET_ROLES.find((r) => r.id === selectedRoleId);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.text,
          })),
          model: selectedModel,
          systemInstruction: customSystemPrompt,
          role: activeRole?.name || 'Sokratovský oponent',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Chyba serveru HTTP ${res.status}`);
      }

      const data = await res.json();

      const modelMsg: ChatMessage = {
        id: `mod-${Date.now()}`,
        role: 'model',
        text: data.text || 'Žádná odpověď.',
        timestamp: new Date().toLocaleTimeString(),
        modelUsed: data.model || selectedModel,
        latencyMs: data.latencyMs,
        securityThreatLevel: data.securityScan?.threatLevel || 'NONE',
        securityFlags: data.securityScan?.flags || [],
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `⚠️ Chyba při komunikaci: ${err?.message || 'Neznámé selhání'}`,
        timestamp: new Date().toLocaleTimeString(),
        modelUsed: selectedModel,
        securityThreatLevel: 'HIGH',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string, id: string) => {
    if (!audioEngine) return;
    if (speakingId === id) {
      audioEngine.stopAllAudio();
      setSpeakingId(null);
    } else {
      audioEngine.playSpeechSynthesis(text, id, lang);
      setSpeakingId(id);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm(isCs ? 'Opravdu chcete vymazat historii konverzace?' : 'Clear conversation history?')) {
      const resetMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'model',
        text: isCs ? 'Historie konverzace byla vymazána. Můžete zahájit novou diskuzi.' : 'Conversation history cleared.',
        timestamp: new Date().toLocaleTimeString(),
        modelUsed: selectedModel,
      };
      setMessages([resetMsg]);
    }
  };

  const handleExportChat = () => {
    const exportText = messages
      .map((m) => `[${m.timestamp}] ${m.role.toUpperCase()} (${m.modelUsed || 'user'}):\n${m.text}\n`)
      .join('\n---\n\n');
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-dialectic-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#07090E] text-slate-100">
      {/* 1. Header Toolbar */}
      <div className="shrink-0 border-b border-slate-800/80 bg-[#0B0E17]/95 px-6 py-3 flex flex-wrap items-center justify-between gap-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-100 tracking-tight">
                {isCs ? 'Multimodální Gemini Chatbot (Multi-Turn Chat)' : 'Multimodal Gemini Chatbot'}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {selectedModel}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isCs
                ? 'Vícekroková konverzace s uchováním kontextu, volbou role a IPI bezpečnostním štítem.'
                : 'Multi-turn conversation with persistent history, system role configuration, and IPI guardrails.'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Model Switcher */}
          <div className="flex items-center gap-1.5 bg-[#090D16] border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs font-mono focus:outline-none cursor-pointer"
            >
              <option value="gemini-3.1-pro-preview" className="bg-[#090D16]">
                gemini-3.1-pro-preview (Komplexní analýza)
              </option>
              <option value="gemini-3.5-flash" className="bg-[#090D16]">
                gemini-3.5-flash (Obecný dialog)
              </option>
              <option value="gemini-3.1-flash-lite" className="bg-[#090D16]">
                gemini-3.1-flash-lite (Rychlé úlohy)
              </option>
            </select>
          </div>

          {/* Role Config Drawer Toggle */}
          <button
            onClick={() => setRoleSettingsOpen(!roleSettingsOpen)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
              roleSettingsOpen
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isCs ? 'Nastavení Role' : 'Role Settings'}</span>
          </button>

          {/* Export Chat */}
          <button
            onClick={handleExportChat}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1"
            title={isCs ? 'Exportovat konverzaci do TXT' : 'Export chat as TXT'}
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear History */}
          <button
            onClick={handleClearHistory}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-rose-300 text-xs font-medium transition-colors flex items-center gap-1"
            title={isCs ? 'Vymazat historii' : 'Clear history'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Back to Arena */}
          <button
            onClick={onBackToDashboard}
            className="px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-medium transition-colors"
          >
            {isCs ? '← Zpět do Akční Konzole' : '← Back to Arena'}
          </button>
        </div>
      </div>

      {/* 2. Role Configuration Drawer (collapsible) */}
      {roleSettingsOpen && (
        <div className="shrink-0 p-4 bg-[#090D16] border-b border-slate-800/80 animate-in slide-in-from-top-2 duration-150">
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isCs ? 'SYSTÉMOVÁ ROLE CHATBOTA' : 'CHATBOT SYSTEM ROLE'}</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {isCs ? 'Ovlivňuje tón, pojmový aparát a metodologii modelu' : 'Customizes model domain persona and rigor'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {PRESET_ROLES.slice(0, 4).map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleChange(role.id)}
                  className={`p-2.5 rounded-lg text-left border transition-all text-xs ${
                    selectedRoleId === role.id
                      ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/30'
                      : 'bg-[#0B0E17] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-slate-200 text-[11px] mb-1">{role.name.split(' (')[0]}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{role.desc}</div>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                {isCs ? 'Systémová instrukce (System Instruction):' : 'System Instruction:'}
              </label>
              <textarea
                rows={2}
                value={customSystemPrompt}
                onChange={(e) => {
                  setCustomSystemPrompt(e.target.value);
                  setSelectedRoleId('custom');
                }}
                className="w-full px-3 py-2 bg-[#0B0E17] border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-w-4xl mx-auto w-full">
        {messages.map((msg) => {
          const isModel = msg.role === 'model';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 animate-in fade-in duration-200 ${
                isModel ? 'justify-start' : 'justify-end'
              }`}
            >
              {isModel && (
                <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 space-y-2 border ${
                  isModel
                    ? 'bg-[#0B0E17] border-slate-800/90 text-slate-200 shadow-lg'
                    : 'bg-cyan-950/30 border-cyan-500/40 text-cyan-50 ml-auto'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-3 text-[11px] font-mono border-b border-slate-800/60 pb-1.5 text-slate-400">
                  <span className="font-semibold text-slate-300">
                    {isModel ? 'Gemini Kognitivní Agent' : 'Výzkumník (Vy)'}
                  </span>
                  <div className="flex items-center gap-2">
                    {msg.modelUsed && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                        {msg.modelUsed}
                      </span>
                    )}
                    {msg.latencyMs && (
                      <span className="text-[10px] text-slate-500">{msg.latencyMs} ms</span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Message Content */}
                <div className="text-xs leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>

                {/* Footer Controls: Security Badge, TTS speech, Copy */}
                <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-500">
                  <div className="flex items-center gap-1.5">
                    {msg.securityThreatLevel === 'NONE' || !msg.securityThreatLevel ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400/90">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>IPI Shield: Bezpečný</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>Detekce rizika: {msg.securityThreatLevel}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {audioEngine && (
                      <button
                        onClick={() => handleSpeak(msg.text, msg.id)}
                        className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                          speakingId === msg.id ? 'text-amber-400 font-bold' : 'text-slate-400'
                        }`}
                        title={isCs ? 'Přečíst nahlas syntézou řeči' : 'Speak message aloud'}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title={isCs ? 'Kopírovat do schránky' : 'Copy message'}
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {!isModel && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 animate-in fade-in duration-150">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-[#0B0E17] border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>{isCs ? `Model ${selectedModel} uvažuje a generuje dialektickou odpověď...` : `Generating response with ${selectedModel}...`}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Bottom Input Bar */}
      <div className="shrink-0 border-t border-slate-800/80 bg-[#0B0E17] p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isCs
                ? 'Napište výzkumnou otázku, tezi nebo argument k dialektickému rozboru...'
                : 'Enter your research hypothesis, thesis, or question...'
            }
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#07090E] border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-all"
          />

          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{isCs ? 'Odeslat' : 'Send'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
