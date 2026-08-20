# ATL_MKT_CarbonSense_Video60_v1 — pipeline video Remotion

Progetto Remotion per generare spot pubblicitari Atlas **da codice**, con contenuti
data-driven e guardrail anti-overclaim incorporati.
Primo output: spot da 60 secondi tratto dal deck `CARBONSENSE ENGLISH` (Canva, 18 slide, 15/07/2026).

---

## 0. Prima di iniziare: due avvertenze operative

**a) L'MCP ufficiale Remotion è deprecato.**
Remotion ha dismesso il proprio server MCP documentale: la pagina ufficiale è titolata
"MCP (deprecated)", sconsiglia nuove installazioni e prevede lo spegnimento dell'endpoint
ospitato non prima del 31/08/2026. Il sostituto indicato da Remotion sono le **Agent Skills**
(`npx remotion skills add` + comando `/remotion-docs`), che funzionano con Claude Code, Codex,
Cursor. Motivazione dichiarata da Remotion: costi token a proprio carico e scarsa affidabilità
con cui gli agenti invocano i server MCP.
→ **Non cablare l'MCP Remotion in questa pipeline.** Usare le skills. La sezione 3 spiega
quando un MCP resta comunque utile (generazione asset media, non documentazione).

**b) Licenza Remotion.**
Remotion è gratuito per persone fisiche e aziende fino a 3 dipendenti; sopra quella soglia
serve una **Company License** a pagamento. Con la struttura attuale di Atlas (5 soci +
collaboratori co.co.co.) la posizione va verificata **prima** di pubblicare materiale
commerciale renderizzato con Remotion. Verifica a carico di Cesare Montagna / Indaco.
Alternativa se la licenza non è sostenibile: Motion Canvas, oppure export FFmpeg da HTML.

---

## 1. Setup

```bash
node -v            # richiesto Node 18+ (consigliato 20+)
cd atl-mkt-carbonsense-video
npm install
npx remotion skills add      # Agent Skills Remotion (sostituiscono l'MCP deprecato)
npm run dev                  # Remotion Studio su http://localhost:3000
```

Se il progetto viene ricreato da zero:

```bash
npx create-video@latest --yes --blank atl-mkt-carbonsense-video
cd atl-mkt-carbonsense-video && npm i && npx remotion skills add
# poi copiare dentro src/ e scripts/ di questo pacchetto
```

## 2. Controllo contenuti e render

```bash
npm run make:music      # rigenera la traccia musicale (già inclusa in public/)
npm run check:claims    # filtro anti-overclaim + vincoli di durata (blocca il render)
npm run typecheck       # contratto dati↔grafica
npm run render:it       # 1920x1080 italiano
npm run render:en       # 1920x1080 inglese (ESA BIC / investor)
npm run render:social   # 1080x1920 verticale LinkedIn/IG
npm run render:all      # tutti i formati registrati, naming Atlas automatico
npm run still:cover     # frame di copertina PNG per il post
```

`check:claims` gira anche come primo passo di `render:all`: se un contenuto viola
un guardrail il render non parte. Finché `meta.approvedBy` è `null`, `render:all`
rifiuta il render pubblico; per i file di revisione interna si usa
`npm run render:all -- --draft` (i file escono marcati `_DRAFT`).
Filtri utili: `-- --only=IT`, `-- --ratio=16x9`.

Composizioni registrate: `CarbonSense60-{IT,EN}-{16x9,9x16,1x1}`.
I formati 9:16 e 1:1 hanno i sottotitoli incisi (autoplay muto).

Il render locale richiede FFmpeg (incluso in Remotion) e un browser headless
(scaricato automaticamente al primo render: serve rete aperta verso i domini Remotion).
Se nell'ambiente esiste già un Chromium, si può evitare il download passando
`--browser-executable=<percorso di chrome-headless-shell>`: Remotion non avvia il
Chrome "headless nuovo", serve la headless shell.

## 3. Uso con agenti / MCP

| Bisogno | Strumento corretto |
|---|---|
| Far scrivere/modificare le animazioni a un agente | **Agent Skills Remotion** + Claude Code sulla cartella del progetto |
| Generare voiceover, musica, immagini di supporto | MCP di media generation (es. `remotion-media-mcp`) — **asset, non codice** |
| Anteprima video dentro la chat | MCP App Remotion Player (`mcp-use/remotion-mcp-app`), utile in revisione |
| Documentazione Remotion | `/remotion-docs` da skills, **non** l'MCP deprecato |

Esempio di configurazione MCP per la sola generazione asset (`.mcp.json` nel progetto):

```json
{
  "mcpServers": {
    "remotion-media": {
      "command": "npx",
      "args": ["remotion-media-mcp"],
      "env": {"KIE_API_KEY": "<chiave>"}
    }
  }
}
```

⚠️ Server MCP di terze parti = codice esterno che esegue in locale con le tue chiavi.
Prima di installarlo: verifica autore, ultimo commit e cosa invia in rete. Nessuna
credenziale Atlas (PEC, HubSpot, Notion, banca) va esposta a questi server.

## 4. Struttura

```
src/
  index.ts              entrypoint Remotion
  Root.tsx              registrazione composizioni (IT/EN × 16:9, 9:16, 1:1)
  CarbonSenseAd.tsx     TIMELINE 60 s + crossfade + audio opzionale
  theme.ts              palette brand Atlas
  layout.ts             scala responsive: un solo px() per tutti i formati
  content/
    schema.ts           tipo dei contenuti (contratto dati↔grafica)
    it.ts / en.ts       TESTI — l'unico file da toccare per cambiare il messaggio
  components/
    ui.tsx              fondo a strati, testate, split, reveal, rail, sottotitoli
    figures.tsx         figure schematiche animate in SVG, una per scena
    logo.tsx            marchio: file da public/ oppure segnaposto vettoriale
    LogoBumper.tsx      stacchi marchio in apertura e chiusura
  scenes/               7 scene, una per blocco narrativo
scripts/
  check-claims.mjs      guardrail anti-overclaim + vincoli di durata
  make-music.mjs        sintetizza la traccia musicale (nessuna licenza di terzi)
  render-all.mjs        render batch con naming ATL_MKT_* e gate approvazione
docs/                   script/storyboard, delta di compliance, pipeline agente, sorgenti
```

## 4b. Titoli di scena e figure

Ogni scena ha una **testata**: etichetta numerata + titolo, in `heading` dentro
`src/content/*.ts`. Sono i titoli delle slide del deck riportati nel video:
senza, lo spettatore legge un elenco senza sapere di cosa si parla. Il limite è
6 parole per l'etichetta e 9 per il titolo, verificato da `check:claims`.

Le **figure** stanno in `src/components/figures.tsx` e sono disegnate in SVG,
animate sul frame corrente. Nessuna immagine di stock e nessun logo di terzi:
niente licenze da verificare, niente marchi usati come endorsement.

Tre regole, perché una figura è una dichiarazione come il testo:

1. **Nessun dato inventato.** Gli schemi mostrano rapporti e topologia, non
   misure: nessun asse con valori, nessuna percentuale, nessuna quantità.
2. **Dove la forma somiglia a un grafico** (scena 01 e scena 04) la scena
   mostra `meta.figureNote` — "Schema illustrativo. Non rappresenta dati di
   misura." Non rimuoverla: è ciò che impedisce di leggere una curva come una
   misura di assorbimento.
3. **Identità mai affidata al solo colore.** Continuo/tratteggiato più etichetta
   diretta: leggibile anche stampata, in bianco e nero o con daltonismo.

Per aggiungere una figura a una scena nuova: si scrive in `figures.tsx`, si
riempie la colonna con `Split` e si limita l'altezza con la prop `height`.

## 4c. Marchio e audio

**Stacchi marchio.** `OpenBumper` (frame 0–48) e `CloseBumper` (1746–1800) in
`src/components/LogoBumper.tsx` sono overlay, non scene: la `TIMELINE` resta di
1800 frame e i tempi del montaggio non cambiano. L'ultimo fotogramma è marchio +
dominio, come si aspetta chi guarda uno spot.

**Marchio reale.** Il `Logo` usa il segnaposto vettoriale finché non riceve un
file. Appena il marchio registrato (versione Capra) è disponibile:

```bash
cp logo-atlas.svg public/            # o .png
# poi in src/Root.tsx: logo: 'logo-atlas.svg'
```

Nient'altro cambia: il file compare in apertura, in chiusura e nella scena CTA.
Il segnaposto **non** è il marchio registrato e non va usato in pubblicazione.

**Musica.** `public/music-atlas-ambient.mp3` è generata da
`npm run make:music`: bordone in La minore, battito lento e un accento su ogni
stacco di scena della `TIMELINE`, picco a −14 dBFS per lasciare spazio alla voce.
È prodotta dentro il progetto, quindi non c'è nessuna licenza di terzi da
comprare, archiviare o riesibire quando il video finisce in un materiale
grant/ESA. Per cambiarla: si modificano i parametri in `scripts/make-music.mjs`
e si rigenera. Con il voiceover attivo il volume scende da 0.34 a 0.20.

## 5. Personalizzazioni frequenti

- **Marchio reale**: vedi §4c — basta il file in `public/` e una riga in `Root.tsx`.
- **Voiceover**: `public/vo-it.mp3`, poi in `Root.tsx` `defaultProps: {voiceover: 'vo-it.mp3'}`.
  Lo speakeraggio è già scritto e cronometrato in `docs/`.
- **Musica**: la traccia inclusa è generata dal progetto (vedi §4c). Se si passa a una
  traccia di libreria, serve licenza commerciale documentata e archiviata: serve se il
  video finisce in materiale grant/ESA.
- **Riprese reali**: `<OffthreadVideo src={staticFile('campo.mp4')} />` dentro una scena.
  Le immagini di campo vanno usate solo se Atlas ne detiene i diritti e i luoghi non
  identificano un cliente non consenziente.

## 6. Regola non negoziabile

Il render **non è** approvazione. Ogni versione destinata all'esterno passa dal gate
compliance prima della pubblicazione. Le differenze tra il deck di partenza e i testi di
questo progetto sono elencate e motivate in `docs/COMPLIANCE_DELTA.md`: non reintrodurre
i claim rimossi senza una decisione esplicita e tracciata.

## 7. Stato di questa versione

- Contenuti IT ed EN scritti, `check:claims` verde, `typecheck` verde.
- Testate di scena e figure schematiche su tutte le scene, in 16:9 e 9:16.
- Stacchi marchio in apertura e chiusura, con il segnaposto: il marchio registrato
  non è ancora nel progetto (§4c).
- Musica generata dal progetto, attiva per default in tutte le composizioni.
- Render verificato: still su tutte le scene e master 60" IT 16:9.
- `meta.approvedBy` è `null` in entrambi i file: nessun output è pubblicabile.
- Voiceover e musica non inclusi (`voiceover`/`music` a `null`): i testi VO
  cronometrati stanno in `docs/ATL_MKT_CarbonSense_Script60_v1.md` e, scena per
  scena, nel campo `vo` dei file di contenuti.
- Punti aperti (TRL, ruoli, dominio, marchio, licenze): fondo di
  `docs/COMPLIANCE_DELTA.md`.
