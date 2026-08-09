"""
SC07 — Decarbonizzazione e assorbimento (TC 01:00-01:14, 350 frame @25fps).

Piantagione di bambu' reale in 3D: culmi con nodi disposti in file regolari (e'
una coltura, non un idillio spontaneo — §5), chioma vera, lettiera a terra,
sole laterale che filtra fra i culmi e produce raggi volumetrici.

Tre inquadrature:
  A  1-150    carrellata in avanti nella corsia fra le file, raggi di taglio
  B  151-250  macro: fascetta dendrometrica su un culmo, marker azzurro
  C  251-350  gru che sale e si apre: le file si leggono come coltura

Verde naturale desaturato per la vegetazione; il verde/azzurro di marchio resta
riservato al solo elemento grafico (marker di misura).
"""
import bpy
import math
import random
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import cine

OUT_DIR, N_FRAMES, RES_X, RES_Y, ONLY = cine.parse_argv(sys.argv[sys.argv.index("--") + 1:])
rnd = random.Random(23)

cine.reset_scene()
cine.setup_eevee(RES_X, RES_Y, samples=10, bloom=True, volumetrics=True, vol_end=65.0)
_ee = bpy.context.scene.eevee
_ee.bloom_intensity = 0.055
_ee.bloom_radius = 6.2
# Su GL software il costo dominante di questa scena non sono i campioni ma le
# ombre: centinaia di culmi di geometria fitta, moltiplicati per quattro cascade
# a 2048 e per le ombre morbide. A 40 s/frame la scena non e' producibile; con
# cascade a 1024, ombre dure e senza riflessi screen-space l'immagine resta
# equivalente (qui non ci sono superfici riflettenti) e il costo crolla.
_ee.shadow_cascade_size = "1024"
_ee.shadow_cube_size = "1024"
_ee.use_soft_shadows = False
_ee.use_ssr = False
_ee.use_gtao = False

# Sole laterale-frontale: la camera guarda verso +Y, il sole entra da destra e i
# raggi tagliano il fotogramma in diagonale invece di illuminarlo da dietro.
SUN_EL, SUN_ROT = 9.0, 132.0
cine.sky_world(sun_elevation_deg=SUN_EL, sun_rotation_deg=SUN_ROT, strength=0.55,
               dust=1.1, air=1.2, ozone=2.6, sun_intensity=0.45, sun_size_deg=1.5)

# ---------------------------------------------------------------- materiali
culm_a = cine.pbr_material("CulmA", (0.132, 0.190, 0.082), roughness=0.58, specular=0.45)
culm_b = cine.pbr_material("CulmB", (0.168, 0.215, 0.098), roughness=0.54, specular=0.48)
culm_c = cine.pbr_material("CulmC", (0.108, 0.158, 0.070), roughness=0.64, specular=0.40)
node_m = cine.pbr_material("Node", (0.205, 0.225, 0.128), roughness=0.70)
leaf_m = cine.pbr_material("Leaf", (0.122, 0.182, 0.072), roughness=0.48, specular=0.55,
                           emission_rgb=(0.145, 0.225, 0.088), emission_strength=0.55)
soil = cine.pbr_material("Soil", (0.105, 0.088, 0.062), roughness=0.94, specular=0.14)
litter = cine.pbr_material("Litter", (0.168, 0.142, 0.092), roughness=0.90)
# Fascetta: acciaio spazzolato, con la satinatura orientata lungo la
# circonferenza. Con il rumore isotropo la fascetta risultava a chiazze e leggeva
# come cartoncino verniciato, non come metallo.
steel = cine.pbr_material("Steel", (0.340, 0.352, 0.365), roughness=0.30, metallic=0.92,
                          rough_break=0.06, tex_scale=260.0, stretch=(9.0, 9.0, 0.35))
AZZURRO = (0.325, 0.643, 0.859)   # #53a4db — V01
azz = cine.pbr_material("Azz", AZZURRO, roughness=0.35,
                        emission_rgb=AZZURRO, emission_strength=1.4)

# ---------------------------------------------------------------- terreno
bpy.ops.mesh.primitive_plane_add(size=600, location=(0, 0, 0))
cine.assign(bpy.context.object, soil)
for i in range(340):                      # lettiera: il suolo si legge, non e' un vuoto
    ll = rnd.uniform(0.14, 0.36)
    lf = cine.leaf_blade(f"Litter{i}", ll, ll * rnd.uniform(0.12, 0.22),
                         bend=ll * 0.10, segments=3)
    lf.location = (rnd.uniform(-22, 22), rnd.uniform(-10, 70), 0.030)
    lf.rotation_euler = (rnd.uniform(-0.14, 0.14), 0, rnd.uniform(0, 6.28))
    cine.assign(lf, litter)


# ---------------------------------------------------------------- culmo "modello"
def build_master_culm(height, radius, mat):
    """Un culmo completo (fusto + nodi + rami alti), costruito una volta sola e
    poi duplicato in linked-duplicate: centinaia di piante a costo contenuto."""
    parts = []
    # Cono, non cilindro: un culmo si rastrema salendo. Un fusto a diametro
    # costante per tredici metri e' un tubo, e si vede che e' un tubo.
    TAPER = 0.58
    bpy.ops.mesh.primitive_cone_add(radius1=radius, radius2=radius * TAPER, depth=height,
                                    location=(0, 0, height / 2), vertices=16)
    stem = bpy.context.object
    cine.assign(stem, mat)
    parts.append(stem)
    n_nodes = max(4, int(height / 1.05))
    for k in range(1, n_nodes):
        z = k * (height / n_nodes)
        r_z = radius * (1.0 - (1.0 - TAPER) * (z / height))   # l'anello segue la rastremazione
        bpy.ops.mesh.primitive_cylinder_add(radius=r_z * 1.22, depth=r_z * 0.85,
                                            location=(0, 0, z), vertices=10)
        cine.assign(bpy.context.object, node_m)
        parts.append(bpy.context.object)
    # Chioma. Prima erano 8 rami quasi orizzontali con 3 foglie grandi ciascuno:
    # visti dalla gru i culmi leggevano come stecchi e i rami come ramaglia
    # incrociata. Un bambuseto ha una massa di fogliame nel terzo alto, fatta di
    # molte foglie piccole raccolte in ciuffi verso la punta del ramo, e i rami
    # salgono — non stanno a squadra col fusto.
    for k in range(11):
        z = height * (0.52 + 0.47 * (k / 11.0))
        a = k * 2.399                      # angolo d'oro: distribuzione non ripetitiva
        br = radius * 0.26                 # rami piu' sottili
        bl = rnd.uniform(0.42 + 0.5 * (z / height), 1.05)
        up = math.radians(rnd.uniform(38, 52))     # inclinazione verso l'alto
        bpy.ops.mesh.primitive_cylinder_add(radius=br, depth=bl,
                                            location=(math.cos(a) * bl * 0.32,
                                                      math.sin(a) * bl * 0.32,
                                                      z + bl * 0.30),
                                            vertices=6)
        b = bpy.context.object
        b.rotation_euler = (up * math.sin(a), up * math.cos(a), 0)
        cine.assign(b, node_m)
        parts.append(b)
        # ciuffo alla punta del ramo: foglie piccole a ventaglio
        tip = (math.cos(a) * bl * 0.62, math.sin(a) * bl * 0.62, z + bl * 0.58)
        # Otto foglie per ciuffo, e piu' larghe: a 24 m di quota, dalla gru, un
        # bambuseto vero e' una massa verde continua. Con cinque lame strette per
        # ramo la chioma restava trasparente e i culmi leggevano come stecchi.
        # Lame larghe coprono piu' pixel per triangolo: e' il rapporto migliore
        # fra costo di render e resa.
        for j in range(8):
            ll = rnd.uniform(0.16, 0.34)
            lf = cine.leaf_blade(f"Blade{k}{j}", ll, ll * rnd.uniform(0.20, 0.30),
                                 bend=ll * rnd.uniform(0.28, 0.50), segments=3)
            lf.location = (tip[0] + rnd.uniform(-0.16, 0.16),
                           tip[1] + rnd.uniform(-0.16, 0.16),
                           tip[2] + rnd.uniform(-0.18, 0.12))
            lf.rotation_euler = (rnd.uniform(-0.9, 0.9), rnd.uniform(-1.3, -0.2),
                                 a + rnd.uniform(-1.0, 1.0))
            cine.assign(lf, leaf_m)
            parts.append(lf)
    for o in parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = stem
    bpy.ops.object.join()
    joined = bpy.context.object
    # Senza questo si contano i lati del cilindro: e' la correzione singola con
    # piu' effetto su tutta la scena, e non costa un fotogramma in piu'.
    # Soglia a 50 e non 34: gli anelli dei nodi hanno dieci lati, cioe' 36 fra una
    # faccia e l'altra, e con la soglia a 34 restavano sfaccettati proprio nella
    # macro. Gli spigoli veri (bordi degli anelli, 90) restano netti comunque.
    cine.smooth_shade(joined, 50.0)
    return joined


# Variazione per singola pianta: senza questa i culmi condividono materiale
# (sono duplicati collegati) e risultano tutti dello stesso verde.
for _m in (culm_a, culm_b, culm_c, leaf_m, node_m):
    cine.per_object_variation(_m, value=0.20, hue=0.035)

MASTERS = [
    build_master_culm(13.5, 0.066, culm_a),
    build_master_culm(11.0, 0.058, culm_b),
    build_master_culm(15.5, 0.074, culm_c),
]
for m in MASTERS:
    m.location = (0, 600, 0)      # i master restano fuori campo


def plant(master, x, y, scale, lean_deg, spin, linked=True):
    bpy.ops.object.select_all(action="DESELECT")
    master.select_set(True)
    bpy.context.view_layer.objects.active = master
    bpy.ops.object.duplicate(linked=linked)
    c = bpy.context.object
    c.location = (x, y, 0.0)
    c.scale = (scale, scale, scale)
    c.rotation_euler = (math.radians(lean_deg * math.cos(spin)),
                        math.radians(lean_deg * math.sin(spin)), rnd.uniform(0, 6.28))
    return c


# File regolari: 2.35 m fra le file, 0.80 m sulla fila. Coltura, non bosco.
ROW_STEP, IN_ROW = 2.35, 0.80
LANE = 0.62                     # semi-larghezza della corsia di servizio
culms = []
for r in range(15):
    y = -6.0 + r * ROW_STEP
    jitter_row = rnd.uniform(-0.10, 0.10)
    for i in range(36):
        x = -14.2 + i * IN_ROW + jitter_row + rnd.uniform(-0.09, 0.09)
        if abs(x) < LANE and y < 30:          # corsia libera per la carrellata
            continue
        m = MASTERS[(r * 7 + i) % 3]
        culms.append(plant(m, x, y, rnd.uniform(0.82, 1.26), rnd.uniform(0.6, 3.0), rnd.uniform(0, 6.28)))

# Ciuffi molto fuori fuoco a ~1 m dalla camera: bokeh vero in primo piano.
#
# Erano scritti ma disabilitati (range(0)), ed e' il motivo principale per cui
# l'inquadratura non aveva profondita': tutto stava sullo stesso piano di fuoco,
# e un bosco senza niente davanti all'obiettivo non e' un bosco ripreso, e' un
# fondale. Con la lama lanceolata al posto del rettangolo non leggono piu' come
# lame nere che attraversano il fotogramma — a f/2.2 e un metro di distanza sono
# macchie morbide, che e' esattamente quello che fa un obiettivo vero.
BOKEH = []
for i in range(7):
    ll = rnd.uniform(0.16, 0.34)
    lf = cine.leaf_blade(f"Fg{i}", ll, ll * rnd.uniform(0.18, 0.30),
                         bend=ll * 0.30, segments=4)
    lf.location = (rnd.uniform(-0.9, 0.9), 0, rnd.uniform(1.05, 2.35))
    lf.rotation_euler = (rnd.uniform(-1.0, 1.0), rnd.uniform(-0.6, 0.6), rnd.uniform(0, 3.1))
    cine.assign(lf, leaf_m)
    BOKEH.append((lf, rnd.uniform(0.85, 1.55), rnd.uniform(0, 6.28)))

# ---------------------------------------------------------------- culmo misurato (shot B)
HERO_X, HERO_Y, HERO_Z = 0.72, 7.0, 1.46
# Copia non collegata: nell'inquadratura B questo culmo occupa mezzo fotogramma a
# 135 mm, e a quella distanza la superficie deve avere le striature verticali e i
# difetti che sugli altri cinquecento culmi non si vedrebbero. Il bump costa il
# 64% in piu' per fotogramma, quindi sta solo qui e non sul materiale condiviso.
hero = plant(MASTERS[2], HERO_X, HERO_Y, 1.18, 0.8, 0.4, linked=False)
culm_hero = cine.pbr_material("CulmHero", (0.150, 0.200, 0.090), roughness=0.52,
                              specular=0.50, bump=0.045, tex_scale=30.0,
                              stretch=(7.0, 7.0, 0.30))   # striature verticali
for _slot in hero.material_slots:
    if _slot.material in (culm_a, culm_b, culm_c):
        _slot.material = culm_hero

# Punti luce dietro l'eroe: a f/2.0 e 135 mm il fondo si scioglie, e senza alte
# luci puntiformi si scioglie nel nulla. Queste diventano i cerchi di bokeh che
# in una ripresa controluce ci sono sempre.
BOKEH_LIGHTS = cine.add_motes((0.9, 13.0, 2.6), (9.0, 8.0, 3.4), count=46,
                              radius=0.020, seed=11, color=(1.0, 0.93, 0.76),
                              strength=5.5)
R_HERO = 0.074 * 1.18
bpy.ops.mesh.primitive_cylinder_add(radius=R_HERO * 1.30, depth=0.052,
                                    location=(HERO_X, HERO_Y, HERO_Z), vertices=28)
bandg = bpy.context.object
cine.assign(bandg, steel)
cine.smooth_shade(bandg, 50.0)      # 28 lati: senza questo il cerchio e' un poligono
cine.bevel_edges(bandg, width=0.0012, segments=2)
for k in range(13):                       # tacche dendrometriche incise sulla fascetta
    a = math.radians(-96 + k * 16)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(HERO_X + math.cos(a) * R_HERO * 1.32,
                                                     HERO_Y + math.sin(a) * R_HERO * 1.32,
                                                     HERO_Z + (0.016 if k % 4 else 0.010)))
    tk = bpy.context.object
    tk.scale = (0.0035, 0.0035, 0.018 if k % 4 == 0 else 0.010)
    tk.rotation_euler.z = a
    cine.assign(tk, node_m)
# targhetta con un solo indice azzurro: strumento di misura, non decorazione
bpy.ops.mesh.primitive_cube_add(size=1, location=(HERO_X - 0.012, HERO_Y - R_HERO * 1.42, HERO_Z - 0.001))
tag = bpy.context.object
tag.scale = (0.030, 0.008, 0.012)
cine.assign(tag, azz)

# ---------------------------------------------------------------- luce e foschia
sun = cine.sun_matching_sky(SUN_EL, SUN_ROT, energy=8.5, color=(1.0, 0.82, 0.58), angle_deg=0.8)
sun.data.shadow_cascade_max_distance = 45.0
sun.data.shadow_cascade_count = 4
sun.data.shadow_buffer_bias = 0.045
# densita' molto piu' bassa della prima versione: i raggi si devono vedere, il
# fondo no — a 0.075 la scena diventava un vuoto lattiginoso
cine.add_fog_volume((0, 30, 2.6), (86, 130, 6.6), density=0.016, color=(0.66, 0.70, 0.72))
# Il cubo alto era a 0.005 su 130 m di profondita': nell'inquadratura della gru la
# camera guarda attraverso tutta quella colonna e il fotogramma diventava una
# lastra marrone uniforme, senza verde e senza orizzonte. A 0.0030 la prospettiva
# aerea si legge ancora ma la chioma resta verde.
cine.add_fog_volume((0, 30, 9.5), (86, 130, 13.0), density=0.0020, color=(0.70, 0.74, 0.76))

# Polline sospeso nei fasci di sole: e' il dettaglio che rende l'aria
# visibile, e in un bosco controluce c'e' sempre.
POLLEN = cine.add_motes((0.4, 12.0, 3.2), (14.0, 26.0, 5.0), count=150,
                        radius=0.010, seed=7, color=(0.92, 0.90, 0.78),
                        strength=2.4)

# ---------------------------------------------------------------- camera
cam = cine.add_camera((0, -6.0, 1.75), (0, 0, 0), lens=35.0, focus_distance=8.0, fstop=2.2)

A_END = int(N_FRAMES * 0.428)     # ~150
B_END = int(N_FRAMES * 0.714)     # ~250

A_FROM, A_TO = (-0.08, -5.2, 1.72), (0.05, 10.2, 1.55)
B_FROM, B_TO = (0.10, 4.55, 1.49), (0.24, 5.05, 1.46)
C_FROM, C_TO = (0.02, 2.6, 2.05), (0.14, -5.6, 24.0)


def per_frame(f):
    if f <= A_END:
        t = cine.seg(f, 1, A_END)
        cam.location = cine.lerp3(A_FROM, A_TO, t)
        cam.location.x += math.sin(f * 0.13) * 0.040          # micro-instabilita' da spalla
        cam.location.z += math.sin(f * 0.19 + 1.1) * 0.026
        cine.look_at(cam, (0.30 + 1.2 * t, cam.location.y + 11.0, 3.6 - 0.8 * t),
                     roll_deg=math.sin(f * 0.09) * 0.7)
        cam.data.lens = 35.0
        cam.data.dof.focus_distance = 6.5 + 3.5 * t
        cam.data.dof.aperture_fstop = 2.2
    elif f <= B_END:
        t = cine.seg(f, A_END + 1, B_END)
        cam.location = cine.lerp3(B_FROM, B_TO, t)
        cam.location.x += math.sin(f * 0.11) * 0.010
        cine.look_at(cam, (HERO_X, HERO_Y, HERO_Z + 0.02 * t))
        cam.data.lens = 135.0
        cam.data.dof.focus_distance = (cam.location - bandg.location).length
        cam.data.dof.aperture_fstop = 2.0
    else:
        t = cine.seg(f, B_END + 1, N_FRAMES)
        cam.location = cine.lerp3(C_FROM, C_TO, t)
        # la gru sale ma resta inclinata sulle file: finire a picco sul terreno
        # buio significava chiudere la scena sul nulla
        cine.look_at(cam, (0.8 + 1.6 * t, 15.0 + 9.0 * t, 5.0 - 2.6 * t), roll_deg=-1.0 + 2.0 * t)
        cam.data.lens = 30.0 + 8.0 * t
        cam.data.dof.focus_distance = 14.0 + 20.0 * t
        cam.data.dof.aperture_fstop = 4.0 + 4.0 * t

    # brezza: i culmi oscillano, non sono pali fermi
    for i, c in enumerate(culms):
        base = 0.011 + 0.010 * ((i % 5) / 4.0)
        c.rotation_euler.x = base * math.sin(f * 0.055 + i * 0.31)
        c.rotation_euler.y = base * math.cos(f * 0.048 + i * 0.17)
    hero.rotation_euler.x = 0.004 * math.sin(f * 0.05)
    cine.drift_motes(POLLEN, f, amp=0.06, speed=0.018)
    cine.drift_motes(BOKEH_LIGHTS, f, amp=0.10, speed=0.010)

    # ciuffi in primo piano: entrano ed escono di campo, danno parallasse vera
    in_macro = A_END < f <= B_END
    for lf, dist, ph in BOKEH:
        if in_macro:
            lf.location = (60.0, 600.0, 0.0)
            continue
        lf.location.y = cam.location.y + dist + 0.06 * math.sin(f * 0.07 + ph)
        lf.location.x = 0.75 * math.sin(f * 0.020 + ph) + 0.18 * math.sin(f * 0.09 + ph)
        lf.rotation_euler.z = ph + f * 0.005


cine.render_frames(OUT_DIR, N_FRAMES, per_frame, only=ONLY)
