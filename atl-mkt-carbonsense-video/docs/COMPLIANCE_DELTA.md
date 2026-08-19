# COMPLIANCE_DELTA — deck `CARBONSENSE ENGLISH` → spot 60"

Registro delle affermazioni presenti nel deck sorgente che **non** sono state trasferite
nel video, o che sono state riformulate. Un video pubblicitario è materiale diffuso a un
pubblico indeterminato: l'esposizione (Green Claims / AGCM) è più alta di quella di un deck
consegnato a un interlocutore singolo.

| # | Claim nel deck | Trattamento nello spot | Motivo |
|---|---|---|---|
| 1 | "Software prototype **TRL 4 completed**" (slide Traction) e "THE SITUATION TRL 4" | Sostituito con *"CarbonSense: TRL 3 in consolidamento verso TRL 4"* | Contrasta con il fatto verificato interno. Dichiarare un TRL superiore a quello sostenibile in materiale ESA/grant è il tipo di scostamento che costa un finanziamento. **Da riconciliare: il deck e i fatti verificati dicono cose diverse.** |
| 2 | "EU competitors do not exist in this space-native category" | Rimosso | Claim di superiorità assoluta non dimostrabile → pratica commerciale ingannevole. Sostituito da differenziatori descrittivi (SAR, proof-of-location). |
| 3 | "$1 trillion by 2030", "SOM €50 M/anno", "TAM €205 mld" | Rimossi dallo spot | Proiezioni illustrative: ammissibili in un investor deck con fonte e disclaimer, non in un video pubblicitario dove nessuno legge la nota. |
| 4 | "€500/y" + "up to 30%" (business model) | Rimossi | Il pricing non va in un asset pubblico: comprime la trattativa e cristallizza la % Layer 3 di fronte a partner di canale. |
| 5 | "Strategic collaborations — Agertech, SeaTheChange, Biobambuitalia" e "3 pilot partners" | Rimossi | Nessuna citazione di terzi senza consenso scritto. Biobambuitalia inoltre è filone holding, non core MRV Atlas. |
| 6 | "European legislation (CSRD – ISO 14068) requires…" | Sostituito con CRCF + Green Claims + pull Scope 3 | Post-Omnibus I la CSRD obbligatoria copre una platea molto ristretta: presentarla come l'obbligo che spinge il cliente tipo è impreciso e attaccabile. |
| 7 | "Dr. Matteo Polonio — CTO" (slide Team) | Slide team non presente nello spot | Il ruolo indicato non corrisponde all'assetto dichiarato (CTO full-time = post-round). **Da correggere anche nel deck sorgente.** |
| 8 | "ERC-20" e riferimenti a NFT/token nel workflow | Non ripresi | Un token nel materiale pubblicitario sposta la conversazione su un piano regolatorio (MiCA) che non serve alla vendita e apre domande a cui lo spot non risponde. |
| 9 | Brevetto | Nel video compare come *"B.R.A.I.N. Engine: brevetto depositato UIBM"* | Il deposito n. 102025000029407 copre B.R.A.I.N., **non** CarbonSense; fino a concessione si dice "depositato". |
| 10 | Loghi/accreditamenti | Mantenuti solo: ESA BIC Padova, Le Village by CA Padova, Fondazione Italia-USA Top 100, MIMIT | Accreditamenti verificati. Nessun logo di terzi (Copernicus, ESA, Galileo) va usato come endorsement: citazione testuale sì, marchio no senza autorizzazione. |


## Secondo passaggio — deck `CarbonSense` italiano (PDF 11 slide, `docs/sorgenti/`)

Stesso criterio delle righe 1–10: qui sono registrate le affermazioni del deck
italiano non trasferite in `src/content/it.ts` e `en.ts`.

| # | Claim nel deck | Trattamento nello spot | Motivo |
|---|---|---|---|
| 11 | "Il **primo** modello AI europeo addestrato su dati con proof-of-location GNSS" (slide AI Engine) | Rimosso | Claim di primato non dimostrabile. Sostituito da descrizione della funzione: correzione del dato satellitare sul misurato. |
| 12 | "CarbonSense: il **primo sistema italiano** space native…" (slide di chiusura) | Rimosso | Stesso motivo. Il differenziatore resta descrittivo: SAR, proof-of-location, ancoraggio. |
| 13 | "Calcolo CO₂ … secondo **ONCRA + ISO 14068**", "metodologie certificate e riconosciute a livello europeo" | Rimosso | Una conformità metodologica dichiarata su un componente a TRL 3 è contestabile in un minuto. Lo stack verificato Atlas cita GHG Protocol / ISO 14064-1 / ESRS sul motore di calcolo: la conformità di CarbonSense va accertata prima di essere annunciata. |
| 14 | "Smart contract per emissione automatica dei crediti", "1 dato = 1 credito", crediti "vendibili, accettati da aziende e auditor" | Rimossi | Promettono un esito di mercato e una capacità di emissione che dipendono da registro e verificatore terzi, non da Atlas. In più riportano la conversazione su token e MiCA. |
| 15 | "Certificato digitale con QR/NFC", "blockchain ATLAS" | Rimossi | Il certificato è funzione non ancora dimostrata al TRL dichiarato; "blockchain ATLAS" suggerisce una catena proprietaria. Nello spot resta "ancorato con hash su Ethereum L2". |
| 16 | "Eliminando il rischio di Double Counting", "anti-frode e anti-spoofing", "data spoofing impossibile" | Riformulati | Nessuna eliminazione totale del rischio: lo spot dice cosa fa Galileo ("il dato viene da quel campo"), non cosa rende impossibile. |
| 17 | "Ottenimento dati da parte dell'agricoltore tramite chat **WhatsApp** semplificata" | Sostituito con "chat guidata su smartphone" | Piattaforma di terzi citata come componente dell'architettura: implica un rapporto e un trattamento dati da verificare prima di dichiararlo. |
| 18 | "Integrazione **futura** con sat-IoT per aree non coperte da GSM" | Rimosso | Roadmap, non attività a regime: in uno spot si legge come funzione disponibile. |
| 19 | "Rileva … tagli illegali prima che siano visibili a occhio nudo" | Rimosso | Claim di prestazione non misurato né documentato. |
| 20 | Slide team: "Dr. Francesco Garbin — **CTO**" | Slide team non presente nello spot | Divergenza con l'assetto dichiarato (Garbin CSO; CTO full-time = post-round) e con il deck inglese, che assegna il ruolo a un'altra persona. **Da riconciliare nei due deck.** |

### Elementi del deck mantenuti, con verifica a carico

| Elemento | Dove compare | Verifica richiesta |
|---|---|---|
| Cadenza di misura "ogni quindici minuti" | `stack.steps[0].detail` | Deve essere la cadenza del prototipo attuale, non quella di progetto. |
| Sentinel-1 / -2 / -5P, Galileo come testo | scena Space | Solo citazione testuale: nessun logo Copernicus/ESA/Galileo (riga 10). |
| "Ethereum L2" | `stack.steps[4].detail` | Coerente con l'ancoraggio SHA-256 su Base L2 usato dal registry Atlas. |

## Deroghe redazionali del passaggio a video

Il voiceover dello script supera i limiti di parole della tabella "Vincoli di
durata" (`PIPELINE_AGENT.md`): lo script annota "≈11 parole" per l'hook, che di
parole ne conta 15. A 2,6 parole/secondo quel testo non entra nei 5 secondi
della scena. I testi in `src/content/*.ts` sono quindi accorciati; il senso e i
claim non cambiano. `npm run check:claims` verifica i limiti a ogni modifica.

| Scena | Script | Contenuti | Modifica |
|---|---|---|---|
| Hook IT | 15 parole | 13 | cade "E … davvero" |
| Problema IT | 24 | 21 | "dati che nessuno può verificare" → "dati non verificabili" |
| Stack IT | 33 | 31 | "lo ancora in modo immutabile" → "lo ancora, immutabile" |
| Space IT | 31 | 28 | "non da un altro" → "non altrove" |
| Perché ora IT | 24 | 23 | cade l'articolo in "un rischio legale" |
| Hook EN | 14 | 13 | cade "And" |

Se il gate compliance preferisce il testo integrale dello script, la scelta è
allungare le scene in `TIMELINE`, non comprimere il parlato.

## Punti aperti prima del render definitivo

1. **TRL** — il deck circolante dichiara TRL 4 completato. O si allinea il deck, o si spiega
   perché le due fonti divergono. Finché resta la divergenza, qualunque materiale nuovo è
   esposto a una contestazione banale.
2. **Uso dei marchi Copernicus / Galileo / ESA** — verificare le condizioni d'uso prima di
   inserire loghi. Nel progetto attuale compaiono solo come testo.
3. **Licenza Remotion** — vedi README §0b.
4. **Musica e voce** — licenza commerciale documentata e archiviata.
5. **Approvazione** — campo `meta.approvedBy` in `content/it.ts` va compilato prima del
   render della versione pubblica.
6. **Dominio e contatti** — il deck italiano riporta `www.atlascarbonneutral.it`
   e `info@atlascarbonneutral.it`, lo script `atlascarbonneutral.com`. Nei
   contenuti è usato il `.com`: va confermato quale dominio e quale casella
   sono operativi prima di mandare in onda un contatto.
7. **Sede operativa** — il deck indica "Piazza Giacomo Zanellato 23, Padova",
   i dati societari "Le Village by Crédit Agricole, Padova". Lo spot cita solo
   "Milano · Padova": se serve l'indirizzo, prima si allinea.
8. **Marchio** — `Brandmark` in `src/components/ui.tsx` è un segnaposto
   astratto, non il marchio registrato (versione Capra). Va sostituito con
   `public/logo-atlas.svg` prima di qualunque uscita pubblica.
9. **Ruolo del filtro automatico** — `npm run check:claims` intercetta le
   violazioni meccaniche (superiorità, TRL unico, pricing, proiezioni, nomi di
   terzi, brevetto non "depositato", sforamenti di durata). Non decide se un
   claim si può fare: quello resta il gate compliance.
