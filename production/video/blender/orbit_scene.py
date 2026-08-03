"""
Asset 3D per SC05 (movimento 2, "vista orbitale"): sfera astratta scura con
un anello orbitale sottile color V01/azzurro. Deliberatamente NON un "globo
verde" (cliche' bandito dallo script, SS2.3) e NON un'estetica sci-fi/hologram
(bandita dal NEG prompt di SC05): materiale opaco, nessun glow, illuminazione
piatta, palette industriale.

Uso: blender -b --factory-startup --python orbit_scene.py -- <out_dir> <n_frames>
"""
import bpy
import sys
import math

argv = sys.argv[sys.argv.index("--") + 1:]
OUT_DIR = argv[0]
N_FRAMES = int(argv[1])

scene = bpy.context.scene
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)

# Sfera opaca, palette industriale (BG_LIGHT)
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=(0, 0, 0), segments=64, ring_count=32)
sphere = bpy.context.object
bpy.ops.object.shade_smooth()
mat_sphere = bpy.data.materials.new("SphereMat")
mat_sphere.diffuse_color = (0.164, 0.180, 0.200, 1.0)  # #2a2e33
mat_sphere.roughness = 0.85
sphere.data.materials.append(mat_sphere)

# Anello orbitale sottile, azzurro V01, inclinato
bpy.ops.mesh.primitive_torus_add(major_radius=1.7, minor_radius=0.012, location=(0, 0, 0))
ring = bpy.context.object
ring.rotation_euler = (math.radians(70), 0, 0)
mat_ring = bpy.data.materials.new("RingMat")
mat_ring.diffuse_color = (0.325, 0.643, 0.859, 1.0)  # #53a4db V01
ring.data.materials.append(mat_ring)

# Luce piatta, nessun glow/hologram
bpy.ops.object.light_add(type="AREA", location=(3, -3, 4))
light = bpy.context.object
light.data.energy = 220
light.data.size = 4

bpy.ops.object.light_add(type="AREA", location=(-3, 2, -2))
fill = bpy.context.object
fill.data.energy = 60
fill.data.size = 5

# Camera
bpy.ops.object.camera_add(location=(0, -9.5, 0.9))
cam = bpy.context.object
cam.rotation_euler = (math.radians(84), 0, 0)
cam.data.lens = 50
scene.camera = cam

# Sfondo = stessa base fredda usata in Remotion (#14171a), niente compositing alpha
scene.world.use_nodes = True
bg_node = scene.world.node_tree.nodes.get("Background")
bg_node.inputs[0].default_value = (0.078, 0.090, 0.102, 1.0)  # #14171a
bg_node.inputs[1].default_value = 1.0

scene.view_settings.view_transform = "Standard"  # colore fedele, niente tone mapping Filmic

scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items] else "BLENDER_EEVEE"
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = OUT_DIR + "/frame_"

scene.frame_start = 1
scene.frame_end = N_FRAMES

for f in range(1, N_FRAMES + 1):
    scene.frame_set(f)
    # anello che ruota lentamente sul proprio asse, sfera pressoche' immobile
    ring.rotation_euler = (math.radians(70), 0, math.radians(f * 1.6))
    scene.render.filepath = f"{OUT_DIR}/frame_{f:04d}.png"
    bpy.ops.render.render(write_still=True)

print("BLENDER_RENDER_DONE")
