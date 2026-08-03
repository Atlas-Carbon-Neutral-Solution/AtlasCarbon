# Atlas — video pubblicitario: stato di produzione

## Cosa è questo cut

`remotion/atlas-motion/` contiene un **cut completo di 90 secondi** che segue scena per scena la
struttura e il timing esatto di `script-video-pubblicitario-v1.0.md` (§4-§5), assemblato con
Remotion.

**Quattro scene sono scene 3D reali renderizzate in Blender/EEVEE** (geometria, materiali PBR,
luci ad area, profondita' di campo ottica), sorgenti in `blender/`:

- **SC01** (`sc01_report.py`) — bilancio patinato su scrivania, luce radente, copertina
  incernierata che si chiude di scatto sui grafici stampati.
- **SC03** (`sc03_office.py`) — ufficio notturno illuminato dal solo monitor, questionario che
  scorre (illeggibile per §2.2), stacco su scrivania con calendario e data cerchiata.
- **SC04** (`sc04_plant.py`) — interno impianto: contatore con cifre 3D emissive che avanzano,
  poi valvola che perde vapore sotto una torcia in movimento.
- **SC05** (`orbit_scene.py`, movimento 2) — sfera opaca con anello orbitale.

`render_all.sh` rigenera SC01/SC03/SC04 e li encoda negli asset Remotion.

## Cosa NON è

**Non è il video pubblicitario finale descritto dallo script.** Lo script prevede riprese reali
(drone, termocamera, piantagione di bambù, mani di tecnici, voce fuori campo, musica su licenza).
Questo ambiente non dispone di:

- una camera o accesso a footage/stock reale;
- un generatore text-to-video connesso;
- un motore TTS per la voce fuori campo;
- una libreria musicale con licenza documentata (§6.3 la richiede esplicitamente).

Le scene 3D in Blender sono **ricostruzioni**, non riprese: nessun drone reale, nessuna
termocamera reale, nessuna piantagione reale, nessun attore. **SC06 e SC07 restano
motion-graphics astratte** (termocamera e campo di bambu'), in attesa dello stesso trattamento 3D
o delle riprese vere. Tutto e' coerente con la palette e i divieti del brief (§2.3: nessun cliche'
ambientalista; NEG prompt: nessuna estetica sci-fi/hologram), ma non sostituisce i PROMPT (EN)
dello script.

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

- produzione delle riprese reali (o generazione text-to-video autorizzata) dove servono immagini
  fotografiche: le scene 3D di SC01/SC03/SC04 sono ricostruzioni, SC06/SC07 sono ancora astratte;
- voce fuori campo (talent o TTS con licenza) e musica su licenza documentata;
- compilazione di V08-V12 se si vuole completare SC08;
- revisione legale finale del testo (in particolare la correzione sul brevetto);
- approvazione scritta di Tobia Zampieri.
