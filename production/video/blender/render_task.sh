#!/bin/bash
# Render di UNA scena: e' l'unita' di lavoro che rebuild_v4.sh distribuisce fra
# due worker paralleli. Tenerla in un file separato serve proprio a questo — con
# xargs -P la coda si bilancia da sola, senza dover indovinare in anticipo quali
# scene mettere nello stesso job.
#
# uso: render_task.sh <script> <outdir> <frames> <nome> [res_x] [res_y] [vol_samples]
set -uo pipefail
cd "$(dirname "$0")"

script="$1"; outdir="$2"; frames="$3"; name="$4"
rx="${5:-1280}"; ry="${6:-720}"; vol="${7:-16}"
PUB=../remotion/atlas-motion/public/video
IMG=../remotion/atlas-motion/public/img
mkdir -p "$PUB" "$IMG" "$outdir"
rm -f "$outdir"/*.png

t0=$(cut -d. -f1 /proc/uptime)
echo "=== $name : $frames frame @ ${rx}x${ry} vol=$vol — inizio $(date +%H:%M:%S)"
CINE_VOL_SAMPLES="$vol" xvfb-run -a blender -b --factory-startup \
  --python "$script" -- "$PWD/$outdir" "$frames" "$rx" "$ry" 2>&1 \
  | grep -cE "^Saved" || true
t1=$(cut -d. -f1 /proc/uptime)

got=$(ls "$outdir"/frame_*.png 2>/dev/null | wc -l)
if [ "$got" -ne "$frames" ]; then
  echo "!!! $name: $got PNG su $frames attesi — TASK_FAILED"
  exit 1
fi

if [ "$frames" -gt 1 ]; then
  ffmpeg -y -loglevel error -framerate 25 -i "$outdir/frame_%04d.png" \
    -c:v libx264 -pix_fmt yuv420p -crf 18 "$PUB/$name.mp4" || exit 1
  n=$(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of csv=p=0 "$PUB/$name.mp4")
  echo "--> $name.mp4 : $n frame in $((t1 - t0))s ($(( (t1 - t0) / frames ))s/frame) — fine $(date +%H:%M:%S)"
else
  cp "$outdir/frame_0001.png" "$IMG/$name.png"
  echo "--> $name.png in $((t1 - t0))s — fine $(date +%H:%M:%S)"
fi
rm -f "$outdir"/*.png
