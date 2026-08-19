# PIPELINE_AGENT — da documento Atlas a spot, con un agente

Questo progetto non è un video: è uno **stampo**. La grafica non contiene testo, i testi
stanno in `src/content/*.ts`. Per un nuovo spot si scrive un nuovo file di contenuti.

## Ciclo operativo (≈30 minuti a spot, dopo il primo)

```
documento sorgente (PDF/DOCX)
   → estrazione testo
   → riduzione a 7 blocchi narrativi
   → filtro anti-overclaim
   → src/content/<nome>.ts
   → registrazione in Root.tsx
   → npm run check:claims  (filtro meccanico: blocca il render)
   → npm run dev  (revisione visiva)
   → gate compliance  → compilare meta.approvedBy
   → npm run render:all
```

Il filtro anti-overclaim è implementato in `scripts/check-claims.mjs`: controlla
i pattern vietati (superiorità assoluta, TRL unico, pricing, proiezioni, token,
nomi di terzi, "brevetto" senza "depositato"), la presenza della riga di stato
TRL/brevetto e i limiti di parole della tabella qui sotto. Gira come primo passo
di `render:all`. È un controllo meccanico: intercetta gli errori banali, non
sostituisce il gate.

## Prompt operativo per l'agente

Da usare con Claude Code aperto sulla cartella del progetto, dopo `npx remotion skills add`:

```
Contesto: progetto Remotion Atlas, stampo a 7 scene, 1800 frame, 30 fps.
Sorgente: <percorso del documento>.

Compito:
1. Estrai i contenuti e riducili allo schema in src/content/schema.ts.
2. Applica i guardrail (vedi sotto). Se una frase del sorgente viola un guardrail,
   NON riscriverla in modo creativo: rimuovila e annotala in docs/COMPLIANCE_DELTA.md.
3. Crea src/content/<nome>.ts e registra le composizioni in Root.tsx.
4. Non modificare i componenti grafici salvo richiesta esplicita.
5. Restituisci: (a) file creati, (b) elenco delle affermazioni scartate con motivo,
   (c) le domande a cui non hai potuto rispondere da solo.

Prima di consegnare: `npm run check:claims && npm run typecheck` devono passare.

Guardrail non negoziabili:
- Clienti citabili: solo AGESP e MakaNi. Tutto il resto è pipeline, mai "cliente" né "referenza".
- TRL sempre sdoppiato: B.R.A.I.N. TRL 7; CarbonSense TRL 3 → 4. Mai un TRL unico di piattaforma.
- "Brevetto depositato" (UIBM 102025000029407, copre B.R.A.I.N.), mai "brevetto".
- Nessun claim di superiorità assoluta ("unico", "non esistono competitor", "il primo").
- Nessuna proiezione di mercato o di ricavo in materiale pubblicitario.
- Nessun pricing, nessuna percentuale Layer 3.
- Ruoli: Zampieri CEO, Garbin CSO, Montagna Compliance. CTO full-time = post-round.
- Perimetro normativo post-Omnibus I: non usare la CSRD obbligatoria come leva sul cliente tipo.
- Materiale client-facing in italiano; inglese solo per ESA/investor/partner esteri.
```

## Vincoli di durata

Il testo deve stare nei tempi. Regole pratiche:

| Scena | Frame | Secondi | Parole VO max | Righe a schermo max |
|---|---|---|---|---|
| Hook | 150 | 5,0 | 13 | 2 righe brevi |
| Problema | 240 | 8,0 | 21 | 4 bullet ≤ 13 parole |
| Stack | 360 | 12,0 | 31 | 5 step, dettaglio ≤ 14 parole |
| Space | 330 | 11,0 | 28 | 4 righe tag+testo |
| Twin | 270 | 9,0 | 23 | 4 card ≤ 6 parole |
| Perché ora | 270 | 9,0 | 23 | 3 card ≤ 14 parole |
| CTA | 180 | 6,0 | 14 | claim + contatti |

Sforare significa testo illeggibile in autoplay muto, non solo VO fuori sync.

## Cambiare il montaggio

`TIMELINE` in `src/CarbonSenseAd.tsx` è la fonte unica: la somma dei `duration` deve
coincidere con `DURATION`. Per un taglio da 20", riscrivere `TIMELINE` con le sole scene
1, 4, 7 e impostare `DURATION = 20 * FPS`.

## Cosa non delegare all'agente

- La decisione su quale claim si può fare. L'agente propone, il gate compliance decide.
- La riconciliazione TRL tra deck e fatti verificati: è una scelta aziendale, non redazionale.
- L'acquisto di licenze (Remotion, musica, voce).
