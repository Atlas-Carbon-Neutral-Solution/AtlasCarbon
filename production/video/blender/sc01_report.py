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

argv = sys.argv[sys.argv.index("--") + 1:]
OUT_DIR = argv[0]
N_FRAMES = int(argv[1])
RES_X = int(argv[2]) if len(argv) > 2 else 1920
RES_Y = int(argv[3]) if len(argv) > 3 else 1080

cine.reset_scene()
scene = cine.setup_eevee(RES_X, RES_Y, samples=16, world_rgb=(0.010, 0.011, 0.013))
scene.eevee.shadow_cube_size = "1024"
scene.eevee.use_ssr_refraction = False

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
cine.assign(pages, cine.pbr_material("Pages", (0.80, 0.80, 0.78), roughness=0.64, specular=0.22))

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
cine.assign(cover, cine.pbr_material("Cover", (0.86, 0.87, 0.88), roughness=0.11, specular=0.9))
hinge = cover  # la copertina stessa e' la cerniera

# --- grafica in rilievo SULLA PAGINA (astratta, nessun testo leggibile)
ring_mat = cine.pbr_material("RingInk", (0.40, 0.42, 0.45), roughness=0.34, specular=0.5)
bar_mat = cine.pbr_material("BarInk", (0.54, 0.55, 0.57), roughness=0.5, specular=0.35)

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
cine.assign(photo, cine.pbr_material("Photo", (0.34, 0.37, 0.35), roughness=0.42, specular=0.45))

# --- luci: radente calda principale, fill freddo, rim
key = cine.add_area_light((-2.6, -1.4, 0.70), (74, 0, -58), energy=300, size=1.9, color=(1.0, 0.95, 0.88))
cine.add_area_light((2.8, 2.4, 2.2), (48, 0, 148), energy=52, size=4.2, color=(0.70, 0.79, 0.93))
cine.add_area_light((1.8, -2.2, 0.40), (86, 0, 26), energy=34, size=1.1, color=(0.86, 0.91, 1.0))

# --- camera: 50mm arretrata, inclinata per leggere la pagina intera
cam = cine.add_camera((-0.05, -1.98, 1.34), (52, 0, 0), lens=50.0, focus_distance=2.40, fstop=2.4)

OPEN_DEG = -168.0  # copertina ribaltata indietro, quasi piatta


def animate(f):
    t = (f - 1) / max(1, N_FRAMES - 1)
    cam.location.x = -0.05 + t * 0.13
    cam.location.z = 1.34 - t * 0.03
    cam.data.dof.focus_distance = 2.40 - t * 0.04
    # luce radente che scorre
    key.location.x = -2.6 + t * 0.9

    snap_start = int(N_FRAMES * 0.80)
    if f < snap_start:
        hinge.rotation_euler = (math.radians(OPEN_DEG), 0, 0)
    else:
        p = min(1.0, (f - snap_start) / max(1.0, (N_FRAMES - snap_start) * 0.55))
        eased = p * p * (3 - 2 * p)
        hinge.rotation_euler = (math.radians(OPEN_DEG * (1 - eased)), 0, 0)


cine.render_frames(OUT_DIR, N_FRAMES, animate)
