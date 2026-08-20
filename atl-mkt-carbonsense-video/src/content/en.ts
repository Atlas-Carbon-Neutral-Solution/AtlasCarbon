import type {AdContent} from './schema';

/**
 * TEXTS — English version.
 * Restricted use: ESA BIC, investors, non-Italian partners. Client-facing
 * material in Italy uses `it.ts` (docs/PIPELINE_AGENT.md).
 */
export const en: AdContent = {
  meta: {
    id: 'ATL_MKT_CarbonSense_Video60_EN_v1',
    locale: 'en',
    source: 'CarbonSense deck (11-slide PDF) + CARBONSENSE ENGLISH deck (Canva, 18 slides, 2026-07-15)',
    audience: 'ESA BIC, investors, non-Italian partners',
    approvedBy: null,
    approvedOn: null,
    version: 'v1 — draft',
    figureNote: 'Illustrative diagram. Not measurement data.',
  },

  vo: {
    hook: 'Carbon is measured. Otherwise it is worth nothing. Today, it almost never is.',
    problem:
      'The credit market runs on generic estimates and data nobody can verify. Those who steward land well cannot prove it.',
    stack:
      'CarbonSense starts on the ground: a sensor measures biomass, soil, moisture, temperature. Field data is cross-checked against satellite observation, the engine estimates uptake, the registry anchors it immutably.',
    space:
      'Sentinel-1 radar sees through clouds. Sentinel-2 reads vegetation at scale. Galileo certifies where each sensor sits: the data comes from that field, not another.',
    twin:
      'The same data produces parcel-level digital twins: they simulate yields, anticipate water stress and anomalies, and measure the real effect of each intervention.',
    whyNow:
      'The European removals framework raises the bar, unverifiable environmental claims become legal exposure, and Scope 3 pushes down the supply chain.',
    cta: 'Atlas Carbon Neutral Solutions. We measure carbon where it happens.',
  },

  hook: {
    kicker: 'CarbonSense · Atlas Carbon Neutral Solutions',
    lines: ['Carbon is measured.', 'Or it is worth nothing.'],
  },

  problem: {
    heading: {label: '01 · The problem', title: 'The data nobody can verify'},
    bullets: [
      'Generic estimates standing in for field measurement.',
      'Data nobody can verify independently.',
      'No proof of where a single reading comes from.',
      'Those who steward land well cannot prove it.',
    ],
    key: 'Without verifiable measurement, there is no market.',
  },

  stack: {
    heading: {label: '02 · Workflow', title: 'From soil to registry, in five steps'},
    steps: [
      {
        index: '01',
        label: 'IoT sensor',
        detail: 'Biomass, soil, moisture and temperature measured in the field every fifteen minutes.',
      },
      {
        index: '02',
        label: 'Field data',
        detail: 'Farming operations enter the system through a guided chat on a phone.',
      },
      {
        index: '03',
        label: 'Earth observation',
        detail: 'Sentinel-1, Sentinel-2 and Sentinel-5P validate every measurement from orbit.',
      },
      {
        index: '04',
        label: 'Calculation engine',
        detail: 'The model estimates uptake and corrects satellite figures against measured ground truth.',
      },
      {
        index: '05',
        label: 'Blockchain registry',
        detail: 'Each result is hash-anchored on Ethereum L2: immutable and auditable.',
      },
    ],
  },

  space: {
    heading: {label: '03 · Space-native', title: 'Measured in the field, validated from orbit'},
    rows: [
      {tag: 'Sentinel-1 SAR', text: 'Radar sees through clouds: continuous time series, no gaps.'},
      {tag: 'Sentinel-2 MSI', text: 'Vegetation status and biomass at a scale ground survey cannot reach.'},
      {tag: 'Sentinel-5P', text: 'Early fire signals and measurement of air-related ecosystem services.'},
      {tag: 'GNSS Galileo', text: 'Sensor proof-of-location: the data comes from that field.'},
    ],
    payoff: 'No space, no scalability.',
  },

  twin: {
    heading: {label: '04 · Digital twin', title: 'From certification to predictive management'},
    cards: [
      {title: 'Simulate', text: 'Growth and yields, parcel by parcel.'},
      {title: 'Anticipate', text: 'Water stress, disease, climate anomalies.'},
      {title: 'Assess', text: 'The real effect of each agronomic intervention.'},
      {title: 'Certify', text: 'The practices that generate positive impact.'},
    ],
    output: 'From CO₂ certification to predictive crop management.',
  },

  whyNow: {
    heading: {label: '05 · Why now', title: 'The regulatory window is open now'},
    cards: [
      {title: 'CRCF', text: 'The European removals framework raises the bar on measurement and verification.'},
      {title: 'Green Claims', text: 'Unverifiable environmental claims turn into legal exposure.'},
      {title: 'Value chain', text: 'Scope 3 pushes down the chain: suppliers have to measure.'},
    ],
    statusLine:
      'B.R.A.I.N. Engine: patent application filed with UIBM. CarbonSense: TRL 3, consolidating towards TRL 4.',
  },

  cta: {
    claim: 'We measure carbon where it happens.',
    site: 'atlascarbonneutral.com',
    email: 'info@atlascarbonneutral.com',
    badges: ['ESA BIC Padova', 'Le Village by CA Padova', 'Fondazione Italia-USA Top 100', 'MIMIT'],
    legal:
      'Atlas Carbon Neutral Solutions S.r.l. Società Benefit · VAT 14003650968 · Milan · Padua',
  },
};
