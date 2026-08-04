"""
SC06 — Efficientamento energetico (TC 00:48-01:00, 300 frame @25fps).

Nodo di tubazioni reale in 3D: collettore, valvola a volantino, coibentazione
in lamiera, staffe a muro. Lo script chiede un taglio A/B secco sulla STESSA
inquadratura: qui e' letterale, la camera non si muove fra A e B.

  A  1-130    luce di servizio: il nodo "normale", niente sembra sbagliato
  B  131-215  stacco netto: identica inquadratura in mappa termica, il tratto
              scoibentato brucia in bianco-ambra
  C  216-300  coibentazione applicata, la mappa torna uniforme

Palette IR ambra/ciano: NON usa il verde e l'azzurro di marchio, che restano
riservati agli elementi grafici (§V01).
"""
import bpy
import math
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import cine

OUT_DIR, N_FRAMES, RES_X, RES_Y, ONLY = cine.parse_argv(sys.argv[sys.argv.index("--") + 1:])

cine.reset_scene()
cine.setup_eevee(RES_X, RES_Y, samples=12, bloom=True,
                 world_rgb=(0.006, 0.007, 0.009), volumetrics=True, vol_end=24.0)
bpy.context.scene.eevee.bloom_intensity = 0.045
bpy.context.scene.eevee.bloom_radius = 5.0
bpy.context.scene.eevee.bokeh_max_size = 32
bpy.context.scene.eevee.bokeh_max_size = 32
_ee = bpy.context.scene.eevee
# Costo dominante su GL software: ombre e volumetriche. Con cube map a 1024 e
# ombre dure queste scene sono visivamente equivalenti e girano ~3 volte piu'
# veloci (la grana del master assorbe il rumore residuo dei campioni ridotti).
_ee.shadow_cube_size = "1024"
_ee.shadow_cascade_size = "1024"
_ee.use_soft_shadows = False


# ---------------------------------------------------------------- materiali
wall = cine.pbr_material("Wall", (0.088, 0.092, 0.098), roughness=0.90, specular=0.22)
pipe_m = cine.pbr_material("Pipe", (0.150, 0.155, 0.162), roughness=0.46, metallic=0.80)
clad = cine.pbr_material("Clad", (0.330, 0.345, 0.360), roughness=0.30, metallic=0.92)
bare = cine.pbr_material("Bare", (0.128, 0.108, 0.082), roughness=0.78, specular=0.30)
wheel_m = cine.pbr_material("Wheel", (0.185, 0.062, 0.048), roughness=0.62)
bolt_m = cine.pbr_material("Bolt", (0.095, 0.100, 0.106), roughness=0.52, metallic=0.70)

# Termico: emissivi puri, cosi' in B la geometria si legge come irraggiamento e
# non come oggetto illuminato.
def ir(name, rgb, strength):
    return cine.pbr_material(name, (0.02, 0.02, 0.02), roughness=0.9,
                             emission_rgb=rgb, emission_strength=strength)


ir_bg = ir("IRBg", (0.012, 0.030, 0.058), 0.85)         # fondo: quasi nero-blu
ir_cold = ir("IRCold", (0.030, 0.085, 0.150), 0.55)     # superfici fredde
ir_cool = ir("IRCool", (0.100, 0.250, 0.360), 2.4)
ir_warm = ir("IRWarm", (0.620, 0.330, 0.080), 5.5)
ir_hot = ir("IRHot", (1.000, 0.640, 0.150), 14.0)
ir_peak = ir("IRPeak", (1.000, 0.920, 0.720), 26.0)


def cyl(loc, r, h, mat, rot=(0, 0, 0), verts=32):
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


def torus(loc, maj, mnor, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(location=loc, major_radius=maj, minor_radius=mnor,
                                     major_segments=28, minor_segments=10)
    o = bpy.context.object
    o.rotation_euler = tuple(math.radians(a) for a in rot)
    cine.assign(o, mat)
    return o


# ---------------------------------------------------------------- parete e pavimento
box((0, 1.05, 1.2), (9.0, 0.20, 4.4), wall)
box((0, -1.0, -0.02), (9.0, 6.0, 0.06), cine.pbr_material("Floor", (0.052, 0.055, 0.058),
                                                          roughness=0.70, specular=0.35))
for i in range(6):                                   # fughe / pannellatura della parete
    box((-4.0 + i * 1.6, 0.94, 1.2), (0.035, 0.02, 4.4), cine.pbr_material(f"Seam{i}", (0.045, 0.048, 0.052), roughness=0.9))

# ---------------------------------------------------------------- tubazione principale
PIPE_Z = 1.34
PIPE_R = 0.135
# Il tratto SCOIBENTATO e' il difetto: lo si vede solo in termica.
GAP_X0, GAP_X1 = 0.10, 1.05

main_pipe = cyl((0, 0.55, PIPE_Z), PIPE_R, 8.4, pipe_m, rot=(0, 90, 0))

# coibentazione in lamiera, a segmenti, con il vuoto in corrispondenza del difetto
CLAD_SEGS = []
seg_x = -4.1
while seg_x < 4.1:
    w = 0.62
    if not (seg_x + w > GAP_X0 and seg_x < GAP_X1):
        c = cyl((seg_x + w / 2, 0.55, PIPE_Z), PIPE_R * 1.42, w, clad, rot=(0, 90, 0))
        CLAD_SEGS.append(c)
        cyl((seg_x + 0.02, 0.55, PIPE_Z), PIPE_R * 1.50, 0.035, bolt_m, rot=(0, 90, 0))
    seg_x += w
# Tratto nudo (metallo ossidato), quello che disperde. Segmentato in anelli:
# in termica ogni anello prende un livello diverso e nasce un gradiente vero,
# non una macchia bianca uniforme.
N_SEG = 9
SEG_W = (GAP_X1 - GAP_X0) / N_SEG
BARE_SEGS = []
for i in range(N_SEG):
    sx = GAP_X0 + SEG_W * (i + 0.5)
    BARE_SEGS.append(cyl((sx, 0.55, PIPE_Z), PIPE_R * 1.04, SEG_W * 1.02, bare, rot=(0, 90, 0)))
bare_pipe = BARE_SEGS[N_SEG // 2]

# la coibentazione che verra' applicata in C: presente ma nascosta all'inizio
patch = cyl(((GAP_X0 + GAP_X1) / 2, 0.55, PIPE_Z), PIPE_R * 1.42, GAP_X1 - GAP_X0, clad, rot=(0, 90, 0))
patch.scale = (1.0, 1.0, 0.001)

# ---------------------------------------------------------------- valvola
VX = -1.62
valve_body = cyl((VX, 0.55, PIPE_Z), PIPE_R * 1.65, 0.42, pipe_m, rot=(0, 90, 0))
torus((VX - 0.21, 0.55, PIPE_Z), PIPE_R * 1.72, 0.028, bolt_m, rot=(0, 90, 0))
torus((VX + 0.21, 0.55, PIPE_Z), PIPE_R * 1.72, 0.028, bolt_m, rot=(0, 90, 0))
stem = cyl((VX, 0.55, PIPE_Z + 0.34), 0.030, 0.56, bolt_m)
wheel = torus((VX, 0.55, PIPE_Z + 0.60), 0.205, 0.028, wheel_m, rot=(0, 0, 0))
WHEEL_SPOKES = []
for k in range(5):
    a = k * (2 * math.pi / 5)
    sp = box((VX + math.cos(a) * 0.10, 0.55 + math.sin(a) * 0.10, PIPE_Z + 0.60),
             (0.205, 0.022, 0.014), wheel_m, rot=(0, 0, math.degrees(a)))
    WHEEL_SPOKES.append(sp)

# ---------------------------------------------------------------- staffe, derivazioni
for x in (-3.4, -2.4, 2.1, 3.3):
    box((x, 0.80, PIPE_Z), (0.09, 0.42, 0.09), bolt_m)
    box((x, 0.55, PIPE_Z - 0.26), (0.24, 0.05, 0.34), bolt_m)
branch = cyl((2.62, 0.55, PIPE_Z - 0.55), 0.072, 1.05, pipe_m)
cyl((2.62, 0.55, PIPE_Z - 1.05), 0.115, 0.10, bolt_m)
gauge = cyl((-0.62, 0.34, PIPE_Z + 0.22), 0.072, 0.05, bolt_m, rot=(90, 0, 0))

# ---------------------------------------------------------------- luce (shot A e C)
key = cine.add_area_light((-2.2, -2.8, 3.1), (58, 0, -26), energy=340, size=2.2,
                          color=(1.0, 0.90, 0.78))
fill = cine.add_area_light((3.0, -2.6, 1.1), (72, 0, 40), energy=95, size=2.6,
                           color=(0.58, 0.70, 0.88))
rim = cine.add_spot((1.4, 1.6, 2.7), (128, 0, 14), energy=340, spot_size_deg=58, blend=0.6,
                    color=(0.86, 0.92, 1.0))
cine.add_fog_volume((0, -0.4, 1.5), (9.0, 5.0, 4.0), density=0.020, color=(0.60, 0.64, 0.70))

# ---------------------------------------------------------------- camera: FISSA fra A e B
CAM_AT = (-1.02, -4.30, 1.62)
CAM_LOOK = (-0.40, 0.55, 1.32)
cam = cine.add_camera(CAM_AT, (0, 0, 0), lens=34.0, focus_distance=4.9, fstop=2.8)
cine.look_at(cam, CAM_LOOK)

A_END = int(N_FRAMES * 0.433)      # ~130
B_END = int(N_FRAMES * 0.717)      # ~215

# Mappatura termica: ogni oggetto riceve il suo livello IR. Il tratto nudo e la
# porzione di tubo adiacente sono i soli "caldi".
# profilo di temperatura sul tratto scoibentato: picco al centro, decadimento
# verso le estremita' dove riprende la coibentazione
PROFILE = [ir_warm, ir_hot, ir_hot, ir_peak, ir_peak, ir_peak, ir_hot, ir_hot, ir_warm]
IR_MAP = [(BARE_SEGS[i], PROFILE[i]) for i in range(N_SEG)]
IR_MAP += [(main_pipe, ir_cool), (valve_body, ir_warm),
           (stem, ir_cool), (wheel, ir_cool), (branch, ir_cool), (gauge, ir_cool)]
BG_OBJS = set()

# Il cubo della foschia e' una mesh con materiale di VOLUME: se la mappatura
# termica gli assegna un emissivo di superficie, la camera (che sta dentro quel
# cubo) vede solo la sua faccia interna e il fotogramma diventa una campitura
# piatta. Va escluso dalla mappatura e nascosto in termica.
FOG_OBJS = [o for o in bpy.data.objects if o.name.startswith("FogVolume")]
FOG_NAMES = {o.name for o in FOG_OBJS}

BG_NAMES = {o.name for o in bpy.data.objects if o.type == "MESH" and o.name not in FOG_NAMES
            and (o.data.materials and o.data.materials[0].name.startswith(("Wall", "Floor", "Seam")))}

BASE_MATS = {o.name: (o.data.materials[0] if o.data.materials else None)
             for o in bpy.data.objects if o.type == "MESH"}


def set_thermal(on, cooled=False):
    for o in FOG_OBJS:
        o.hide_render = on
    for o in bpy.data.objects:
        if o.type != "MESH" or o.name in FOG_NAMES:
            continue
        if not on:
            m = BASE_MATS.get(o.name)
            if m:
                cine.assign(o, m)
            continue
        target = None
        for obj, mat in IR_MAP:
            if o is obj:
                target = mat
                break
        if target is None:
            target = ir_bg if o.name in BG_NAMES else ir_cold
        if cooled and o in BARE_SEGS:
            target = ir_cool            # coibentato: non irradia piu' come prima
        if cooled and o is patch:
            target = ir_cool
        cine.assign(o, target)


def lights(on):
    for lt in (key, fill, rim):
        lt.hide_render = not on


def per_frame(f):
    if f <= A_END:
        set_thermal(False)
        lights(True)
        # il volantino gira lentamente: l'impianto e' in esercizio
        for k, sp in enumerate(WHEEL_SPOKES):
            a = k * (2 * math.pi / 5) + f * 0.006
            sp.location = (VX + math.cos(a) * 0.10, 0.55 + math.sin(a) * 0.10, PIPE_Z + 0.60)
            sp.rotation_euler.z = a
        patch.scale = (1.0, 1.0, 0.001)
        # micro-drift: anche l'inquadratura "fissa" respira
        cam.location = (CAM_AT[0] + math.sin(f * 0.04) * 0.007, CAM_AT[1],
                        CAM_AT[2] + math.sin(f * 0.031) * 0.005)
        cine.look_at(cam, CAM_LOOK)
    elif f <= B_END:
        # STACCO: stessa inquadratura, nessun movimento di camera, solo la termica
        set_thermal(True)
        lights(False)
        cam.location = CAM_AT
        cine.look_at(cam, CAM_LOOK)
        puls = 1.0 + 0.10 * math.sin((f - A_END) * 0.22)
        ir_peak.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 26.0 * puls
        ir_hot.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 14.0 * puls
        patch.scale = (1.0, 1.0, 0.001)
    else:
        # C: la coibentazione viene applicata e la mappa si uniforma
        t = cine.seg(f, B_END + 1, B_END + 46)
        set_thermal(True, cooled=t > 0.5)
        lights(False)
        patch.scale = (1.0, 1.0, max(0.001, t))
        ir_peak.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 26.0 * (1 - t) + 2.6 * t
        ir_hot.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 14.0 * (1 - t) + 2.8 * t
        # lento carrello indietro, l'unico movimento della scena: il problema e' chiuso
        tt = cine.seg(f, B_END + 1, N_FRAMES)
        cam.location = (CAM_AT[0] - 0.14 * tt, CAM_AT[1] - 0.70 * tt, CAM_AT[2] + 0.07 * tt)
        cine.look_at(cam, CAM_LOOK)
        cam.data.lens = 34.0 - 2.0 * tt


cine.render_frames(OUT_DIR, N_FRAMES, per_frame, only=ONLY)
