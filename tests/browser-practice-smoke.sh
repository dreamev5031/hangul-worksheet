#!/usr/bin/env bash
set -euo pipefail

chrome="$(command -v google-chrome || command -v google-chrome-stable || command -v chromium || command -v chromium-browser)"
test -n "$chrome"
mkdir -p artifacts/practice-glyphs /tmp/practice-browser

python3 -m http.server 4173 --directory dist >/tmp/hangul-browser-http.log 2>&1 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT
for attempt in {1..30}; do
  if curl --fail --silent http://127.0.0.1:4173/practice/ >/dev/null; then break; fi
  sleep 0.25
done

encoded_hwang='%ED%99%A9'
viewports=(
  '740 360 phone-landscape'
  '844 390 phone-landscape'
  '915 412 phone-landscape'
  '1024 600 tablet-landscape'
  '1024 768 tablet-landscape'
  '1180 820 tablet-landscape'
  '1200 800 tablet-landscape'
  '1280 800 tablet-landscape'
  '1366 768 tablet-landscape'
  '1536 960 tablet-landscape'
)

for viewport in "${viewports[@]}"; do
  read -r width height expected_mode <<<"$viewport"
  output="/tmp/practice-browser/${width}x${height}.html"
  "$chrome" \
    --headless=new \
    --no-sandbox \
    --disable-dev-shm-usage \
    --disable-gpu \
    --hide-scrollbars \
    --force-device-scale-factor=1 \
    --window-size="${width},${height}" \
    --virtual-time-budget=2500 \
    --dump-dom \
    "http://127.0.0.1:4173/practice/?start=1&text=${encoded_hwang}" >"$output" 2>/tmp/practice-browser/chrome.log
  grep -Fq "data-layout-mode=\"${expected_mode}\"" "$output"
  grep -Fq 'data-scroll-ok="true"' "$output"
  grep -Fq 'data-display-glyph-layer="display-glyph-layer-v1"' "$output"
  canvas_side="$(grep -oE 'data-canvas-side="[0-9]+"' "$output" | head -1 | grep -oE '[0-9]+')"
  panel_width="$(grep -oE 'data-panel-width="[0-9]+"' "$output" | head -1 | grep -oE '[0-9]+')"
  test -n "$canvas_side"
  test -n "$panel_width"
  if [ "$expected_mode" = 'phone-landscape' ]; then
    test "$canvas_side" -ge $((height - 76))
    test "$panel_width" -ge 168
  else
    test "$panel_width" -ge 240
  fi
  echo "viewport=${width}x${height} mode=${expected_mode} canvas=${canvas_side} panel=${panel_width} scroll=ok"
done

samples=('ㄱ' '가' '사' '황' '슬' '김' '민' '준' '하' '호' '우' '히')
index=1
for character in "${samples[@]}"; do
  encoded="$(python3 - "$character" <<'PY'
import sys
from urllib.parse import quote
print(quote(sys.argv[1]))
PY
)"
  "$chrome" \
    --headless=new \
    --no-sandbox \
    --disable-dev-shm-usage \
    --disable-gpu \
    --hide-scrollbars \
    --force-device-scale-factor=1 \
    --window-size=1024,768 \
    --virtual-time-budget=2200 \
    --run-all-compositor-stages-before-draw \
    --screenshot="artifacts/practice-glyphs/$(printf '%02d' "$index").png" \
    "http://127.0.0.1:4173/practice/?start=1&text=${encoded}" >/tmp/practice-browser/screenshot.log 2>&1
  test -s "artifacts/practice-glyphs/$(printf '%02d' "$index").png"
  index=$((index + 1))
done

cat > artifacts/practice-glyphs/README.txt <<'TXT'
01 ㄱ
02 가
03 사
04 황
05 슬
06 김
07 민
08 준
09 하
10 호
11 우
12 히
1024x768 브라우저 렌더링 캡처
TXT
