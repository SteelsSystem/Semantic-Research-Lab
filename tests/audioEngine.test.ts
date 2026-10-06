import { describe, it, expect } from 'vitest';
import {
  AsymmetricEnvelopeFollower,
  arrayBufferToBase64,
  base64ToInt16Array,
  calculateRms,
  simulateDownwardExpander,
  calculateBiquadHighpassCoeffs,
  sanitizeSpeechText,
} from '../src/utils/audioEngine';

describe('AudioEngine DSP Math & Worklet Utilities', () => {
  describe('AsymmetricEnvelopeFollower', () => {
    it('initializes at zero and tracks fast attack correctly', () => {
      // 10ms attack, 120ms decay
      const follower = new AsymmetricEnvelopeFollower(0.010, 0.120);
      expect(follower.getCurrentLevel()).toBe(0);

      // Apply sudden burst of energy (1.0) with dt = 10ms
      const level = follower.process(1.0, 0.010);
      // alpha = exp(-0.010 / 0.010) = exp(-1) ~= 0.367879
      // level = 0.367879 * 0 + (1 - 0.367879) * 1.0 ~= 0.6321
      expect(level).toBeGreaterThan(0.6);
      expect(level).toBeLessThan(0.7);
    });

    it('exhibits slower decay than attack when energy drops', () => {
      const follower = new AsymmetricEnvelopeFollower(0.010, 0.120);
      // Pump up to near 1.0
      for (let i = 0; i < 10; i++) {
        follower.process(1.0, 0.010);
      }
      const peakLevel = follower.getCurrentLevel();
      expect(peakLevel).toBeGreaterThan(0.99);

      // Now silence (0.0) with 10ms steps. With 120ms decay, alpha_dec = exp(-10/120) ~= 0.92
      const afterOneStep = follower.process(0.0, 0.010);
      expect(afterOneStep).toBeGreaterThan(0.9); // Should decay very slowly
      expect(afterOneStep).toBeLessThan(peakLevel);
    });

    it('resets back to zero properly', () => {
      const follower = new AsymmetricEnvelopeFollower(0.010, 0.120);
      follower.process(0.85, 0.020);
      expect(follower.getCurrentLevel()).toBeGreaterThan(0);
      follower.reset();
      expect(follower.getCurrentLevel()).toBe(0);
    });
  });

  describe('arrayBufferToBase64 and base64ToInt16Array', () => {
    it('roundtrips 16-bit PCM samples accurately', () => {
      const samples = new Int16Array([-32768, -16384, 0, 16384, 32767]);
      const base64 = arrayBufferToBase64(samples.buffer);
      expect(typeof base64).toBe('string');
      expect(base64.length).toBeGreaterThan(0);

      const decoded = base64ToInt16Array(base64);
      expect(decoded.length).toBe(samples.length);
      for (let i = 0; i < samples.length; i++) {
        expect(decoded[i]).toBe(samples[i]);
      }
    });
  });

  describe('RMS and Downward Expander Math', () => {
    it('calculates correct RMS for silence and sine waves', () => {
      const silence = new Float32Array(640);
      expect(calculateRms(silence)).toBe(0);

      // Full-scale sine wave has RMS of 1 / sqrt(2) ~= 0.7071
      const sine = new Float32Array(1000);
      for (let i = 0; i < sine.length; i++) {
        sine[i] = Math.sin((2 * Math.PI * i) / 100);
      }
      const rms = calculateRms(sine);
      expect(rms).toBeCloseTo(0.7071, 2);
    });

    it('downward expander preserves full speech signal above threshold', () => {
      // Create strong voice samples (amplitude 0.5 >> 0.015 threshold)
      const loudVoice = new Float32Array(500).fill(0.4);
      const { gains } = simulateDownwardExpander(loudVoice, 0.015);
      // Final gain should stay close to 1.0 (0dB attenuation)
      expect(gains[gains.length - 1]).toBeGreaterThan(0.95);
    });

    it('downward expander strongly attenuates low-amplitude room noise', () => {
      // Room noise at 0.002 amplitude (< 0.015 threshold)
      const roomNoise = new Float32Array(600).fill(0.002);
      const { gains } = simulateDownwardExpander(roomNoise, 0.015);
      // Gain should be attenuated down towards 0.05 or lower
      expect(gains[gains.length - 1]).toBeLessThan(0.15);
    });
  });

  describe('Biquad Highpass Filter Coefficients', () => {
    it('calculates normalized biquad coefficients for 85Hz HPF at 16kHz', () => {
      const coeffs = calculateBiquadHighpassCoeffs(16000, 85, 0.707);
      expect(coeffs.b0).toBeGreaterThan(0);
      expect(coeffs.b1).toBeLessThan(0);
      expect(coeffs.b2).toBeGreaterThan(0);
      // Highpass b0 should approximately equal b2
      expect(coeffs.b0).toBeCloseTo(coeffs.b2, 4);
    });
  });

  describe('sanitizeSpeechText', () => {
    it('strips visual state tags and markdown formatting', () => {
      const input = '[VISUAL_STATE: L=0.42, a=0.05, b=-0.15, turbulence=0.20, density=0.85]\n**Sokratická analýza:**\n- *Premisa:* Vědomí není emergentní.';
      const output = sanitizeSpeechText(input);
      expect(output).not.toContain('VISUAL_STATE');
      expect(output).not.toContain('*');
      expect(output).toContain('Sokratická analýza:');
      expect(output).toContain('Premisa: Vědomí není emergentní.');
    });

    it('strips clarification question tags and || reasoning context', () => {
      const input = '[KLÍČOVÁ OTÁZKA 1]: Jaké empirické kritérium předpokládáte? || Nutné pro falzifikaci hypotézy.';
      const output = sanitizeSpeechText(input);
      expect(output).not.toContain('KLÍČOVÁ OTÁZKA');
      expect(output).not.toContain('Nutné pro falzifikaci');
      expect(output).toBe('Jaké empirické kritérium předpokládáte?');
    });
  });
});
