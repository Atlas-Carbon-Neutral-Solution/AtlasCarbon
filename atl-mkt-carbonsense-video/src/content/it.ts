import type {AdContent} from './schema';

/**
 * TESTI — versione italiana (materiale client-facing).
 * Estratti dal deck CarbonSense e filtrati con i guardrail di
 * docs/PIPELINE_AGENT.md. Le affermazioni del deck non riportate qui sono
 * elencate con motivazione in docs/COMPLIANCE_DELTA.md: non reintrodurle
 * senza una decisione esplicita e tracciata.
 */
export const it: AdContent = {
  meta: {
    id: 'ATL_MKT_CarbonSense_Video60_IT_v1',
    locale: 'it',
    source: 'deck CarbonSense (PDF 11 slide) + deck CARBONSENSE ENGLISH (Canva, 18 slide, 15/07/2026)',
    audience: 'clienti e prospect italiani: CFO, responsabile ESG, direzione tecnica',
    approvedBy: null,
    approvedOn: null,
    version: 'v1 — bozza',
  },

  vo: {
    hook: 'Il carbonio si misura. Altrimenti non vale niente. Oggi, quasi mai si misura.',
    problem:
      'Il mercato dei crediti si regge su stime generiche e dati non verificabili. Chi gestisce bene il territorio non può dimostrarlo.',
    stack:
      'CarbonSense parte da terra: un sensore misura biomassa, suolo, umidità, temperatura. I dati di campo si incrociano con l’osservazione satellitare, il motore di calcolo stima l’assorbimento, il registry lo ancora, immutabile.',
    space:
      'Il radar Sentinel-1 attraversa le nuvole. Sentinel-2 legge lo stato vegetativo su larga scala. Galileo certifica dove sta ogni sensore: il dato viene da quel campo, non altrove.',
    twin:
      'Dagli stessi dati nascono i gemelli digitali delle particelle: simulano le rese, anticipano stress idrico e anomalie, misurano l’effetto reale di ogni intervento.',
    whyNow:
      'Il quadro europeo sulle rimozioni alza l’asticella, le dichiarazioni ambientali non verificabili diventano rischio legale, e lo Scope 3 scende lungo la filiera.',
    cta: 'Atlas Carbon Neutral Solutions. Misuriamo il carbonio dove nasce.',
  },

  hook: {
    kicker: 'CarbonSense · Atlas Carbon Neutral Solutions',
    lines: ['Il carbonio si misura.', 'Oppure non vale nulla.'],
  },

  problem: {
    bullets: [
      'Stime generiche al posto di misure prese sul campo.',
      'Dati che nessuno può verificare in modo indipendente.',
      'Nessuna prova di dove nasce il singolo dato.',
      'Chi gestisce bene il territorio non riesce a dimostrarlo.',
    ],
    key: 'Senza misura verificabile, non c’è mercato.',
  },

  stack: {
    title: 'Dal suolo al registry, in cinque passaggi',
    steps: [
      {
        index: '01',
        label: 'Sensore IoT',
        detail: 'Biomassa, suolo, umidità e temperatura misurati in campo ogni quindici minuti.',
      },
      {
        index: '02',
        label: 'Dati di campo',
        detail: 'Le operazioni colturali entrano nel sistema da una chat guidata su smartphone.',
      },
      {
        index: '03',
        label: 'Osservazione della Terra',
        detail: 'Sentinel-1, Sentinel-2 e Sentinel-5P validano ogni misura dall’orbita.',
      },
      {
        index: '04',
        label: 'Motore di calcolo',
        detail: 'Il modello stima l’assorbimento e corregge il dato satellitare sul misurato.',
      },
      {
        index: '05',
        label: 'Registry blockchain',
        detail: 'Ogni risultato è ancorato con hash su Ethereum L2: immutabile e auditabile.',
      },
    ],
  },

  space: {
    title: 'Architettura space-native',
    rows: [
      {tag: 'Sentinel-1 SAR', text: 'Il radar attraversa le nuvole: serie storiche continue, senza buchi.'},
      {tag: 'Sentinel-2 MSI', text: 'Stato vegetativo e biomassa su larga scala, oltre il rilievo a terra.'},
      {tag: 'Sentinel-5P', text: 'Segnali precoci di incendio e misura dei servizi sull’aria.'},
      {tag: 'GNSS Galileo', text: 'Proof-of-location del sensore: il dato viene da quel campo.'},
    ],
    payoff: 'No space, no scalability.',
  },

  twin: {
    title: 'Digital twin agronomico',
    cards: [
      {title: 'Simulare', text: 'Crescita e rese, parcella per parcella.'},
      {title: 'Anticipare', text: 'Stress idrico, malattie, anomalie climatiche.'},
      {title: 'Valutare', text: 'L’effetto reale di ogni intervento agronomico.'},
      {title: 'Certificare', text: 'Le pratiche che generano impatto positivo.'},
    ],
    output: 'Dalla certificazione della CO₂ alla gestione predittiva.',
  },

  whyNow: {
    title: 'Perché ora',
    cards: [
      {title: 'CRCF', text: 'Il quadro europeo sulle rimozioni alza l’asticella su misura e verifica.'},
      {title: 'Green Claims', text: 'Le dichiarazioni ambientali non verificabili diventano esposizione legale.'},
      {title: 'Value chain', text: 'Lo Scope 3 scende lungo la filiera: i fornitori devono misurare.'},
    ],
    statusLine:
      'B.R.A.I.N. Engine: brevetto depositato UIBM. CarbonSense: TRL 3 in consolidamento verso TRL 4.',
  },

  cta: {
    claim: 'Misuriamo il carbonio dove nasce.',
    site: 'atlascarbonneutral.com',
    email: 'info@atlascarbonneutral.com',
    badges: ['ESA BIC Padova', 'Le Village by CA Padova', 'Fondazione Italia-USA Top 100', 'MIMIT'],
    legal:
      'Atlas Carbon Neutral Solutions S.r.l. Società Benefit · P.IVA 14003650968 · Milano · Padova',
  },
};
