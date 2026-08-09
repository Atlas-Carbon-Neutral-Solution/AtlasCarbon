"""
SC05 movimento 2 — "Dati satellitari" (150 frame @25fps, esatti).

Sostituisce il vecchio "pianeta con anello" (che leggeva come Saturno, estraneo
al messaggio e fermo su se stesso). Qui: lembo di un pianeta con rilievo
procedurale vero, atmosfera sottile in controluce, e un satellite di
osservazione che transita in primo piano con pannelli solari e antenna.

La camera si muove per tutti i 150 frame e il satellite attraversa il campo:
nessun fotogramma statico, nessuna inquadratura che si chiude sul nulla.
"""
import bpy
import math
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import cine

OUT_DIR, N_FRAMES, RES_X, RES_Y, ONLY = cine.parse_argv(sys.argv[sys.argv.index("--") + 1:])

cine.reset_scene()
cine.setup_eevee(RES_X, RES_Y, samples=10, bloom=True, world_rgb=(0.0016, 0.0020, 0.0030))
bpy.context.scene.eevee.bloom_intensity = 0.075
bpy.context.scene.eevee.bloom_radius = 6.5
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

land = cine.pbr_material("Land", (0.082, 0.088, 0.096), roughness=0.86, specular=0.28)
atmo = cine.pbr_material("Atmo", (0.10, 0.26, 0.44), roughness=0.9,
                         emission_rgb=(0.16, 0.42, 0.70), emission_strength=0.55)
sat_body = cine.pbr_material("SatBody", (0.115, 0.120, 0.128), roughness=0.42, metallic=0.55)
foil = cine.pbr_material("Foil", (0.62, 0.52, 0.22), roughness=0.28, metallic=0.85)
panel = cine.pbr_material("Panel", (0.028, 0.045, 0.085), roughness=0.20, metallic=0.35,
                          emission_rgb=(0.05, 0.11, 0.22), emission_strength=0.6)
panel_grid = cine.pbr_material("PanelGrid", (0.140, 0.150, 0.165), roughness=0.5, metallic=0.6)
dish = cine.pbr_material("Dish", (0.320, 0.330, 0.345), roughness=0.34, metallic=0.80)
led = cine.pbr_material("Led", AZZURRO, roughness=0.3, emission_rgb=AZZURRO, emission_strength=14.0)

# ---------------------------------------------------------------- pianeta
bpy.ops.mesh.primitive_ico_sphere_add(radius=220.0, subdivisions=6, location=(0, 980, -560))
planet = bpy.context.object
cine.assign(planet, land)
cine.displace_terrain(planet, scale=88.0, strength=12.0, seed=1)
cine.displace_terrain(planet, scale=26.0, strength=3.8, seed=2)
bpy.ops.object.shade_smooth()

# Nessun guscio d'atmosfera in alpha-blend: occludeva la superficie e il pianeta
# leggeva come un disco ciano piatto. Il filo sul limbo viene dal sole radente
# piu' il bloom, che e' anche il modo in cui si forma davvero.

# ---------------------------------------------------------------- satellite
sat = bpy.data.objects.new("SatRoot", None)
bpy.context.collection.objects.link(sat)


def child(obj):
    obj.parent = sat
    obj.matrix_parent_inverse = sat.matrix_world.inverted()
    return obj


def box(loc, scale, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.scale = scale
    o.rotation_euler = tuple(math.radians(a) for a in rot)
    cine.assign(o, mat)
    return child(o)


def cyl(loc, r, h, mat, rot=(0, 0, 0), verts=24):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, vertices=verts)
    o = bpy.context.object
    o.rotation_euler = tuple(math.radians(a) for a in rot)
    cine.assign(o, mat)
    return child(o)


box((0, 0, 0), (0.90, 0.82, 1.15), sat_body)                 # bus
box((0, 0, 0), (0.93, 0.85, 0.30), foil)                      # coibentazione dorata
for s in (-1, 1):                                             # ali fotovoltaiche
    cyl((s * 0.62, 0, 0), 0.045, 0.42, panel_grid, rot=(0, 90, 0))
    for k in range(3):
        box((s * (1.05 + k * 1.02), 0, 0), (0.98, 0.62, 0.022), panel)
        box((s * (1.05 + k * 1.02), 0, 0), (0.99, 0.03, 0.026), panel_grid)
        box((s * (1.05 + k * 1.02), 0, 0), (0.03, 0.63, 0.026), panel_grid)
bpy.ops.mesh.primitive_cone_add(radius1=0.30, radius2=0.05, depth=0.26, location=(0, -0.62, 0.30),
                                vertices=24)
d = bpy.context.object
d.rotation_euler = (math.radians(-90), 0, 0)
cine.assign(d, dish)
child(d)
cyl((0, -0.80, 0.30), 0.012, 0.30, panel_grid, rot=(90, 0, 0))     # feed dell'antenna
box((0, 0.10, -0.72), (0.34, 0.34, 0.30), sat_body)                 # sensore verso il pianeta
cyl((0, 0.10, -0.90), 0.10, 0.06, dish, verts=20)
cyl((0.30, -0.30, 0.60), 0.018, 0.028, led, verts=12)               # led di stato

# ---------------------------------------------------------------- luce
sun = cine.add_sun((76.0, 0.0, -62.0), energy=8.5, color=(1.0, 0.95, 0.90), angle_deg=0.53)
cine.add_area_light((-16, -14, 10), (58, 0, -40), energy=420, size=14,
                    color=(0.24, 0.34, 0.52))       # debole rimbalzo dal pianeta

# ---------------------------------------------------------------- camera
cam = cine.add_camera((0, -13.5, 3.0), (0, 0, 0), lens=48.0, focus_distance=13.0, fstop=3.2)
cam.data.clip_end = 6000.0
cam.data.clip_start = 0.05

SAT_FROM = (6.6, 2.2, 1.0)
SAT_TO = (-5.8, -0.6, -2.6)


def per_frame(f):
    t = cine.seg(f, 1, N_FRAMES)
    lin = (f - 1) / max(1, N_FRAMES - 1)

    # il satellite attraversa il campo per tutta la durata
    sat.location = cine.lerp3(SAT_FROM, SAT_TO, lin)
    sat.rotation_euler = (math.radians(6.0 + 10.0 * lin), math.radians(-18.0 + 26.0 * lin),
                          math.radians(4.0 * math.sin(lin * 3.1)))

    # orbita lenta della camera: il limbo del pianeta ruota nel fotogramma
    ang = math.radians(-11.0 + 19.0 * t)
    rad = 11.4 - 1.9 * t
    cam.location = (math.sin(ang) * rad, -math.cos(ang) * rad, 1.6 + 1.5 * t)
    cine.look_at(cam, cine.lerp3((2.2, 11.0, -3.0), (-2.0, 10.0, -5.4), t), roll_deg=-2.0 + 4.5 * t)
    cam.data.lens = 46.0 + 12.0 * t
    cam.data.dof.focus_distance = (cam.location - sat.location).length
    # il pianeta ruota su se stesso: nessun elemento della scena e' fermo
    planet.rotation_euler.z = 0.045 * lin


cine.render_frames(OUT_DIR, N_FRAMES, per_frame, only=ONLY)
