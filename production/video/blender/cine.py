"""
Helper condiviso per le scene 3D cinematografiche (Blender 4.0, EEVEE).
Nessun asset di terzi: tutta la geometria e' generata da codice.
"""
import bpy
import math


def reset_scene():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat)


def setup_eevee(res_x=1920, res_y=1080, samples=64, bloom=True, world_rgb=(0.01, 0.012, 0.014),
                volumetrics=False, vol_end=60.0, look="AgX - Medium High Contrast"):
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    ee = scene.eevee
    # CINE_SAMPLES / CINE_SCALE: proxy rapido per giudicare le inquadrature
    # (un frame in ~1s invece di ~9s) senza toccare i valori di render finale.
    import os as _os
    samples = int(_os.environ.get("CINE_SAMPLES", samples))
    _scale = float(_os.environ.get("CINE_SCALE", "1.0"))
    if _scale != 1.0:
        res_x = max(64, int(res_x * _scale))
        res_y = max(64, int(res_y * _scale))
    ee.taa_render_samples = samples
    ee.use_gtao = True
    ee.gtao_distance = 0.6
    ee.use_ssr = True
    ee.use_ssr_refraction = True
    ee.use_soft_shadows = True
    ee.shadow_cube_size = "2048"
    ee.shadow_cascade_size = "2048"
    if bloom and hasattr(ee, "use_bloom"):
        ee.use_bloom = True
        ee.bloom_intensity = 0.035
        ee.bloom_threshold = 1.1
        ee.bloom_radius = 5.5
    scene.render.resolution_x = res_x
    scene.render.resolution_y = res_y
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False

    # Volumetriche: e' quello che produce i coni di luce / la foschia con profondita'.
    if volumetrics:
        ee.use_volumetric_lights = True
        ee.use_volumetric_shadows = True
        ee.volumetric_start = 0.1
        ee.volumetric_end = vol_end
        ee.volumetric_tile_size = "16"
        ee.volumetric_samples = int(_os.environ.get("CINE_VOL_SAMPLES", "24"))

    # Resa filmica AgX: highlight che rollano invece di bruciare, neri pieni.
    try:
        scene.view_settings.view_transform = "AgX"
        scene.view_settings.look = look
    except TypeError:
        scene.view_settings.view_transform = "Filmic"

    scene.world.use_nodes = True
    bg = scene.world.node_tree.nodes.get("Background")
    bg.inputs[0].default_value = (*world_rgb, 1.0)
    bg.inputs[1].default_value = 1.0
    return scene


def add_sun(rotation_deg, energy=3.0, color=(1.0, 0.86, 0.68), angle_deg=1.5):
    """Sole direzionale — con le volumetriche attive produce raggi visibili."""
    bpy.ops.object.light_add(type="SUN", location=(0, 0, 20))
    sun = bpy.context.object
    sun.rotation_euler = tuple(math.radians(a) for a in rotation_deg)
    sun.data.energy = energy
    sun.data.color = color
    sun.data.angle = math.radians(angle_deg)
    return sun


def add_fog_volume(center, size, density=0.02, color=(0.62, 0.66, 0.70), anisotropy=0.35):
    """Cubo di volume scatter: foschia atmosferica reale, non un gradiente 2D."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=center)
    box = bpy.context.object
    box.scale = size
    box.name = "FogVolume"
    mat = bpy.data.materials.new("Fog")
    mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    vol = nt.nodes.new("ShaderNodeVolumePrincipled")
    vol.inputs["Color"].default_value = (*color, 1.0)
    vol.inputs["Density"].default_value = density
    vol.inputs["Anisotropy"].default_value = anisotropy
    nt.links.new(vol.outputs["Volume"], out.inputs["Volume"])
    box.data.materials.append(mat)
    return box, vol


def displace_terrain(obj, scale=1.2, strength=0.9, seed=0.0):
    """Rilievo procedurale su una mesh: terreno vero, non una sfera liscia."""
    tex = bpy.data.textures.new(f"Terr{seed}", type="CLOUDS")
    tex.noise_scale = scale
    tex.noise_depth = 4
    mod = obj.modifiers.new("Displace", "DISPLACE")
    mod.texture = tex
    mod.strength = strength
    mod.mid_level = 0.5
    return mod


def look_at(obj, target, roll_deg=0.0):
    """Punta un oggetto (tipicamente la camera) verso un punto: movimenti puliti."""
    import mathutils
    d = mathutils.Vector(target) - obj.location
    rot = d.to_track_quat("-Z", "Y").to_euler()
    obj.rotation_euler = rot
    if roll_deg:
        obj.rotation_euler.rotate_axis("Z", math.radians(roll_deg))
    return obj


def ease(t):
    """Ease-in-out cubica su t in [0,1] — nessun movimento di camera lineare."""
    t = max(0.0, min(1.0, t))
    return 3 * t * t - 2 * t * t * t


def seg(f, start, end):
    """Progresso normalizzato+eased di f dentro il segmento [start, end]."""
    if end <= start:
        return 1.0
    return ease((f - start) / (end - start))


def lerp3(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))


def pbr_material(name, base_rgb, roughness=0.5, metallic=0.0, specular=0.5, emission_rgb=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*base_rgb, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if "Specular" in bsdf.inputs:
        bsdf.inputs["Specular"].default_value = specular
    elif "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = specular
    if emission_rgb is not None:
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = (*emission_rgb, 1.0)
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = (*emission_rgb, 1.0)
        bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat


def assign(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)


def add_camera(location, rotation_deg, lens=85.0, focus_distance=2.0, fstop=1.8):
    bpy.ops.object.camera_add(location=location)
    cam = bpy.context.object
    cam.rotation_euler = tuple(math.radians(a) for a in rotation_deg)
    cam.data.lens = lens
    cam.data.dof.use_dof = True
    cam.data.dof.focus_distance = focus_distance
    cam.data.dof.aperture_fstop = fstop
    bpy.context.scene.camera = cam
    return cam


def add_area_light(location, rotation_deg, energy, size=2.0, color=(1.0, 1.0, 1.0)):
    bpy.ops.object.light_add(type="AREA", location=location)
    light = bpy.context.object
    light.rotation_euler = tuple(math.radians(a) for a in rotation_deg)
    light.data.energy = energy
    light.data.size = size
    light.data.color = color
    return light


def add_spot(location, rotation_deg, energy, spot_size_deg=45, blend=0.4, color=(1.0, 1.0, 1.0)):
    bpy.ops.object.light_add(type="SPOT", location=location)
    light = bpy.context.object
    light.rotation_euler = tuple(math.radians(a) for a in rotation_deg)
    light.data.energy = energy
    light.data.spot_size = math.radians(spot_size_deg)
    light.data.spot_blend = blend
    light.data.color = color
    return light


def sky_world(sun_elevation_deg=3.0, sun_rotation_deg=200.0, strength=1.0,
              dust=2.4, air=1.6, ozone=1.2, sun_intensity=0.55, sun_size_deg=1.6):
    """Cielo atmosferico Nishita: alba vera con scattering, non un fondale piatto.
    E' quello che da' profondita' all'orizzonte e colore alle ombre."""
    world = bpy.context.scene.world
    world.use_nodes = True
    nt = world.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.inputs["Strength"].default_value = strength
    sky = nt.nodes.new("ShaderNodeTexSky")
    sky.sky_type = "NISHITA"
    sky.sun_elevation = math.radians(sun_elevation_deg)
    sky.sun_rotation = math.radians(sun_rotation_deg)
    sky.sun_intensity = sun_intensity
    sky.sun_size = math.radians(sun_size_deg)
    sky.dust_density = dust
    sky.air_density = air
    sky.ozone_density = ozone
    sky.altitude = 0.0
    nt.links.new(sky.outputs["Color"], bg.inputs["Color"])
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    return sky


def sun_matching_sky(elevation_deg=3.0, rotation_deg=200.0, energy=4.0,
                     color=(1.0, 0.66, 0.40), angle_deg=1.4):
    """Sole direzionale allineato al sole del cielo Nishita, per ombre coerenti."""
    bpy.ops.object.light_add(type="SUN", location=(0, 0, 40))
    sun = bpy.context.object
    sun.rotation_euler = (math.radians(90.0 - elevation_deg), 0.0, math.radians(rotation_deg))
    sun.data.energy = energy
    sun.data.color = color
    sun.data.angle = math.radians(angle_deg)
    return sun


def render_frames(out_dir, n_frames, per_frame_fn, only=None):
    """per_frame_fn(frame_index_1based) — anima la scena, poi renderizza.
    `only`: iterabile di indici da renderizzare (per giudicare le inquadrature
    senza pagare il render completo); la timeline resta quella di n_frames."""
    scene = bpy.context.scene
    frames = range(1, n_frames + 1) if only is None else [f for f in only if 1 <= f <= n_frames]
    for f in frames:
        per_frame_fn(f)
        scene.render.filepath = f"{out_dir}/frame_{f:04d}.png"
        bpy.ops.render.render(write_still=True)
    print("BLENDER_RENDER_DONE")


def parse_argv(argv):
    """OUT_DIR N_FRAMES [RES_X RES_Y] [only=1,50,100]"""
    out_dir = argv[0]
    n_frames = int(argv[1])
    res_x = int(argv[2]) if len(argv) > 2 else 1280
    res_y = int(argv[3]) if len(argv) > 3 else 720
    only = None
    for a in argv[4:]:
        if a.startswith("only="):
            only = [int(v) for v in a.split("=", 1)[1].split(",") if v]
    return out_dir, n_frames, res_x, res_y, only
