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
  components/ui.tsx     sfondo, titoli, reveal, brandmark, progress rail, sottotitoli
  scenes/               7 scene, una per blocco narrativo
scripts/
  check-claims.mjs      guardrail anti-overclaim + vincoli di durata
  render-all.mjs        render batch con naming ATL_MKT_* e gate approvazione
docs/                   script/storyboard, delta di compliance, pipeline agente, sorgenti
```

## 5. Personalizzazioni frequenti

- **Marchio reale**: mettere `logo-atlas.svg` in `public/` e sostituire `<Brandmark/>` con
  `<Img src={staticFile('logo-atlas.svg')} />`. Il `Brandmark` attuale è un segnaposto
  astratto, non il marchio registrato versione Capra.
- **Voiceover**: `public/vo-it.mp3`, poi in `Root.tsx` `defaultProps: {voiceover: 'vo-it.mp3'}`.
  Lo speakeraggio è già scritto e cronometrato in `docs/`.
- **Musica**: solo tracce con licenza commerciale documentata (Artlist/Epidemic Sound o
  equivalente). Conservare la licenza: serve se il video finisce in materiale grant/ESA.
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
- Render verificato: still su tutte le scene e master 60" IT 16:9.
- `meta.approvedBy` è `null` in entrambi i file: nessun output è pubblicabile.
- Voiceover e musica non inclusi (`voiceover`/`music` a `null`): i testi VO
  cronometrati stanno in `docs/ATL_MKT_CarbonSense_Script60_v1.md` e, scena per
  scena, nel campo `vo` dei file di contenuti.
- Punti aperti (TRL, ruoli, dominio, marchio, licenze): fondo di
  `docs/COMPLIANCE_DELTA.md`.
