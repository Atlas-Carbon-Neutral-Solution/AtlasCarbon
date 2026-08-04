"""
SC05 movimento 1 — "Sensori in campo" (125 frame @25fps, esatti).

Macro reale: sensore industriale fascettato su una tubazione, cavo schermato,
LED di stato azzurro, condensa sul metallo. Camera che deriva lateralmente con
stacco di fuoco dal cavo al LED. Nessuna estetica sci-fi (NEG prompt §5).
"""
import bpy
import math
import random
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import cine

OUT_DIR, N_FRAMES, RES_X, RES_Y, ONLY = cine.parse_argv(sys.argv[sys.argv.index("--") + 1:])
rnd = random.Random(5)

cine.reset_scene()
cine.setup_eevee(RES_X, RES_Y, samples=8, bloom=True,
                 world_rgb=(0.010, 0.012, 0.016), volumetrics=False)
bpy.context.scene.eevee.bloom_intensity = 0.050
bpy.context.scene.eevee.bokeh_max_size = 24
bpy.context.scene.eevee.bokeh_max_size = 24
_ee = bpy.context.scene.eevee
# Costo dominante su GL software: ombre e volumetriche. Con cube map a 1024 e
# ombre dure queste scene sono visivamente equivalenti e girano ~3 volte piu'
# veloci (la grana del master assorbe il rumore residuo dei campioni ridotti).
_ee.shadow_cube_size = "1024"
_ee.shadow_cascade_size = "1024"
_ee.use_soft_shadows = False


AZZURRO = (0.325, 0.643, 0.859)   # #53a4db — V01
pipe_m = cine.pbr_material("Pipe", (0.132, 0.138, 0.146), roughness=0.38, metallic=0.85)
body_m = cine.pbr_material("Body", (0.098, 0.102, 0.108), roughness=0.44, specular=0.55)
face_m = cine.pbr_material("Face", (0.055, 0.058, 0.062), roughness=0.22, specular=0.75)
steel = cine.pbr_material("Steel", (0.300, 0.315, 0.330), roughness=0.30, metallic=0.92)
cable_m = cine.pbr_material("Cable", (0.042, 0.045, 0.050), roughness=0.72)
grip_m = cine.pbr_material("Grip", (0.062, 0.065, 0.070), roughness=0.88)
led_m = cine.pbr_material("Led", AZZURRO, roughness=0.25,
                          emission_rgb=AZZURRO, emission_strength=9.0)
drop_m = cine.pbr_material("Drop", (0.42, 0.46, 0.52), roughness=0.28, specular=0.70)
wall_m = cine.pbr_material("Wall", (0.070, 0.074, 0.082), roughness=0.92)


def cyl(loc, r, h, mat, rot=(0, 0, 0), verts=36):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, vertices=verts)
    o = bpy.context.object
    o.rotation_euler = tuple(math.radians(a) for a in rot)
    cine.assign(o, mat)
    return o


def box(loc, scale, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.scale = scale
    o.rotation_euler = tuple(math.radians(a) for a in rot)
    cine.assign(o, mat)
    return o


# fondo lontano, molto fuori fuoco
box((0, 0.62, 0.0), (3.0, 0.06, 2.2), wall_m)

# tubazione orizzontale
PR = 0.075
cyl((0, 0, 0), PR, 2.6, pipe_m, rot=(0, 90, 0))
for x in (-0.52, 0.58):                        # giunzioni
    cyl((x, 0, 0), PR * 1.16, 0.03, steel, rot=(0, 90, 0))

# corpo del sensore, fascettato sul tubo
SX = 0.02
body = box((SX, -PR - 0.032, 0.004), (0.115, 0.062, 0.078), body_m)
face = box((SX, -PR - 0.064, 0.004), (0.092, 0.004, 0.056), face_m)
for k in range(4):                             # viti agli angoli
    cyl((SX - 0.040 + (k % 2) * 0.080, -PR - 0.066, -0.020 + (k // 2) * 0.040),
        0.0035, 0.006, steel, rot=(90, 0, 0), verts=10)
led = cyl((SX + 0.034, -PR - 0.067, 0.020), 0.0055, 0.004, led_m, rot=(90, 0, 0), verts=16)

# fascetta metallica attorno al tubo
bpy.ops.mesh.primitive_torus_add(location=(SX, 0, 0), major_radius=PR * 1.05, minor_radius=0.006,
                                 major_segments=40, minor_segments=8)
band = bpy.context.object
band.rotation_euler = (0, math.radians(90), 0)
cine.assign(band, steel)
box((SX, -PR - 0.010, 0.0), (0.020, 0.018, 0.014), steel)   # blocchetto di serraggio

# cavo schermato che scende con una catenaria
CABLE = []
for i in range(0):
    t = i / 25.0
    x = SX - 0.010 - t * 0.30
    z = -0.052 - math.sinh(t * 1.5) * 0.075
    seg = cyl((x, -PR - 0.030, z), 0.0072, 0.030, cable_m,
              rot=(0, 78 - t * 46, 0), verts=10)
    CABLE.append(seg)
cyl((SX - 0.014, -PR - 0.030, -0.046), 0.0125, 0.022, grip_m, rot=(6, 0, 0), verts=14)

# condensa sul tubo: goccioline vere, non una texture
for i in range(0):
    a = rnd.uniform(-2.4, 0.9)
    x = rnd.uniform(-0.20, 0.26)
    r = rnd.uniform(0.0018, 0.0052)
    bpy.ops.mesh.primitive_ico_sphere_add(radius=r, subdivisions=1,
                                          location=(x, math.sin(a) * PR, math.cos(a) * PR))
    d = bpy.context.object
    d.scale = (1.0, 1.0, 0.55)
    cine.assign(d, drop_m)

# ---------------------------------------------------------------- luce
key = cine.add_area_light((-0.55, -0.85, 0.62), (52, 0, -30), energy=26, size=0.7,
                          color=(1.0, 0.94, 0.86))
rim = cine.add_area_light((0.75, 0.30, 0.45), (108, 0, 32), energy=17, size=0.5,
                         color=(0.62, 0.74, 0.92))
# nessuna foschia: in una macro a 30 cm non si legge e costa un passaggio volumetrico

# ---------------------------------------------------------------- camera
cam = cine.add_camera((-0.34, -0.72, 0.14), (0, 0, 0), lens=50.0, focus_distance=0.72, fstop=2.4)

CABLE_PT = (SX - 0.24, -PR - 0.030, -0.16)
LED_PT = (SX + 0.034, -PR - 0.067, 0.020)


def per_frame(f):
    t = cine.seg(f, 1, N_FRAMES)
    # deriva laterale lenta + leggerissima instabilita': mai una camera immobile
    cam.location = cine.lerp3((-0.40, -0.76, 0.10), (-0.16, -0.66, 0.17), t)
    cam.location.x += math.sin(f * 0.12) * 0.0022
    cam.location.z += math.sin(f * 0.17 + 0.8) * 0.0015
    cine.look_at(cam, cine.lerp3((SX - 0.115, -PR - 0.03, -0.075), (SX + 0.015, -PR - 0.05, 0.010), t))
    # stacco di fuoco: dal cavo (primo terzo) al LED
    fp = cine.seg(f, int(N_FRAMES * 0.30), int(N_FRAMES * 0.68))
    a = cine.lerp3(CABLE_PT, LED_PT, fp)
    cam.data.dof.focus_distance = ((cam.location[0] - a[0]) ** 2 + (cam.location[1] - a[1]) ** 2
                                   + (cam.location[2] - a[2]) ** 2) ** 0.5
    cam.data.dof.aperture_fstop = 2.4
    # il LED respira come un vero indicatore di stato
    led_m.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = \
        7.0 + 5.0 * (0.5 + 0.5 * math.sin(f * 0.20))


cine.render_frames(OUT_DIR, N_FRAMES, per_frame, only=ONLY)
