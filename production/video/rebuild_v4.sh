#!/bin/bash
# Ricostruzione integrale dopo la terza revisione.
#
# Perche' TUTTE le scene e non solo quelle toccate: la revisione ha riscritto
# cine.pbr_material (variazione micro-superficie sulla ruvidezza) e ogni scena
# 3D costruisce i propri materiali con quella funzione. Anche SC02 e SC05b, che
# non hanno modifiche proprie, rendono diversamente.
#
# La coda e' bilanciata da xargs -P 2: le scene sono elencate dalla piu' costosa
# alla piu' leggera, cosi' la coda si svuota senza che un worker resti fermo ad
# aspettare l'altro. Le volumetriche di SC07 girano a 8 campioni (e' la scena
# che domina il costo).
set -uo pipefail
cd "$(dirname "$0")"

LOG=/tmp/rebuild_v4.log
: > "$LOG"

echo "== 1/4  render 3D: 1851 frame su due worker — $(date +%H:%M:%S) ==" | tee -a "$LOG"
# script            outdir        frames nome          rx   ry  vol
cat > /tmp/render_tasks.txt <<'TASKS'
sc07_bamboo.py  frames_sc07  350 sc07-bamboo  1280 720 8
sc06_thermal.py frames_sc06  300 sc06-thermal 1280 720 16
sc03_office.py  frames_sc03  250 sc03-office  1280 720 16
sc04_plant.py   frames_sc04  200 sc04-plant   1280 720 16
sc01_report.py  frames_sc01  175 sc01-report  1280 720 16
sc02_aerial.py  frames_sc02  175 sc02-aerial  1280 720 16
sc05b_orbit.py  frames_sc05b 150 sc05b-orbit  1280 720 16
sc05a_sensor.py frames_sc05a 125 sc05a-sensor 1280 720 16
sc05c_ledger.py frames_sc05c 125 sc05c-ledger 1280 720 16
sc08_plate.py   frames_sc08  1   sc08-plate   1920 1080 16
TASKS

xargs -P 2 -L 1 ./blender/render_task.sh < /tmp/render_tasks.txt 2>&1 | tee -a "$LOG"
RC=${PIPESTATUS[0]}
if [ "$RC" -ne 0 ]; then echo "RENDER_FAILED rc=$RC" | tee -a "$LOG"; exit 1; fi

echo "== 2/4  master 90\" — $(date +%H:%M:%S) ==" | tee -a "$LOG"
./render_master.sh 2>&1 | tee -a "$LOG" || { echo "MASTER_FAILED" | tee -a "$LOG"; exit 1; }

echo "== 3/4  derivati §9 — $(date +%H:%M:%S) ==" | tee -a "$LOG"
./make_derivatives.sh 2>&1 | tee -a "$LOG" || { echo "DERIVATI_FAILED" | tee -a "$LOG"; exit 1; }

echo "== 4/4  anteprima compressa per l'invio — $(date +%H:%M:%S) ==" | tee -a "$LOG"
ffmpeg -y -loglevel error -i output/atlas_master_90.mp4 \
  -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p \
  -c:a aac -b:a 128k output/atlas_master_90_preview.mp4 2>&1 | tee -a "$LOG"

echo "REBUILD_V4_DONE $(date +%H:%M:%S)" | tee -a "$LOG"
