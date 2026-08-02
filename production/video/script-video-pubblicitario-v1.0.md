# ATLAS — SCRIPT VIDEO PUBBLICITARIO
## Documento di produzione per pipeline multi-agent
**Committente:** Atlas: Carbon Neutral Solutions S.r.l. Società Benefit
**Versione:** v1.0 — 02/08/2026
**Stato:** DRAFT — non renderizzabile finché le variabili in §3 non sono compilate
---
## 0. ISTRUZIONI PER GLI AGENT (leggere prima di tutto)
1. **Nessun agent può inventare dati.** Ogni numero, nome cliente, percentuale, certificazione o data normativa presente nel video deve provenire dalla tabella §3. Se una variabile è vuota, il segmento va renderizzato senza quel dato o non va renderizzato affatto. **Non sostituire con valori plausibili.**
2. **Nessun logo di terzi** (ESA, Copernicus, RIR AIR, clienti, enti certificatori) senza autorizzazione scritta caricata come asset. Vedi §9.
3. **Nessun volto reale identificabile** senza liberatoria firmata. Attori generati o figure di spalle / fuori fuoco.
4. Il file è la fonte unica di verità. Se un agent trova ambiguità, si ferma e la segnala: non risolve per conto proprio.
---
## 1. SCHEDA DI PRODUZIONE
| Voce | Specifica |
|---|---|
| **Obiettivo commerciale** | Generare richieste di contatto qualificate da decision maker industriali (non awareness generica) |
| **Audience primaria** | Direzione generale, CFO, HSE/Energy Manager di PMI e medie industrie italiane energivore o soggette a rendicontazione (cemento, calcestruzzo, waste management, manifattura, utility locali) |
| **Audience secondaria** | Amministratori pubblici locali; investitori e partner istituzionali |
| **Insight strategico** | Il target **non va convinto che l'ESG conti** — lo sa già, glielo impone la filiera. Va convinto che *la sua misura attuale non regge un controllo*. Il nemico non è lo scetticismo: è la stima approssimativa spacciata per dato. |
| **Promessa unica** | Atlas non racconta la sostenibilità: la misura, con un dato che regge la verifica di terzi. |
| **Tono** | Documentario industriale. Asciutto, adulto, zero retorica ambientalista. Nessun tono catastrofista. |
| **Durata master** | 90 secondi |
| **Derivati obbligatori** | Cut 30" (16:9) · Cut 15" verticale (9:16) · 6" bumper (opzionale) |
| **Lingua** | Italiano. Sottotitoli IT sempre impressi (open caption) sui formati social |
| **Versione EN** | Fuori scope v1.0. Non tradurre: va riscritta. |
**KPI di successo (da tracciare, non da mostrare nel video):** numero di richieste di diagnosi/assessment ricevute nei 30 giorni post-lancio, non views né like.
---
## 2. REGOLE VINCOLANTI (compliance e brand)
### 2.1 Claim ambientali — regime restrittivo
Atlas è **Società Benefit**: uno standard di comunicazione più alto, non più basso. La disciplina UE sui claim ambientali generici (Dir. UE 2024/825 e seguito) rende sanzionabile ciò che fino a ieri era tollerato come marketing.
**VIETATO nel video, senza eccezioni:**
- "sostenibile", "green", "eco", "carbon neutral", "a impatto zero" riferiti ad **Atlas stessa** o ai clienti, senza certificazione allegata
- qualsiasi percentuale di riduzione emissioni/consumi non tracciabile a un documento agli atti
- claim comparativi impliciti o espliciti verso concorrenti
- nomi di clienti, loghi clienti, immagini riconoscibili di loro impianti senza liberatoria
- date normative future affermate come certe (ETS2, CSRD, CBAM): usare solo le formulazioni in §3 se compilate; altrimenti tagliare la battuta
**AMMESSO:** descrizione di *cosa fa* Atlas (misurare, notarizzare, certificare, ridurre) — verbi di processo, non aggettivi di risultato.
### 2.2 Protezione IPR
Il video **non deve** mostrare o descrivere: architettura interna dello stack, logiche algoritmiche, schemi di rivendicazione brevettuale, screenshot reali di dashboard con struttura dati leggibile. Le UI a schermo sono **mockup astratti** (vedi §7.4). Il numero di brevetto può comparire come testo statico se la variabile V07 è confermata.
### 2.3 Divieti visivi (anti-cliché — respinta automatica del render)
Nessun: orso polare · ghiacciaio che si sciolge · mani che reggono una piantina · globo terrestre che diventa verde · foglie che volano in slow motion · pale eoliche in campo di girasoli al tramonto · bambini che corrono nel prato · lampadina che diventa foglia · timelapse di città con overlay verde · font corsivo "naturale" · musica pianoforte emotivo ascendente.
Questi elementi segnalano *marketing ambientale*, cioè esattamente la categoria da cui Atlas si sta differenziando.
---
## 3. VARIABILI DA COMPILARE PRIMA DEL RENDER
> Compilazione a cura di Tobia Zampieri. Ogni cella vuota = segmento tagliato, mai inventato.
| ID | Variabile | Dove compare | Valore | Fonte/verifica |
|---|---|---|---|---|
| V01 | Palette brand ufficiale (HEX primario/secondario/accento) | tutto | ______ | Brand book Atlas |
| V02 | Font brand (titolo / testo) | tutto | ______ | Brand book Atlas |
| V03 | Logo Atlas + versione con dicitura "Società Benefit" (SVG/PNG trasparente) | SC08, SC09 | ______ | file asset |
| V04 | Payoff ufficiale (se già esistente) | SC09 | ______ | vedi §8 per 3 opzioni se assente |
| V05 | CTA operativa (URL landing / email / QR) | SC09 | ______ | — |
| V06 | Claim normativo A: formulazione esatta e verificata su ETS2 / CSRD-VSME / CBAM | SC03 | ______ | verifica legale prima del render |
| V07 | Numero brevetto AgroCarbonSense da esporre a schermo (sì/no + stringa) | SC08 | ______ | conferma Dr. Leganza (IP counsel) |
| V08 | Menzione ESA BIC Padova a schermo (sì/no + wording e logo autorizzati) | SC08 | ______ | allineamento preventivo con referente ESA BIC |
| V09 | Menzione RIR AIR (sì/no + wording) | SC08 | ______ | allineamento con RIR AIR |
| V10 | Menzione Premio Fondazione Italia USA (sì/no + wording) | SC08 | ______ | — |
| V11 | Standard citabili a schermo (es. GHG Protocol, ISO 14064-1, ESRS) | SC05/SC08 | ______ | citare solo quelli effettivamente applicati |
| V12 | Metrica di trazione esponibile (es. n. impianti monitorati, ettari sotto MRV) | SC08 | ______ | solo se documentata |
| V13 | Location reali disponibili per riprese (impianto, campo bambù, sede) | SC02, SC06, SC07 | ______ | + liberatoria proprietà |
| V14 | Voce speaker: genere e provino selezionato | tutto | ______ | default suggerito §6.1 |
| V15 | Ragione sociale completa per endcard legale | SC09 | ______ | visura |
---
## 4. STRUTTURA NARRATIVA (perché funziona in quest'ordine)
Il video non tratta tre temi in parallelo (ESG, efficientamento, decarbonizzazione): li mette **in sequenza causale**, con la misura come spina dorsale.
```
DICHIARAZIONE  →  PROBLEMA      →  MISURA        →  EFFICIENZA    →  DECARBONIZZAZIONE  →  PROVA  →  AZIONE
(tutti dicono)    (nessuno prova)  (Atlas misura)   (tagli i costi)  (compensi il resto)   (chi siamo) (CTA)
   SC01              SC02-04          SC05             SC06              SC07              SC08     SC09
```
Regola di montaggio: **ogni scena deve poter essere tagliata senza rompere la successiva**, tranne SC05 (perno). Serve per generare i cut da 30" e 15".
---
## 5. SCRIPT MASTER 90" — SCENA PER SCENA
Legenda campi: **TC** timecode · **VO** voce fuori campo · **OST** on-screen text · **SFX/MX** suono e musica · **PROMPT** descrizione per generatore video (in EN, ottimizzata per modelli text-to-video) · **NEG** negative prompt.
---
### SC01 — L'APERTURA CHE NEGA IL SETTORE
**TC 00:00–00:07 (7s)**
**Visual:** macro estrema. Una pagina patinata di un bilancio di sostenibilità che scorre sotto la luce radente. Si intravedono grafici a torta verdi, una foto stock di un prato. Nessun testo leggibile. La mano di un dirigente (solo mano, polsino di camicia, orologio sobrio) chiude il fascicolo di scatto.
**Camera:** macro 100mm, profondità di campo cortissima, movimento slider laterale 3 cm/s. Chiusura fascicolo ripresa a 60fps, montata a 24fps (leggero rallenty percettivo, non estetizzante).
**VO:** «Oggi ogni azienda ha un bilancio di sostenibilità.»
**OST:** nessuno.
**SFX/MX:** silenzio quasi totale. Fruscio carta. Un singolo colpo secco (chiusura fascicolo) che diventa il primo beat del brano.
**PROMPT (EN):** `Extreme macro shot, glossy corporate sustainability report page under raking window light, shallow depth of field, subtle green pie charts out of focus, a man's hand with plain shirt cuff snaps the folder shut, cinematic desaturated industrial color grade, 100mm macro lens, slow lateral slider, natural office light, photorealistic, 24fps film look`
**NEG:** `text, readable words, logos, brand names, cartoon, saturated green, nature imagery, smiling people, stock photo aesthetic`
---
### SC02 — LO STACCO SUL REALE
**TC 00:07–00:14 (7s)**
**Visual:** stacco netto sul mondo fisico. Alba livida su un impianto industriale italiano: silos, nastri trasportatori, vapore. Drone in avvicinamento lento, basso, laterale. Nessuna estetica "smog drammatico": luce naturale, colori freddi, impianto pulito e funzionante.
**Camera:** drone, 24mm, traiettoria lineare a 4 m/s, altezza 15 m, nessuna rotazione.
**VO:** «Quasi nessuna ha un dato che regga una verifica esterna.»
**OST:** nessuno.
**SFX/MX:** ingresso ambienza industriale reale (motori bassi, nastro). Entra un pattern ritmico minimale (kick sordo + pulse).
**PROMPT (EN):** `Aerial drone shot at cold dawn, Italian industrial plant with silos and conveyor belts, thin steam, overcast blue-grey light, slow low lateral push-in, clean functional factory, documentary realism, anamorphic 24mm, muted teal and concrete palette, photorealistic`
**NEG:** `black smoke, apocalyptic, polluted sky, dramatic orange sunset, ruins, abandoned factory, people, logos`
---
### SC03 — LA PRESSIONE ESTERNA
**TC 00:14–00:24 (10s)**
**Visual:** montaggio serrato di 4 inquadrature da 2,5s ciascuna, tutte in interni ufficio, luce fredda da monitor:
1. Un questionario fornitori su schermo, scroll rapido (testo illeggibile/blurrato).
2. Un dito che batte su una casella non compilata di un form.
3. Un calendario a muro con una data cerchiata (nessun anno leggibile).
4. Una firma su un documento, ripresa dall'alto.
**VO:** «Non lo chiede più solo il regolatore. Lo chiedono le banche, i capitolati, i clienti a monte della tua filiera.»
*(Se V06 è compilata, sostituire la prima frase con la formulazione normativa verificata. Se V06 è vuota, mantenere questa versione: non contiene claim datati.)*
**OST:** nessuno (i testi su schermo restano illeggibili per design — vedi §2.2).
**SFX/MX:** il pattern ritmico si infittisce. Suoni UI secchi, tastiera, timbro.
**PROMPT (EN):** `Fast documentary montage inside a modern Italian office, cold monitor light, close-up of a supplier questionnaire scrolling on screen with unreadable blurred text, finger tapping an empty form field, wall calendar with one circled date, overhead shot of a hand signing a document, handheld subtle movement, desaturated corporate palette, photorealistic`
**NEG:** `readable text, real company names, logos, stock-photo handshake, smiling businesspeople, green graphics`
---
### SC04 — IL COSTO DELL'APPROSSIMAZIONE
**TC 00:24–00:32 (8s)**
**Visual:** interno impianto, notte. Un contatore elettrico industriale con le cifre che avanzano. Poi: una valvola che perde vapore in un angolo buio, illuminata solo da una torcia. Nessuno la sta guardando.
**Camera:** 50mm, macchina a mano stabilizzata, luce pratica (torcia in campo).
**VO:** «Chi stima invece di misurare paga due volte. Paga l'energia che spreca. E paga il carbonio che non sa di emettere.»
**OST:** nessuno.
**SFX/MX:** sibilo del vapore isolato in premix, panoramico. Il brano si abbassa per lasciare spazio alla frase.
**PROMPT (EN):** `Night interior of an industrial facility, close-up of an electric meter with digits advancing, then a steam valve leaking in a dark corner lit only by a handheld work torch, volumetric steam, high contrast low-key lighting, 50mm, subtle handheld camera, photorealistic documentary style`
**NEG:** `fire, explosion, danger signs, workers in distress, cartoon, neon colors`
---
### SC05 — INGRESSO ATLAS (PERNO — non tagliabile)
**TC 00:32–00:48 (16s)**
**Visual:** in tre movimenti collegati da match-cut sulla stessa geometria circolare (lente sensore → orbita → nodo dati).
1. **(5s)** Un sensore installato su una tubazione/campo: dettaglio hardware, LED che pulsa una volta.
2. **(6s)** Stacco su vista orbitale: la penisola italiana da satellite, passaggio di un'orbita polare tracciata come linea sottile. Realismo scientifico, non sci-fi.
3. **(5s)** I due mondi convergono: un'astrazione grafica pulita — punti dati dal terreno e strisciate satellitari che confluiscono in un registro a blocchi che si sigilla (animazione 2D vettoriale, palette V01).
**VO:** «Atlas misura. Sensori in campo. Dati satellitari. Modelli calibrati sull'impianto reale. E un registro notarizzato che nessuno può riscrivere a posteriori — nemmeno noi.»
**OST (al terzo movimento, sequenziale, uno per riga):**
```
MISURA        →   VERIFICA        →   NOTARIZZAZIONE
in campo          da satellite        immutabile
```
**SFX/MX:** il brano si apre (entra un elemento armonico sostenuto). Suono singolo, cristallino, sul sigillo del registro.
**PROMPT 1 (EN):** `Macro shot of a compact industrial IoT sensor mounted on a metal pipe outdoors, single blue LED pulse, morning light, shallow depth of field, photorealistic, no branding`
**PROMPT 2 (EN):** `Photorealistic satellite view of the Italian peninsula from low earth orbit, thin polar orbit track line, scientific accuracy, no lens flares, no sci-fi UI, dark space background, subtle cloud cover`
**PROMPT 3:** animazione vettoriale 2D — **non generativa**. Da produrre in After Effects/Lottie con palette V01. Vedi §7.4.
**NEG:** `sci-fi hologram, blue glowing grid, futuristic HUD, matrix code rain, spaceship, alien`
---
### SC06 — EFFICIENTAMENTO ENERGETICO
**TC 00:48–01:00 (12s)**
**Visual:**
1. **(4s)** Termocamera reale (o simulazione fedele) su un tratto di impianto: la dispersione termica appare come area chiara.
2. **(4s)** Stessa inquadratura, ripresa dopo l'intervento: la dispersione non c'è più. Il taglio è secco, A/B, senza transizione. Questa è la figura retorica più forte del video: non spiega, dimostra.
3. **(4s)** Ripresa dell'operatore che chiude un quadro elettrico (spalle, non riconoscibile).
**VO:** «Dove misuri, trovi lo spreco. Dove trovi lo spreco, tagli il costo prima ancora dell'emissione. L'efficienza energetica è la parte della decarbonizzazione che si ripaga da sola.»
**OST:** nessun numero, **salvo V12 compilata**. Se compilata: dato reale + fonte in caption piccola.
**SFX/MX:** stacco A/B accompagnato da un beat pieno. Poi ambienza pulita.
**PROMPT (EN):** `Industrial thermal camera footage of a pipe section showing a bright heat loss area, then the identical framing with uniform temperature after insulation, hard cut A/B comparison, authentic infrared color mapping, technical documentary style`
**NEG:** `fake rainbow thermal, cartoon heatmap, sci-fi overlay, readable brand`
---
### SC07 — DECARBONIZZAZIONE E ASSORBIMENTO
**TC 01:00–01:14 (14s)**
**Visual:**
1. **(5s)** Camminata dentro una piantagione di bambù gigante: verticali fitte, luce che filtra, movimento steadicam in avanti. **Realismo agronomico**: filare ordinato, terreno lavorato, non giungla.
2. **(4s)** Dettaglio: un misuratore diametrico (calibro) su un culmo; mano di un tecnico che annota o inquadra con un dispositivo.
3. **(5s)** Vista aerea che sale dal filare e rivela l'estensione dell'appezzamento, con overlay grafico minimale a griglia (parcelle di misura).
**VO:** «Ciò che non puoi eliminare, lo assorbi. Ma solo se lo conti davvero: ettaro per ettaro, pianta per pianta, misura per misura. Un credito che non si può verificare non vale niente. Un credito misurato, sì.»
**OST (sull'aerea):** `MISURATO, NON STIMATO`
**SFX/MX:** ambienza naturale reale (vento tra i culmi, uccelli discreti). Nessun ammorbidimento musicale: il brano mantiene il registro industriale. La natura qui è **infrastruttura produttiva**, non idillio.
**PROMPT (EN):** `Steadicam forward walk through a cultivated giant bamboo plantation in Northern Italy, orderly rows, tilled soil, sunlight filtering through dense vertical culms, then close-up of a caliper measuring a bamboo culm held by a technician's hands, then rising aerial revealing the full plot extent, agricultural realism, natural color grade, photorealistic`
**NEG:** `tropical jungle, wild forest, panda, zen garden, oriental music imagery, mist, fairy lights, magical atmosphere`
---
### SC08 — LA PROVA (chi parla)
**TC 01:14–01:22 (8s)**
**Visual:** fondo neutro nella palette V01. Comparsa sequenziale di elementi testuali/logo, uno ogni 1,5s, con animazione minima (fade + 4px di traslazione verticale). Nessuna scena filmata.
**OST — inserire SOLO le voci le cui variabili sono confermate:**
```
Atlas: Carbon Neutral Solutions S.r.l. — Società Benefit
[V07] Brevetto AgroCarbonSense n. ________
[V08] Incubata presso ESA BIC Padova
[V09] Rete Innovativa Regionale AIR — Aerospace Innovation and Research
[V10] Premio Fondazione Italia USA
[V11] Metodologie: ________________
[V12] ________________
```
**VO:** «Siamo una Società Benefit. Significa che l'impatto che dichiariamo, lo rendicontiamo. Con lo stesso metodo che vendiamo.»
**SFX/MX:** brano in sostegno, nessun accento.
**Nota per l'agent grafico:** se un logo di terzi non ha autorizzazione caricata (V08/V09), renderizzare la riga **in solo testo**, mai il marchio.
---
### SC09 — ENDCARD E CTA
**TC 01:22–01:30 (8s)**
**Visual:** logo Atlas (V03) centrato su fondo V01. Sotto: payoff (V04). In basso: CTA (V05) + QR code se il video è destinato a proiezione/fiera. Ragione sociale completa (V15) in corpo minimo, riga unica, in fondo.
**VO:** «Atlas. [payoff V04]»
**OST:**
```
[LOGO ATLAS]
[V04 — payoff]
[V05 — CTA: es. "Richiedi la valutazione del tuo impianto → atlascarbonneutral.com"]
Atlas: Carbon Neutral Solutions S.r.l. Società Benefit — [V15]
```
**SFX/MX:** il brano chiude su un singolo colpo, stesso timbro di SC01 (chiusura del fascicolo). Il video si chiude come si è aperto: struttura ad arco udibile.
---
## 6. VOCE E AUDIO
### 6.1 Speaker
- **Default suggerito (reversibile):** voce maschile, 40–55 anni percepiti, timbro basso, dizione italiana neutra senza inflessione regionale, ritmo lento (≈115 parole/minuto), **zero enfasi pubblicitaria**. Registro: chi constata, non chi vende.
- **Alternativa valida:** voce femminile stessi parametri. La scelta è di brand, non di efficacia.
- **Se TTS:** modello con controllo di pause. Inserire pausa di 400 ms dopo ogni punto fermo e di 250 ms prima di ogni congiunzione avversativa. Nessuna enfasi automatica sulle parole chiave: l'enfasi la fa il montaggio.
### 6.2 Testo VO pulito (per TTS o gobbo — copiare da qui)
```
Oggi ogni azienda ha un bilancio di sostenibilità.
Quasi nessuna ha un dato che regga una verifica esterna.
Non lo chiede più solo il regolatore. Lo chiedono le banche, i capitolati, i clienti a monte della tua filiera.
Chi stima invece di misurare paga due volte. Paga l'energia che spreca. E paga il carbonio che non sa di emettere.
Atlas misura. Sensori in campo. Dati satellitari. Modelli calibrati sull'impianto reale. E un registro notarizzato che nessuno può riscrivere a posteriori: nemmeno noi.
Dove misuri, trovi lo spreco. Dove trovi lo spreco, tagli il costo prima ancora dell'emissione. L'efficienza energetica è la parte della decarbonizzazione che si ripaga da sola.
Ciò che non puoi eliminare, lo assorbi. Ma solo se lo conti davvero: ettaro per ettaro, pianta per pianta, misura per misura. Un credito che non si può verificare non vale niente. Un credito misurato, sì.
Siamo una Società Benefit. Significa che l'impatto che dichiariamo, lo rendicontiamo. Con lo stesso metodo che vendiamo.
Atlas. [PAYOFF V04]
```
**Conteggio:** 178 parole ≈ 88–92 secondi a 115 wpm. Se il montato sfora, tagliare **SC03** per intero (10s) prima di comprimere il parlato.
### 6.3 Musica
- Genere: **minimal industrial / ambient ritmico**. Percussioni sorde, bassi profondi, un solo elemento armonico sostenuto che entra a SC05.
- BPM 84–92, costante. Nessun cambio di tonalità, nessun crescendo emotivo, nessun pianoforte.
- Struttura: silenzio (SC01) → pulse (SC02) → build ritmico (SC03-04) → apertura armonica (SC05) → sostegno (SC06-08) → colpo finale (SC09).
- **Licenza obbligatoria** con documentazione allegata. Nessuna traccia generata da modelli il cui training non è documentato, se il video andrà in advertising a pagamento.
### 6.4 Mix
- VO sempre in primo piano, -6 dB sopra la musica. Ambienze a -18 dB.
- Loudness target: **-16 LUFS** per web/social, **-23 LUFS** per eventuale broadcast/fiera.
- True peak max -1 dBTP.
---
## 7. GRAFICA E IDENTITÀ VISIVA
### 7.1 Palette
Palette brand V01. Vincolo cromatico generale: **il verde non è il colore guida.** Base fredda (grigio-blu industriale, cemento, acciaio) con un solo accento del brand usato con parsimonia, esclusivamente sui dati. Il colore segnala *dove c'è misura*, non *dove c'è natura*.
### 7.2 Tipografia
Font V02. Se assente: sans-serif geometrico o neo-grottesco, pesi Regular e Medium soltanto. Mai corsivo. Mai maiuscoletto decorativo. Interlinea 1,3. Testo sempre allineato a sinistra tranne endcard.
### 7.3 Sottotitoli
- Open caption impressi su tutte le versioni social, chiusi (SRT separato) sulla versione sito.
- Max 2 righe, 42 caratteri per riga, permanenza minima 1,2 s.
- Posizione: terzo inferiore, con margine di sicurezza del 12% dal bordo (evita sovrapposizione UI Instagram/TikTok).
### 7.4 UI e animazione dati (SC05, SC07)
- **Astratte per obbligo IPR.** Punti, linee, blocchi, griglie. Nessun campo dati leggibile, nessuna struttura di database, nessuna label che riveli architettura.
- Stile: vettoriale piatto, spessore linea 2px costante, nessun glow, nessuna trasparenza sfumata, nessuna estetica "hologram".
- Animazione: ease-in-out 300 ms, mai rimbalzi.
---
## 8. PAYOFF — 3 OPZIONI (se V04 è vuota, scegliere qui, non improvvisare)
| # | Payoff | Perché | Rischio |
|---|---|---|---|
| A | **Il dato prima della promessa.** | Coerente con l'intera narrazione; nessun claim ambientale, quindi zero esposizione greenwashing | Poco emotivo |
| B | **Misuriamo ciò che gli altri dichiarano.** | Posizionamento competitivo netto | Sfiora il claim comparativo — verifica legale |
| C | **La sostenibilità, dimostrata.** | Immediato, comprensibile a un CFO | Contiene "sostenibilità": richiede supporto documentale se contestato |
Raccomandazione operativa: **A**. È l'unico che regge un'istruttoria AGCM senza allegati.
---
## 9. DERIVATI
### 9.1 Cut 30" (16:9) — performance / pre-roll
Sequenza: **SC01 (4s) → SC02 (3s) → SC04 (5s) → SC05 (10s) → SC06 A/B (4s) → SC09 (4s)**
VO ridotto:
```
Oggi ogni azienda ha un bilancio di sostenibilità. Quasi nessuna ha un dato che regga una verifica.
Chi stima invece di misurare paga due volte: l'energia che spreca e il carbonio che non sa di emettere.
Atlas misura. Sensori in campo, dati satellitari, un registro che nessuno può riscrivere.
Atlas. [PAYOFF V04]
```
(58 parole ≈ 30s)
### 9.2 Cut 15" verticale (9:16) — social
Sequenza: **SC06 A/B in apertura (hook visivo, 3s) → SC05 mov.3 (5s) → SC07 aerea (3s) → SC09 (4s)**
- Il verticale **apre con la termocamera**, non con il fascicolo: su feed serve un hook visivo entro 1,5s, non retorico.
- Riquadratura: soggetto sempre nel terzo centrale. Ricomporre, mai crop automatico.
- Deve funzionare **senza audio**: ogni informazione passa dai sottotitoli impressi.
VO/caption:
```
Lo spreco che non vedi lo stai già pagando.
Atlas misura: sensori, satelliti, registro notarizzato.
[PAYOFF V04]
```
### 9.3 Bumper 6" (opzionale)
Solo SC06 A/B + endcard. Nessun VO, solo testo: `MISURATO, NON STIMATO` → logo.
---
## 10. QA — CHECKLIST PRE-CONSEGNA (bloccante)
Il video **non esce** se una casella non è spuntata.
- [ ] Nessun claim ambientale generico non supportato (§2.1) — verifica riga per riga del VO finale
- [ ] Tutte le variabili §3 usate sono compilate; nessun dato inventato in nessun frame
- [ ] Review legale del testo VO e degli OST completata (formulazioni normative in particolare)
- [ ] Nessun dettaglio tecnico coperto da brevetto visibile o descritto — **passaggio da IP counsel (Dr. Leganza)** se compare V07 o se le animazioni dati mostrano logica di processo
- [ ] Loghi di terzi: autorizzazione scritta agli atti (ESA BIC, RIR AIR, altri) oppure riga in solo testo
- [ ] Nessun cliente citato, mostrato o riconoscibile senza liberatoria
- [ ] Location riprese: liberatoria del proprietario dell'impianto/fondo
- [ ] Volti: liberatorie firmate oppure nessun volto riconoscibile
- [ ] Musica: licenza documentata e archiviata
- [ ] Nessun contenzioso aperto evocato, nemmeno indirettamente
- [ ] Loudness -16 LUFS (web) verificato in misura, non a orecchio
- [ ] Sottotitoli sincronizzati e revisionati (refusi = danno di credibilità sproporzionato per un'azienda che vende rigore)
- [ ] Test di leggibilità dell'endcard su smartphone a 5" di diagonale
- [ ] Approvazione finale scritta di Tobia Zampieri prima della pubblicazione
---
## 11. CONSEGNA ATTESA
| File | Formato | Note |
|---|---|---|
| `atlas_master_90_16x9.mp4` | H.264, 1920×1080, 25fps, ~20 Mbps | master |
| `atlas_cut_30_16x9.mp4` | idem | performance |
| `atlas_cut_15_9x16.mp4` | 1080×1920 | social, open caption |
| `atlas_bumper_06_16x9.mp4` | idem | opzionale |
| `atlas_master_90.srt` | UTF-8 | sottotitoli separati |
| `atlas_master_90_noVO.mp4` | — | versione senza voce, per futura edizione EN |
| `/assets/` | — | tutte le clip sorgente, liberatorie, licenza musicale |
