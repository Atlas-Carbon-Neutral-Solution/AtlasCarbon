"""
SC02 — Lo stacco sul reale (TC 00:07-00:14, 175 frame @25fps).

Aerea su un impianto industriale all'alba. Geometria reale (torri di
raffreddamento, camini, silos, parco serbatoi, rack di tubazioni), sole radente
all'orizzonte, foschia volumetrica che rende visibili i raggi, pennacchi di
vapore volumetrici sopra le torri.

Due inquadrature, stacco netto:
  A  1-100   grandangolo 30mm, drone che avanza e scende sul sito
  B  101-175 70mm, carrellata bassa controluce: i camini spazzano il sole

Nessun logo, nessuna insegna, nessun volto: l'impianto e' generico (§2.1).
"""
import bpy
import math
import random
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import cine

OUT_DIR, N_FRAMES, RES_X, RES_Y, ONLY = cine.parse_argv(sys.argv[sys.argv.index("--") + 1:])

rnd = random.Random(11)

cine.reset_scene()
cine.setup_eevee(RES_X, RES_Y, samples=24, bloom=True,
                 volumetrics=True, vol_end=1400.0)
bpy.context.scene.eevee.bloom_intensity = 0.060
bpy.context.scene.eevee.bloom_radius = 6.8

# Alba: il sole e' basso ESATTAMENTE dietro l'impianto rispetto alla camera di
# apertura, cosi' le strutture si leggono in controluce e la foschia diventa raggio.
SUN_EL, SUN_ROT = 2.2, 58.0
# ozone alto / dust basso: caldo solo all'orizzonte, zenit che resta blu — senza
# questo la scena e' una sola campitura arancione dall'alto in basso.
cine.sky_world(sun_elevation_deg=SUN_EL, sun_rotation_deg=SUN_ROT, strength=0.45,
               dust=0.9, air=1.1, ozone=3.4, sun_intensity=0.55, sun_size_deg=1.3)

# ---------------------------------------------------------------- materiali
# Cemento freddo e scuro: con un sole cosi' caldo, un beige chiaro diventa
# arancione e il fotogramma perde contrasto.
concrete = cine.pbr_material("Concrete", (0.148, 0.158, 0.168), roughness=0.80, specular=0.30)
concrete_d = cine.pbr_material("ConcreteDark", (0.082, 0.089, 0.097), roughness=0.86, specular=0.26)
metal = cine.pbr_material("Metal", (0.240, 0.255, 0.272), roughness=0.52, metallic=0.90)
metal_d = cine.pbr_material("MetalDark", (0.062, 0.068, 0.076), roughness=0.50, metallic=0.75)
rust = cine.pbr_material("Rust", (0.190, 0.108, 0.062), roughness=0.86, specular=0.22)
# asfalto leggermente lucido: il sole radente ci striscia sopra e regala
# un riflesso speculare che da' scala e profondita' al piazzale
asphalt = cine.pbr_material("Asphalt", (0.030, 0.033, 0.037), roughness=0.74, specular=0.32)
band = cine.pbr_material("Band", (0.205, 0.072, 0.052), roughness=0.78)
lamp = cine.pbr_material("Lamp", (1.0, 0.78, 0.46), roughness=0.4,
                         emission_rgb=(1.0, 0.72, 0.36), emission_strength=42.0)
win = cine.pbr_material("Win", (0.9, 0.75, 0.5), roughness=0.3,
                        emission_rgb=(1.0, 0.80, 0.50), emission_strength=6.0)


def box(loc, scale, mat, rot_z=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.scale = scale
    o.rotation_euler.z = math.radians(rot_z)
    cine.assign(o, mat)
    return o


def cyl(loc, r, h, mat, rot=(0, 0, 0), verts=28):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, vertices=verts)
    o = bpy.context.object
    o.rotation_euler = tuple(math.radians(a) for a in rot)
    cine.assign(o, mat)
    return o


def cone(loc, r1, r2, h, mat, verts=28):
    bpy.ops.mesh.primitive_cone_add(radius1=r1, radius2=r2, depth=h, location=loc, vertices=verts)
    o = bpy.context.object
    cine.assign(o, mat)
    return o


# ---------------------------------------------------------------- suolo e strade
ground = box((0, 20, -0.5), (3600, 3600, 1.0), asphalt)
for y in (-46, 62):
    box((0, y, 0.06), (420, 9, 0.1), cine.pbr_material(f"Road{y}", (0.052, 0.055, 0.060), roughness=0.7))

# Orizzonte popolato: senza questo il piano di terra taglia il cielo sul nulla e
# tutto sembra un modellino su un tavolo.
far_m = cine.pbr_material("FarMass", (0.055, 0.062, 0.072), roughness=0.9, specular=0.2)
for i in range(46):
    x = -1400 + i * 62 + rnd.uniform(-24, 24)
    y = 420 + rnd.uniform(-60, 260)
    h = rnd.uniform(10, 46)
    box((x, y, h / 2), (rnd.uniform(30, 78), rnd.uniform(24, 60), h), far_m, rot_z=rnd.uniform(-14, 14))
for i in range(9):                                  # camini lontani, scala del territorio
    cyl((-900 + i * 230 + rnd.uniform(-40, 40), 520 + rnd.uniform(-40, 120),
         rnd.uniform(30, 62)), rnd.uniform(2.4, 4.4), 120.0, far_m, verts=12)
for i in range(3):                                  # dorsale collinare in lontananza
    cone((-700 + i * 760, 1250, -60), 620, 0, 190, far_m, verts=24)

# ---------------------------------------------------------------- parco serbatoi
for i in range(4):
    x = -96 + i * 30
    cyl((x, -14, 6.0), 13.0, 12.0, metal)
    cone((x, -14, 13.4), 13.2, 0.6, 3.0, metal_d)          # tetto conico
    cyl((x, -14, 12.2), 13.6, 0.5, metal_d)                 # cerchiatura
    for k in range(3):                                       # scalette / montanti
        a = math.radians(35 + k * 118)
        cyl((x + math.cos(a) * 13.4, -14 + math.sin(a) * 13.4, 6.0), 0.32, 12.0, metal_d, verts=8)

# ---------------------------------------------------------------- capannone principale
hall = box((-14, 52, 11.0), (74, 34, 22.0), concrete)
box((-14, 52, 22.6), (75, 35, 1.2), metal_d)                # copertura
for i in range(9):                                           # nervature del tetto
    box((-48 + i * 8.6, 52, 23.6), (1.1, 35, 1.6), metal)
for i in range(7):                                           # finestre a nastro accese
    box((-44 + i * 10.0, 34.8, 15.0), (6.0, 0.6, 3.0), win)

# ---------------------------------------------------------------- silos
for i in range(6):
    x = -34 + i * 11.0
    cyl((x, 16, 13.0), 4.9, 26.0, concrete)
    cone((x, 16, 27.4), 5.0, 0.8, 3.2, concrete_d)
box((-34 + 2.5 * 11.0, 16, 30.5), (60, 2.6, 1.4), metal_d)   # passerella sopra i silos

# ---------------------------------------------------------------- torri di raffreddamento
TOWERS = [(62, 26), (96, 26)]
for (tx, ty) in TOWERS:
    cone((tx, ty, 16.0), 16.5, 11.0, 32.0, concrete, verts=36)   # profilo iperbolico semplificato
    cyl((tx, ty, 32.6), 11.6, 1.6, concrete_d, verts=36)          # labbro superiore
    for k in range(10):                                            # sostegni obliqui alla base
        a = math.radians(k * 36)
        cyl((tx + math.cos(a) * 16.0, ty + math.sin(a) * 16.0, 2.4), 0.55, 5.0, concrete_d, verts=8)

# ---------------------------------------------------------------- camini
STACKS = [(18, 4, 78.0, 3.3), (34, -4, 62.0, 2.6)]
for (sx, sy, sh, sr) in STACKS:
    cyl((sx, sy, sh / 2), sr, sh, concrete, verts=24)
    for b in range(4):                                             # fasce di segnalazione
        cyl((sx, sy, sh - 6 - b * 11), sr + 0.18, 3.4, band, verts=24)
    cyl((sx, sy, sh + 0.6), sr + 0.5, 1.4, metal_d, verts=24)
    box((sx + sr + 1.0, sy, sh * 0.5), (0.5, 0.5, sh), metal_d)     # scala esterna

# ---------------------------------------------------------------- rack di tubazioni
# Dentro l'impianto, fra serbatoi e silos: in primo piano attraversava il
# fotogramma come un guardrail d'autostrada.
for i in range(15):
    x = -100 + i * 14.0
    box((x, 2.0, 4.0), (1.4, 1.4, 8.0), metal_d)                    # montanti
    box((x, 2.0, 8.4), (1.8, 9.0, 0.7), metal_d)                    # traverse
for k, dy in enumerate((-1.6, 2.0, 5.6)):
    cyl((0, dy, 8.9 + (k % 2) * 0.8), 0.78 - k * 0.11, 212.0,
        rust if k == 1 else metal, rot=(0, 90, 0), verts=16)

# Tralicci: silhouette a graticcio, la figura grafica piu' forte in controluce
for (px, py) in ((-118, 26), (-72, 54), (128, -8), (150, 46)):
    for s in (-1, 1):
        for u in (-1, 1):
            cyl((px + s * 4.2, py + u * 4.2, 22.0), 0.42, 46.0, metal_d, verts=6)
    for lvl in range(6):
        z = 3.0 + lvl * 8.0
        box((px, py, z), (9.6, 0.35, 0.35), metal_d)
        box((px, py, z), (0.35, 9.6, 0.35), metal_d)
    box((px, py, 47.0), (24.0, 0.6, 0.6), metal_d)                  # mensole
    box((px, py, 52.0), (17.0, 0.6, 0.6), metal_d)

# ---------------------------------------------------------------- torcia
cyl((108, 64, 41.0), 2.0, 82.0, metal_d, verts=20)
tip = cyl((108, 64, 83.0), 2.6, 3.0, lamp, verts=20)

# ---------------------------------------------------------------- dettagli di scala
for i in range(14):                                                  # mezzi parcheggiati
    x = -92 + i * 13.5 + rnd.uniform(-2, 2)
    box((x, -60 + rnd.uniform(-3, 3), 1.7), (7.2, 2.6, 3.4), metal_d, rot_z=rnd.uniform(-8, 8))
for i in range(22):                                                  # lampioni accesi
    x = -104 + i * 10.0
    cyl((x, 68, 7.0), 0.28, 14.0, metal_d, verts=8)
    box((x, 67.2, 14.1), (1.5, 0.7, 0.35), lamp)
for i in range(9):                                                   # container
    box((-70 + i * 12.0, 78 + (i % 2) * 7, 2.2), (11.0, 4.6, 4.4),
        rust if i % 3 == 0 else metal_d, rot_z=rnd.uniform(-3, 3))

# ---------------------------------------------------------------- luce
sun = cine.sun_matching_sky(SUN_EL, SUN_ROT, energy=6.0, color=(1.0, 0.62, 0.34), angle_deg=1.1)

# Foschia: densita' molto bassa e distribuita su tutto il territorio. Serve a far
# vedere i raggi e a separare i piani, non a lavare l'immagine — la prima
# versione, tre volte piu' densa, appiattiva tutto in un'unica campitura.
cine.add_fog_volume((0, 200, 80), (2600, 2600, 170), density=0.0010, color=(0.58, 0.66, 0.78))
cine.add_fog_volume((0, 120, 6), (1600, 1600, 13), density=0.0018, color=(0.56, 0.61, 0.68))
# banda di foschia a media distanza: spinge la citta' lontana dietro l'impianto
# (prospettiva aerea) invece di lasciarla incollata sullo stesso piano
cine.add_fog_volume((0, 560, 62), (3000, 820, 150), density=0.0062, color=(0.60, 0.66, 0.76))

# pennacchi di vapore sopra le torri e il camino grande
plumes = []
for (tx, ty) in TOWERS:
    b, v = cine.add_fog_volume((tx, ty, 46), (26, 26, 30), density=0.055,
                               color=(0.80, 0.83, 0.86))
    plumes.append((b, v, 46.0))
b, v = cine.add_fog_volume((18, 4, 92), (13, 13, 26), density=0.045, color=(0.78, 0.80, 0.83))
plumes.append((b, v, 92.0))

# ---------------------------------------------------------------- camera
cam = cine.add_camera((-150, -250, 120), (0, 0, 0), lens=28.0, focus_distance=210.0, fstop=5.6)

CUT = int(N_FRAMES * 0.575)          # stacco netto ~ frame 100 su 175

A_FROM, A_TO = (-132, -208, 86), (-34, -80, 15)
A_LOOK_FROM, A_LOOK_TO = (8, 22, 26), (36, 30, 50)
B_FROM, B_TO = (14, -50, 5.5), (46, -41, 8.5)
B_LOOK_FROM, B_LOOK_TO = (64, 22, 26), (86, 30, 30)


def per_frame(f):
    if f <= CUT:
        t = cine.seg(f, 1, CUT)
        cam.location = cine.lerp3(A_FROM, A_TO, t)
        cine.look_at(cam, cine.lerp3(A_LOOK_FROM, A_LOOK_TO, t), roll_deg=3.2 - 4.6 * t)
        cam.data.lens = 30.0 + 6.0 * t
        cam.data.dof.focus_distance = 190.0 - 30.0 * t
        cam.data.dof.aperture_fstop = 5.6
    else:
        t = cine.seg(f, CUT + 1, N_FRAMES)
        cam.location = cine.lerp3(B_FROM, B_TO, t)
        cine.look_at(cam, cine.lerp3(B_LOOK_FROM, B_LOOK_TO, t), roll_deg=-1.4 + 2.2 * t)
        cam.data.lens = 26.0 + 4.0 * t
        cam.data.dof.focus_distance = 80.0 + 14.0 * t
        cam.data.dof.aperture_fstop = 5.0

    # i pennacchi salgono e respirano: il sito e' vivo in ogni fotogramma
    for i, (bx, vol, z0) in enumerate(plumes):
        bx.location.z = z0 + ((f * 0.22 + i * 5.0) % 9.0)
        bx.rotation_euler.z = math.radians(f * 0.35 + i * 40)
        vol.inputs["Density"].default_value = 0.050 + 0.018 * math.sin(f * 0.07 + i * 2.1)

    # la torcia pulsa
    tip.data.materials[0].node_tree.nodes.get("Principled BSDF").inputs[
        "Emission Strength"].default_value = 34.0 + 12.0 * math.sin(f * 0.31)


cine.render_frames(OUT_DIR, N_FRAMES, per_frame, only=ONLY)
