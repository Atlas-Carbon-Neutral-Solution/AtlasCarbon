// Sorgenti video delle scene: un unico punto in cui sostituire un girato 3D con
// una ripresa reale.
//
// Perché un file dedicato: la richiesta "sul bambù metti una ripresa reale" è a
// un passo dall'essere eseguibile, ma il passo non è tecnico — è di diritti e di
// rete. In questo ambiente l'egress verso gli archivi di stock è negato dalla
// policy dell'organizzazione (il gateway risponde 403 alla CONNECT su
// pixabay.com, api.pexels.com, videvo, mixkit, commons.wikimedia.org,
// archive.org), quindi nessun girato reale può essere scaricato da qui. E anche
// potendo, un filmato di stock va licenziato prima della pubblicazione: lo
// script §2.1 e §10 non ammettono materiale di terzi senza autorizzazione
// caricata come asset.
//
// Quando il girato arriva, la sostituzione è una riga:
//   1. copiare il file in  remotion/atlas-motion/public/video/
//   2. cambiare qui sotto il nome del file
//   3. ../../verify_clips.sh   (legge questo file: controlla che il clip copra
//      l'intera sequenza, altrimenti l'ultimo fotogramma si congela)
//
// Requisiti del girato per SC07: 16:9, almeno 350 fotogrammi a 25fps (14"),
// piantagione in FILE regolari — è una coltura, non un bosco spontaneo (§5) —
// e nessun volto identificabile senza liberatoria firmata (§2.1).
export const SC07_SRC = "video/sc07-bamboo.mp4";
