"""
SC08 — fondale per "La prova (chi parla)" (1 fotogramma, 1920x1080, alta qualita').

Un solo frame renderizzato con cura: piastra d'acciaio fresata su un piano scuro,
luce radente da sinistra, foschia sottile. In Remotion riceve un movimento lento
di scala/posizione (Ken Burns), che a queste dimensioni e' indistinguibile da un
carrello ed evita di pagare 200 fotogrammi per un fondale.

Austero per scelta: in SC08 il contenuto e' il testo, il fondale non deve
competere. Nessun dato leggibile, nessun logo (§2.2).
"""
import bpy
import math
import random
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import cine

OUT_DIR, N_FRAMES, RES_X, RES_Y, ONLY = cine.parse_argv(sys.argv[sys.argv.index("--") + 1:])
rnd = random.Random(31)

cine.reset_scene()
cine.setup_eevee(RES_X, RES_Y, samples=64, bloom=True,
                 world_rgb=(0.008, 0.009, 0.011), volumetrics=True, vol_end=22.0)
bpy.context.scene.eevee.bloom_intensity = 0.030

steel = cine.pbr_material("Steel", (0.072, 0.077, 0.083), roughness=0.44, metallic=0.40,
                          bump=0.030)
mill = cine.pbr_material("Mill", (0.092, 0.098, 0.106), roughness=0.30, metallic=0.50)
floor = cine.pbr_material("Floor", (0.014, 0.015, 0.018), roughness=0.40, specular=0.58)
edge = cine.pbr_material("Edge", (0.078, 0.082, 0.088), roughness=0.55, metallic=0.35)


def box(loc, scale, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.scale = scale
    o.rotation_euler = tuple(math.radians(a) for a in rot)
    cine.assign(o, mat)
    return o


box((0, 0, -0.06), (40.0, 24.0, 0.12), floor)
wall = cine.pbr_material("Wall", (0.038, 0.041, 0.046), roughness=0.92, specular=0.20)
box((0, 2.4, 1.35), (16.0, 0.30, 5.0), wall)                  # parete di fondo

# piastra principale, leggermente ruotata: nessun allineamento perfetto
plate = box((0.35, 0.0, 0.42), (3.60, 2.30, 0.16), steel, rot=(0, 0, -4.0))
cine.bevel_edges(plate, width=0.010, segments=3)
box((0.35, 0.0, 0.505), (3.44, 2.16, 0.008), mill, rot=(0, 0, -4.0))
for i in range(22):                                            # solchi di fresatura
    box((-1.30 + i * 0.155, 0.0, 0.508), (0.012, 2.10, 0.004), edge, rot=(0, 0, -4.0))
for k in range(4):                                             # fori agli angoli
    bpy.ops.mesh.primitive_cylinder_add(radius=0.052, depth=0.20,
                                        location=(0.35 + (-1.55 if k % 2 else 1.55),
                                                  (-0.92 if k < 2 else 0.92), 0.42), vertices=20)
    cine.assign(bpy.context.object, edge)

cine.add_area_light((-5.2, -2.6, 2.6), (62, 0, -46), energy=150, size=1.6, color=(1.0, 0.95, 0.90))
cine.add_area_light((4.6, -1.4, 1.2), (78, 0, 44), energy=26, size=2.0, color=(0.56, 0.68, 0.86))
cine.add_fog_volume((0, 0, 1.4), (24.0, 12.0, 4.0), density=0.007, color=(0.58, 0.62, 0.70))

cam = cine.add_camera((-2.6, -4.6, 1.55), (0, 0, 0), lens=40.0, focus_distance=5.4, fstop=2.2)
cine.look_at(cam, (0.35, 0.1, 0.46))


def per_frame(f):
    pass


cine.render_frames(OUT_DIR, N_FRAMES, per_frame, only=ONLY)
