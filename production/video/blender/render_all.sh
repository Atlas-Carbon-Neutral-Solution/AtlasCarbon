#!/bin/bash
# Render di TUTTE le scene 3D e encode negli asset Remotion.
#
# Le durate in frame vengono dalle TC del master script §5 @25fps e sono esatte:
# ogni clip copre per costruzione l'intera sequenza che lo ospita nel montaggio
# (un clip più corto farebbe congelare l'ultimo fotogramma — v. verify_clips.sh).
#
# Su GL software (llvmpipe) il costo è dominato da ombre e volumetriche, non dai
# campioni: le scene pesanti girano con cascade ridotte e ombre dure, impostate
# nei rispettivi script. Tempo indicativo su 4 core: ~2 ore in totale.
#
# In pratica si usano due job in parallelo:
#   ./render_all.sh sc07     # la scena pesante, da sola
#   ./render_queue.sh        # tutte le altre, in sequenza
set -uo pipefail
cd "$(dirname "$0")"

PUB=../remotion/atlas-motion/public/video
IMG=../remotion/atlas-motion/public/img
mkdir -p "$PUB" "$IMG"

render() {
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
  else
    cp "$outdir/frame_0001.png" "$IMG/$name.png"
    echo "--> $IMG/$name.png"
  fi
  rm -f "$outdir"/*.png
}

case "${1:-all}" in
  sc07)
    CINE_VOL_SAMPLES=8 render sc07_bamboo.py frames_sc07 350 sc07-bamboo
    ;;
  all)
    render sc01_report.py  frames_sc01  175 sc01-report
    render sc02_aerial.py  frames_sc02  175 sc02-aerial
    render sc03_office.py  frames_sc03  250 sc03-office
    render sc04_plant.py   frames_sc04  200 sc04-plant
    render sc05a_sensor.py frames_sc05a 125 sc05a-sensor
    render sc05b_orbit.py  frames_sc05b 150 sc05b-orbit
    render sc05c_ledger.py frames_sc05c 125 sc05c-ledger
    render sc06_thermal.py frames_sc06  300 sc06-thermal
    CINE_VOL_SAMPLES=8 render sc07_bamboo.py frames_sc07 350 sc07-bamboo
    render sc08_plate.py   frames_sc08  1   sc08-plate 1920 1080
    ;;
  *)
    echo "uso: $0 [all|sc07]" >&2; exit 2
    ;;
esac

echo "ALL_RENDERS_DONE $(date +%H:%M:%S)"
ls -la "$PUB"
