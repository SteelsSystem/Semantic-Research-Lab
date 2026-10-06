import { AudioSpectrumMetrics } from '../types/cognitive';

/**
 * AudioWorklet processor for 16kHz 16-bit mono PCM packetization (40ms blocks = 640 samples)
 * with integrated downward expansion to eliminate room tone, fan hiss, keyboard thumps, and mouth clicks.
 * Note: The microphone signal is isolated exclusively to the VAD / capture branch and NEVER
 * connected to the AudioDestinationNode to prevent destructive acoustic feedback.
 */
const WORKLET_PROCESSOR_CODE = `
class PcmCaptureWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 640; // 40ms at 16kHz
    this.buffer = new Float32Array(this.bufferSize);
    this.writeIndex = 0;

    // Downward expander & adaptive noise-gate envelope tracking
    this.envelope = 0.0;
    this.gateGain = 1.0;
    this.expanderThreshold = 0.015; // -36.5 dB threshold for room hum & quiet mechanical noise
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;
    const channelData = input[0];

    let sumSquares = 0;
    for (let i = 0; i < channelData.length; i++) {
      const rawSample = channelData[i];
      const absSample = Math.abs(rawSample);

      // Asymmetric fast-attack (2ms) and smooth-decay (80ms) envelope follower
      if (absSample > this.envelope) {
        this.envelope = 0.88 * this.envelope + 0.12 * absSample;
      } else {
        this.envelope = 0.994 * this.envelope + 0.006 * absSample;
      }

      // Smooth downward expander transfer curve:
      // When speech is above threshold, gateGain stays 1.0 (0dB) with zero coloration.
      // When signal drops below threshold (ambient room noise, keyboard clicks, breathing),
      // softly attenuate down to -28dB without chopping word tails.
      if (this.envelope < this.expanderThreshold) {
        const ratio = Math.max(0.03, this.envelope / this.expanderThreshold);
        const targetGain = Math.pow(ratio, 1.8);
        this.gateGain = 0.92 * this.gateGain + 0.08 * targetGain;
      } else {
        this.gateGain = 0.82 * this.gateGain + 0.18 * 1.0;
      }

      const processedSample = rawSample * this.gateGain;
      sumSquares += processedSample * processedSample;
      this.buffer[this.writeIndex++] = processedSample;

      if (this.writeIndex >= this.bufferSize) {
        const pcm16 = new Int16Array(this.bufferSize);
        for (let j = 0; j < this.bufferSize; j++) {
          const s = Math.max(-1, Math.min(1, this.buffer[j]));
          pcm16[j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        const rms = Math.sqrt(sumSquares / this.bufferSize);
        this.port.postMessage({
          pcmBuffer: pcm16.buffer,
          rms
        }, [pcm16.buffer]);

        this.buffer = new Float32Array(this.bufferSize);
        this.writeIndex = 0;
      }
    }
    return true;
  }
}
registerProcessor('pcm-capture-worklet', PcmCaptureWorkletProcessor);
`;

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToInt16Array(base64: string): Int16Array {
  const binary = atob(base64);
  const sampleCount = Math.floor(binary.length / 2);
  const bytes = new Uint8Array(sampleCount * 2);
  for (let i = 0; i < sampleCount * 2; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Int16Array(bytes.buffer, 0, sampleCount);
}

/**
 * Splits spoken text into human sentence and clause chunks (80-180 chars).
 * Chunking completely avoids browser speech-synthesis buffer cutoffs and
 * ensures clean boundary pauses and uninterrupted vocalization.
 */
export function splitSpeechChunks(text: string, maxChunkLen = 180): string[] {
  const clean = sanitizeSpeechText(text);
  if (!clean) return [];

  // Split on sentence terminal punctuation (. ? ! \n ;)
  const rawSentences = clean.match(/[^.!?\n;:]+[.!?\n;:]*/g) || [clean];
  const chunks: string[] = [];

  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    if (trimmed.length <= maxChunkLen) {
      chunks.push(trimmed);
    } else {
      // Split long sentence by clauses or spaces
      const words = trimmed.split(' ');
      let current = '';
      for (const w of words) {
        if ((current + ' ' + w).trim().length <= maxChunkLen) {
          current = (current + ' ' + w).trim();
        } else {
          if (current) chunks.push(current);
          current = w;
        }
      }
      if (current) chunks.push(current);
    }
  }

  return chunks.length > 0 ? chunks : [clean];
}

/**
 * Pure DSP Utility: Root-Mean-Square calculation
 */
export function calculateRms(samples: Float32Array | number[]): number {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  return Math.sqrt(sum / samples.length);
}

/**
 * Pure DSP Utility: Downward expander simulation matching the worklet transfer function
 */
export function simulateDownwardExpander(
  samples: Float32Array | number[],
  expanderThreshold = 0.015
): { processed: Float32Array; gains: Float32Array } {
  const len = samples.length;
  const processed = new Float32Array(len);
  const gains = new Float32Array(len);
  let envelope = 0.0;
  let gateGain = 1.0;

  for (let i = 0; i < len; i++) {
    const rawSample = samples[i];
    const absSample = Math.abs(rawSample);

    if (absSample > envelope) {
      envelope = 0.88 * envelope + 0.12 * absSample;
    } else {
      envelope = 0.994 * envelope + 0.006 * absSample;
    }

    if (envelope < expanderThreshold) {
      const ratio = Math.max(0.03, envelope / expanderThreshold);
      const targetGain = Math.pow(ratio, 1.8);
      gateGain = 0.92 * gateGain + 0.08 * targetGain;
    } else {
      gateGain = 0.82 * gateGain + 0.18 * 1.0;
    }

    gains[i] = gateGain;
    processed[i] = rawSample * gateGain;
  }

  return { processed, gains };
}

/**
 * Pure DSP Utility: Biquad Highpass Filter Coefficients calculation
 * Standard Audio EQ Cookbook formula for highpass biquad
 */
export function calculateBiquadHighpassCoeffs(sampleRate: number, cutoffHz: number, Q = 0.707) {
  const w0 = (2 * Math.PI * cutoffHz) / sampleRate;
  const cosW0 = Math.cos(w0);
  const sinW0 = Math.sin(w0);
  const alpha = sinW0 / (2 * Q);

  const b0 = (1 + cosW0) / 2;
  const b1 = -(1 + cosW0);
  const b2 = (1 + cosW0) / 2;
  const a0 = 1 + alpha;
  const a1 = -2 * cosW0;
  const a2 = 1 - alpha;

  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a1: a1 / a0,
    a2: a2 / a0,
  };
}

/**
 * Pure DSP & Speech Utility: Cleans model output into natural spoken text
 * Strips bracketed protocol tags, markdown bold/italics/headings, code fences, and telemetric metadata
 */
export function sanitizeSpeechText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\[VISUAL_STATE:[^\]]+\]/gi, '')
    .replace(/\[KLÍČOVÁ OTÁZKA\s*\d*\]:?/gi, '')
    .replace(/\[KEY_QUESTION\s*\d*\]:?/gi, '')
    .replace(/\[Vertikální prohloubení\]:?/gi, 'Vertikální prohloubení:')
    .replace(/\[Laterální extrapolace\]:?/gi, 'Laterální extrapolace:')
    .replace(/\[Oponentská antiteze\]:?/gi, 'Oponentská antiteze:')
    .replace(/\[EXTEND_CONTEXT:[^\]]+\]/gi, '')
    .replace(/\[USER_CLARIFICATION:[^\]]+\]/gi, '')
    .replace(/[*#_`~>]/g, '')
    .replace(/\|\|.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Asymmetric Envelope Follower
 * Models human auditory ballistics with independent attack (tau_att) and decay (tau_dec) time constants:
 * alpha_att = exp(-dt / tau_att), alpha_dec = exp(-dt / tau_dec)
 * A[n] = alpha * A[n-1] + (1 - alpha) * E[n]
 */
export class AsymmetricEnvelopeFollower {
  private currentLevel = 0;
  private tauAtt: number;
  private tauDec: number;

  constructor(tauAttSeconds: number, tauDecSeconds: number) {
    this.tauAtt = tauAttSeconds;
    this.tauDec = tauDecSeconds;
  }

  public process(instantEnergy: number, dtSeconds: number): number {
    const dt = Math.max(0.001, Math.min(0.1, dtSeconds));
    const alpha =
      instantEnergy > this.currentLevel
        ? Math.exp(-dt / this.tauAtt)
        : Math.exp(-dt / this.tauDec);

    this.currentLevel = alpha * this.currentLevel + (1.0 - alpha) * instantEnergy;
    return this.currentLevel;
  }

  public getCurrentLevel(): number {
    return this.currentLevel;
  }

  public reset() {
    this.currentLevel = 0;
  }
}

export class DuplexAudioEngine {
  private inputCtx: AudioContext | null = null;
  private outputCtx: AudioContext | null = null;
  private sharedOutputGain: GainNode | null = null;
  private outputAnalyser: AnalyserNode | null = null;
  private inputAnalyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private workletNode: AudioWorkletNode | null = null;

  // Sound Engineer DSP Channel Strip Nodes
  private hpfNode: BiquadFilterNode | null = null;
  private clarityEqNode: BiquadFilterNode | null = null;
  private deHissNode: BiquadFilterNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private limiterNode: DynamicsCompressorNode | null = null;
  private pttGainNode: GainNode | null = null;

  // Push-to-Talk (PTT) state: hard default is true!
  private isPttMode = true;
  private isPttPressed = false;
  private dspEnabled = true;

  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private nextStartTime = 0;
  private rmsInput = 0;
  private bargeInThreshold = 0.065;
  private isModelSpeaking = false;
  private bargeInTriggered = false;
  public currentlyPlayingId: string | null = null;
  private onPlaybackStateChange: ((isPlaying: boolean, entryId: string | null) => void) | null = null;
  private playbackToken = 0;

  private freqData: Uint8Array = new Uint8Array(512);
  private inputFreqData: Uint8Array = new Uint8Array(512);

  // Asymmetric Envelope Followers per frequency band as specified:
  // Band 1: 0 - 250 Hz (F0 fundamental) -> tau_att = 10ms (0.010s), tau_dec = 120ms (0.120s)
  private envLow = new AsymmetricEnvelopeFollower(0.010, 0.120);
  // Band 2: 250 - 2500 Hz (F1, F2 formants) -> tau_att = 20ms (0.020s), tau_dec = 150ms (0.150s)
  private envMid = new AsymmetricEnvelopeFollower(0.020, 0.150);
  // Band 3: 2500 - 8000 Hz (F3, F4 sibilants/transients) -> tau_att = 5ms (0.005s), tau_dec = 80ms (0.080s)
  private envHigh = new AsymmetricEnvelopeFollower(0.005, 0.080);

  private lastProcessTime = performance.now();

  private onAudioPacketCallback: ((base64Pcm: string) => void) | null = null;
  private onLocalBargeInCallback: (() => void) | null = null;

  // Synthetic PCM Vocal Harmonics Generator (AudioBufferSourceNode -> sharedOutputGain -> AnalyserNode + Destination)
  private synthSource: AudioBufferSourceNode | null = null;
  public isSimulatingVoice = false;

  // Speech Synthesis Acoustic Resonance Driver (feeds outputAnalyser during speech synthesis so sphere animates)
  private speechAcousticSource: AudioBufferSourceNode | null = null;
  private speechAcousticGain: GainNode | null = null;
  private speechKeepAliveTimer: any = null;
  // Strongly pinned utterance reference: prevents V8 GC from killing SpeechSynthesisUtterance while user types
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  // Guard flag: protects text reading from being cancelled by keyboard typing sounds into microphone
  private isTextReadingMode = false;

  /**
   * Initializes linearized output signal topology:
   * AudioBufferSourceNode -> sharedOutputGain -> [AudioDestinationNode, AnalyserNode (N_FFT = 1024, smoothing = 0.8)]
   */
  public async initOutputContext() {
    if (!this.outputCtx) {
      this.outputCtx = new AudioContext({ sampleRate: 24000 });
      this.sharedOutputGain = this.outputCtx.createGain();
      this.sharedOutputGain.gain.value = 1.0;

      this.outputAnalyser = this.outputCtx.createAnalyser();
      this.outputAnalyser.fftSize = 1024;
      this.outputAnalyser.smoothingTimeConstant = 0.8;

      // Parallel routing from shared GainNode to hardware destination and AnalyserNode
      this.sharedOutputGain.connect(this.outputCtx.destination);
      this.sharedOutputGain.connect(this.outputAnalyser);

      this.freqData = new Uint8Array(this.outputAnalyser.frequencyBinCount);
    }
    if (this.outputCtx.state === 'suspended') {
      try {
        await this.outputCtx.resume();
      } catch (e) {
        console.warn('AudioContext resume deferred until user gesture:', e);
      }
    }
  }

  /**
   * Sound Engineer Professional Capture Chain:
   * MediaStream ->
   * 1. HPF (85Hz, 12dB/oct) [Cuts sub-rumble, desk thumps, HVAC & heavy plosives] ->
   * 2. Clarity Presence EQ (2800Hz, +3.5dB peaking) [Lifts speech consonants & intelligibility] ->
   * 3. De-Hiss Filter (7200Hz lowpass) [Cuts coil whine, fan hiss, ultrasonic artifacts] ->
   * 4. Studio Vocal Compressor (-22dB threshold, 3.5:1 ratio, 3ms attack, 140ms release) [Smooth dynamic leveling] ->
   * 5. Brickwall Peak Limiter (-1.5dB ceiling, 20:1 ratio, 1ms attack) [Prevents digital clipping & distortion] ->
   * 6. De-Clicking PTT Ramp Gain Node (12ms smooth fade in/out) ->
   * 7. Input AnalyserNode ->
   * 8. WorkletNode with Downward Expander (attenuates room noise floor < -36dB)
   */
  public async startMicrophoneCapture(
    onAudioPacket: (base64Pcm: string) => void,
    onLocalBargeIn: () => void
  ) {
    await this.initOutputContext();
    this.onAudioPacketCallback = onAudioPacket;
    this.onLocalBargeInCallback = onLocalBargeIn;

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: false, // Managed by our studio compressor & limiter for zero pumping
      },
    });

    this.inputCtx = new AudioContext({ sampleRate: 16000 });
    if (this.inputCtx.state === 'suspended') {
      await this.inputCtx.resume();
    }

    const source = this.inputCtx.createMediaStreamSource(this.mediaStream);

    // 1. High-Pass Filter (removes rumble, desk thumps, low HVAC frequency, and microphone plosive pops)
    const hpf = this.inputCtx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 85;
    hpf.Q.value = 0.707;
    this.hpfNode = hpf;

    // 2. Vocal Clarity & Speech Presence EQ (lifts consonant intelligibility for optimal AI transcription)
    const clarityEq = this.inputCtx.createBiquadFilter();
    clarityEq.type = 'peaking';
    clarityEq.frequency.value = 2800;
    clarityEq.gain.value = 3.5;
    clarityEq.Q.value = 1.1;
    this.clarityEqNode = clarityEq;

    // 3. De-Hiss Low-Pass Filter (cuts ultra-high fan noise, coil whine, electronic hum)
    const deHiss = this.inputCtx.createBiquadFilter();
    deHiss.type = 'lowpass';
    deHiss.frequency.value = 7200;
    deHiss.Q.value = 0.707;
    this.deHissNode = deHiss;

    // 4. Vocal Dynamics Compressor (smooth leveling so soft spoken words and emphatic speech stay even)
    const compressor = this.inputCtx.createDynamicsCompressor();
    compressor.threshold.value = -22;
    compressor.knee.value = 10;
    compressor.ratio.value = 3.5;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.14;
    this.compressorNode = compressor;

    // 5. Studio Brickwall Peak Limiter (prevents digital clipping / overload distortion into the live model)
    const limiter = this.inputCtx.createDynamicsCompressor();
    limiter.threshold.value = -1.5;
    limiter.knee.value = 0;
    limiter.ratio.value = 20.0;
    limiter.attack.value = 0.001;
    limiter.release.value = 0.05;
    this.limiterNode = limiter;

    // 6. Push-to-Talk (PTT) Anti-Click Smooth Gain Node
    const pttGain = this.inputCtx.createGain();
    // Default to PTT mode: muted (0.0) until user presses PTT, or 1.0 if open mic
    const initialGain = this.isPttMode && !this.isPttPressed ? 0.0 : 1.0;
    pttGain.gain.setValueAtTime(initialGain, this.inputCtx.currentTime);
    this.pttGainNode = pttGain;

    // 7. Input Analyser for UI Spectrum Readout & Sphere Reactivity
    this.inputAnalyser = this.inputCtx.createAnalyser();
    this.inputAnalyser.fftSize = 1024;
    this.inputAnalyser.smoothingTimeConstant = 0.8;
    this.inputFreqData = new Uint8Array(this.inputAnalyser.frequencyBinCount);

    // Audio routing graph
    source.connect(hpf);
    hpf.connect(clarityEq);
    clarityEq.connect(deHiss);
    deHiss.connect(compressor);
    compressor.connect(limiter);
    limiter.connect(pttGain);
    pttGain.connect(this.inputAnalyser);

    // 8. Load and connect AudioWorkletNode
    const blob = new Blob([WORKLET_PROCESSOR_CODE], { type: 'application/javascript' });
    const workletUrl = URL.createObjectURL(blob);

    await this.inputCtx.audioWorklet.addModule(workletUrl);
    URL.revokeObjectURL(workletUrl);

    this.workletNode = new AudioWorkletNode(this.inputCtx, 'pcm-capture-worklet');
    this.workletNode.port.onmessage = (event) => {
      const { pcmBuffer, rms } = event.data;
      this.rmsInput = rms;

      // Local zero-latency VAD barge-in detection (only triggers if mic is active, loud enough, and NOT in text reading mode)
      if (this.isModelSpeaking && !this.isTextReadingMode && rms > this.bargeInThreshold) {
        this.bargeInTriggered = true;
        this.clearPlaybackQueue();
        if (this.onLocalBargeInCallback) {
          this.onLocalBargeInCallback();
        }
      } else if (rms <= this.bargeInThreshold * 0.6) {
        this.bargeInTriggered = false;
      }

      if (this.onAudioPacketCallback) {
        const base64 = arrayBufferToBase64(pcmBuffer);
        this.onAudioPacketCallback(base64);
      }
    };

    // Connect pttGain to workletNode ONLY (isolated from output to avoid feedback)
    pttGain.connect(this.workletNode);
  }

  /**
   * Push-to-Talk (PTT) Press / Release trigger.
   * Employs an 12ms / 15ms linear anti-click ramp to completely eliminate mechanical switch clicks.
   */
  public setPttPressed(pressed: boolean) {
    this.isPttPressed = pressed;
    if (!this.inputCtx || !this.pttGainNode) return;

    const now = this.inputCtx.currentTime;
    this.pttGainNode.gain.cancelScheduledValues(now);

    if (!this.isPttMode) {
      // In Open Mic mode, gain is always unmuted
      this.pttGainNode.gain.setValueAtTime(1.0, now);
      return;
    }

    if (pressed) {
      // Smooth 12ms linear ramp up to 1.0 (anti-click engagement)
      this.pttGainNode.gain.setValueAtTime(this.pttGainNode.gain.value, now);
      this.pttGainNode.gain.linearRampToValueAtTime(1.0, now + 0.012);
    } else {
      // Smooth 15ms linear ramp down to 0.0 (anti-click release)
      this.pttGainNode.gain.setValueAtTime(this.pttGainNode.gain.value, now);
      this.pttGainNode.gain.linearRampToValueAtTime(0.0, now + 0.015);
    }
  }

  public getPttPressed(): boolean {
    return this.isPttPressed;
  }

  /**
   * Enables or disables Push-to-Talk mode.
   * If enabled (default), mic is muted until pressed.
   * If disabled (Open Mic), mic streams continuously.
   */
  public setPttMode(enabled: boolean) {
    this.isPttMode = enabled;
    if (!this.inputCtx || !this.pttGainNode) return;

    const now = this.inputCtx.currentTime;
    this.pttGainNode.gain.cancelScheduledValues(now);

    if (!enabled) {
      // Switched to Open Mic: fade up to 1.0
      this.pttGainNode.gain.setValueAtTime(this.pttGainNode.gain.value, now);
      this.pttGainNode.gain.linearRampToValueAtTime(1.0, now + 0.015);
    } else {
      // Switched to PTT: mute unless currently pressed
      const target = this.isPttPressed ? 1.0 : 0.0;
      this.pttGainNode.gain.setValueAtTime(this.pttGainNode.gain.value, now);
      this.pttGainNode.gain.linearRampToValueAtTime(target, now + 0.015);
    }
  }

  public getPttMode(): boolean {
    return this.isPttMode;
  }

  /**
   * Toggles the Sound Engineer DSP processing chain (HPF, Clarity EQ, De-Hiss).
   */
  public setDspEnabled(enabled: boolean) {
    this.dspEnabled = enabled;
    if (this.clarityEqNode) {
      this.clarityEqNode.gain.value = enabled ? 3.5 : 0.0;
    }
    if (this.hpfNode) {
      this.hpfNode.frequency.value = enabled ? 85 : 10;
    }
    if (this.deHissNode) {
      this.deHissNode.frequency.value = enabled ? 7200 : 20000;
    }
  }

  public getDspEnabled(): boolean {
    return this.dspEnabled;
  }

  public stopMicrophoneCapture() {
    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.inputCtx) {
      this.inputCtx.close().catch(() => {});
      this.inputCtx = null;
      this.inputAnalyser = null;
      this.hpfNode = null;
      this.clarityEqNode = null;
      this.deHissNode = null;
      this.compressorNode = null;
      this.limiterNode = null;
      this.pttGainNode = null;
    }
    this.rmsInput = 0;
    this.isPttPressed = false;
  }

  /**
   * Enqueues incoming 24kHz 16-bit mono PCM audio from Gemini Live API
   * through AudioBufferSourceNode -> sharedOutputGain -> [Destination, AnalyserNode].
   * Ensures any active clip or simulation is silenced before streaming live chunks.
   */
  public async enqueuePcm24kChunk(base64Pcm: string) {
    await this.initOutputContext();
    if (!this.outputCtx || !this.sharedOutputGain) return;

    // If an on-demand clip or acoustic simulation was running, stop it completely to prevent audio chaos
    if (this.synthSource || this.currentlyPlayingId) {
      this.stopAllAudio();
    }

    const int16 = base64ToInt16Array(base64Pcm);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }

    const audioBuffer = this.outputCtx.createBuffer(1, float32.length, 24000);
    audioBuffer.getChannelData(0).set(float32);

    const source = this.outputCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.sharedOutputGain);

    const currentTime = this.outputCtx.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime + 0.015;
    }

    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
    this.activeSources.add(source);
    this.isModelSpeaking = true;

    source.onended = () => {
      this.activeSources.delete(source);
      if (this.activeSources.size === 0) {
        this.isModelSpeaking = false;
      }
    };
  }

  public setPlaybackStateListener(listener: (isPlaying: boolean, entryId: string | null) => void) {
    this.onPlaybackStateChange = listener;
  }

  /**
   * Generates dynamic acoustic speech resonance into outputAnalyser while SpeechSynthesis speaks.
   * This guarantees the VaporSphere particle mesh actively pulses, flexes, and radiates in real time
   * without echoing duplicate audible audio to hardware speakers.
   */
  private startSpeechAcousticResonance() {
    if (!this.outputCtx || !this.outputAnalyser) return;
    this.stopSpeechAcousticResonance();

    try {
      const sampleRate = 24000;
      const duration = 4.0;
      const totalSamples = sampleRate * duration;
      const buffer = this.outputCtx.createBuffer(1, totalSamples, sampleRate);
      const data = buffer.getChannelData(0);

      // Synthesize realistic speech formant spectra (F0 pitch 140Hz, F1 650Hz, F2 1900Hz, F3 3200Hz)
      // modulated by typical ~3.6Hz speech syllable envelope
      for (let i = 0; i < totalSamples; i++) {
        const t = i / sampleRate;
        const syllableEnv = Math.max(0, Math.sin(2 * Math.PI * 3.6 * t) * 0.7 + Math.sin(2 * Math.PI * 1.2 * t) * 0.3);
        const pitchF0 = 145 + 20 * Math.sin(2 * Math.PI * 0.8 * t);
        const fundamental = Math.sin(2 * Math.PI * pitchF0 * t);
        const formantF1 = 0.6 * Math.sin(2 * Math.PI * 650 * t);
        const formantF2 = 0.35 * Math.sin(2 * Math.PI * 1900 * t);
        const sibilanceF3 = 0.15 * (Math.random() * 2 - 1) * Math.sin(2 * Math.PI * 7.2 * t);

        data[i] = syllableEnv * (fundamental + formantF1 + formantF2 + sibilanceF3) * 0.75;
      }

      const source = this.outputCtx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const gain = this.outputCtx.createGain();
      gain.gain.value = 1.0;

      // Connect exclusively to outputAnalyser so FFT gets full speech motion without audio doubling
      source.connect(gain);
      gain.connect(this.outputAnalyser);

      source.start(0);
      this.speechAcousticSource = source;
      this.speechAcousticGain = gain;
    } catch (e) {
      console.warn('Failed to start speech acoustic resonance driver:', e);
    }
  }

  private stopSpeechAcousticResonance() {
    if (this.speechAcousticSource) {
      try {
        this.speechAcousticSource.stop(0);
        this.speechAcousticSource.disconnect();
      } catch {}
      this.speechAcousticSource = null;
    }
    if (this.speechAcousticGain) {
      try {
        this.speechAcousticGain.disconnect();
      } catch {}
      this.speechAcousticGain = null;
    }
    if (this.speechKeepAliveTimer) {
      clearInterval(this.speechKeepAliveTimer);
      this.speechKeepAliveTimer = null;
    }
  }

  /**
   * Plays a unary WAV base64 buffer (24kHz 16-bit mono from gemini-3.8-flash-lite-tts)
   * through AudioBufferSourceNode -> sharedOutputGain -> [Destination, AnalyserNode].
   * Strictly cancels and clears any prior audio, live audio, or acoustic simulation.
   * Uses an incrementing playbackToken to discard stale decodes and prevent race conditions.
   */
  public async playWavBase64(wavBase64: string, entryId?: string) {
    await this.initOutputContext();
    if (!this.outputCtx || !this.sharedOutputGain) return;

    if (this.outputCtx.state === 'suspended') {
      try {
        await this.outputCtx.resume();
      } catch (e) {
        console.warn('AudioContext resume deferred:', e);
      }
    }

    // Immediately stop everything playing and grab a new playback token
    this.stopAllAudio();
    const currentToken = ++this.playbackToken;

    this.currentlyPlayingId = entryId || null;
    if (this.onPlaybackStateChange) {
      this.onPlaybackStateChange(true, this.currentlyPlayingId);
    }

    try {
      const binary = atob(wavBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      // Check if starts with "RIFF" (WAV header = 44 bytes) or raw PCM
      const isRiff =
        bytes.length > 44 &&
        bytes[0] === 0x52 && // R
        bytes[1] === 0x49 && // I
        bytes[2] === 0x46 && // F
        bytes[3] === 0x46;   // F

      let audioBuffer: AudioBuffer | null = null;

      if (isRiff) {
        try {
          audioBuffer = await this.outputCtx.decodeAudioData(bytes.buffer.slice(0));
        } catch {
          const pcmOffset = 44;
          const sampleCount = Math.floor((bytes.byteLength - pcmOffset) / 2);
          const dataView = new DataView(bytes.buffer, pcmOffset, sampleCount * 2);
          const float32 = new Float32Array(sampleCount);
          for (let i = 0; i < sampleCount; i++) {
            float32[i] = dataView.getInt16(i * 2, true) / 32768.0;
          }
          audioBuffer = this.outputCtx.createBuffer(1, sampleCount, 24000);
          audioBuffer.getChannelData(0).set(float32);
        }
      } else {
        const sampleCount = Math.floor(bytes.byteLength / 2);
        const dataView = new DataView(bytes.buffer, 0, sampleCount * 2);
        const float32 = new Float32Array(sampleCount);
        for (let i = 0; i < sampleCount; i++) {
          float32[i] = dataView.getInt16(i * 2, true) / 32768.0;
        }
        audioBuffer = this.outputCtx.createBuffer(1, sampleCount, 24000);
        audioBuffer.getChannelData(0).set(float32);
      }

      // ANTI-CHAOS CHECK: If user stopped or clicked something else while decoding, drop this buffer!
      if (this.playbackToken !== currentToken) {
        return;
      }

      if (!audioBuffer) {
        this.currentlyPlayingId = null;
        if (this.onPlaybackStateChange) this.onPlaybackStateChange(false, null);
        return;
      }

      const source = this.outputCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.sharedOutputGain);
      source.start(0);
      this.activeSources.add(source);
      this.isModelSpeaking = true;

      source.onended = () => {
        this.activeSources.delete(source);
        if (this.playbackToken === currentToken && this.activeSources.size === 0) {
          this.isModelSpeaking = false;
          this.currentlyPlayingId = null;
          if (this.onPlaybackStateChange) {
            this.onPlaybackStateChange(false, null);
          }
        }
      };
    } catch (err) {
      console.warn('Playback of synthesized voice audio failed gracefully:', err);
      if (this.playbackToken === currentToken) {
        this.currentlyPlayingId = null;
        if (this.onPlaybackStateChange) {
          this.onPlaybackStateChange(false, null);
        }
      }
    }
  }

  /**
   * Deterministic Barge-in / Interruption queue flush via source.stop(0).
   * Completely silences any active model or clip playback.
   */
  public clearPlaybackQueue() {
    this.playbackToken++;
    this.stopSpeechAcousticResonance();
    this.isTextReadingMode = false;
    this.activeUtterance = null;
    if (typeof window !== 'undefined') {
      (window as any).__sphereActiveUtterance = null;
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
    }
    if (this.speechKeepAliveTimer) {
      clearInterval(this.speechKeepAliveTimer);
      this.speechKeepAliveTimer = null;
    }
    this.activeSources.forEach((src) => {
      try {
        src.stop(0);
        src.disconnect();
      } catch {}
    });
    this.activeSources.clear();
    if (this.outputCtx) {
      this.nextStartTime = this.outputCtx.currentTime;
    }
    this.isModelSpeaking = false;
    this.currentlyPlayingId = null;
    if (this.onPlaybackStateChange) {
      this.onPlaybackStateChange(false, null);
    }
  }

  /**
   * Native client-side speech synthesis with sentence chunking & GC-immunity.
   * Feeds the acoustic analysis node so the vapor sphere breathes and flexes in real-time.
   * Guaranteed never to stop midway when user types on keyboard or during V8 garbage collection.
   */
  public async playSpeechSynthesis(text: string, entryId: string, lang = 'cs') {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const chunks = splitSpeechChunks(text, 180);
    if (chunks.length === 0) return;

    this.clearPlaybackQueue();
    await this.initOutputContext();
    if (this.outputCtx && this.outputCtx.state === 'suspended') {
      try {
        await this.outputCtx.resume();
      } catch {}
    }

    const currentToken = this.playbackToken;
    this.currentlyPlayingId = entryId;
    this.isModelSpeaking = true;
    this.isTextReadingMode = true;

    if (this.onPlaybackStateChange) {
      this.onPlaybackStateChange(true, entryId);
    }

    // Start acoustic resonance driver so the 3D sphere breathes and flexes in sync
    this.startSpeechAcousticResonance();

    const langCode = lang.toLowerCase();
    let resolvedLangCode = 'cs-CZ';
    if (langCode === 'en') resolvedLangCode = 'en-US';
    else if (langCode === 'de') resolvedLangCode = 'de-DE';
    else if (langCode === 'fr') resolvedLangCode = 'fr-FR';
    else if (langCode === 'es') resolvedLangCode = 'es-ES';
    else if (langCode === 'zh') resolvedLangCode = 'zh-CN';
    else if (langCode === 'ja') resolvedLangCode = 'ja-JP';

    const getVoice = (): SpeechSynthesisVoice | null => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return null;
      return (
        voices.find((v) => v.lang.toLowerCase() === resolvedLangCode.toLowerCase()) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(resolvedLangCode.toLowerCase())) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(langCode)) ||
        voices.find((v) => v.default) ||
        voices[0] ||
        null
      );
    };

    let chunkIndex = 0;

    const playNextChunk = () => {
      // If token changed (user clicked stop or new turn started), abort immediately
      if (this.playbackToken !== currentToken) {
        this.activeUtterance = null;
        (window as any).__sphereActiveUtterance = null;
        return;
      }

      if (chunkIndex >= chunks.length) {
        // Complete playback reached
        this.stopSpeechAcousticResonance();
        if (this.speechKeepAliveTimer) {
          clearInterval(this.speechKeepAliveTimer);
          this.speechKeepAliveTimer = null;
        }
        this.isModelSpeaking = false;
        this.isTextReadingMode = false;
        this.currentlyPlayingId = null;
        this.activeUtterance = null;
        (window as any).__sphereActiveUtterance = null;
        if (this.onPlaybackStateChange) {
          this.onPlaybackStateChange(false, null);
        }
        return;
      }

      const chunkText = chunks[chunkIndex++];
      const utterance = new SpeechSynthesisUtterance(chunkText);
      // Pin reference to class property and window to make it 100% immune to V8 GC while typing
      this.activeUtterance = utterance;
      (window as any).__sphereActiveUtterance = utterance;

      utterance.lang = resolvedLangCode;
      const voice = getVoice();
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = 1.05;

      utterance.onboundary = () => {
        if (this.speechAcousticGain && this.outputCtx) {
          const now = this.outputCtx.currentTime;
          this.speechAcousticGain.gain.cancelScheduledValues(now);
          this.speechAcousticGain.gain.setValueAtTime(1.35, now);
          this.speechAcousticGain.gain.exponentialRampToValueAtTime(0.75, now + 0.12);
        }
      };

      utterance.onend = () => {
        if (this.playbackToken === currentToken) {
          // Play next chunk
          playNextChunk();
        }
      };

      utterance.onerror = (err) => {
        // If an individual chunk fails (e.g. system voice glitch), proceed to next chunk rather than dead silence
        if (this.playbackToken === currentToken) {
          console.warn('SpeechSynthesis chunk note:', err?.error || err);
          playNextChunk();
        }
      };

      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      } catch (speakErr) {
        console.warn('SpeechSynthesis speak failed:', speakErr);
        playNextChunk();
      }
    };

    // Chrome 15s keepalive & pause un-stick
    if (this.speechKeepAliveTimer) {
      clearInterval(this.speechKeepAliveTimer);
    }
    this.speechKeepAliveTimer = setInterval(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        if (window.speechSynthesis.speaking) {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } else if (chunkIndex >= chunks.length) {
          clearInterval(this.speechKeepAliveTimer);
          this.speechKeepAliveTimer = null;
        }
      }
    }, 7000);

    // Initial voice trigger
    playNextChunk();
  }

  /**
   * Completely stops all sources, including synthetic test sound and Live buffers.
   * Guaranteed zero audio overlap.
   */
  public stopAllAudio() {
    this.clearPlaybackQueue();
    this.stopSpeechAcousticResonance();
    if (this.synthSource) {
      try {
        this.synthSource.stop(0);
        this.synthSource.disconnect();
      } catch {}
      this.synthSource = null;
    }
    this.isSimulatingVoice = false;
  }

  /**
   * Generates a synthesized PCM vocal prosody buffer (F0 fundamental + F1/F2 formants + F3/F4 sibilance bursts)
   * played via AudioBufferSourceNode through the exact same linearized GainNode -> AnalyserNode pipeline.
   */
  public async toggleAcousticSimulation(enable?: boolean): Promise<boolean> {
    await this.initOutputContext();
    if (!this.outputCtx || !this.sharedOutputGain) return false;

    const target = enable !== undefined ? enable : !this.isSimulatingVoice;
    if (!target) {
      if (this.synthSource) {
        try {
          this.synthSource.stop(0);
          this.synthSource.disconnect();
        } catch {}
        this.synthSource = null;
      }
      this.isSimulatingVoice = false;
      return false;
    }

    // Stop all other audio to eliminate overlap before starting simulation
    this.stopAllAudio();

    // Create a 6-second looping PCM buffer at 24kHz simulating natural speech cadence, formants, and sibilants
    const sampleRate = 24000;
    const duration = 6.0;
    const numSamples = sampleRate * duration;
    const buffer = this.outputCtx.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const syllableEnv = Math.max(0, Math.sin(2 * Math.PI * 3.4 * t) * 0.65 + Math.sin(2 * Math.PI * 1.1 * t) * 0.35);
      const f0 = 130 + 25 * Math.sin(2 * Math.PI * 0.7 * t);
      const lowSignal = Math.sin(2 * Math.PI * f0 * t) + 0.5 * Math.sin(2 * Math.PI * (f0 * 0.5) * t);

      const midSignal =
        0.6 * Math.sin(2 * Math.PI * 720 * t) +
        0.45 * Math.sin(2 * Math.PI * 1480 * t) +
        0.25 * Math.sin(2 * Math.PI * 2150 * t);

      const sibilantGate = Math.pow(Math.max(0, Math.sin(2 * Math.PI * 3.4 * t + 1.3)), 8);
      const highSignal =
        (Math.sin(2 * Math.PI * 4200 * t) + Math.sin(2 * Math.PI * 5800 * t) + (Math.random() * 2 - 1) * 0.5) *
        sibilantGate;

      data[i] = (lowSignal * 0.45 + midSignal * 0.38 + highSignal * 0.28) * syllableEnv * 0.22;
    }

    const source = this.outputCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.sharedOutputGain);
    source.start(0);

    this.synthSource = source;
    this.isSimulatingVoice = true;
    return true;
  }

  /**
   * Computes real-time spectral energy across the 3 physiological speech bands and passes
   * each band through its dedicated AsymmetricEnvelopeFollower (attack / decay ballistics):
   * - Band 1 (0 - 250 Hz): F0 fundamental -> uLowFreq (tau_att = 10ms, tau_dec = 120ms)
   * - Band 2 (250 - 2500 Hz): F1, F2 formants -> uMidFreq (tau_att = 20ms, tau_dec = 150ms)
   * - Band 3 (2500 - 8000 Hz): F3, F4 sibilants -> uDispersion (tau_att = 5ms, tau_dec = 80ms)
   */
  public getSpectrumMetrics(): AudioSpectrumMetrics {
    const now = performance.now();
    const dt = (now - this.lastProcessTime) / 1000.0;
    this.lastProcessTime = now;

    let lowSum = 0;
    let lowCount = 0;
    let midSum = 0;
    let midCount = 0;
    let highSum = 0;
    let highCount = 0;

    if (this.outputAnalyser && this.outputCtx) {
      this.outputAnalyser.getByteFrequencyData(this.freqData as any);
      const nyquist = this.outputCtx.sampleRate / 2; // 12000 Hz
      const binCount = this.freqData.length;

      // Precalculated bin cutoff indices (zero per-bin division / branching overhead)
      const bin250 = Math.min(binCount, Math.floor((250 / nyquist) * binCount));
      const bin2500 = Math.min(binCount, Math.floor((2500 / nyquist) * binCount));
      const bin8000 = Math.min(binCount, Math.floor((8000 / nyquist) * binCount));

      for (let i = 0; i < bin250; i++) {
        lowSum += this.freqData[i];
      }
      lowCount += bin250;

      for (let i = bin250; i < bin2500; i++) {
        midSum += this.freqData[i];
      }
      midCount += (bin2500 - bin250);

      for (let i = bin2500; i < bin8000; i++) {
        highSum += this.freqData[i];
      }
      highCount += (bin8000 - bin2500);
    }

    // Blend isolated microphone input FFT when user speaks so the sphere also responds to user articulation
    if (this.inputAnalyser && this.inputCtx) {
      this.inputAnalyser.getByteFrequencyData(this.inputFreqData as any);
      const nyquist = this.inputCtx.sampleRate / 2; // 8000 Hz
      const binCount = this.inputFreqData.length;

      const inBin250 = Math.min(binCount, Math.floor((250 / nyquist) * binCount));
      const inBin2500 = Math.min(binCount, Math.floor((2500 / nyquist) * binCount));
      const inBin8000 = Math.min(binCount, Math.floor((8000 / nyquist) * binCount));

      for (let i = 0; i < inBin250; i++) {
        lowSum += this.inputFreqData[i] * 0.85;
      }
      lowCount += inBin250;

      for (let i = inBin250; i < inBin2500; i++) {
        midSum += this.inputFreqData[i] * 0.85;
      }
      midCount += (inBin2500 - inBin250);

      for (let i = inBin2500; i < inBin8000; i++) {
        highSum += this.inputFreqData[i] * 0.85;
      }
      highCount += (inBin8000 - inBin2500);
    }

    const rawLow = lowCount > 0 ? Math.min(1.0, lowSum / (lowCount * 255.0 * 0.48)) : 0;
    const rawMid = midCount > 0 ? Math.min(1.0, midSum / (midCount * 255.0 * 0.38)) : 0;
    const rawHigh = highCount > 0 ? Math.min(1.0, highSum / (highCount * 255.0 * 0.28)) : 0;

    // Apply Asymmetric Envelope Follower ballistics
    const lowBand = this.envLow.process(rawLow, dt);
    const midBand = this.envMid.process(rawMid, dt);
    const highBand = this.envHigh.process(rawHigh, dt);

    const rmsOutput = Math.min(1.0, lowBand * 0.45 + midBand * 0.38 + highBand * 0.17);

    return {
      lowBand,
      midBand,
      highBand,
      rmsInput: this.rmsInput,
      rmsOutput,
      bargeInActive: this.bargeInTriggered,
    };
  }

  public setBargeInThreshold(threshold: number) {
    this.bargeInThreshold = threshold;
  }

  public getBargeInThreshold(): number {
    return this.bargeInThreshold;
  }
}
