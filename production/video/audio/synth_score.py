"""
Colonna sonora originale per il master 90s — sintesi deterministica via numpy,
NON generata da un modello ML (rispetta §6.3: "Nessuna traccia generata da
modelli il cui training non e' documentato"). Nessun materiale di terzi:
composizione originale per questo progetto, zero problemi di licenza.

Struttura da §6.3: silenzio (SC01) -> pulse (SC02) -> build ritmico (SC03-04)
-> apertura armonica (SC05) -> sostegno (SC06-08) -> colpo finale (SC09).
BPM costante 88 (nel range 84-92 richiesto). Nessun cambio di tonalita',
nessun crescendo emotivo, nessun pianoforte.
"""
import numpy as np
import wave

SR = 48000
BPM = 88
BEAT = 60.0 / BPM

# durate scena in secondi, da §5
SCENES = {
    "SC01": 7, "SC02": 7, "SC03": 10, "SC04": 8,
    "SC05": 16, "SC06": 12, "SC07": 14, "SC08": 8, "SC09": 8,
}
TOTAL = sum(SCENES.values())
N = int(TOTAL * SR)

t = np.arange(N) / SR
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
    noise = np.random.default_rng(int(x[0] * 1e6) if n else 0).standard_normal(n)
    return noise * env_decay(n, 0.02)


def pad_chord(n, freqs):
    x = np.arange(n) / SR
    sig = np.zeros(n)
    for f in freqs:
        sig += np.sin(2 * np.pi * f * x)
    return sig / len(freqs)


# --- struttura temporale ---
scene_start = {}
acc = 0.0
for name, dur in SCENES.items():
    scene_start[name] = acc
    acc += dur

# SC01: silenzio quasi totale — nulla (0..7s)

# SC02: entra il pulse (kick sordo), ogni beat, da qui fino alla fine
pulse_start = scene_start["SC02"]
n_beats = int((TOTAL - pulse_start) / BEAT)
for i in range(n_beats):
    add_at(kick, pulse_start + i * BEAT, 0.3, gain=0.55)

# SC03-SC04: build ritmico — click aggiuntivi su ogni mezzo beat
build_start = scene_start["SC03"]
build_end = scene_start["SC05"]
n_half = int((build_end - build_start) / (BEAT / 2))
for i in range(n_half):
    add_at(click, build_start + i * (BEAT / 2), 0.05, gain=0.18)

# SC05 in poi: apertura armonica, pad sostenuto (accordo la minore, nessun cambio di tonalita')
harm_start = scene_start["SC05"]
CHORD = [110.0, 130.81, 164.81]  # A2, C3, E3 — la minore
add_at(lambda n: pad_chord(n, CHORD), harm_start, TOTAL - harm_start, gain=0.10)

# colpo finale — stesso timbro del kick, decadimento un poco piu' lungo, a fine video
final_hit_time = TOTAL - 0.6
add_at(lambda n: kick(n) * 1.0, final_hit_time, 0.5, gain=0.75)

# normalizzazione preliminare (il livello preciso -16 LUFS si ottiene con ffmpeg loudnorm)
peak = np.max(np.abs(out)) or 1.0
out = out / peak * 0.9

stereo = np.stack([out, out], axis=1)
pcm = (stereo * 32767).astype(np.int16)

with wave.open("score_raw.wav", "wb") as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(SR)
    f.writeframes(pcm.tobytes())

print(f"OK durata={TOTAL}s frames={N}")
