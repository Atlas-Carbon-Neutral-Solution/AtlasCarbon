#!/bin/bash
# Derivati richiesti dallo script §9, ricavati dal master 90".
#
#   30" 16:9   — problema (SC01+SC02) + soluzione (SC05) + endcard (SC09)
#   15" 9:16   — composizione Remotion dedicata: un ritaglio verticale del master
#                anamorfico darebbe solo bande nere, quindi le scene vengono
#                ri-montate a 1080x1920 senza bande
#    6" bumper — solo endcard
#
# Nessun contenuto nuovo: gli stessi girati, gli stessi testi, le stesse variabili
# confermate. I tagli cadono su stacchi di scena, non a metà di un movimento.
set -euo pipefail
cd "$(dirname "$0")"

MASTER=output/atlas_master_90.mp4
[ -f "$MASTER" ] || { echo "manca $MASTER: esegui prima ./render_master.sh" >&2; exit 1; }
mkdir -p output/derivati

seg() {  # seg <inizio_s> <durata_s> <file_out>
  ffmpeg -y -loglevel error -ss "$1" -t "$2" -i "$MASTER" \
    -c:v libx264 -crf 19 -preset slow -pix_fmt yuv420p \
    -c:a aac -b:a 192k -avoid_negative_ts make_zero "$3"
}

echo "== 30\" 16:9 =="
seg 0  14 /tmp/d30_a.mp4      # SC01 + SC02: il problema
seg 32  8 /tmp/d30_b.mp4      # SC05 movimento 1-2: Atlas misura
seg 82  8 /tmp/d30_c.mp4      # SC09: endcard e CTA
printf "file '/tmp/d30_a.mp4'\nfile '/tmp/d30_b.mp4'\nfile '/tmp/d30_c.mp4'\n" > /tmp/d30.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i /tmp/d30.txt -c copy output/derivati/atlas_30_16x9.mp4

echo "==  6\" bumper =="
seg 84 6 output/derivati/atlas_06_bumper.mp4

echo "== 15\" 9:16 (composizione dedicata) =="
cd remotion/atlas-motion
npx remotion render AtlasSocial15 ../../output/derivati/atlas_15_9x16_silent.mp4 --log=error --concurrency=2
cd ../..
ffmpeg -y -loglevel error -ss 32 -t 15 -i "$MASTER" -vn -c:a aac -b:a 192k /tmp/d15a.m4a
ffmpeg -y -loglevel error -i output/derivati/atlas_15_9x16_silent.mp4 -i /tmp/d15a.m4a \
  -map 0:v -map 1:a -c:v copy -c:a copy -shortest output/derivati/atlas_15_9x16.mp4
rm -f output/derivati/atlas_15_9x16_silent.mp4

echo "== controlli =="
for f in output/derivati/*.mp4; do
  printf "%-40s " "$f"
  ffprobe -v error -select_streams v:0 -show_entries stream=width,height:format=duration -of csv=p=0 "$f" | tr '\n' ' '
  echo
done
echo "DERIVATI_OK"
