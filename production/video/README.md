# Atlas — video pubblicitario: stato di produzione

## Cosa è questo cut

`remotion/atlas-motion/` contiene un **cut completo di 90 secondi** che segue scena per scena la
struttura e il timing esatto di `script-video-pubblicitario-v1.0.md` (§4-§5), assemblato con
Remotion.

**Tutte le nove scene sono ora immagini vere**: otto sono girate in 3D in Blender/EEVEE
(geometria, materiali PBR, luci ad area e solari, foschia volumetrica, profondità di campo
ottica), la nona è tipografia su un fondale renderizzato. Sorgenti in `blender/`:

| Scena | Sorgente | Contenuto |
|---|---|---|
| SC01 | `sc01_report.py` | bilancio patinato su scrivania, copertina incernierata che si chiude sui grafici |
| SC02 | `sc02_aerial.py` | impianto industriale all'alba: torri di raffreddamento, camini, silos, serbatoi, tralicci. Aerea in discesa, poi carrellata bassa in controluce |
| SC03 | `sc03_office.py` | ufficio notturno illuminato dal solo monitor, questionario che scorre, stacco su calendario |
| SC04 | `sc04_plant.py` | interno impianto: contatore con cifre 3D emissive, valvola che perde vapore sotto una torcia |
| SC05 | `sc05a_sensor.py` `sc05b_orbit.py` `sc05c_ledger.py` | tre movimenti: sensore fascettato su tubazione; satellite di osservazione sopra un pianeta con rilievo reale; blocchi d'acciaio che si incatenano con saldature di luce |
| SC06 | `sc06_thermal.py` | nodo di tubazioni con valvola: stacco A/B a camera **ferma** fra luce di servizio e mappa termica, poi coibentazione applicata |
| SC07 | `sc07_bamboo.py` | piantagione di bambù in file regolari: carrellata fra i culmi, macro sulla fascetta dendrometrica, gru sulle file |
| SC08 | `sc08_plate.py` | piastra d'acciaio fresata, luce radente (fotogramma singolo ad alta qualità, con movimento lento in Remotion) |
| SC09 | — | endcard: logo ufficiale, payoff, CTA a bottone |

`render_all.sh` rigenera tutto; in pratica si usano due job in parallelo — `render_queue.sh` per
le scene leggere in sequenza e `render_all.sh sc07` per quella pesante.

## Trattamento

- **Formato anamorfico 2.39:1** (bande in `shared.tsx`), che impone composizioni orizzontali.
- **Alone luminoso vero** (`CineVideo`): secondo passaggio dello stesso fotogramma, sfocato e
  schiarito, ricomposto in `screen` — è il modo in cui la luce forte si diffonde nell'emulsione.
- **Resa AgX** in Blender, ombre virate al freddo e alte luci calde in Remotion, grana e
  vignettatura su ogni scena.
- **Camera sempre in movimento**, con micro-instabilità da spalla dove la ripresa sarebbe a mano;
  più di una inquadratura per scena, con stacchi netti.
- **Tipografia cinetica parola per parola**, filetto azzurro d'ingresso, dentro l'area sicura.
- **Sound design sintetizzato** (`audio/sfx_design.py`) agganciato ai fotogrammi reali degli
  eventi: lo scatto della copertina, lo stacco dell'aerea, i sette colpi dei blocchi, il taglio
  A/B, il click della fascetta. Mixato con la colonna originale in `audio/mix_final.mp3`.

## Verifica strutturale

`verify_clips.sh` controlla che **ogni clip copra l'intera sequenza che lo ospita**. È il
controllo che mancava: SC05 durava 400 frame ma il clip disponibile era di 150, e
`OffthreadVideo` congelava l'ultimo fotogramma per dieci secondi. `Composition.tsx` fallisce in
build se i tre movimenti di SC05 non sommano esattamente alla durata della scena.

## Note di produzione (costo di render)

Il render gira su GL software (llvmpipe, 4 core): il costo è dominato da **ombre e volumetriche**,
non dai campioni. SC07 partiva da 40 s/fotogramma — non producibile; con cascade d'ombra a 1024
concentrate sui 45 m utili, ombre dure e senza riflessi screen-space scende a ~17 s senza perdite
visibili, perché la scena non ha superfici riflettenti. Gli script accettano `CINE_SCALE` e
`CINE_SAMPLES` da ambiente per generare provini rapidi (~1 s/fotogramma) con cui giudicare le
inquadrature, e `only=1,50,100` per renderizzare solo i fotogrammi campione di una timeline.

## Cosa NON è

**Non è il video pubblicitario finale descritto dallo script.** Lo script prevede riprese reali
(drone, termocamera, piantagione, mani di tecnici, voce fuori campo, musica su licenza). Questo
ambiente non dispone di:

- una camera o accesso a footage/stock reale;
- un generatore text-to-video connesso;
- un motore TTS per la voce fuori campo;
- una libreria musicale con licenza documentata (§6.3 la richiede esplicitamente): tutti gli host
  di musica libera raggiungibili restituiscono 403 dal proxy di rete, quindi la colonna è
  **sintetizzata originale**, non su licenza di terzi.

Le scene 3D sono **ricostruzioni**, non riprese: nessun drone reale, nessuna termocamera reale,
nessuna piantagione reale, nessun attore. Sono coerenti con la palette e i divieti del brief
(§2.3: nessun cliché ambientalista; NEG prompt: nessuna estetica sci-fi/hologram) ma non
sostituiscono i PROMPT (EN) dello script.

Il video non ha voce fuori campo: il testo VO di §6.2 passa dai sottotitoli aperti, l'unico modo
di veicolarlo senza un motore di sintesi vocale.

## Cosa è pienamente conforme

- Nessun dato inventato: solo le variabili confermate (V01, V02 fallback, V03, V04, V05, V07
  corretto) compaiono a schermo; V08-V12 sono omesse, non riempite a caso (§0.1).
- Palette e logo sono quelli ufficiali delle linee guida, usati secondo le regole vincolanti
  (nessuna inclinazione, nessuna alterazione colore). I falsi colori IR di SC06 e il verde
  naturale della vegetazione stanno **fuori** dalla palette di marchio, che resta riservata agli
  elementi grafici.
- Il brevetto è citato correttamente (B.R.A.I.N., depositato) e non come "AgroCarbonSense",
  correggendo un errore presente nello script originale.
- Nessun cliente, nessun logo di terzi, nessun impianto riconoscibile, nessun volto.

## Prima di qualsiasi pubblicazione

Restano bloccanti, per la checklist QA §10 dello script originale:

- produzione delle riprese reali (o generazione text-to-video autorizzata) dove servono immagini
  fotografiche: le scene 3D sono ricostruzioni;
- voce fuori campo (talent o TTS con licenza) e musica su licenza documentata;
- compilazione di V08-V12 se si vuole completare SC08;
- revisione legale finale del testo (in particolare la correzione sul brevetto);
- approvazione scritta di Tobia Zampieri.
