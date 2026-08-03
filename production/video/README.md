# Atlas — video pubblicitario: stato di produzione

## Cosa è questo cut

`remotion/atlas-motion/` contiene un **cut completo di 90 secondi**, motion-graphics, che segue
scena per scena la struttura e il timing esatto di `script-video-pubblicitario-v1.0.md` (§4-§5),
renderizzato con Remotion + un asset 3D reale renderizzato in Blender (SC05, movimento 2).

## Cosa NON è

**Non è il video pubblicitario finale descritto dallo script.** Lo script prevede riprese reali
(drone, termocamera, piantagione di bambù, mani di tecnici, voce fuori campo, musica su licenza).
Questo ambiente non dispone di:

- una camera o accesso a footage/stock reale;
- un generatore text-to-video connesso;
- un motore TTS per la voce fuori campo;
- una libreria musicale con licenza documentata (§6.3 la richiede esplicitamente).

Per questo motivo, **tutte le scene che nello script richiedono riprese fotorealistiche
(SC01-SC04, SC06, SC07) sono qui rappresentazioni astratte/motion-graphics** — coerenti con la
palette e i divieti del brief (§2.3: nessun cliché ambientalista; NEG prompt: nessuna estetica
sci-fi/hologram), ma non le riprese descritte nei PROMPT (EN) dello script.

Il video è **silenzioso**, con sottotitoli aperti (open caption) che riportano il testo VO di §6.2
— l'unico modo per veicolare il contenuto parlato senza un motore di sintesi vocale.

## Cosa è pienamente conforme

- Nessun dato inventato: solo le variabili confermate (V01, V02 fallback, V03, V04, V05, V07
  corretto) compaiono a schermo; V08-V12 sono omesse, non riempite a caso (§0.1).
- Palette e logo sono quelli ufficiali delle linee guida di marchio, usati secondo le regole
  vincolanti (nessuna inclinazione, nessuna alterazione colore, ecc.).
- Il brevetto è citato correttamente (B.R.A.I.N., depositato) e non come "AgroCarbonSense",
  correggendo un errore presente nello script originale.
- Nessun cliente, nessun logo di terzi, nessun contenzioso evocato.

## Prima di qualsiasi pubblicazione

Questo cut è una base di lavoro reale, non un deliverable pronto per l'advertising a pagamento.
Restano bloccanti, per la checklist QA §10 dello script originale:

- produzione delle riprese reali o generazione text-to-video autorizzata per SC01-SC04/SC06/SC07;
- voce fuori campo (talent o TTS con licenza) e musica su licenza documentata;
- compilazione di V08-V12 se si vuole completare SC08;
- revisione legale finale del testo (in particolare la correzione sul brevetto);
- approvazione scritta di Tobia Zampieri.
