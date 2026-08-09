#!/bin/bash
# Verifica strutturale: ogni clip deve coprire per intero la sequenza che lo
# ospita. Un clip più corto della sua sequenza fa congelare l'ultimo fotogramma
# (è il difetto che ha prodotto il "3D che si blocca sul niente" in SC05).
set -uo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT/remotion/atlas-motion/public/video"
fail=0

# SC07 può essere sostituita da una ripresa reale: il nome del file sta in
# src/footage.ts, quindi lo si legge da lì invece di fissarlo qui — così il
# controllo sul congelamento dell'ultimo fotogramma vale anche dopo lo scambio.
SC07=$(sed -n 's/^export const SC07_SRC = "video\/\(.*\)";$/\1/p' \
       "$ROOT/remotion/atlas-motion/src/footage.ts")
[ -n "$SC07" ] || { echo "non riesco a leggere SC07_SRC da src/footage.ts"; exit 1; }
check() {
  local file="$1" expected="$2"
  if [ ! -f "$file" ]; then echo "MANCA   $file (attesi $expected frame)"; fail=1; return; fi
  local n; n=$(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of csv=p=0 "$file")
  if [ "$n" -lt "$expected" ]; then
    echo "CORTO   $file: $n frame < $expected attesi"; fail=1
  else
    printf "ok      %-22s %s frame (>= %s)\n" "$file" "$n" "$expected"
  fi
}
check sc01-report.mp4  175
check sc02-aerial.mp4  175
check sc03-office.mp4  250
check sc04-plant.mp4   200
check sc05a-sensor.mp4 125
check sc05b-orbit.mp4  150
check sc05c-ledger.mp4 125
check sc06-thermal.mp4 300
check "$SC07"          350
exit $fail
