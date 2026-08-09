"""
SC05 movimento 3 — "Un registro che nessuno puo' riscrivere" (125 frame, esatti).

Metafora fisica, non grafica: blocchi di acciaio pieni che scendono uno dopo
l'altro su un piano scuro e si agganciano con una saldatura di luce azzurra. Il
blocco successivo non puo' essere inserito prima di quello precedente, e nessuno
puo' essere estratto: la catena e' la struttura, non un'animazione di rete.

Nessuna estetica sci-fi/hologram, nessun grafo luminoso (NEG prompt §5).
Nessun dato leggibile a schermo (§2.2).
"""
import bpy
import math
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import cine

OUT_DIR, N_FRAMES, RES_X, RES_Y, ONLY = cine.parse_argv(sys.argv[sys.argv.index("--") + 1:])

cine.reset_scene()
cine.setup_eevee(RES_X, RES_Y, samples=10, bloom=True,
                 world_rgb=(0.006, 0.007, 0.010), volumetrics=True, vol_end=18.0)
bpy.context.scene.eevee.bloom_intensity = 0.070
bpy.context.scene.eevee.bloom_radius = 6.0
bpy.context.scene.eevee.bokeh_max_size = 32
bpy.context.scene.eevee.bokeh_max_size = 32
_ee = bpy.context.scene.eevee
# Costo dominante su GL software: ombre e volumetriche. Con cube map a 1024 e
# ombre dure queste scene sono visivamente equivalenti e girano ~3 volte piu'
# veloci (la grana del master assorbe il rumore residuo dei campioni ridotti).
_ee.shadow_cube_size = "1024"
_ee.shadow_cascade_size = "1024"
_ee.use_soft_shadows = False


AZZURRO = (0.325, 0.643, 0.859)   # #53a4db — V01

deck = cine.pbr_material("Deck", (0.028, 0.030, 0.034), roughness=0.34, specular=0.62)
steel = cine.pbr_material("Steel", (0.155, 0.163, 0.174), roughness=0.44, metallic=0.28,
                          bump=0.020)
steel_top = cine.pbr_material("SteelTop", (0.205, 0.215, 0.228), roughness=0.32, metallic=0.35)
edge = cine.pbr_material("Edge", (0.098, 0.103, 0.110), roughness=0.52, metallic=0.30)
seam = cine.pbr_material("Seam", AZZURRO, roughness=0.30,
                         emission_rgb=AZZURRO, emission_strength=6.5)


def box(loc, scale, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.scale = scale
    o.rotation_euler = tuple(math.radians(a) for a in rot)
    cine.assign(o, mat)
    return o


# piano di appoggio lucido: raccoglie i riflessi delle saldature
box((0, 0, -0.05), (26.0, 9.0, 0.10), deck)

N = 7
BW, BD, BH = 0.86, 0.86, 0.62
GAP = 0.055
BLOCKS = []
SEAMS = []
for i in range(N):
    x = (i - (N - 1) / 2.0) * (BW + GAP)
    b = box((x, 0, BH / 2), (BW, BD, BH), steel)
    box((x, 0, BH - 0.012), (BW * 0.94, BD * 0.94, 0.026), steel_top)      # piastra superiore
    for s in (-1, 1):                                                       # spigoli smussati
        box((x + s * BW / 2, 0, BH / 2), (0.030, BD * 1.005, BH * 1.005), edge)
    BLOCKS.append(b)
    if i > 0:
        sm = box((x - (BW + GAP) / 2, 0, BH * 0.5), (GAP * 0.85, BD * 0.86, BH * 0.80), seam)
        sm.scale = (GAP * 0.85, BD * 0.86, 0.0001)
        SEAMS.append(sm)

# ogni blocco ha una sfumatura leggermente diversa: sono duplicati con la
# stessa mesh, e senza variazione risultano stampati in serie
cine.per_object_variation(steel, value=0.10, hue=0.012)
cine.per_object_variation(steel_top, value=0.08, hue=0.010)

# ---------------------------------------------------------------- luce
key = cine.add_area_light((-3.6, -4.4, 4.6), (48, 0, -34), energy=1500, size=3.0,
                          color=(0.96, 0.94, 0.92))
rim = cine.add_area_light((4.4, 3.6, 2.4), (112, 0, 36), energy=760, size=2.4,
                         color=(0.60, 0.72, 0.90))
cine.add_fog_volume((0, 0, 1.2), (26.0, 9.0, 4.0), density=0.011, color=(0.58, 0.62, 0.70))

# ---------------------------------------------------------------- camera
cam = cine.add_camera((-5.2, -5.6, 1.55), (0, 0, 0), lens=50.0, focus_distance=6.0, fstop=2.6)

DROP_H = 3.2
STAMP_AT = [int(N_FRAMES * (0.06 + 0.105 * i)) for i in range(N)]   # ultimo ~ frame 90
STAMP_DUR = 11


def per_frame(f):
    t = cine.seg(f, 1, N_FRAMES)

    for i, b in enumerate(BLOCKS):
        a0 = STAMP_AT[i]
        p = cine.seg(f, a0, a0 + STAMP_DUR)
        # caduta con rimbalzo secco: il blocco arriva e si ferma, non fluttua
        z = BH / 2 + DROP_H * (1.0 - p)
        if p >= 1.0:
            k = min(1.0, (f - (a0 + STAMP_DUR)) / 6.0)
            z = BH / 2 + 0.045 * math.sin(k * math.pi) * (1.0 - k)
        b.location.z = z
        b.hide_render = f < a0 - 1

    # la saldatura si accende solo quando i due blocchi sono entrambi a posto
    for i, sm in enumerate(SEAMS):
        a0 = STAMP_AT[i + 1] + STAMP_DUR
        p = cine.seg(f, a0, a0 + 7)
        sm.scale = (0.055 * 0.85, 0.86 * 0.86, max(0.0001, 0.80 * 0.62 * p))
        sm.location.z = 0.62 * 0.5
        sm.hide_render = p <= 0.001

    # carrello laterale lungo la catena, poi leggero sollevamento finale
    cam.location = cine.lerp3((-5.4, -5.2, 1.35), (4.6, -4.4, 2.35), t)
    cam.location.z += math.sin(f * 0.10) * 0.010
    cine.look_at(cam, cine.lerp3((-2.6, 0, 0.55), (2.8, 0, 0.42), t), roll_deg=-1.0 + 2.0 * t)
    cam.data.lens = 50.0 - 8.0 * t
    cam.data.dof.focus_distance = (cam.location - BLOCKS[min(N - 1, int(t * N))].location).length

    # colpo finale di luce quando l'ultima saldatura chiude la catena
    close = cine.seg(f, STAMP_AT[-1] + STAMP_DUR + 7, STAMP_AT[-1] + STAMP_DUR + 20)
    seam.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = \
        6.5 + 11.0 * close * (1.0 - cine.seg(f, STAMP_AT[-1] + STAMP_DUR + 20, N_FRAMES))


cine.render_frames(OUT_DIR, N_FRAMES, per_frame, only=ONLY)
