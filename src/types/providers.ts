import { VisualState, DeepAnalysisData, BranchingInquiry } from './cognitive';

export interface DialecticTurnRequest {
  userMessage: string;
  history?: Array<{ role: 'user' | 'model'; content: string }>;
  domainHint?: string;
  activeTopic?: string;
  apiKey?: string;
  customEndpoint?: string;
  temperature?: number;
}

export interface DialecticTurnResponse {
  rawText: string;
  visualState: VisualState;
  analysis: DeepAnalysisData;
  branching: BranchingInquiry[];
  modelId: string;
  latencyMs: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: 'gemini' | 'llama_cpp' | 'ollama' | 'tauri_sidecar';
  description: string;
  contextWindow: number;
  isLocal: boolean;
  quantization?: string;
}

export interface LLMProvider {
  readonly id: string;
  readonly name: string;
  readonly isLocal: boolean;
  readonly availableModels: ModelInfo[];

  generateTurn(req: DialecticTurnRequest): Promise<DialecticTurnResponse>;
  streamTurn?(
    req: DialecticTurnRequest,
    onChunk: (chunk: string) => void
  ): Promise<DialecticTurnResponse>;
}

export interface EmbeddingProvider {
  readonly id: string;
  readonly name: string;
  readonly dimension: number;
  readonly isLocal: boolean;

  embedText(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

export interface VectorItem {
  id: string;
  concept: string;
  domain: string;
  summary: string;
  isomorphismLink: string;
  embedding: number[];
  createdAt: string;
}

export interface VectorSearchResult {
  item: VectorItem;
  similarity: number;
}

export interface VectorStore {
  readonly id: string;
  readonly name: string;
  readonly isLocal: boolean;

  search(queryEmbedding: number[], limit?: number, threshold?: number): Promise<VectorSearchResult[]>;
  searchByText(queryText: string, limit?: number): Promise<VectorSearchResult[]>;
  insert(item: Omit<VectorItem, 'id' | 'createdAt'>): Promise<VectorItem>;
  listAll(): Promise<VectorItem[]>;
  delete(id: string): Promise<boolean>;
  exportDump(): Promise<string>;
  importDump(jsonString: string): Promise<number>;
}

export interface ProviderSettings {
  activeProviderId: 'gemini_proxy' | 'gemini_direct' | 'llama_cpp_local' | 'ollama_local' | 'tauri_ipc';
  userGeminiApiKey: string;
  ollamaBaseUrl: string;
  selectedLocalModel: string;
  useLocalVectorStore: boolean;
  useLocalAudioDSP: boolean;
  whisperEngine: 'browser' | 'local_sidecar';
}
