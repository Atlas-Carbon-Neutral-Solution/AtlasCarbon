#!/bin/bash
# Attende che tutte le clip 3D siano pronte, poi verifica, monta il master,
# mixa l'audio e produce i derivati. Pensato per girare in background: i render
# Blender delle singole scene sono lunghi e non serve presidiarli.
set -uo pipefail
cd "$(dirname "$0")"
PUB=remotion/atlas-motion/public/video

# SC01 e SC05a vengono RI-renderizzate (chiave bassa / LED azzurro) da
# blender/chain_sc01.sh: i loro mp4 esistono già con il conteggio giusto, quindi
# il solo controllo sui fotogrammi non basta — il master partirebbe sulle versioni
# vecchie, o su un file a metà scrittura. Si attende il marcatore della catena.
CHAIN_LOG=/tmp/chain01.log
if [ -f "$CHAIN_LOG" ]; then
  echo "== attesa ri-render di SC01 e SC05a =="
  until grep -q "CHAIN_DONE" "$CHAIN_LOG"; do sleep 30; done
  echo "catena completata $(date +%H:%M:%S)"
fi

echo "== attesa clip =="
while :; do
  missing=0
  for spec in sc01-report:175 sc02-aerial:175 sc03-office:250 sc04-plant:200 \
              sc05a-sensor:125 sc05b-orbit:150 sc05c-ledger:125 sc06-thermal:300 sc07-bamboo:350; do
    f="$PUB/${spec%%:*}.mp4"; want="${spec##*:}"
    if [ ! -f "$f" ]; then missing=1; continue; fi
    n=$(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of csv=p=0 "$f" 2>/dev/null || echo 0)
    [ "${n:-0}" -lt "$want" ] && missing=1
  done
  [ "$missing" -eq 0 ] && break
  sleep 30
done
echo "clip pronte $(date +%H:%M:%S)"

./render_master.sh || { echo "MASTER_FAILED"; exit 1; }
./make_derivatives.sh || { echo "DERIVATI_FAILED"; exit 1; }
echo "FINISH_ALL_DONE $(date +%H:%M:%S)"
