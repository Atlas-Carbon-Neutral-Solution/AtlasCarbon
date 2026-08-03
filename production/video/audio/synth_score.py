"""
Colonna sonora originale per il master 90s — sintesi deterministica via numpy,
NON generata da un modello ML. Nessun materiale di terzi: composizione originale
per questo progetto, zero problemi di licenza.

v2: presenza musicale per l'intera durata (feedback: "manca una musica di
sottofondo" — nella v1 la componente armonica entrava solo da SC05 e il resto
era quasi solo percussione sparsa). Ora: drone di basso sommesso già da SC01,
pad armonico con leggero movimento (LFO su ampiezza+filtro simulato) esteso
fino alla fine, percussione continua anche in SC06-09. BPM costante 88.
"""
import numpy as np
import wave

SR = 48000
BPM = 88
BEAT = 60.0 / BPM

SCENES = {
    "SC01": 7, "SC02": 7, "SC03": 10, "SC04": 8,
    "SC05": 16, "SC06": 12, "SC07": 14, "SC08": 8, "SC09": 8,
}
TOTAL = sum(SCENES.values())
N = int(TOTAL * SR)

out = np.zeros(N)


def env_decay(n_samples, tau):
    x = np.arange(n_samples) / SR
    return np.exp(-x / tau)


def add_at(signal_fn, start_sec, dur_sec, gain=1.0):
    global out
    start = int(start_sec * SR)
    dur_n = int(dur_sec * SR)
    end = min(N, start + dur_n)
    if start >= N:
        return
    seg = signal_fn(end - start)
    out[start:end] += seg * gain


def kick(n):
    x = np.arange(n) / SR
    freq = 62 * np.exp(-x / 0.06) + 40
    sig = np.sin(2 * np.pi * np.cumsum(freq) / SR)
    return sig * env_decay(n, 0.16)


def click(n):
    x = np.arange(n) / SR
    seed = int(x[0] * 1e6) if n else 0
    noise = np.random.default_rng(seed).standard_normal(n)
    return noise * env_decay(n, 0.02)


def bass_drone(n, freq, start_offset_sec):
    x = np.arange(n) / SR + start_offset_sec
    lfo = 1 + 0.12 * np.sin(2 * np.pi * 0.08 * x)
    return np.sin(2 * np.pi * freq * x) * lfo


def pad_chord(n, freqs, start_offset_sec, richness=1.0):
    x = np.arange(n) / SR + start_offset_sec
    sig = np.zeros(n)
    for i, f in enumerate(freqs):
        detune = 1 + (i - 1) * 0.0015
        sig += np.sin(2 * np.pi * f * detune * x)
    tremolo = 1 + 0.10 * np.sin(2 * np.pi * 0.12 * x)
    return (sig / len(freqs)) * tremolo * richness


scene_start = {}
acc = 0.0
for name, dur in SCENES.items():
    scene_start[name] = acc
    acc += dur

# drone di basso sommesso da SC01 in poi — presenza musicale fin dall'inizio,
# non piu' silenzio totale
add_at(lambda n: bass_drone(n, 55.0, 0.0), 0.0, TOTAL, gain=0.045)

# pulse (kick), da SC02 fino alla fine, continuo (non si ferma piu' a SC05)
pulse_start = scene_start["SC02"]
n_beats = int((TOTAL - pulse_start) / BEAT)
for i in range(n_beats):
    add_at(kick, pulse_start + i * BEAT, 0.3, gain=0.5)

# build ritmico SC03-SC04: click aggiuntivi su ogni mezzo beat
build_start = scene_start["SC03"]
build_end = scene_start["SC05"]
n_half = int((build_end - build_start) / (BEAT / 2))
for i in range(n_half):
    add_at(click, build_start + i * (BEAT / 2), 0.05, gain=0.16)

# apertura armonica da SC05, pad con movimento (LFO), presente fino alla fine
harm_start = scene_start["SC05"]
CHORD = [110.0, 130.81, 164.81]  # A2, C3, E3 — la minore, nessun cambio di tonalita'
add_at(lambda n: pad_chord(n, CHORD, harm_start, richness=1.0), harm_start, TOTAL - harm_start, gain=0.16)

# seconda voce armonica un'ottava sopra, molto piu' timida, solo da SC06 (spessore
# senza affollare il mix, nessun crescendo emotivo: livello costante)
CHORD_HI = [220.0, 261.63, 329.63]
sc06_start = scene_start["SC06"]
add_at(lambda n: pad_chord(n, CHORD_HI, sc06_start, richness=1.0), sc06_start, TOTAL - sc06_start, gain=0.05)

# click continuano anche in SC06-SC09 (sostegno ritmico, non solo pad statico)
sostegno_start = scene_start["SC06"]
n_half_sost = int((TOTAL - sostegno_start) / (BEAT / 2))
for i in range(n_half_sost):
    add_at(click, sostegno_start + i * (BEAT / 2), 0.05, gain=0.08)

# colpo finale
final_hit_time = TOTAL - 0.6
add_at(lambda n: kick(n) * 1.0, final_hit_time, 0.5, gain=0.8)

peak = np.max(np.abs(out)) or 1.0
out = out / peak * 0.9

stereo = np.stack([out, out], axis=1)
pcm = (stereo * 32767).astype(np.int16)

with wave.open("score_raw_v2.wav", "wb") as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(SR)
    f.writeframes(pcm.tobytes())

print(f"OK durata={TOTAL}s frames={N}")
