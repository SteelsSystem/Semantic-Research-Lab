import { ResearchCase, TranscriptEntry, VisualState } from '../types/cognitive';

const STORAGE_KEY = 'cognitive_research_cases_v2';
const ACTIVE_CASE_KEY = 'cognitive_active_case_id_v2';

export const INITIAL_PRESET_CASES: ResearchCase[] = [
  {
    id: 'case-01-consciousness',
    title: 'Ontologie vědomí a epistemická integrita',
    domainId: 'ontology',
    domainName: 'Ontologie a hluboká metafyzika',
    createdAt: '2026-10-03T18:40:00Z',
    updatedAt: '2026-10-04T08:15:00Z',
    hypothesis: 'Vědomí není emergentní vlastností komplexní výpočetní sítě, nýbrž fundamentální ontologickou kategorií iredukovatelnou na fyzikalistický popis.',
    summary: 'Zkoumání hard problem of consciousness skrze Integrovanou teorii informace (IIT Φ), fenomenologickou redukci a limity reduktivního fyzikalismu.',
    tags: ['Fenomenologie', 'Kvalia', 'IIT Φ', 'Dualismus'],
    isPinned: true,
    status: 'active',
    visualState: {
      L: 0.42,
      a: 0.05,
      b: -0.15,
      turbulence: 0.20,
      density: 0.85,
      domainLabel: 'Ontologie a hluboká metafyzika',
    },
    transcripts: [
      {
        id: 'c1-t1',
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
              status: 'pending',
            },
            {
              id: 'kq-init-2',
              question: 'Do jakého vědního aparátu preferujete tezi ukotvit (neurobiologie, kvantová mechanika či analytická filosofie mysli)?',
              contextWhy: 'Určuje specifický terminologický aparát a navazující epistemologické mantinely.',
              status: 'pending',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'case-02-dissipative',
    title: 'Disipativní struktury a společenská bifurkace (Prigogine)',
    domainId: 'physics',
    domainName: 'Exaktní vědy a teoretická fyzika',
    createdAt: '2026-10-03T16:15:00Z',
    updatedAt: '2026-10-04T07:30:00Z',
    hypothesis: 'Otevřené termodynamické systémy daleko od rovnováhy udržují lokální pokles entropie exportem disipace; v socioekonomických systémech vede přetížení k nevyhnutelné bifurkaci.',
    summary: 'Aplikace nerovnovážné termodynamiky na zranitelnost institucionálních infrastruktur (Tainter, Prigogine).',
    tags: ['Termodynamika', 'Entropie', 'Komplexní systémy', 'Bifurkace'],
    isPinned: false,
    status: 'completed',
    visualState: {
      L: 0.82,
      a: -0.12,
      b: -0.10,
      turbulence: 0.60,
      density: 0.60,
      domainLabel: 'Exaktní vědy a teoretická fyzika',
    },
    transcripts: [
      {
        id: 'c2-t1',
        timestamp: '16:15:00',
        role: 'user',
        text: 'Lze extrapolovat Prigoginovu teorii disipativních struktur na zánik institucionální komplexity moderních civilizací?',
      },
      {
        id: 'c2-t2',
        timestamp: '16:15:04',
        role: 'model',
        text: '[VISUAL_STATE: L=0.82, a=-0.12, b=-0.10, turbulence=0.60, density=0.60]\nDisipativní struktura vyžaduje pro zachování nízké vnitřní entropie kontinuální energetický gradient. U sociálních institucí však cena za údržbu komunikační a regulační hierarchie roste nelineárně, což vyvolává fenomén klesající mezní návratnosti investic do komplexity (Tainterův zákon). V blízkosti kritického bodu fluktuace mikroúrovně determinují makroskopický výběr nové větve atraktoru.',
        visualState: {
          L: 0.82,
          a: -0.12,
          b: -0.10,
          turbulence: 0.60,
          density: 0.60,
          domainLabel: 'Exaktní vědy a teoretická fyzika',
        },
      },
    ],
  },
  {
    id: 'case-03-bioethics',
    title: 'Allostatická zátěž a bioetika editace zárodečné linie',
    domainId: 'bioethics',
    domainName: 'Medicína a bioetická dilemata',
    createdAt: '2026-10-03T17:42:00Z',
    updatedAt: '2026-10-03T20:12:00Z',
    hypothesis: 'Zásah do pleiotropních genových sítí pomocí CRISPR-Cas9 modifikuje evolučně konzervované homeostatické kompromisy a narušuje mezigenerační autonomii.',
    summary: 'Bioetická elenktika zaměřená na nelineární genetické interakce, pleiotropní kaskády a normativní spravedlnost.',
    tags: ['CRISPR', 'Pleiotropie', 'Bioetika', 'Genetika'],
    isPinned: false,
    status: 'completed',
    visualState: {
      L: 0.68,
      a: -0.15,
      b: 0.08,
      turbulence: 0.35,
      density: 0.75,
      domainLabel: 'Medicína a bioetická dilemata',
    },
    transcripts: [
      {
        id: 'c3-t1',
        timestamp: '17:42:00',
        role: 'user',
        text: 'Není terapeutická modifikace zárodečné linie morální povinností, pokud dokáže preventivně vymýtit monogenní letální nemoci?',
      },
      {
        id: 'c3-t2',
        timestamp: '17:42:03',
        role: 'model',
        text: '[VISUAL_STATE: L=0.68, a=-0.15, b=0.08, turbulence=0.35, density=0.75]\nAxiom morální povinnosti předpokládá dokonalou ortogonalitu genových funkcí. V biologických makrosystémech je však naprostá většina lokusů pleiotropní. Odstranění predispozice k jedné patologii často eliminuje imunitní protektivní mechanismus vůči jiným environmentálním stresorům. Hranice mezi kurativním zásahem a eugenickým posunem normativního lidského genofondu je epistemologicky nestabilní.',
      },
    ],
  },
  {
    id: 'case-04-epistemology',
    title: 'Gödelova neúplnost a limity vědeckého realismu',
    domainId: 'epistemology',
    domainName: 'Kritická epistemologie a dekonstrukce',
    createdAt: '2026-10-03T18:10:00Z',
    updatedAt: '2026-10-03T21:40:00Z',
    hypothesis: 'Každý dostatečně bohatý formalizovaný axiomatický systém obsahuje pravdivé věty nedokazatelné uvnitř daného formalismu, což vylučuje uzavřenou finální fyzikální teorii.',
    summary: 'Dekonstrukce předpokladu konečné teorie všeho (ToE) optikou matematické logiky a epistemologické skepse.',
    tags: ['Gödel', 'Logika', 'Epistemologie', 'Teorie všeho'],
    isPinned: false,
    status: 'completed',
    visualState: {
      L: 0.75,
      a: 0.01,
      b: 0.04,
      turbulence: 0.40,
      density: 0.40,
      domainLabel: 'Kritická epistemologie a dekonstrukce',
    },
    transcripts: [
      {
        id: 'c4-t1',
        timestamp: '18:10:00',
        role: 'model',
        text: '[VISUAL_STATE: L=0.75, a=0.01, b=0.04, turbulence=0.40, density=0.40]\nPředstava, že fundamentální fyzika dospěje k uzavřené deduktivní "Teorii všeho", naráží na limity formalizované sémantiky. Jakmile teorie inkorporuje spojité matematické struktury a schopnost sebereference, vnitřní bezespornost systému nelze verifikovat bez postulování vnějšího metajazyka.',
      },
    ],
  },
];

export class CaseManager {
  static loadCases(): ResearchCase[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved cases from localStorage:', e);
    }
    // Initialize with presets
    this.saveCases(INITIAL_PRESET_CASES);
    return INITIAL_PRESET_CASES;
  }

  static saveCases(cases: ResearchCase[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    } catch (e) {
      console.error('Failed to save cases to localStorage:', e);
    }
  }

  static getActiveCaseId(): string {
    const stored = localStorage.getItem(ACTIVE_CASE_KEY);
    if (stored) return stored;
    return INITIAL_PRESET_CASES[0].id;
  }

  static setActiveCaseId(id: string): void {
    localStorage.setItem(ACTIVE_CASE_KEY, id);
  }

  static createCase(params: {
    title: string;
    domainId?: string;
    domainName?: string;
    hypothesis?: string;
    initialVisualState?: VisualState;
  }): ResearchCase {
    const id = `case-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newCase: ResearchCase = {
      id,
      title: params.title.trim() || `Výzkumný případ #${Date.now().toString().slice(-4)}`,
      domainId: params.domainId || 'ontology',
      domainName: params.domainName || 'Ontologie a hluboká metafyzika',
      hypothesis: params.hypothesis || '',
      tags: [params.domainName || 'Interdisciplinární'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      isPinned: false,
      visualState: params.initialVisualState || {
        L: 0.55,
        a: 0.0,
        b: -0.1,
        turbulence: 0.4,
        density: 0.8,
        domainLabel: params.domainName || 'Nový výzkumný případ',
      },
      transcripts: [],
    };

    const currentCases = this.loadCases();
    currentCases.unshift(newCase);
    this.saveCases(currentCases);
    this.setActiveCaseId(id);
    return newCase;
  }

  static updateCase(caseId: string, updater: (prev: ResearchCase) => ResearchCase): ResearchCase[] {
    const cases = this.loadCases();
    const updated = cases.map((c) => (c.id === caseId ? { ...updater(c), updatedAt: new Date().toISOString() } : c));
    this.saveCases(updated);
    return updated;
  }

  static deleteCase(caseId: string): ResearchCase[] {
    const cases = this.loadCases();
    const filtered = cases.filter((c) => c.id !== caseId);
    this.saveCases(filtered.length > 0 ? filtered : INITIAL_PRESET_CASES);
    if (this.getActiveCaseId() === caseId) {
      this.setActiveCaseId(filtered[0]?.id || INITIAL_PRESET_CASES[0].id);
    }
    return filtered;
  }

  static exportCaseJson(caseObj: ResearchCase): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(caseObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `case_${caseObj.id}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}
