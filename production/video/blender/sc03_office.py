"""
SC03 — scena 3D reale: interno ufficio, luce fredda da monitor. Un questionario
fornitori scorre sullo schermo (testo NON leggibile per design, §2.2/§5), poi
stacco su inquadratura piu' ampia della scrivania con calendario a muro e una
data cerchiata (nessun anno leggibile).

Uso: blender -b --factory-startup --python sc03_office.py -- <out_dir> <n_frames> [res_x] [res_y]
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
scene = cine.setup_eevee(RES_X, RES_Y, samples=16, world_rgb=(0.007, 0.008, 0.010))
scene.eevee.shadow_cube_size = "1024"
scene.eevee.use_ssr_refraction = False

# --- scrivania e parete
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0))
cine.assign(bpy.context.object, cine.pbr_material("Desk", (0.030, 0.032, 0.036), roughness=0.45, specular=0.35))

bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 1.75, 0))
wall = bpy.context.object
wall.rotation_euler = (math.radians(90), 0, 0)
cine.assign(wall, cine.pbr_material("Wall", (0.040, 0.043, 0.048), roughness=0.9, specular=0.08))

# --- monitor: scocca + schermo emissivo
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 1.10, 0.44))
bezel = bpy.context.object
bezel.scale = (1.30, 0.045, 0.80)
cine.assign(bezel, cine.pbr_material("Bezel", (0.020, 0.021, 0.024), roughness=0.4, specular=0.5))

bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 1.074, 0.44))
screen = bpy.context.object
screen.rotation_euler = (math.radians(90), 0, 0)
screen.scale = (1.24, 0.74, 1.0)
cine.assign(screen, cine.pbr_material(
    "Screen", (0.055, 0.075, 0.100), roughness=0.25, specular=0.3,
    emission_rgb=(0.09, 0.14, 0.21), emission_strength=1.15))

# piede del monitor
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 1.10, 0.055))
foot = bpy.context.object
foot.scale = (0.34, 0.20, 0.11)
cine.assign(foot, cine.pbr_material("Foot", (0.022, 0.023, 0.026), roughness=0.45, specular=0.5))

# --- righe del questionario sullo schermo (illeggibili): barre emissive tenui
row_mat = cine.pbr_material("Row", (0.30, 0.36, 0.44), roughness=0.5, specular=0.2,
                            emission_rgb=(0.34, 0.45, 0.56), emission_strength=0.85)
rows = []
N_ROWS = 26
for i in range(N_ROWS):
    w = 0.36 + ((i * 7) % 5) * 0.165   # max 1.02, dentro lo schermo (1.24)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(-0.56 + w / 2, 1.070, 0.0))
    r = bpy.context.object
    r.rotation_euler = (math.radians(90), 0, 0)
    r.scale = (w, 0.017, 1.0)
    cine.assign(r, row_mat)
    rows.append((r, i))

# --- casella non compilata: cornice piu' chiara al centro dello schermo
bpy.ops.mesh.primitive_plane_add(size=1, location=(0.36, 1.068, 0.30))
box = bpy.context.object
box.rotation_euler = (math.radians(90), 0, 0)
box.scale = (0.26, 0.13, 1.0)
cine.assign(box, cine.pbr_material("EmptyField", (0.10, 0.13, 0.17), roughness=0.35, specular=0.3,
                                   emission_rgb=(0.30, 0.44, 0.60), emission_strength=1.4))

# --- tastiera: base + griglia di tasti
bpy.ops.mesh.primitive_cube_add(size=1, location=(0.02, 0.30, 0.018))
kb = bpy.context.object
kb.scale = (0.98, 0.34, 0.036)
cine.assign(kb, cine.pbr_material("Keyboard", (0.026, 0.027, 0.030), roughness=0.55, specular=0.4))

key_mat = cine.pbr_material("Key", (0.048, 0.050, 0.055), roughness=0.6, specular=0.35)
for r in range(4):
    for c in range(14):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.44 + c * 0.068, 0.19 + r * 0.062, 0.040))
        k = bpy.context.object
        k.scale = (0.052, 0.046, 0.010)
        cine.assign(k, key_mat)

# --- fogli sulla scrivania
paper_mat = cine.pbr_material("Paper", (0.62, 0.62, 0.60), roughness=0.7, specular=0.2)
for i, (px, py, rz) in enumerate([(-1.05, 0.45, 8.0), (-0.98, 0.38, -5.0)]):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(px, py, 0.004 + i * 0.004))
    pg = bpy.context.object
    pg.scale = (0.52, 0.70, 0.004)
    pg.rotation_euler = (0, 0, math.radians(rz))
    cine.assign(pg, paper_mat)

# --- calendario a muro con una data cerchiata (nessun anno leggibile)
bpy.ops.mesh.primitive_cube_add(size=1, location=(1.42, 1.70, 0.86))
cal = bpy.context.object
cal.scale = (0.62, 0.02, 0.80)
cine.assign(cal, cine.pbr_material("Calendar", (0.30, 0.31, 0.32), roughness=0.75, specular=0.15))

cell_mat = cine.pbr_material("Cell", (0.20, 0.21, 0.22), roughness=0.7, specular=0.15)
mark_mat = cine.pbr_material("Mark", (0.33, 0.55, 0.80), roughness=0.4, specular=0.4,
                             emission_rgb=(0.33, 0.55, 0.80), emission_strength=0.9)
for r in range(5):
    for c in range(6):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(1.42 - 0.22 + c * 0.088, 1.688, 1.10 - r * 0.105))
        cell = bpy.context.object
        cell.scale = (0.062, 0.006, 0.062)
        cine.assign(cell, mark_mat if (r == 2 and c == 3) else cell_mat)

# --- luci: lo schermo illumina, piu' un fill freddo molto tenue
cine.add_area_light((0, 0.60, 0.55), (98, 0, 0), energy=26, size=2.2, color=(0.55, 0.70, 0.95))
cine.add_area_light((-2.6, -0.9, 1.7), (55, 0, -40), energy=14, size=3.0, color=(0.62, 0.72, 0.90))

# --- camera: due inquadrature, stacco netto a meta' scena
cam = cine.add_camera((0.02, -0.85, 0.50), (78, 0, 0), lens=40.0, focus_distance=1.92, fstop=2.0)

CUT = int(N_FRAMES * 0.52)


def animate(f):
    if f < CUT:
        # A: primo piano sullo schermo, push-in lentissimo
        t = (f - 1) / max(1, CUT - 1)
        cam.location = (0.02 - t * 0.04, -0.85 + t * 0.13, 0.50 - t * 0.012)
        cam.rotation_euler = (math.radians(78 + t * 1.2), 0, 0)
        cam.data.lens = 40.0
        cam.data.dof.focus_distance = 1.92 - t * 0.12
        cam.data.dof.aperture_fstop = 2.0
    else:
        # B: inquadratura ampia della scrivania col calendario, leggero slider
        t = (f - CUT) / max(1, N_FRAMES - CUT)
        cam.location = (-0.35 + t * 0.30, -1.95, 1.02)
        cam.rotation_euler = (math.radians(70), 0, math.radians(-4 + t * 3))
        cam.data.lens = 34.0
        cam.data.dof.focus_distance = 2.65
        cam.data.dof.aperture_fstop = 3.2

    # scroll delle righe sullo schermo (rapido, illeggibile)
    PERIOD, HALF = 0.68, 0.34
    for r, i in rows:
        y = ((i * (PERIOD / N_ROWS) - f * 0.0075) % PERIOD) - HALF
        r.location.z = 0.44 + y


cine.render_frames(OUT_DIR, N_FRAMES, animate)
