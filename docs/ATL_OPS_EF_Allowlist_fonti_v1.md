# ATL_OPS_EF_Allowlist_fonti_v1

**Domini di fonte primaria da autorizzare per l'agent EF-Curator**

| Campo | Valore |
|---|---|
| Motivo | Chiusura di `GAP-018`: la verifica di fonte non è eseguibile perché il fetch diretto è bloccato dalla policy di egress |
| Environment interessato | `Default — trusted network access` (`env_01WoYS4QT7rntDgq16QuhD2u`, `anthropic_cloud`) |
| Ambito | Sola **lettura** di documenti pubblici. Nessun invio di dati verso questi domini |
| Data | 21 agosto 2026 |

---

## 0. Cosa è bloccato e cosa no

La ricerca (WebSearch) funziona: passa dall'API Anthropic e non attraversa la policy di egress. È bloccato il **fetch diretto** dei documenti, che è l'unica operazione che permette l'estrazione verbatim richiesta dal §1.

Verificato il 21/08/2026 — tutti `EGRESS_BLOCKED`: `arera.it`, `gazzettaufficiale.it`, `gse.it`, `mimit.gov.it`, `mase.gov.it`, `eur-lex.europa.eu`, `certifico.com`, `it.wikipedia.org`.

Conseguenza operativa: nessun record può superare il **gate 2** (provenienza completa, `source_url` risolvibile, hash del file corrispondente), quindi nessun record è promuovibile oltre `status = draft` e nessun pacchetto di validazione è componibile per il CSO.

---

## 1. Tier 1 — bloccante, LIB-01 e LIB-02

Senza questi cinque domini il regime normativo TEE non è verificabile. Sono la priorità assoluta: LIB-01 è la libreria del progetto Smart Move.

| Dominio | Ente | Cosa serve |
|---|---|---|
| `arera.it` | ARERA (già AEEG) | Delibera EEN 3/08 e allegati; linee guida e successivi aggiornamenti dei coefficienti (VF-001, CONF-001) |
| `gazzettaufficiale.it` | Istituto Poligrafico dello Stato | Testi in Gazzetta: D.M. MASE 21 luglio 2025 (VF-004), D.M. 20 luglio 2004 (VF-003) |
| `gse.it` | GSE | Guida Operativa certificati bianchi vigente e allegati: chiarimenti, guide settoriali, tabella degli interventi, tabelle dei coefficienti (VF-002, VF-005) |
| `mase.gov.it` | MASE | Decreti e provvedimenti su efficienza energetica, TEE, CAR |
| `mimit.gov.it` | MIMIT (già MISE) | Guide operative e decreti attuativi storici |
| `eur-lex.europa.eu` | Unione Europea | Direttiva 2012/27/UE (allegato IV, contenuto energetico — CONF-002); direttiva 2024/825; direttiva 96/9/CE per la nota IP §15 |

**Sottodomini e host di servizio.** ARERA e GSE serviscono i PDF da percorsi e talvolta da host distinti da quello della pagina indice. Se la policy accetta wildcard, autorizzare `*.arera.it`, `*.gse.it`, `*.gazzettaufficiale.it`, `*.mase.gov.it`, `*.mimit.gov.it`, `*.europa.eu`: senza questo il fetch della pagina riesce e quello dell'allegato no, che è esattamente il caso peggiore — sembra funzionare e non produce provenienza.

---

## 2. Tier 2 — LIB-05 e LIB-06

| Dominio | Ente | Cosa serve |
|---|---|---|
| `isprambiente.gov.it` | ISPRA | Inventario nazionale dei gas serra e fattori di emissione per l'Italia — fonte gerarchicamente prevalente per LIB-05 (§4) |
| `efficienzaenergetica.enea.it` | ENEA | Riferimenti per diagnosi energetiche UNI CEI 11339 e parametri di riferimento LIB-02 |
| `eea.europa.eu` | European Environment Agency | Fattori europei e geografie non coperte dall'inventario nazionale |
| `ipcc-nggip.iges.or.jp` | IPCC — National Greenhouse Gas Inventories Programme | Linee guida IPCC e Emission Factor Database; set GWP (gate G1) |
| `ghgprotocol.org` | GHG Protocol | Standard e categorie Scope 3; aggiornamenti strutturali → escalation §6 |
| `efrag.org` | EFRAG | ESRS; aggiornamenti che modificano la struttura → escalation §6 |
| `joint-research-centre.ec.europa.eu` | JRC | Dataset di riferimento europei |
| `environment.ec.europa.eu` | Commissione europea — DG ENV | Product/Organisation Environmental Footprint |
| `environdec.com` | EPD International | EPD verificate per LIB-06 — licenza **gialla**, ingestione in `sources/quarantine/`, nessun rilascio senza conferma scritta di Tobia (§5) |
| `eco-platform.org` | ECO Platform | EPD europee — licenza **gialla**, stesso regime |

---

## 3. Tier 3 — LIB-03 e LIB-04

| Dominio | Ente | Cosa serve |
|---|---|---|
| `verra.org` | Verra | Metodologie VCS, buffer di non-permanenza, requisiti di monitoraggio |
| `registry.verra.org` | Verra | Registro dei progetti |
| `goldstandard.org` | Gold Standard | Metodologie e requisiti |
| `globalgoals.goldstandard.org` | Gold Standard | Registro |
| `crea.gov.it` | CREA | Interlocuzione forestale, parametri biometrici, registro agroforestale |

**Nota LIB-04.** Il dominio del registro pubblico dei crediti agroforestali va confermato al tavolo CREA prima di essere inserito: non lo scrivo qui per ipotesi. Vale la nota di coordinamento del §3 — le specifiche vanno allineate a quel tavolo *prima* di consolidare la tassonomia.

---

## 4. Domini che NON vanno autorizzati

Autorizzarli non serve e crea un rischio di contaminazione che non si sana a valle (§5).

- **Norme tecniche a pagamento** — `store.uni.com`, `iso.org`: contenuti dietro paywall, licenza **rossa**. Vanno acquistate come documenti, non scaricate; la citazione dei valori è vietata. L'esistenza si registra in `gaps/licensed_sources.md`.
- **Database LCA commerciali** e banche dati proprietarie di software LCA: licenza **rossa**, divieto assoluto. Se servono per coprire una lacuna materiale → scheda con costo e impatto, poi stop ed escalation a Tobia (§14).
- **Portali di settore, blog, siti di ESCo, enciclopedie collaborative**: vietati come fonte dal §1. Sono utili solo per *localizzare* un documento, e per quello WebSearch già basta. Autorizzarli al fetch aumenta solo la probabilità che un valore non tracciato entri in un record.

---

## 5. Come applicarla

La policy di rete è un attributo dell'**environment**, non della sessione: non è modificabile dall'interno di una sessione in corso, e l'agent non ha strumenti per cambiarla.

1. In `claude.ai/code`, aprire le impostazioni dell'environment `Default`.
2. Sostituire il preset di rete corrente con una policy che includa i domini del Tier 1 (Tier 2 e 3 quando si aprono le rispettive librerie).
3. Avviare una **nuova sessione**: la policy viene applicata all'avvio del container, quindi questa sessione non la vedrà.

Riferimento sulla configurazione degli environment: <https://code.claude.com/docs/en/claude-code-on-the-web>

---

## 6. Cosa diventa possibile dopo

In ordine, alla prima sessione utile:

1. **VF-001** — estrazione verbatim del fattore 0,187 × 10⁻³ tep/kWh dalla delibera EEN 3/08, con articolo, allegato, tabella, pagina e data di entrata in vigore. Chiude `CONF-001`.
2. **VF-004** — lettura del D.M. MASE 21 luglio 2025 in Gazzetta. **Da fare per prima se confermato**: ridefinisce la base normativa dell'intera LIB-01, quindi condiziona tutto il resto. Escalation §14, non aggiornamento di record.
3. **VF-002** — identificazione dell'atto che fissa il coefficiente gas naturale. Se non esiste un atto che lo fissa, la lacuna resta e va dichiarata: è un esito legittimo.
4. **VF-003** — D.M. 20 luglio 2004 e allegato IV della direttiva 2012/27/UE, per portare `CONF-002` a Garbin con entrambi i testi in mano invece che con due citazioni.
5. Deposito dei documenti in `sources/<org>/<documento>_<edizione>/` con `source_file_sha256`, e primo passaggio di record da `draft` a `in_review`.

La firma resta di Garbin. L'allowlist rende possibile la verifica di fonte, non la validazione.
