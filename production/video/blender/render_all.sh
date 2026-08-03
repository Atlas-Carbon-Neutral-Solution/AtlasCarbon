#!/bin/bash
# Render delle tre scene 3D reali (SC01, SC03, SC04), encode mp4 e copia negli
# asset Remotion. Durate in frame dalle TC del master script §5 @ 25fps.
set -euo pipefail
cd "$(dirname "$0")"

PUB=../remotion/atlas-motion/public/video
mkdir -p "$PUB"

render() {
  local script="$1" outdir="$2" frames="$3" name="$4"
  echo "=== $name : $frames frame ==="
  mkdir -p "$outdir"
  rm -f "$outdir"/*.png
  xvfb-run -a blender -b --factory-startup --python "$script" -- "$PWD/$outdir" "$frames" 1280 720 \
    2>&1 | grep -cE "^Saved" || true
  ffmpeg -y -loglevel error -framerate 25 -i "$outdir/frame_%04d.png" \
    -c:v libx264 -pix_fmt yuv420p -crf 19 "$PUB/$name.mp4"
  echo "--> $PUB/$name.mp4"
  rm -f "$outdir"/*.png
}

render sc01_report.py frames_sc01 175 sc01-report
render sc03_office.py frames_sc03 250 sc03-office
render sc04_plant.py  frames_sc04 200 sc04-plant

echo "ALL_RENDERS_DONE"
ls -la "$PUB"
