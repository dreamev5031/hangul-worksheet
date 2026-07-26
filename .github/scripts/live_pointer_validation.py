#!/usr/bin/env python3
"""Chrome DevTools Protocol로 운영 캔버스에 실제 마우스 입력을 보내 자동 판정을 검증한다."""

from __future__ import annotations

import argparse
import base64
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

import websocket


class CdpClient:
    def __init__(self, websocket_url: str) -> None:
        self.socket = websocket.create_connection(websocket_url, timeout=20)
        self.next_id = 1

    def close(self) -> None:
        self.socket.close()

    def call(self, method: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        call_id = self.next_id
        self.next_id += 1
        self.socket.send(json.dumps({"id": call_id, "method": method, "params": params or {}}))
        while True:
            message = json.loads(self.socket.recv())
            if message.get("id") != call_id:
                continue
            if "error" in message:
                raise RuntimeError(f"CDP {method} 실패: {message['error']}")
            return message.get("result", {})

    def evaluate(self, expression: str) -> Any:
        response = self.call(
            "Runtime.evaluate",
            {
                "expression": expression,
                "returnByValue": True,
                "awaitPromise": True,
            },
        )
        if "exceptionDetails" in response:
            raise RuntimeError(f"브라우저 평가 실패: {response['exceptionDetails']}")
        return response.get("result", {}).get("value")


def request_json(url: str, method: str = "GET") -> dict[str, Any]:
    request = urllib.request.Request(url, method=method)
    with urllib.request.urlopen(request, timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


def wait_for_canvas(client: CdpClient, timeout_seconds: float = 20) -> dict[str, Any]:
    deadline = time.monotonic() + timeout_seconds
    expression = r"""
(() => {
  const canvas = document.querySelector('canvas.stroke-practice-canvas');
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  return {
    currentStrokeId: canvas.getAttribute('data-current-stroke-id'),
    strokeCount: canvas.getAttribute('data-canonical-stroke-count'),
    canonicalSource: canvas.getAttribute('data-canonical-stroke-source'),
    bodyText: document.body.innerText,
    rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
  };
})()
"""
    while time.monotonic() < deadline:
        state = client.evaluate(expression)
        if (
            state
            and state.get("strokeCount") == "4"
            and state.get("canonicalSource") == "canonical-stroke-rendering-v3-optical-fit"
            and "1 / 4획" in state.get("bodyText", "")
            and state.get("rect", {}).get("width", 0) > 100
        ):
            return state
        time.sleep(0.25)
    raise TimeoutError("운영 다 화면의 1 / 4획 canonical 캔버스를 찾지 못했습니다.")


def wait_for_second_stroke(
    client: CdpClient,
    previous_stroke_id: str,
    timeout_seconds: float = 8,
) -> dict[str, Any]:
    deadline = time.monotonic() + timeout_seconds
    expression = r"""
(() => {
  const canvas = document.querySelector('canvas.stroke-practice-canvas');
  if (!canvas) return null;
  return {
    currentStrokeId: canvas.getAttribute('data-current-stroke-id'),
    bodyText: document.body.innerText,
    strokeCount: canvas.getAttribute('data-canonical-stroke-count')
  };
})()
"""
    while time.monotonic() < deadline:
        state = client.evaluate(expression)
        if (
            state
            and state.get("strokeCount") == "4"
            and state.get("currentStrokeId") != previous_stroke_id
            and "2 / 4획" in state.get("bodyText", "")
        ):
            return state
        time.sleep(0.2)
    raise TimeoutError("첫 획 pointerup 후 2 / 4획으로 자동 이동하지 않았습니다.")


def dispatch_stroke(client: CdpClient, rect: dict[str, float], points: list[dict[str, float]]) -> None:
    if len(points) < 2:
        raise ValueError("canonical guidePoints가 두 점 미만입니다.")

    def screen_point(point: dict[str, float]) -> tuple[float, float]:
        return (
            rect["x"] + point["x"] * rect["width"],
            rect["y"] + point["y"] * rect["height"],
        )

    start_x, start_y = screen_point(points[0])
    client.call("Input.dispatchMouseEvent", {"type": "mouseMoved", "x": start_x, "y": start_y})
    client.call(
        "Input.dispatchMouseEvent",
        {
            "type": "mousePressed",
            "x": start_x,
            "y": start_y,
            "button": "left",
            "buttons": 1,
            "clickCount": 1,
            "pointerType": "mouse",
        },
    )
    for point in points[1:]:
        x, y = screen_point(point)
        client.call(
            "Input.dispatchMouseEvent",
            {
                "type": "mouseMoved",
                "x": x,
                "y": y,
                "button": "left",
                "buttons": 1,
                "pointerType": "mouse",
            },
        )
        time.sleep(0.006)
    end_x, end_y = screen_point(points[-1])
    client.call(
        "Input.dispatchMouseEvent",
        {
            "type": "mouseReleased",
            "x": end_x,
            "y": end_y,
            "button": "left",
            "buttons": 0,
            "clickCount": 1,
            "pointerType": "mouse",
        },
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--debug-port", type=int, default=9222)
    parser.add_argument("--path-json", required=True)
    parser.add_argument("--screenshot", required=True)
    parser.add_argument(
        "--url",
        default="https://hangul-worksheet.pages.dev/practice/?start=1&text=%EB%8B%A4",
    )
    args = parser.parse_args()

    target_url = f"http://127.0.0.1:{args.debug_port}/json/new?{urllib.parse.quote('about:blank', safe='')}"
    target = request_json(target_url, method="PUT")
    client = CdpClient(target["webSocketDebuggerUrl"])
    try:
        client.call("Page.enable")
        client.call("Runtime.enable")
        client.call(
            "Emulation.setDeviceMetricsOverride",
            {
                "width": 390,
                "height": 844,
                "deviceScaleFactor": 1,
                "mobile": False,
            },
        )
        client.call("Page.navigate", {"url": args.url})
        before = wait_for_canvas(client)

        path_data = json.loads(Path(args.path_json).read_text(encoding="utf-8"))
        expected_id = path_data.get("id")
        if before.get("currentStrokeId") != expected_id:
            raise AssertionError(
                f"운영 첫 획 ID 불일치: DOM={before.get('currentStrokeId')} canonical={expected_id}"
            )

        dispatch_stroke(client, before["rect"], path_data["guidePoints"])
        after = wait_for_second_stroke(client, before["currentStrokeId"])

        screenshot = client.call(
            "Page.captureScreenshot",
            {"format": "png", "fromSurface": True, "captureBeyondViewport": False},
        )
        screenshot_path = Path(args.screenshot)
        screenshot_path.parent.mkdir(parents=True, exist_ok=True)
        screenshot_path.write_bytes(base64.b64decode(screenshot["data"]))

        print(
            "live-pointer-auto-validation "
            f"before={before['currentStrokeId']} "
            f"after={after['currentStrokeId']} "
            "progress=1/4->2/4 accepted=true"
        )
    finally:
        client.close()


if __name__ == "__main__":
    main()
