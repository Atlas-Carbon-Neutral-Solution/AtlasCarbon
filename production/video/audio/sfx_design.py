"""
Livello di sound design, sintetizzato da zero (nessun campione di terzi).

Ogni evento e' agganciato a un fatto che accade nell'immagine: lo scatto della
copertina in SC01, lo stacco dell'aerea in SC02, il vapore in SC04, i sette
colpi dei blocchi in SC05, il taglio A/B in SC06, il click della fascetta
dendrometrica in SC07. I tempi sono ricavati dai frame reali delle scene 3D, non
messi a orecchio.

Uscita: audio/sfx_layer.wav, poi mixato con audio/score_final.mp3.
"""
import numpy as np
import wave
import os

SR = 48000
FPS = 25.0
DUR = 90.0
N = int(SR * DUR)
rng = np.random.default_rng(20260804)

bus = np.zeros(N, dtype=np.float64)


def at(sec):
    return int(sec * SR)


def add(sig, sec, gain=1.0):
    i = at(sec)
    j = min(N, i + len(sig))
    if i >= N:
        return
    bus[i:j] += sig[: j - i] * gain


def env(n, attack, decay, curve=2.5):
    """Inviluppo percussivo: attacco breve, coda esponenziale."""
    a = max(1, int(attack * SR))
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a) ** 0.6
    tail = np.linspace(0, 1, max(1, n - a))
    e[a:] = (1 - tail) ** curve
    return e


def thud(f0=62.0, f1=34.0, dur=0.85, noise=0.10):
    """Colpo grave con sweep discendente: peso fisico, non un 'boom' generico."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 9.0)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * env(n, 0.002, dur, 3.0)
    if noise:
        s += lowpass(rng.normal(0, 1, n), 220.0) * env(n, 0.001, dur * 0.4, 5.0) * noise
    return s


def lowpass(x, fc, order=2):
    a = np.exp(-2 * np.pi * fc / SR)
    y = x.copy()
    for _ in range(order):
        out = np.empty_like(y)
        acc = 0.0
        for i in range(0, len(y), 4096):          # a blocchi, per non iterare in Python su 4.3M campioni
            blk = y[i:i + 4096]
            filt = np.empty_like(blk)
            v = acc
            for k in range(len(blk)):
                v = (1 - a) * blk[k] + a * v
                filt[k] = v
            acc = v
            out[i:i + 4096] = filt
        y = out
    return y


def highpass(x, fc):
    return x - lowpass(x, fc)


def bandnoise(dur, lo, hi, seed_shift=0):
    n = int(dur * SR)
    x = rng.normal(0, 1, n)
    return highpass(lowpass(x, hi), lo)


def hiss(dur, level=1.0, lo=900.0, hi=7000.0, wobble=0.7):
    """Sfiato di vapore / aria: rumore filtrato con respiro lento."""
    n = int(dur * SR)
    s = bandnoise(dur, lo, hi)
    t = np.arange(n) / SR
    mod = 1.0 + wobble * 0.35 * np.sin(2 * np.pi * 0.7 * t) + wobble * 0.2 * np.sin(2 * np.pi * 1.9 * t + 1.1)
    fade = np.minimum(1.0, np.minimum(t / 0.25, (dur - t) / 0.5))
    return s * mod * np.clip(fade, 0, 1) * level


def hum(dur, f0=100.0, level=1.0, partials=(1.0, 1.5, 2.0, 3.0), detune=0.4):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for k, p in enumerate(partials):
        s += np.sin(2 * np.pi * (f0 * p + detune * (k - 1)) * t) / (k + 1.6)
    fade = np.clip(np.minimum(t / 0.6, (dur - t) / 0.8), 0, 1)
    return s * fade * level


def click(dur=0.05, lo=1800.0, hi=9000.0):
    n = int(dur * SR)
    return bandnoise(dur, lo, hi) * env(n, 0.0005, dur, 6.0)


def metal_clank(dur=0.55, f=430.0):
    """Colpo metallico: parziali inarmoniche con decadimenti diversi."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for mult, dec, amp in ((1.0, 7.0, 1.0), (2.37, 11.0, 0.55), (3.71, 15.0, 0.32), (5.42, 20.0, 0.18)):
        s += np.sin(2 * np.pi * f * mult * t) * np.exp(-t * dec) * amp
    s += bandnoise(dur, 2500.0, 11000.0) * env(n, 0.0006, dur * 0.25, 7.0) * 0.30
    return s / 2.0


def whoosh(dur=0.9, peak=0.45):
    """Passaggio d'aria: banda che si apre e si chiude — per gli stacchi."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = bandnoise(dur, 220.0, 5200.0)
    e = np.exp(-((t - peak) ** 2) / (2 * (dur * 0.22) ** 2))
    return x * e


def riser(dur=3.2, f_from=110.0, f_to=440.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f_from * (f_to / f_from) ** (t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) * 0.45
    air = highpass(rng.normal(0, 1, n), 1200.0) * 0.5
    e = (t / dur) ** 2.0
    return (tone + air) * e


def blip(f=1180.0, dur=0.10):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2 * t)) * env(n, 0.004, dur, 4.0)


# ----------------------------------------------------------------------------
# SC01 00:00-00:07 — la copertina si chiude di scatto (frame ~150/175)
add(hum(6.8, 84.0, 0.05, partials=(1.0, 2.0)), 0.10)
add(bandnoise(0.30, 1400.0, 6500.0) * env(int(0.30 * SR), 0.004, 0.30, 4.0), 5.85, 0.22)  # carta
add(thud(78.0, 40.0, 0.75), 5.98, 0.52)

# SC02 00:07-00:14 — aerea; stacco netto al frame 100/175 => 07 + 4.00 = 11.00
add(hiss(7.0, 0.16, 300.0, 2600.0, wobble=0.5), 7.00)          # vento d'alta quota
add(hum(7.0, 52.0, 0.10, partials=(1.0, 2.0, 3.0)), 7.00)      # rombo dell'impianto
add(whoosh(1.0, 0.42), 10.62, 0.30)
add(thud(58.0, 30.0, 1.10), 11.00, 0.34)

# SC03 00:14-00:24 — ufficio notturno; stacco al frame 130/250 => 14 + 5.20 = 19.20
add(hum(10.0, 118.0, 0.07, partials=(1.0, 2.0, 4.0)), 14.00)   # ventole
for k, sec in enumerate((15.10, 15.42, 15.71, 16.35, 16.62, 17.48, 18.05, 18.30, 21.10, 21.44, 22.30)):
    add(click(0.035, 2200.0, 7800.0), sec, 0.085 + 0.02 * (k % 3))
add(whoosh(0.6, 0.28), 19.02, 0.16)

# SC04 00:24-00:32 — contatore, poi valvola che perde; stacco al frame 92/200 => 27.68
add(hum(8.0, 96.0, 0.11, partials=(1.0, 1.5, 3.0)), 24.00)
for sec in (24.55, 25.30, 26.05, 26.80):
    add(click(0.045, 900.0, 4200.0), sec, 0.10)                # scatto del contatore
add(whoosh(0.7, 0.3), 27.50, 0.20)
add(hiss(4.3, 0.30, 1500.0, 9000.0, wobble=1.0), 27.70)        # vapore
add(metal_clank(0.6, 380.0), 27.72, 0.26)

# SC05 00:32-00:48 — tre movimenti: 32.0 / 37.0 / 43.0
add(hum(5.0, 132.0, 0.06, partials=(1.0, 2.0)), 32.00)
add(blip(1240.0), 33.20, 0.16)
add(blip(1240.0), 35.05, 0.13)
add(hiss(6.2, 0.10, 200.0, 1400.0, wobble=0.3), 37.00)         # vuoto: solo sub e aria
add(hum(6.2, 44.0, 0.13, partials=(1.0, 2.0, 3.0)), 37.00)
# sette blocchi: STAMP_AT = int(125*(0.06+0.105*i)) + STAMP_DUR(11) frame, clip da 43.0s
for i in range(7):
    fr = int(125 * (0.06 + 0.105 * i)) + 11
    add(thud(96.0 - i * 4.0, 44.0, 0.55), 43.0 + fr / FPS, 0.40)
    add(metal_clank(0.34, 620.0 - i * 22.0), 43.0 + fr / FPS, 0.16)
add(riser(1.6, 180.0, 520.0), 45.70, 0.10)
add(thud(70.0, 36.0, 1.30), 47.00, 0.34)                       # la catena si chiude

# SC06 00:48-01:00 — A/B secco al frame 130/300 => 53.20 ; C al frame 215 => 56.60
add(hum(5.1, 108.0, 0.13, partials=(1.0, 1.5, 2.0, 4.0)), 48.00)
add(hiss(5.1, 0.09, 1200.0, 6000.0, wobble=0.4), 48.00)
add(thud(52.0, 28.0, 1.20), 53.20, 0.30)                       # lo stacco in termica
add(hum(3.3, 62.0, 0.09, partials=(1.0, 2.0)), 53.30)          # la termica non "suona": resta il sub
add(blip(760.0, 0.16), 56.60, 0.13)
add(hum(3.2, 88.0, 0.07, partials=(1.0, 2.0)), 56.80)

# SC07 01:00-01:14 — macro al frame 151/350 => 66.04 ; gru al frame 251 => 70.04
add(hiss(14.0, 0.17, 600.0, 5200.0, wobble=1.0), 60.00)        # vento nelle foglie
add(hum(14.0, 58.0, 0.05, partials=(1.0, 2.0)), 60.00)
add(click(0.05, 1500.0, 8000.0), 66.10, 0.22)                  # scatto della fascetta
add(metal_clank(0.30, 980.0), 66.12, 0.10)
add(riser(3.0, 130.0, 380.0), 70.10, 0.09)

# SC08 01:14-01:22 — la prova
add(hum(8.0, 74.0, 0.10, partials=(1.0, 2.0, 3.0)), 74.00)
add(blip(940.0, 0.13), 74.10, 0.13)
add(blip(940.0, 0.13), 75.70, 0.11)
add(riser(3.6, 120.0, 300.0), 77.80, 0.08)

# SC09 01:22-01:30 — endcard
add(thud(66.0, 34.0, 1.60), 82.00, 0.40)
add(hum(7.6, 70.0, 0.08, partials=(1.0, 2.0, 3.0)), 82.10)
add(blip(1320.0, 0.09), 83.55, 0.09)                            # comparsa della CTA

# ----------------------------------------------------------------------------
peak = np.max(np.abs(bus))
bus = bus / peak * 0.72
fade = int(0.4 * SR)
bus[:fade] *= np.linspace(0, 1, fade)
bus[-fade:] *= np.linspace(1, 0, fade)

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sfx_layer.wav")
stereo = np.stack([bus, bus], axis=1)
pcm = (np.clip(stereo, -1, 1) * 32767).astype("<i2")
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"SFX_WRITTEN {out} {DUR}s peak={peak:.3f}")
