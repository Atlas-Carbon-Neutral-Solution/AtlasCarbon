"""
SC04 — scena 3D reale: interno impianto, notte. Prima il contatore elettrico con
le cifre che avanzano, poi una valvola che perde vapore in un angolo buio,
illuminata da una torcia in movimento (§5).

Uso: blender -b --factory-startup --python sc04_plant.py -- <out_dir> <n_frames> [res_x] [res_y]
"""
import bpy
import sys
import math
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cine

OUT_DIR, N_FRAMES, RES_X, RES_Y, ONLY = cine.parse_argv(sys.argv[sys.argv.index("--") + 1:])

cine.reset_scene()
scene = cine.setup_eevee(RES_X, RES_Y, samples=16, world_rgb=(0.004, 0.0045, 0.005))
scene.eevee.shadow_cube_size = "1024"
scene.eevee.use_ssr_refraction = False


def soft_steam_material(name):
    """Billboard di vapore con alpha a gradiente radiale: bordi morbidi, non un
    rettangolo. Ritorna (mat, nodo_moltiplicatore) per animare l'opacita'."""
    mat = cine.pbr_material(name, (0.52, 0.55, 0.58), roughness=0.98, specular=0.02)
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")

    coord = nt.nodes.new("ShaderNodeTexCoord")
    grad = nt.nodes.new("ShaderNodeTexGradient")
    grad.gradient_type = "SPHERICAL"
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.62   # bordo: trasparente
    ramp.color_ramp.elements[1].position = 1.00   # centro: pieno
    mult = nt.nodes.new("ShaderNodeMath")
    mult.operation = "MULTIPLY"
    mult.inputs[1].default_value = 0.12

    nt.links.new(coord.outputs["Object"], grad.inputs["Vector"])
    nt.links.new(grad.outputs["Color"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], mult.inputs[0])
    nt.links.new(mult.outputs[0], bsdf.inputs["Alpha"])

    mat.blend_method = "BLEND"
    mat.shadow_method = "NONE"
    return mat, mult


# --- pavimento e parete di cemento
bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0))
cine.assign(bpy.context.object, cine.pbr_material("Floor", (0.020, 0.020, 0.022), roughness=0.82, specular=0.2))

bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 2.6, 0))
wall = bpy.context.object
wall.rotation_euler = (math.radians(90), 0, 0)
cine.assign(wall, cine.pbr_material("Wall", (0.026, 0.027, 0.029), roughness=0.92, specular=0.1))

steel = cine.pbr_material("Steel", (0.10, 0.105, 0.115), roughness=0.42, metallic=0.85, specular=0.6)
steel_dark = cine.pbr_material("SteelDark", (0.055, 0.058, 0.062), roughness=0.55, metallic=0.7, specular=0.5)

# --- tubazioni orizzontali a profondita' diverse
for (px, pz, rad, ln) in [(0.0, 1.05, 0.115, 9.0), (0.0, 0.42, 0.075, 9.0), (0.0, 1.72, 0.055, 9.0)]:
    bpy.ops.mesh.primitive_cylinder_add(radius=rad, depth=ln, location=(px, 2.15, pz), vertices=40)
    pipe = bpy.context.object
    pipe.rotation_euler = (0, math.radians(90), 0)
    cine.assign(pipe, steel)

# staffe a muro
for sx in (-2.4, -0.8, 0.8, 2.4):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(sx, 2.34, 1.05))
    br = bpy.context.object
    br.scale = (0.07, 0.34, 0.05)
    cine.assign(br, steel_dark)

# --- valvola sul tubo principale: corpo + volantino
bpy.ops.mesh.primitive_cylinder_add(radius=0.165, depth=0.26, location=(0.55, 2.15, 1.05), vertices=32)
body = bpy.context.object
body.rotation_euler = (0, math.radians(90), 0)
cine.assign(body, steel)

bpy.ops.mesh.primitive_cylinder_add(radius=0.055, depth=0.30, location=(0.55, 2.15, 1.26), vertices=24)
cine.assign(bpy.context.object, steel_dark)

bpy.ops.mesh.primitive_torus_add(major_radius=0.19, minor_radius=0.028, location=(0.55, 2.15, 1.42), major_segments=44)
wheel = bpy.context.object
cine.assign(wheel, steel_dark)
for a in range(4):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.016, depth=0.36, location=(0.55, 2.15, 1.42), vertices=12)
    spoke = bpy.context.object
    spoke.rotation_euler = (0, math.radians(90), math.radians(a * 45))
    cine.assign(spoke, steel_dark)

# --- vapore: billboard alpha che salgono dalla giunzione della valvola
steam_pairs = [soft_steam_material(f"Steam{i}") for i in range(7)]
steam = []
for i in range(7):
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0.42, 2.02, 1.20))
    s = bpy.context.object
    s.rotation_euler = (math.radians(90), 0, 0)
    s.scale = (0.20, 0.24, 1.0)
    cine.assign(s, steam_pairs[i][0])
    steam.append((s, steam_pairs[i][1], i))

# --- contatore elettrico a muro: scocca, display, cifre 3D emissive
# colonna di supporto
bpy.ops.mesh.primitive_cube_add(size=1, location=(-1.55, 1.55, 1.05))
col = bpy.context.object
col.scale = (0.95, 0.34, 2.10)
cine.assign(col, cine.pbr_material("Column", (0.031, 0.032, 0.035), roughness=0.9, specular=0.1))

bpy.ops.mesh.primitive_cube_add(size=1, location=(-1.55, 1.35, 1.15))
mbox = bpy.context.object
mbox.scale = (0.78, 0.22, 0.60)
cine.assign(mbox, cine.pbr_material("MeterBox", (0.070, 0.073, 0.078), roughness=0.55, specular=0.4))

bpy.ops.mesh.primitive_cube_add(size=1, location=(-1.55, 1.225, 1.24))
disp = bpy.context.object
disp.scale = (0.60, 0.03, 0.20)
cine.assign(disp, cine.pbr_material("Display", (0.010, 0.010, 0.010), roughness=0.25, specular=0.5))

amber = cine.pbr_material("Amber", (0.95, 0.62, 0.18), roughness=0.4, specular=0.3,
                          emission_rgb=(1.0, 0.62, 0.16), emission_strength=5.0)
digits = []
for i in range(6):
    bpy.ops.object.text_add(location=(-1.80 + i * 0.098, 1.202, 1.175))
    txt = bpy.context.object
    txt.data.body = "0"
    txt.data.size = 0.135
    txt.data.extrude = 0.004
    txt.data.align_x = "CENTER"
    txt.rotation_euler = (math.radians(90), 0, 0)
    cine.assign(txt, amber)
    digits.append(txt)

# --- luci: ambiente notturno molto basso + torcia in movimento
cine.add_area_light((-2.0, -1.0, 3.2), (28, 0, -20), energy=30, size=5.0, color=(0.62, 0.58, 0.54))
torch = cine.add_spot((1.9, -1.5, 1.55), (74, 0, 34), energy=900, spot_size_deg=52, blend=0.55,
                      color=(1.0, 0.93, 0.80))

# --- camera: A sul contatore, B sulla valvola col vapore
cam = cine.add_camera((-1.52, -0.05, 1.235), (87, 0, -1), lens=45.0, focus_distance=1.42, fstop=2.2)

CUT = int(N_FRAMES * 0.46)


def digit_at(f, slot):
    return str(int(abs(math.sin(f * 0.31 + slot * 7.7)) * 10) % 10)


def handheld(f, amp=1.0):
    """Micro-instabilita' da spalla: qui la luce e' una torcia in mano, non un
    faro su cavalletto, e l'inquadratura deve dirlo."""
    return (math.sin(f * 0.31) * 0.006 * amp,
            math.sin(f * 0.23 + 1.7) * 0.005 * amp,
            math.sin(f * 0.41 + 0.6) * 0.004 * amp)


def animate(f):
    for i, txt in enumerate(digits):
        txt.data.body = digit_at(f, i)

    if f < CUT:
        # A: contatore, lento push-in laterale
        t = (f - 1) / max(1, CUT - 1)
        cam.location = (-1.52 + t * 0.06, -0.05 + t * 0.20, 1.235 - t * 0.008)
        cam.rotation_euler = (math.radians(87), 0, math.radians(-1 + t * 1.2))
        cam.data.lens = 38.0
        dx, dy, dz = handheld(f, 0.8)
        cam.location = (cam.location[0] + dx, cam.location[1] + dy, cam.location[2] + dz)
        cam.data.dof.focus_distance = 1.45 - t * 0.20
        cam.data.dof.aperture_fstop = 2.2
        torch.location = (-0.55, 0.10, 2.05)
        torch.rotation_euler = (math.radians(46), 0, math.radians(-16))
        torch.data.energy = 560
    else:
        # B: valvola che perde vapore, torcia che spazza
        t = (f - CUT) / max(1, N_FRAMES - CUT)
        cam.location = (1.30 - t * 0.26, -0.55, 1.20 + t * 0.05)
        cam.rotation_euler = (math.radians(88.5), 0, math.radians(15 - t * 4))
        cam.data.lens = 72.0
        dx, dy, dz = handheld(f, 1.4)
        cam.location = (cam.location[0] + dx, cam.location[1] + dy, cam.location[2] + dz)
        cam.data.dof.focus_distance = 2.80
        cam.data.dof.aperture_fstop = 2.0
        torch.location = (1.6 - t * 1.9, -1.2, 1.45)
        torch.rotation_euler = (math.radians(72), 0, math.radians(30 - t * 40))
        torch.data.energy = 820

    # vapore: sale, si allarga, sfuma
    for s, mult, i in steam:
        ph = ((f * 0.014) + i * 0.143) % 1.0
        s.location.z = 1.16 + ph * 0.85
        s.location.x = 0.44 + math.sin((f * 0.05) + i) * 0.06 + ph * 0.07
        gro = 0.13 + i * 0.012 + ph * 0.22
        s.scale = (gro, gro * 1.25, 1.0)
        fade = math.sin(min(1.0, ph / 0.22) * math.pi * 0.5) * (1.0 - ph) ** 0.8
        mult.inputs[1].default_value = max(0.0, 0.24 * fade * (1.0 if f >= CUT else 0.30))


cine.render_frames(OUT_DIR, N_FRAMES, animate, only=ONLY)
