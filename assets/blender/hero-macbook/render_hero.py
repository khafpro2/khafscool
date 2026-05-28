#!/usr/bin/env python3
"""
Hero MacBook — rendu Blender pour la page d'accueil MDM Academy.

Usage (depuis la racine du dépôt) :
  blender --background --python assets/blender/hero-macbook/render_hero.py
  blender --background --python assets/blender/hero-macbook/render_hero.py -- --quick
  blender --background --python assets/blender/hero-macbook/render_hero.py -- --poster-only

Sorties : web/public/media/hero/macbook-hero.{webm,mp4} + macbook-hero-poster.webp
"""

from __future__ import annotations

import math
import os
import subprocess
import sys

# Couleurs MDM Academy
COLOR_ACCENT = (0.145, 0.388, 0.922, 1.0)  # #2563EB
COLOR_TEAL = (0.051, 0.580, 0.533, 1.0)  # #0d9488
COLOR_METAL = (0.12, 0.13, 0.16, 1.0)
COLOR_METAL_LIGHT = (0.22, 0.24, 0.28, 1.0)

REPO_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), os.pardir, os.pardir, os.pardir)
)
OUTPUT_DIR = os.path.join(REPO_ROOT, "web", "public", "media", "hero")
FRAMES_DIR = os.path.join(OUTPUT_DIR, "frames")

FPS = 30
DURATION_SEC = 5.0
FRAME_COUNT = int(FPS * DURATION_SEC)


def parse_args() -> dict:
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1 :]
    else:
        argv = []
    return {
        "quick": "--quick" in argv,
        "poster_only": "--poster-only" in argv,
        "no_encode": "--no-encode" in argv,
    }


def repo_paths():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(FRAMES_DIR, exist_ok=True)
    return {
        "webm": os.path.join(OUTPUT_DIR, "macbook-hero.webm"),
        "mp4": os.path.join(OUTPUT_DIR, "macbook-hero.mp4"),
        "poster": os.path.join(OUTPUT_DIR, "macbook-hero-poster.webp"),
        "frames": os.path.join(FRAMES_DIR, "frame_%04d.png"),
    }


def clear_scene():
    import bpy

    bpy.ops.wm.read_factory_settings(use_empty=True)
    for coll in ("Collection",):
        if coll in bpy.data.collections:
            bpy.data.collections.remove(bpy.data.collections[coll])


def make_material(name: str, base_color, metallic=0.85, roughness=0.35, emission=None):
    import bpy

    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = base_color
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if emission:
        emit = nodes.new("ShaderNodeEmission")
        emit.inputs["Color"].default_value = emission
        emit.inputs["Strength"].default_value = 2.2
        mix = nodes.new("ShaderNodeMixShader")
        mix.inputs["Fac"].default_value = 0.72
        links.new(bsdf.outputs["BSDF"], mix.inputs[1])
        links.new(emit.outputs["Emission"], mix.inputs[2])
        links.new(mix.outputs["Shader"], out.inputs["Surface"])
    else:
        links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat


def make_screen_material():
    import bpy

    mat = bpy.data.materials.new(name="Screen_Glow")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    tex = nodes.new("ShaderNodeTexGradient")
    tex.gradient_type = "LINEAR"
    map_range = nodes.new("ShaderNodeMapRange")
    map_range.inputs["From Min"].default_value = 0.0
    map_range.inputs["From Max"].default_value = 1.0
    map_range.inputs["To Min"].default_value = 0.0
    map_range.inputs["To Max"].default_value = 1.0
    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (*COLOR_ACCENT[:3], 1.0)
    ramp.color_ramp.elements[1].color = (*COLOR_TEAL[:3], 1.0)
    emit = nodes.new("ShaderNodeEmission")
    emit.inputs["Strength"].default_value = 3.5
    links.new(tex.outputs["Fac"], map_range.inputs["Value"])
    links.new(map_range.outputs["Result"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], emit.inputs["Color"])
    links.new(emit.outputs["Emission"], out.inputs["Surface"])
    return mat


def build_macbook():
    import bpy

    mats = {
        "body": make_material("Body", COLOR_METAL),
        "body_light": make_material("BodyLight", COLOR_METAL_LIGHT, roughness=0.25),
        "screen": make_screen_material(),
    }

    # Base (clavier)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.04))
    base = bpy.context.active_object
    base.name = "MacBook_Base"
    base.scale = (1.45, 0.95, 0.07)
    base.data.materials.append(mats["body"])

    # Trackpad hint
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.22, 0.095))
    track = bpy.context.active_object
    track.name = "Trackpad"
    track.scale = (0.42, 0.28, 0.008)
    track.data.materials.append(mats["body_light"])

    # Charnière
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.04, depth=1.35, location=(0, 0.48, 0.11), rotation=(math.pi / 2, 0, 0)
    )
    hinge = bpy.context.active_object
    hinge.name = "Hinge"
    hinge.data.materials.append(mats["body_light"])

    # Écran (lid) — parent empty pour animation
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0.48, 0.11))
    lid_pivot = bpy.context.active_object
    lid_pivot.name = "Lid_Pivot"

    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.48, 0.62))
    lid = bpy.context.active_object
    lid.name = "MacBook_Lid"
    lid.scale = (1.45, 0.06, 0.92)
    lid.data.materials.append(mats["body"])
    lid.parent = lid_pivot
    lid.matrix_parent_inverse = lid_pivot.matrix_world.inverted()

    # Face écran (léger décalage)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0.44, 0.62))
    display = bpy.context.active_object
    display.name = "Screen_Display"
    display.scale = (1.32, 1.32, 1.0)
    display.rotation_euler = (math.pi / 2, 0, 0)
    display.data.materials.append(mats["screen"])
    display.parent = lid_pivot
    display.matrix_parent_inverse = lid_pivot.matrix_world.inverted()

    return lid_pivot, base


def setup_camera_and_lights():
    import bpy

    bpy.ops.object.camera_add(location=(3.2, -2.8, 1.85))
    cam = bpy.context.active_object
    cam.name = "Hero_Camera"
    cam.data.lens = 42
    bpy.context.scene.camera = cam

    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0.2, 0.35))
    target = bpy.context.active_object
    target.name = "Look_Target"
    track = cam.constraints.new(type="TRACK_TO")
    track.target = target
    track.track_axis = "TRACK_NEGATIVE_Z"
    track.up_axis = "UP_Y"

    bpy.ops.object.light_add(type="AREA", location=(2.5, -1.5, 3.0))
    key = bpy.context.active_object
    key.data.energy = 280
    key.data.size = 2.5

    bpy.ops.object.light_add(type="AREA", location=(-2.0, 2.0, 1.5))
    fill = bpy.context.active_object
    fill.data.energy = 120
    fill.data.size = 3.0

  # Lumière bleue sur l'écran
    bpy.ops.object.light_add(type="POINT", location=(0, 0.3, 0.7))
    rim = bpy.context.active_object
    rim.data.energy = 45
    rim.data.color = COLOR_ACCENT[:3]

    return cam, target


def animate(lid_pivot, cam, target):
    import bpy

    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = FRAME_COUNT

    # Ouverture capot : ~100° fermé → ~108° (léger)
    lid_pivot.rotation_euler = (math.radians(-100), 0, 0)
    lid_pivot.keyframe_insert(data_path="rotation_euler", frame=1)
    lid_pivot.rotation_euler = (math.radians(-108), 0, 0)
    lid_pivot.keyframe_insert(data_path="rotation_euler", frame=FRAME_COUNT // 2)
    lid_pivot.rotation_euler = (math.radians(-100), 0, 0)
    lid_pivot.keyframe_insert(data_path="rotation_euler", frame=FRAME_COUNT)

    # Orbite caméra
    radius = 3.6
    height = 1.85
    for frame in (1, FRAME_COUNT // 2, FRAME_COUNT):
        t = (frame - 1) / max(FRAME_COUNT - 1, 1)
        angle = t * math.pi * 0.35 - math.pi * 0.175
        cam.location = (
            math.sin(angle) * radius,
            -math.cos(angle) * radius * 0.85,
            height + math.sin(t * math.pi) * 0.12,
        )
        cam.keyframe_insert(data_path="location", frame=frame)

    for fcurve in lid_pivot.animation_data.action.fcurves:
        for kp in fcurve.keyframe_points:
            kp.interpolation = "BEZIER"
    if cam.animation_data and cam.animation_data.action:
        for fcurve in cam.animation_data.action.fcurves:
            for kp in fcurve.keyframe_points:
                kp.interpolation = "BEZIER"


def configure_render(quick: bool):
    import bpy

    res = int(os.environ.get("HERO_RESOLUTION", "720" if quick else "1080"))
    samples = int(os.environ.get("HERO_SAMPLES", "32" if quick else "128"))

    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.render.resolution_x = res
    scene.render.resolution_y = int(res * 0.5625)  # 16:9
    scene.render.fps = FPS
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = True
    scene.world.use_nodes = True
    bg = scene.world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.02, 0.05, 0.12, 0.0)


def render_animation(paths: dict):
    import bpy

    scene = bpy.context.scene
    scene.render.filepath = paths["frames"]
    bpy.ops.render.render(animation=True)
    print(f"[hero-macbook] Frames → {FRAMES_DIR}")


def render_poster(paths: dict):
    import bpy

    scene = bpy.context.scene
    mid = FRAME_COUNT // 2
    scene.frame_set(mid)
    poster_png = paths["poster"].replace(".webp", ".png")
    scene.render.filepath = poster_png
    bpy.ops.render.render(write_still=True)
    try:
        from PIL import Image

        img = Image.open(poster_png).convert("RGBA")
        img.save(paths["poster"], "WEBP", quality=88, method=6)
        os.remove(poster_png)
        print(f"[hero-macbook] Poster → {paths['poster']}")
    except ImportError:
        # Sans Pillow : garder PNG, le site accepte aussi poster.svg
        fallback = paths["poster"].replace(".webp", "-from-blender.png")
        os.rename(poster_png, fallback)
        print(f"[hero-macbook] Poster PNG (installez Pillow pour WebP) → {fallback}")


def encode_videos(paths: dict, no_encode: bool):
    if no_encode:
        return
    pattern = os.path.join(FRAMES_DIR, "frame_%04d.png")
    if not os.path.isfile(pattern.replace("%04d", "0001")):
        first = os.path.join(FRAMES_DIR, "frame_0001.png")
        if not os.path.isfile(first):
            print("[hero-macbook] Aucune frame — encodage ignoré.")
            return

    ffmpeg = "ffmpeg"
    common_in = ["-y", "-framerate", str(FPS), "-i", pattern]

    webm_cmd = [
        ffmpeg,
        *common_in,
        "-c:v",
        "libvpx-vp9",
        "-pix_fmt",
        "yuva420p",
        "-b:v",
        "2M",
        "-an",
        paths["webm"],
    ]
    mp4_cmd = [
        ffmpeg,
        *common_in,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        "23",
        "-preset",
        "medium",
        "-movflags",
        "+faststart",
        "-an",
        paths["mp4"],
    ]

    for cmd, label in ((webm_cmd, "WebM"), (mp4_cmd, "MP4")):
        try:
            subprocess.run(cmd, check=True, capture_output=True, text=True)
            print(f"[hero-macbook] {label} → {cmd[-1]}")
        except (subprocess.CalledProcessError, FileNotFoundError) as exc:
            print(f"[hero-macbook] Encodage {label} échoué : {exc}")


def main():
    try:
        import bpy  # noqa: F401
    except ImportError:
        print(
            "Ce script doit être exécuté dans Blender :\n"
            "  blender --background --python assets/blender/hero-macbook/render_hero.py"
        )
        sys.exit(1)

    opts = parse_args()
    paths = repo_paths()
    print(f"[hero-macbook] Sortie : {OUTPUT_DIR}")

    clear_scene()
    lid_pivot, _base = build_macbook()
    cam, target = setup_camera_and_lights()
    animate(lid_pivot, cam, target)
    configure_render(quick=opts["quick"])

    if opts["poster_only"]:
        render_poster(paths)
        return

    render_animation(paths)
    render_poster(paths)
    encode_videos(paths, opts["no_encode"])
    print("[hero-macbook] Terminé.")


if __name__ == "__main__":
    main()
