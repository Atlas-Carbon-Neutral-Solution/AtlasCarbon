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

OUT_DIR, N_FRAMES, RES_X, RES_Y, ONLY = cine.parse_argv(sys.argv[sys.argv.index("--") + 1:])

cine.reset_scene()
scene = cine.setup_eevee(RES_X, RES_Y, samples=14, world_rgb=(0.007, 0.008, 0.010),
                         volumetrics=True, vol_end=12.0)
scene.eevee.shadow_cube_size = "1024"
scene.eevee.use_ssr_refraction = False
scene.eevee.use_soft_shadows = False   # strisce della veneziana nette
scene.eevee.bokeh_max_size = 28

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

# --- finestra con veneziana a sinistra: e' la firma visiva dell'ufficio
# notturno, e distingue immediatamente questa scena dall'interno industriale di
# SC04 (che e' caldo, stretto e mosso). Le strisce sono OMBRE VERE proiettate da
# lamelle di geometria, non una texture.
blind_mat = cine.pbr_material("Blind", (0.055, 0.058, 0.064), roughness=0.85, specular=0.2)
frame_mat = cine.pbr_material("WinFrame", (0.045, 0.048, 0.053), roughness=0.8, specular=0.25)
WX = -2.05                       # parete di sinistra
for i in range(16):              # lamelle inclinate
    bpy.ops.mesh.primitive_cube_add(size=1, location=(WX, 0.35, 0.28 + i * 0.112))
    sl = bpy.context.object
    sl.scale = (0.03, 1.55, 0.040)
    sl.rotation_euler = (math.radians(26), 0, 0)
    cine.assign(sl, blind_mat)
for dz in (0.22, 1.94):          # traversi del telaio
    bpy.ops.mesh.primitive_cube_add(size=1, location=(WX, 0.35, dz))
    fr = bpy.context.object
    fr.scale = (0.06, 1.66, 0.06)
    cine.assign(fr, frame_mat)

# --- luci: lo schermo, la luce esterna che entra dalla veneziana, un fill tenue
cine.add_area_light((0, 0.60, 0.55), (98, 0, 0), energy=24, size=2.2, color=(0.55, 0.70, 0.95))
# rotazione (90,0,-90): la normale della lampada guarda verso +X, cioe' DENTRO
# la stanza. Con (90,0,90) puntava verso -X e la finestra non illuminava nulla.
street = cine.add_area_light((WX - 1.3, 0.35, 1.20), (90, 0, -90), energy=620, size=2.6,
                            color=(0.60, 0.74, 1.0))
street.data.spread = math.radians(22)     # fascio stretto: strisce nette
cine.add_area_light((-2.6, -0.9, 1.7), (55, 0, -40), energy=9, size=3.0, color=(0.62, 0.72, 0.90))
# un velo di foschia perche' il fascio della veneziana si veda nell'aria
cine.add_fog_volume((-0.6, 0.2, 0.9), (4.6, 3.4, 2.2), density=0.028, color=(0.62, 0.72, 0.92))

# polvere nel fascio della veneziana: senza particelle il fascio e' un
# gradiente, con le particelle e' aria
DUST = cine.add_motes((-0.7, 0.35, 0.95), (2.6, 2.0, 1.5), count=140,
                      radius=0.0028, seed=3, color=(0.80, 0.86, 0.96), strength=1.5)

# --- camera: due inquadrature, stacco netto a meta' scena
cam = cine.add_camera((-0.45, -1.15, 0.62), (80, 0, 0), lens=35.0, focus_distance=2.10, fstop=2.4)

CUT = int(N_FRAMES * 0.52)


def animate(f):
    if f < CUT:
        # A: primo piano sullo schermo, push-in lentissimo
        # A: carrello laterale da sinistra a destra — attraversa le strisce
        # della veneziana, cosi' la luce si muove sull'immagine
        t = (f - 1) / max(1, CUT - 1)
        cam.location = (-0.52 + t * 0.62, -1.15 + t * 0.10, 0.62 - t * 0.02)
        cam.rotation_euler = (math.radians(80 + t * 1.0), 0, math.radians(-3.0 + t * 5.0))
        cam.data.lens = 35.0
        cam.data.dof.focus_distance = 2.10 - t * 0.10
        cam.data.dof.aperture_fstop = 2.4
    else:
        # B: inquadratura ampia della scrivania col calendario, leggero slider
        # B: campo largo dell'ufficio, la stanza si legge come stanza
        t = (f - CUT) / max(1, N_FRAMES - CUT)
        cam.location = (-0.80 + t * 0.50, -2.45, 1.22)
        cam.rotation_euler = (math.radians(72), 0, math.radians(-7 + t * 5))
        cam.data.lens = 28.0
        cam.data.dof.focus_distance = 3.10
        cam.data.dof.aperture_fstop = 4.0

    cine.drift_motes(DUST, f, amp=0.02, speed=0.016)

    # scroll delle righe sullo schermo (rapido, illeggibile)
    PERIOD, HALF = 0.68, 0.34
    for r, i in rows:
        y = ((i * (PERIOD / N_ROWS) - f * 0.0075) % PERIOD) - HALF
        r.location.z = 0.44 + y


cine.render_frames(OUT_DIR, N_FRAMES, animate, only=ONLY)
