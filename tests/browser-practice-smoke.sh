#!/usr/bin/env bash
set -euo pipefail

chrome="$(command -v google-chrome || command -v google-chrome-stable || command -v chromium || command -v chromium-browser)"
test -n "$chrome"
mkdir -p artifacts/canonical-strokes /tmp/practice-browser

python3 -m http.server 4173 --directory dist >/tmp/hangul-browser-http.log 2>&1 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT
for attempt in {1..30}; do
  if curl --fail --silent http://127.0.0.1:4173/practice/ >/dev/null; then break; fi
  sleep 0.25
done

encode_character() {
  python3 - "$1" <<'PY'
import sys
from urllib.parse import quote
print(quote(sys.argv[1]))
PY
}

encoded_hwang="$(encode_character '황')"
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
    --virtual-time-budget=4000 \
    --run-all-compositor-stages-before-draw \
    --dump-dom \
    "http://127.0.0.1:4173/practice/?start=1&text=${encoded_hwang}" >"$output" 2>/tmp/practice-browser/chrome.log
  grep -Fq "data-layout-mode=\"${expected_mode}\"" "$output"
  grep -Fq 'data-scroll-ok="true"' "$output"
  grep -Fq 'data-canonical-stroke-source="canonical-stroke-rendering-v2"' "$output"
  if grep -Fq 'data-display-glyph-layer' "$output"; then
    echo "Legacy display glyph layer remains at ${width}x${height}" >&2
    exit 1
  fi
  canvas_side="$(grep -oE 'data-canvas-side="[0-9]+"' "$output" | head -1 | grep -oE '[0-9]+')"
  panel_width="$(grep -oE 'data-panel-width="[0-9]+"' "$output" | head -1 | grep -oE '[0-9]+')"
  actual_height="$(grep -oE -- '--practice-vh: [0-9]+px' "$output" | head -1 | grep -oE '[0-9]+')"
  test -n "$canvas_side"
  test -n "$panel_width"
  test -n "$actual_height"
  if [ "$expected_mode" = 'phone-landscape' ]; then
    test "$canvas_side" -ge $((actual_height - 24))
    test "$panel_width" -ge 168
  else
    test "$panel_width" -ge 240
  fi
  echo "viewport=${width}x${height} visualHeight=${actual_height} mode=${expected_mode} canvas=${canvas_side} panel=${panel_width} scroll=ok canonical=ok"
done

scenarios=(
  'tablet-portrait-ba 768 1024 portrait 바'
  'tablet-portrait-da 768 1024 portrait 다'
  'tablet-portrait-bam 768 1024 portrait 밤'
  'tablet-landscape-hwang 1024 768 tablet-landscape 황'
  'tablet-landscape-seul 1024 768 tablet-landscape 슬'
  'phone-portrait-da 390 844 portrait 다'
  'phone-landscape-bam 844 390 phone-landscape 밤'
)

for scenario in "${scenarios[@]}"; do
  read -r name width height expected_mode character <<<"$scenario"
  encoded="$(encode_character "$character")"
  url="http://127.0.0.1:4173/practice/?start=1&text=${encoded}"
  dom="/tmp/practice-browser/${name}.html"
  screenshot="artifacts/canonical-strokes/${name}.png"

  "$chrome" \
    --headless=new \
    --no-sandbox \
    --disable-dev-shm-usage \
    --disable-gpu \
    --hide-scrollbars \
    --force-device-scale-factor=1 \
    --window-size="${width},${height}" \
    --virtual-time-budget=3500 \
    --run-all-compositor-stages-before-draw \
    --dump-dom \
    "$url" >"$dom" 2>/tmp/practice-browser/scenario.log

  grep -Fq "data-layout-mode=\"${expected_mode}\"" "$dom"
  grep -Fq 'data-scroll-ok="true"' "$dom"
  grep -Fq 'data-canonical-stroke-source="canonical-stroke-rendering-v2"' "$dom"
  if grep -Fq 'data-display-glyph-layer' "$dom"; then
    echo "Legacy display glyph layer remains in ${name}" >&2
    exit 1
  fi
  if [ "$character" = '다' ]; then
    grep -Fq 'data-canonical-stroke-count="4"' "$dom"
    grep -Fq '1 / 4획' "$dom"
  fi

  "$chrome" \
    --headless=new \
    --no-sandbox \
    --disable-dev-shm-usage \
    --disable-gpu \
    --hide-scrollbars \
    --force-device-scale-factor=1 \
    --window-size="${width},${height}" \
    --virtual-time-budget=3500 \
    --run-all-compositor-stages-before-draw \
    --screenshot="$screenshot" \
    "$url" >/tmp/practice-browser/screenshot.log 2>&1
  test -s "$screenshot"
  echo "scenario=${name} character=${character} viewport=${width}x${height} mode=${expected_mode} canonical=ok scroll=ok"
done

cat > artifacts/canonical-strokes/README.txt <<'TXT'
tablet-portrait-ba.png: 태블릿 세로 바
tablet-portrait-da.png: 태블릿 세로 다, 총 4획
tablet-portrait-bam.png: 태블릿 세로 밤
tablet-landscape-hwang.png: 태블릿 가로 황
tablet-landscape-seul.png: 태블릿 가로 슬
phone-portrait-da.png: 휴대폰 세로 다, 총 4획
phone-landscape-bam.png: 휴대폰 가로 밤
모든 화면은 canonical-stroke-rendering-v2 경로만 표시하며 시스템 폰트 완성 글자 레이어가 없어야 한다.
TXT
