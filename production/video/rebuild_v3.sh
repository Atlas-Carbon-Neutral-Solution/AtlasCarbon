#!/bin/bash
# Ricostruzione dopo le revisioni: SC01 (due inquadrature + oggetti di scena),
# SC03 (ufficio notturno con veneziana, differenziata da SC04), SC04 (piu' calda,
# stretta e mossa), nuova colonna sonora. Poi master e derivati.
#
# Due job in parallelo su 4 core: SC03 ha le volumetriche e va da sola.
set -uo pipefail
cd "$(dirname "$0")"
B=blender
PUB=remotion/atlas-motion/public/video

render_one() {   # render_one <script> <outdir> <frames> <nome>
  local script="$1" outdir="$2" frames="$3" name="$4"
  echo "=== $name : $frames frame — $(date +%H:%M:%S) ==="
  mkdir -p "$B/$outdir"; rm -f "$B/$outdir"/*.png
  ( cd "$B" && CINE_VOL_SAMPLES=10 xvfb-run -a blender -b --factory-startup \
      --python "$script" -- "$PWD/$outdir" "$frames" 1280 720 2>&1 | grep -cE "^Saved" )
  ffmpeg -y -loglevel error -framerate 25 -i "$B/$outdir/frame_%04d.png" \
    -c:v libx264 -pix_fmt yuv420p -crf 18 "$PUB/$name.mp4"
  echo "--> $name.mp4 ($(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of csv=p=0 "$PUB/$name.mp4") frame)"
  rm -f "$B/$outdir"/*.png
}

( render_one sc01_report.py frames_sc01 175 sc01-report
  render_one sc04_plant.py  frames_sc04 200 sc04-plant ) > /tmp/reb_a.log 2>&1 &
JOB_A=$!
( render_one sc03_office.py frames_sc03 250 sc03-office ) > /tmp/reb_b.log 2>&1 &
JOB_B=$!
wait $JOB_A $JOB_B
cat /tmp/reb_a.log /tmp/reb_b.log

./render_master.sh || { echo "MASTER_FAILED"; exit 1; }
./make_derivatives.sh || { echo "DERIVATI_FAILED"; exit 1; }
echo "REBUILD_V3_DONE $(date +%H:%M:%S)"
