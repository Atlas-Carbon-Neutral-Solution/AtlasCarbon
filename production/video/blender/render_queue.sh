#!/bin/bash
# Coda dei render "leggeri": scene con poca geometria, girate in sequenza in un
# solo job per non saturare i 4 core (SC07, molto piu' pesante, gira in parallelo).
# Le durate in frame vengono dalle TC del master script §5 @25fps e sono ESATTE:
# ogni clip copre per costruzione l'intera sequenza che la ospita in Remotion.
set -uo pipefail
cd "$(dirname "$0")"
PUB=../remotion/atlas-motion/public/video
mkdir -p "$PUB"

run() {
  local script="$1" outdir="$2" frames="$3" name="$4" rx="${5:-1280}" ry="${6:-720}"
  echo "=== $name : $frames frame @ ${rx}x${ry} — $(date +%H:%M:%S) ==="
  mkdir -p "$outdir"; rm -f "$outdir"/*.png
  CINE_VOL_SAMPLES="${CINE_VOL_SAMPLES:-16}" \
    xvfb-run -a blender -b --factory-startup --python "$script" -- "$PWD/$outdir" "$frames" "$rx" "$ry" \
    2>&1 | grep -cE "^Saved" || true
  if [ "$frames" -gt 1 ]; then
    ffmpeg -y -loglevel error -framerate 25 -i "$outdir/frame_%04d.png" \
      -c:v libx264 -pix_fmt yuv420p -crf 18 "$PUB/$name.mp4"
    echo "--> $PUB/$name.mp4 ($(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of csv=p=0 "$PUB/$name.mp4") frame)"
    rm -f "$outdir"/*.png
  else
    cp "$outdir/frame_0001.png" "$PUB/../img/$name.png"
    echo "--> $name.png"
  fi
}

mkdir -p "$PUB/../img"
run sc08_plate.py   frames_sc08  1   sc08-plate 1920 1080
run sc05a_sensor.py frames_sc05a 125 sc05a-sensor
run sc05c_ledger.py frames_sc05c 125 sc05c-ledger
run sc05b_orbit.py  frames_sc05b 150 sc05b-orbit
run sc06_thermal.py frames_sc06  300 sc06-thermal
echo "QUEUE_DONE $(date +%H:%M:%S)"
