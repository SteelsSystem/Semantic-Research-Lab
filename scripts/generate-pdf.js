import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});

const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const margin = 16;
const contentWidth = pageWidth - margin * 2;

// Background
doc.setFillColor(7, 9, 14);
doc.rect(0, 0, pageWidth, pageHeight, 'F');

// Header Accent
doc.setFillColor(6, 182, 212);
doc.rect(margin, 12, 4, 18, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(18);
doc.setTextColor(248, 250, 252);
doc.text('Semantic Research Lab — Operational User Guide', margin + 8, 20);

doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.setTextColor(148, 163, 184);
doc.text('Simple-Minded Architecture & Feature Walkthrough | Version 2.0 (Multilingual Edition)', margin + 8, 26);

const GUIDE_SECTIONS = [
  {
    title: '1. What Is This Cognitive Interface? (In Plain Terms)',
    points: [
      'Think of this application as a high-level scientific debate partner and thinking lab.',
      'Unlike simple chatbots that give shallow conversational summaries, this interface is built on Socratic Elenctics: it looks for hidden assumptions in what you say, stress-tests your hypotheses, and connects ideas across theoretical physics, biology, and philosophy.',
      'Everything you discuss is physically mirrored in real-time by a glowing 3D particle sphere (the OKLab VaporSphere) that changes color, turbulence, and density on your GPU depending on the intellectual tension and emotional tone of the inquiry.',
    ],
  },
  {
    title: '2. The Entry Hub & Managing Research Cases (Chats)',
    points: [
      'Top Cases / Topics Bar: Located at the very top of your screen. Every distinct line of inquiry is treated as a dedicated "Case" (like an investigation file in a scientific lab).',
      'The badge shows the total number of topics/cases you have processed (e.g., [ 4 Cases Processed ]).',
      'You can switch between previous cases with zero data loss—your full conversation history, key clarifying questions, and 3D visual particle states are preserved in your local browser.',
      'Click "New Case (+)" to open a fresh slate, or click "Entry Hub" to choose pre-configured philosophical paradoxes.',
    ],
  },
  {
    title: '3. Talking with Your Voice: Gemini Live API & Barge-In',
    points: [
      'Real-Time Duplex Voice: Click the cyan "Start Gemini Live API" button in the top right to start a live audio stream.',
      'Instant Interruption (Barge-In): You do not need to wait for the model to finish speaking. If you speak into your microphone, the local voice activity detector (VAD) immediately cuts the model speech and lets you take the floor.',
      'Voice Personas: Choose between Zephyr (Analytical), Fenrir (Deep Baritone), Kore (Precise), Charon (Grave), or Puck (Dynamic).',
      'Spectral Telemetry: Notice how your voice frequencies directly perturb the 3D vapor sphere in real time.',
    ],
  },
  {
    title: '4. Understanding the 3D VaporSphere & OKLab Colorimetry',
    points: [
      'Perceptual Color Space (OKLab): Colors are calculated using true human vision LMS cone responses. This prevents ugly muddy transitions and creates radiant, luminous glows.',
      'Color Meanings:',
      '  - Deep Indigo (285 deg): Metaphysics & Ontology of Consciousness.',
      '  - Crystalline Azure (190 deg): Exact Sciences & Theoretical Physics.',
      '  - Emerald / Warm Amber (145 to 35 deg): Medicine & Bioethical Dilemmas.',
      '  - Terracotta / Cobalt (15 to 240 deg): Socioeconomic Bifurcation & Friction.',
      '  - Pale Platinum (85 deg): Critical Epistemology & Deconstruction.',
      'Turbulence: Low turbulence = calm, orderly logic. High turbulence = fierce controversy or structural paradox.',
    ],
  },
  {
    title: '5. Socratic Disputation & Key Clarification Questions',
    points: [
      'Submitting a Premise: In the Dialectical Arena, write your hypothesis or research question.',
      'Elenctic Deconstruction: The model immediately identifies: 1) Hidden Axioms, 2) Structural Isomorphisms, and 3) Dialectical Counter-Theses.',
      'Key Clarification Questions: The model will pose 2-3 specific questions asking you to clarify missing boundaries. You can click "Address Question" to instantly inject your answer into the debate.',
      'Branching Inquiries: Three quick-launch buttons allow you to dive deeper vertically, extrapolate laterally, or adopt the opponent antithesis.',
    ],
  },
  {
    title: '6. Subscription Plans, Quotas & Coordination with Cloud Services',
    points: [
      'Free Explorer: 20 turns/day, uses Gemini 3.1 Flash-Lite, standard 100k GPU particles, browser voice synthesis.',
      'Pro Researcher: 250 turns/day, Gemini 3.8 Flash, Pro reasoning, full 24kHz Live audio streaming, unlimited research cases.',
      'Unlimited Scholar: Unlimited inquiries, 250k particle simulation, extended thinking mode, automated PDF report generation.',
      'ADMIN & Root Mesh: Complete administrative bypass, live WebSocket latency inspectors, raw prompt debugger, vector store management, and direct integration hooks with Google Cloud Run, Cloud SQL, Firebase, and Google Workspace.',
    ],
  },
  {
    title: '7. Multi-Language Support & Personalisation',
    points: [
      'Language Selection: Toggle between English (default), Czech, Spanish, German, French, Japanese, Chinese, Arabic, and Portuguese with 1 click.',
      'Personalisation: Customize your UI accent glow (Cyan, Emerald, Amber, Violet, Rose) and dialectical tone (Post-graduate, Socratic Challenger, Peer Reviewer).',
      'Ambient Focus Hum: Activate a 432Hz binaural background frequency to enhance mental immersion during research.',
    ],
  },
  {
    title: '8. Push-to-Talk (Default) & Studio Sound Engineer DSP Chain',
    points: [
      'Hard Default Push-to-Talk: To protect dialogue sanctity and eliminate accidental background interruptions, the microphone is muted by default until you hold the Spacebar or the central Microphone button.',
      'Universal Microphone Button: Features a universal mic icon that changes dynamically from cool standby slate into glowing emerald while transmitting.',
      'Ability to Disable PTT: If you prefer continuous hands-free dialogue, toggle the switch from "PTT" to "Open Mic" at any time.',
      'Studio DSP Noise Reduction Strip: The audio chain processes your input before sending to Gemini: 1) 85Hz High-Pass Filter cuts desk bumps and HVAC rumble; 2) 2.8kHz Clarity Peaking EQ lifts consonant intelligibility; 3) Downward Expander silences background room tone; 4) 3.5:1 Vocal Compressor levels quiet vs loud words; 5) -1.5dB Brickwall Peak Limiter eliminates digital distortion; 6) 12ms Anti-Click soft ramp eliminates mechanical mouse switch clicks.',
    ],
  },
];

let currentY = 38;

GUIDE_SECTIONS.forEach((section) => {
  if (currentY > pageHeight - 35) {
    doc.addPage();
    doc.setFillColor(7, 9, 14);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(56, 189, 248);
  doc.text(section.title, margin, currentY);
  currentY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);

  section.points.forEach((point) => {
    const splitLines = doc.splitTextToSize(`• ${point}`, contentWidth);
    if (currentY + splitLines.length * 4.5 > pageHeight - 18) {
      doc.addPage();
      doc.setFillColor(7, 9, 14);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      currentY = 20;
    }
    doc.text(splitLines, margin, currentY);
    currentY += splitLines.length * 4.5 + 2;
  });

  currentY += 4;
});

doc.setFont('helvetica', 'italic');
doc.setFontSize(7.5);
doc.setTextColor(100, 116, 139);
doc.text(
  `Generated by Semantic Research Lab Engine · Gemini Live API & OKLab VaporSphere · ${new Date().toLocaleDateString()}`,
  margin,
  pageHeight - 8
);

const pdfData = doc.output('arraybuffer');
const outputPath = path.resolve('public/documentation_guide.pdf');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, Buffer.from(pdfData));
fs.writeFileSync(path.resolve('documentation_guide.pdf'), Buffer.from(pdfData));
console.log('PDF documentation written successfully to documentation_guide.pdf and public/documentation_guide.pdf');
