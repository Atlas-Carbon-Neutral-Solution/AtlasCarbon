#!/bin/bash
# Master 90" completo: verifica dei clip, render Remotion, mix audio, controlli.
# I render 3D delle singole scene si producono con blender/render_all.sh e
# blender/render_queue.sh; questo script assembla.
set -euo pipefail
cd "$(dirname "$0")"

OUT=output/atlas_master_90.mp4
SILENT=output/atlas_master_90_silent.mp4
MIX=audio/mix_final.mp3
mkdir -p output

echo "== 1/4  verifica che ogni clip copra la propria sequenza =="
./verify_clips.sh

echo "== 2/4  render Remotion (1920x1080, 25fps, 2250 frame) =="
cd remotion/atlas-motion
npx remotion render AtlasMaster90 "../../$SILENT" --log=error --concurrency=2
cd ../..

echo "== 3/4  mix audio =="
ffmpeg -y -loglevel error -i "$SILENT" -i "$MIX" \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 224k -shortest "$OUT"

echo "== 4/4  controlli sul master =="
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate \
  -of default=nw=1 "$OUT"
ffmpeg -hide_banner -i "$OUT" -af loudnorm=I=-16:TP=-1:print_format=summary -f null - 2>&1 \
  | grep -E "Input (Integrated|True Peak)"
echo "MASTER_OK $OUT"
