"""
Colonna sonora originale, sintetizzata da zero (nessun campione di terzi).

Sostituisce la versione precedente, che era essenzialmente un drone con un
impulso ritmico: povera di armonia e con tratti in cui restava quasi solo il
sub, dando la sensazione che la musica si interrompesse.

Qui la struttura è musicale e CONTINUA: un tappeto armonico che non si ferma
mai dal primo all'ultimo secondo, sopra il quale entrano e escono arpeggi,
basso, una melodia semplice e una percussione morbida. La progressione segue la
drammaturgia dello script §4:

  bar  0-4   (00:00-12.8)  La minore sospeso — il problema, sparso e freddo
  bar  4-10  (12.8-32.0)   Re minore / Mi — la pressione, entra l'arpeggio
  bar 10-15  (32.0-48.0)   Do / Sol maggiore — Atlas entra: la musica si apre
  bar 15-23  (48.0-73.6)   costruzione, entra la percussione
  bar 23-28  (73.6-89.6)   risoluzione su Do, accordo tenuto sull'endcard

Nessuna dissonanza aggressiva, dinamica contenuta: deve stare sotto una voce
fuori campo senza combattere con le didascalie.

Uscita: audio/score_v3.wav (poi mixato con sfx_layer in render_master.sh).
"""
import numpy as np
import wave
import os

SR = 44100
BPM = 75.0
BEAT = 60.0 / BPM          # 0.8 s
BAR = BEAT * 4             # 3.2 s
N_BARS = 28   # 28 x 3.2s = 89.6s; il pad dell'ultima battuta e l'accordo
              # tenuto finale coprono oltre i 90s, quindi nessun buco in coda
DUR = 90.0
N = int(SR * DUR)

rng = np.random.default_rng(20260805)
bus = np.zeros(N, dtype=np.float64)


def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N:
        return
    j = min(N, i + len(sig))
    bus[i:j] += sig[: j - i] * gain


# ---------------------------------------------------------------- note e accordi
def note(name):
    """Nome nota (es. 'A3') -> frequenza in Hz, temperamento equabile su A4=440."""
    table = {"C": -9, "C#": -8, "D": -7, "D#": -6, "E": -5, "F": -4,
             "F#": -3, "G": -2, "G#": -1, "A": 0, "A#": 1, "B": 2}
    pitch = name[:-1]
    octave = int(name[-1])
    semis = table[pitch] + (octave - 4) * 12
    return 440.0 * (2 ** (semis / 12.0))


CHORDS = {
    "Am": ["A3", "C4", "E4"],
    "Am7": ["A3", "C4", "E4", "G4"],
    "F": ["F3", "A3", "C4"],
    "Fmaj7": ["F3", "A3", "C4", "E4"],
    "Dm": ["D3", "F3", "A3"],
    "Dm7": ["D3", "F3", "A3", "C4"],
    "E": ["E3", "G#3", "B3"],
    "Esus": ["E3", "A3", "B3"],
    "C": ["C3", "E3", "G3"],
    "Cadd9": ["C3", "E3", "G3", "D4"],
    "G": ["G3", "B3", "D4"],
    "Gsus": ["G3", "C4", "D4"],
}

# una sigla per battuta (28 battute = 89.6s, piu' l'accordo tenuto finale)
PROGRESSION = [
    "Am", "Am", "Fmaj7", "Fmaj7",                       # 0-12.8  problema
    "Dm7", "Dm7", "Am7", "Am7", "Esus", "E",            # 12.8-32 pressione
    "C", "Gsus", "Am7", "Fmaj7", "Cadd9",               # 32-48   Atlas entra
    "Am7", "Fmaj7", "Cadd9", "G", "Am7", "Fmaj7", "Dm7", "Esus",   # 48-73.6 costruzione
    "Cadd9", "G", "Am7", "Fmaj7", "Cadd9",              # 73.6-89.6 risoluzione
]
assert len(PROGRESSION) == N_BARS, len(PROGRESSION)


# ---------------------------------------------------------------- voci
def env_adsr(n, a, d, s_level, r):
    """Inviluppo ADSR in secondi; il sustain occupa quel che resta."""
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    ns = max(0, n - na - nd - nr)
    e = np.concatenate([
        np.linspace(0, 1, max(1, na)) ** 1.4,
        np.linspace(1, s_level, max(1, nd)),
        np.full(ns, s_level),
        np.linspace(s_level, 0, max(1, nr)) ** 1.2,
    ])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))


def pad_voice(freqs, dur, detune=0.004, vib=0.15):
    """Tappeto armonico caldo: parziali dispari con lieve detune e vibrato molto
    lento. È la voce che non si interrompe mai."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for f in freqs:
        for k, amp in ((1, 1.0), (2, 0.30), (3, 0.16), (4, 0.07), (5, 0.045)):
            for sign in (-1, 1):
                fk = f * k * (1 + sign * detune * k)
                lfo = 1 + vib * 0.004 * np.sin(2 * np.pi * 0.13 * t + f % 3)
                out += np.sin(2 * np.pi * fk * t * lfo) * amp / (k * 2.2)
    out /= max(1e-9, len(freqs) * 1.6)
    return out * env_adsr(n, 0.9, 0.5, 0.85, 1.1)


def pluck(freq, dur, bright=1.0):
    """Corda pizzicata / marimba: parziali con decadimenti diversi, attacco corto."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k, amp, dec in ((1, 1.0, 3.2), (2, 0.42 * bright, 5.0), (3, 0.20 * bright, 7.5),
                        (4, 0.10 * bright, 10.0), (6, 0.05 * bright, 14.0)):
        out += np.sin(2 * np.pi * freq * k * t) * np.exp(-t * dec) * amp
    out *= env_adsr(n, 0.004, 0.02, 0.9, min(0.25, dur * 0.4))
    return out / 1.9


def sub_voice(freq, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * freq * t) + 0.22 * np.sin(2 * np.pi * freq * 2 * t)
    return s * env_adsr(n, 0.12, 0.2, 0.9, 0.4) / 1.2


def soft_kick(dur=0.42):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 46 + 30 * np.exp(-t * 22)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7.0)


def shaker(dur=0.10):
    n = int(dur * SR)
    x = rng.normal(0, 1, n)
    # passa-alto molto rozzo: differenza prima, ripetuta
    for _ in range(3):
        x = np.diff(x, prepend=x[0])
    x /= max(1e-9, np.max(np.abs(x)))
    t = np.arange(n) / SR
    return x * np.exp(-t * 42.0)


# ---------------------------------------------------------------- arrangiamento
for b, name in enumerate(PROGRESSION):
    t0 = b * BAR
    freqs = [note(x) for x in CHORDS[name]]
    root = min(freqs)

    # 1) TAPPETO — sempre presente, con sovrapposizione fra battute così non
    #    esiste un solo istante di silenzio armonico
    section_gain = 0.30 if b < 4 else 0.36 if b < 10 else 0.44 if b < 15 else 0.50 if b < 23 else 0.46
    add(pad_voice(freqs, BAR + 0.9), t0, section_gain)

    # 2) BASSO — dalla seconda battuta, una nota per battuta
    if b >= 1:
        add(sub_voice(root / 2, BAR * 0.92), t0, 0.30 if b < 15 else 0.34)

    # 3) ARPEGGIO — entra con la sezione "pressione" (bar 4) e resta
    if b >= 4:
        pattern = [0, 1, 2, 1] if len(freqs) == 3 else [0, 1, 2, 3]
        for i in range(8):                       # ottavi
            idx = pattern[i % len(pattern)]
            f = freqs[idx] * (2 if i % 8 >= 4 else 1)
            g = (0.11 if b < 10 else 0.15 if b < 23 else 0.13) * (1.0 if i % 2 == 0 else 0.7)
            add(pluck(f, BEAT * 0.9, bright=0.9), t0 + i * BEAT / 2, g)

    # 4) MELODIA — dalla sezione "Atlas entra" (bar 10): tre note tenute per battuta
    if 10 <= b < 28:
        # tre gradi distinti dell'accordo, un'ottava sopra: la versione
        # precedente calcolava top*3/4*4/3, che fa esattamente top — la seconda
        # nota del motivo ripeteva la prima
        motif = [freqs[-1] * 2, freqs[1] * 2, freqs[0] * 3]
        for i, f in enumerate(motif):
            add(pluck(f, BEAT * 1.5, bright=0.55), t0 + i * BEAT * 1.25, 0.115)

    # 5) PERCUSSIONE — morbida, dalla costruzione (bar 15) alla risoluzione
    if b >= 15:
        for beat in range(4):
            if beat % 2 == 0:
                add(soft_kick(), t0 + beat * BEAT, 0.16)
            add(shaker(), t0 + beat * BEAT + BEAT / 2, 0.045)

# accordo finale tenuto: l'endcard non deve chiudersi nel vuoto
add(pad_voice([note(x) for x in CHORDS["Cadd9"]], 7.0), 83.4, 0.42)
add(sub_voice(note("C3") / 2, 6.6), 83.4, 0.30)
add(pluck(note("C5"), 2.6, bright=0.5), 83.6, 0.13)
add(pluck(note("G5"), 2.4, bright=0.5), 84.6, 0.10)

# ---------------------------------------------------------------- finitura
peak = float(np.max(np.abs(bus)))
bus = bus / peak * 0.80
fi, fo = int(1.2 * SR), int(2.2 * SR)
bus[:fi] *= np.linspace(0, 1, fi) ** 0.8
bus[-fo:] *= np.linspace(1, 0, fo) ** 1.4

# leggera apertura stereo: la stessa sorgente ritardata di pochi campioni
delay = int(0.011 * SR)
left = bus.copy()
right = np.concatenate([np.zeros(delay), bus[:-delay]]) * 0.97 + bus * 0.03
stereo = np.stack([left, right], axis=1)
stereo /= max(1e-9, np.max(np.abs(stereo))) / 0.82

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "score_v3.wav")
pcm = (np.clip(stereo, -1, 1) * 32767).astype("<i2")
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"SCORE_WRITTEN {out} {DUR}s bar={BAR:.2f}s bars={N_BARS} peak_pre={peak:.2f}")
