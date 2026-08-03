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


def setup_eevee(res_x=1920, res_y=1080, samples=64, bloom=True, world_rgb=(0.01, 0.012, 0.014)):
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    ee = scene.eevee
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

    scene.world.use_nodes = True
    bg = scene.world.node_tree.nodes.get("Background")
    bg.inputs[0].default_value = (*world_rgb, 1.0)
    bg.inputs[1].default_value = 1.0
    return scene


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


def render_frames(out_dir, n_frames, per_frame_fn):
    """per_frame_fn(frame_index_1based) — anima la scena, poi renderizza."""
    scene = bpy.context.scene
    for f in range(1, n_frames + 1):
        per_frame_fn(f)
        scene.render.filepath = f"{out_dir}/frame_{f:04d}.png"
        bpy.ops.render.render(write_still=True)
    print("BLENDER_RENDER_DONE")
