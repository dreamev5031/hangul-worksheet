#!/usr/bin/env bash
set -euo pipefail

chrome="$(command -v google-chrome || command -v google-chrome-stable || command -v chromium || command -v chromium-browser)"
test -n "$chrome"
mkdir -p artifacts/glyph-optical-layout /tmp/practice-browser

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
  grep -Fq 'data-canonical-stroke-source="canonical-stroke-rendering-v3-optical-fit"' "$output"
  grep -Fq 'data-glyph-layout-type="compound-with-final"' "$output"
  grep -Fq 'data-glyph-center-x="0.5000"' "$output"
  grep -Fq 'data-glyph-center-y="0.5000"' "$output"
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
  echo "viewport=${width}x${height} visualHeight=${actual_height} mode=${expected_mode} canvas=${canvas_side} panel=${panel_width} scroll=ok fit=ok"
done

scenarios=(
  'tablet-portrait-hwang 768 1024 portrait 황'
  'tablet-portrait-bam 768 1024 portrait 밤'
  'tablet-portrait-seul 768 1024 portrait 슬'
  'tablet-portrait-gim 768 1024 portrait 김'
  'tablet-portrait-min 768 1024 portrait 민'
  'tablet-portrait-jun 768 1024 portrait 준'
  'tablet-portrait-gwa 768 1024 portrait 과'
  'tablet-portrait-mul 768 1024 portrait 물'
  'tablet-portrait-han 768 1024 portrait 한'
  'tablet-landscape-hwang 1024 768 tablet-landscape 황'
  'tablet-landscape-bam 1024 768 tablet-landscape 밤'
  'tablet-landscape-seul 1024 768 tablet-landscape 슬'
  'phone-portrait-hwang 390 844 portrait 황'
  'phone-portrait-bam 390 844 portrait 밤'
  'phone-portrait-gim 390 844 portrait 김'
  'phone-landscape-bam 844 390 phone-landscape 밤'
  'phone-landscape-seul 844 390 phone-landscape 슬'
)

for scenario in "${scenarios[@]}"; do
  read -r name width height expected_mode character <<<"$scenario"
  encoded="$(encode_character "$character")"
  url="http://127.0.0.1:4173/practice/?start=1&text=${encoded}"
  dom="/tmp/practice-browser/${name}.html"
  screenshot="artifacts/glyph-optical-layout/${name}.png"

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
  grep -Fq 'data-canonical-stroke-source="canonical-stroke-rendering-v3-optical-fit"' "$dom"
  grep -Fq 'data-glyph-fit-scale=' "$dom"
  grep -Fq 'data-glyph-fit-usage-x=' "$dom"
  grep -Fq 'data-glyph-fit-usage-y=' "$dom"
  grep -Fq 'data-glyph-center-x="0.5000"' "$dom"
  grep -Fq 'data-glyph-center-y="0.5000"' "$dom"
  grep -Fq "data-glyph-override=\"${character}\"" "$dom"
  if grep -Fq 'data-display-glyph-layer' "$dom"; then
    echo "Legacy display glyph layer remains in ${name}" >&2
    exit 1
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
  echo "scenario=${name} character=${character} viewport=${width}x${height} mode=${expected_mode} optical=ok fit=ok scroll=ok"
done

cat > artifacts/glyph-optical-layout/README.txt <<'TXT'
tablet-portrait-hwang.png: 태블릿 세로 황
tablet-portrait-bam.png: 태블릿 세로 밤
tablet-portrait-seul.png: 태블릿 세로 슬
tablet-portrait-gim.png: 태블릿 세로 김
tablet-portrait-min.png: 태블릿 세로 민
tablet-portrait-jun.png: 태블릿 세로 준
tablet-portrait-gwa.png: 태블릿 세로 과
tablet-portrait-mul.png: 태블릿 세로 물
tablet-portrait-han.png: 태블릿 세로 한
tablet-landscape-hwang.png: 태블릿 가로 황
tablet-landscape-bam.png: 태블릿 가로 밤
tablet-landscape-seul.png: 태블릿 가로 슬
phone-portrait-hwang.png: 휴대폰 세로 황
phone-portrait-bam.png: 휴대폰 세로 밤
phone-portrait-gim.png: 휴대폰 세로 김
phone-landscape-bam.png: 휴대폰 가로 밤
phone-landscape-seul.png: 휴대폰 가로 슬
모든 화면은 canonical-stroke-rendering-v3-optical-fit 최종 path만 표시하며 glyph 중심은 0.5, 0.5여야 한다.
TXT
