"""
SC01 — scena 3D reale: bilancio di sostenibilita' patinato su scrivania, luce
radente, profondita' di campo. La copertina, ribaltata indietro, si chiude di
scatto sulla pagina verso la fine (§5) coprendo i grafici.
Nessun testo leggibile (§2.2): solo anelli/barre astratti in rilievo.

Uso: blender -b --factory-startup --python sc01_report.py -- <out_dir> <n_frames> [res_x] [res_y]
"""
import bpy
import sys
import math
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cine

OUT_DIR, N_FRAMES, RES_X, RES_Y, ONLY = cine.parse_argv(sys.argv[sys.argv.index("--") + 1:])

cine.reset_scene()
scene = cine.setup_eevee(RES_X, RES_Y, samples=14, world_rgb=(0.010, 0.011, 0.013),
                         volumetrics=True, vol_end=8.0)
scene.eevee.shadow_cube_size = "1024"
scene.eevee.use_ssr_refraction = False
scene.eevee.use_soft_shadows = False
scene.eevee.bokeh_max_size = 28
cine.add_fog_volume((0, 0.55, 0.60), (5.0, 4.4, 1.5), density=0.006,
                    color=(0.60, 0.64, 0.70))

W, D = 0.62, 0.44  # mezza larghezza / mezza profondita'
TH = 0.030         # spessore blocco pagine

# --- scrivania e parete di fondo
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0))
cine.assign(bpy.context.object, cine.pbr_material("Desk", (0.026, 0.029, 0.034), roughness=0.38, specular=0.4))

bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 7.0, 0))
wall = bpy.context.object
wall.rotation_euler = (math.radians(90), 0, 0)
cine.assign(wall, cine.pbr_material("Wall", (0.034, 0.037, 0.042), roughness=0.85, specular=0.1))

# --- blocco pagine
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, TH / 2))
pages = bpy.context.object
pages.scale = (W * 2, D * 2, TH)
cine.assign(pages, cine.pbr_material("Pages", (0.235, 0.233, 0.226), roughness=0.34, specular=0.58, bump=0.022))

# --- copertina: l'ORIGINE dell'oggetto e' la cerniera sul bordo lontano (+Y).
# Sposto i vertici in local space invece di usare un parent: cosi' la rotazione
# su X e' esattamente una cerniera, senza dipendere da matrix_parent_inverse.
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
cover = bpy.context.object
cover.scale = (W * 2 + 0.012, D * 2, 0.008)
bpy.context.view_layer.objects.active = cover
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
for v in cover.data.vertices:
    v.co.y -= D  # la mesh si estende da y=-2D a y=0 rispetto all'origine
COVER_Z = TH + 0.010
cover.location = (0, D, COVER_Z)
cine.assign(cover, cine.pbr_material("Cover", (0.052, 0.056, 0.062), roughness=0.09,
                                    specular=1.0, bump=0.016))
cine.bevel_edges(cover, width=0.0018)
cine.bevel_edges(pages, width=0.0022)
hinge = cover  # la copertina stessa e' la cerniera

# --- grafica in rilievo SULLA PAGINA (astratta, nessun testo leggibile)
ring_mat = cine.pbr_material("RingInk", (0.148, 0.156, 0.170), roughness=0.30, specular=0.55)
bar_mat = cine.pbr_material("BarInk", (0.225, 0.232, 0.244), roughness=0.46, specular=0.40)

Z_INK = TH + 0.0015
for rx, maj in [(-0.34, 0.105), (-0.03, 0.080)]:
    bpy.ops.mesh.primitive_torus_add(major_radius=maj, minor_radius=maj * 0.30, location=(rx, 0.21, Z_INK), major_segments=72, minor_segments=16)
    ring = bpy.context.object
    ring.scale = (1.0, 1.0, 0.06)  # schiacciato: grafico stampato, non anello di gomma
    cine.assign(ring, ring_mat)

for i in range(5):
    w = 0.30 - i * 0.048
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.34 + w, 0.02 - i * 0.072, Z_INK))
    b = bpy.context.object
    b.scale = (w * 2, 0.014, 0.003)
    cine.assign(b, bar_mat)

# blocco "foto stock" sfocato in alto a destra: solo un rettangolo piu' scuro
bpy.ops.mesh.primitive_cube_add(size=1, location=(0.34, 0.05, Z_INK))
photo = bpy.context.object
photo.scale = (0.46, 0.56, 0.003)
cine.assign(photo, cine.pbr_material("Photo", (0.118, 0.132, 0.125), roughness=0.40, specular=0.50))

# --- oggetti di scena: danno scala, contesto e parallasse al movimento
stack_mat = cine.pbr_material("Stack", (0.062, 0.066, 0.072), roughness=0.30, specular=0.75)
sheet_mat = cine.pbr_material("Sheet", (0.165, 0.164, 0.158), roughness=0.62, specular=0.30)
pen_mat = cine.pbr_material("Pen", (0.040, 0.042, 0.046), roughness=0.24, specular=0.85)
steel_mat = cine.pbr_material("Steel", (0.330, 0.342, 0.356), roughness=0.28, metallic=0.90)

# due fascicoli chiusi a sinistra, leggermente disallineati
for i, (dx, dy, rot) in enumerate(((-1.02, 0.10, 6.0), (-0.97, 0.05, -3.5))):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(dx, dy, 0.017 + i * 0.034))
    bk = bpy.context.object
    bk.scale = (0.60, 0.84, 0.032)
    bk.rotation_euler = (0, 0, math.radians(rot))
    cine.assign(bk, stack_mat)

# fogli sciolti a destra, non allineati
for i, (dx, dy, rot) in enumerate(((0.95, -0.16, -9.0), (1.02, -0.10, 4.0), (0.90, -0.05, -2.0))):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(dx, dy, 0.003 + i * 0.0035))
    sh = bpy.context.object
    sh.scale = (0.56, 0.78, 0.0028)
    sh.rotation_euler = (0, 0, math.radians(rot))
    cine.assign(sh, sheet_mat)

# penna appoggiata di traverso sulla pagina
bpy.ops.mesh.primitive_cylinder_add(radius=0.0085, depth=0.30,
                                    location=(0.34, -0.30, TH + 0.012), vertices=20)
pen = bpy.context.object
pen.rotation_euler = (0, math.radians(90), math.radians(24))
cine.assign(pen, pen_mat)
bpy.ops.mesh.primitive_cone_add(radius1=0.0085, radius2=0.001, depth=0.030,
                                location=(0.34 + 0.137, -0.30 - 0.061, TH + 0.012), vertices=16)
tip = bpy.context.object
tip.rotation_euler = (0, math.radians(90), math.radians(24))
cine.assign(tip, steel_mat)

# graffetta metallica: un dettaglio piccolo che il macro puo' trovare
bpy.ops.mesh.primitive_torus_add(location=(-0.46, -0.30, TH + 0.004),
                                 major_radius=0.026, minor_radius=0.0032,
                                 major_segments=28, minor_segments=8)
clip = bpy.context.object
clip.scale = (1.0, 0.42, 1.0)
clip.rotation_euler = (0, 0, math.radians(-18))
cine.assign(clip, steel_mat)

# polvere in sospensione sopra la scrivania, nel fascio della radente
DUST = cine.add_motes((0.1, -0.15, 0.22), (1.9, 1.5, 0.42), count=110,
                      radius=0.0022, seed=1, strength=1.2)

# --- luci: radente calda principale, fill freddo, rim
key = cine.add_area_light((-1.9, -1.15, 0.30), (85, 0, -62), energy=62, size=0.55, color=(1.0, 0.93, 0.84))
cine.add_area_light((2.8, 2.4, 2.2), (48, 0, 148), energy=52, size=4.2, color=(0.70, 0.79, 0.93))
cine.add_area_light((1.8, -2.2, 0.40), (86, 0, 26), energy=34, size=1.1, color=(0.86, 0.91, 1.0))

# --- camera: due inquadrature con stacco netto, come le altre scene.
#   A  macro radente sulla pagina stampata, carrello laterale, fuoco corto
#   B  tre quarti piu' ampio con i fascicoli in campo: qui la copertina scatta
# Prima era una sola inquadratura lenta: era l'unica scena del montaggio senza
# stacco interno, e si vedeva.
cam = cine.add_camera((-0.42, -0.86, 0.30), (68, 0, 0), lens=58.0, focus_distance=0.95, fstop=2.0)

OPEN_DEG = -168.0  # copertina ribaltata indietro, quasi piatta


CUT = int(N_FRAMES * 0.55)         # ~frame 96 su 175


def handheld(f, amp=1.0):
    """Micro-instabilita' da spalla: nessuna delle due inquadrature e' su cavalletto."""
    return (math.sin(f * 0.29) * 0.0022 * amp,
            math.sin(f * 0.22 + 1.3) * 0.0018 * amp,
            math.sin(f * 0.37 + 0.5) * 0.0015 * amp)


def animate(f):
    if f <= CUT:
        # A: macro radente, carrello da sinistra a destra sulla pagina stampata
        t = (f - 1) / max(1, CUT - 1)
        e = t * t * (3 - 2 * t)
        cam.location = (-0.46 + e * 0.62, -0.88 + e * 0.06, 0.30 - e * 0.03)
        cam.rotation_euler = (math.radians(68 + e * 3.0), 0, math.radians(-1.5 + e * 3.0))
        cam.data.lens = 58.0
        cam.data.dof.focus_distance = 0.95 - e * 0.06
        cam.data.dof.aperture_fstop = 2.0
        key.location.x = -1.9 + t * 0.55
    else:
        # B: tre quarti, i fascicoli entrano in campo, la copertina scatta qui
        t = (f - CUT - 1) / max(1, N_FRAMES - CUT - 1)
        e = t * t * (3 - 2 * t)
        cam.location = (-0.16 + e * 0.16, -1.86 - e * 0.10, 1.24 + e * 0.05)
        cam.rotation_euler = (math.radians(53 - e * 1.6), 0, math.radians(2.5 - e * 4.0))
        cam.data.lens = 44.0
        cam.data.dof.focus_distance = 2.28 - e * 0.05
        cam.data.dof.aperture_fstop = 2.8
        key.location.x = -1.35 + t * 0.5

    cine.drift_motes(DUST, f, amp=0.012, speed=0.02)
    dx, dy, dz = handheld(f, 1.0 if f <= CUT else 1.4)
    cam.location = (cam.location[0] + dx, cam.location[1] + dy, cam.location[2] + dz)

    # Lo scatto della copertina cade DENTRO l'inquadratura B e con un rimbalzo,
    # cosi' si vede arrivare e assestarsi. Prima partiva all'80% e la scena
    # finiva prima che il movimento si esaurisse.
    snap_start = int(N_FRAMES * 0.62)
    snap_len = max(1.0, N_FRAMES * 0.13)
    if f < snap_start:
        hinge.rotation_euler = (math.radians(OPEN_DEG), 0, 0)
    else:
        p = min(1.0, (f - snap_start) / snap_len)
        eased = p * p * (3 - 2 * p)
        ang = OPEN_DEG * (1 - eased)
        if p >= 1.0:
            k = min(1.0, (f - snap_start - snap_len) / max(1.0, N_FRAMES * 0.05))
            ang = -3.2 * math.sin(k * math.pi) * (1.0 - k)   # rimbalzo secco
        hinge.rotation_euler = (math.radians(ang), 0, 0)


cine.render_frames(OUT_DIR, N_FRAMES, animate, only=ONLY)
