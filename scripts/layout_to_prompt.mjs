#!/usr/bin/env node
// layout_to_prompt.mjs
// Parses a layout HTML (1792x1024 template) and emits a Codex $imagegen spatial prompt.
//
// Usage:
//   node layout_to_prompt.mjs <layout.html> [--style "style brief inline"] [--json]
//
// Output: a single block of natural-language prompt text suitable to splice into
//   codex exec '$imagegen
//   프롬프트: <output>
//   사이즈: 1792x1024
//   ...
// Notes:
//   - Reads only data-slot blocks; slide IDs / batch labels in data-slide-id are NEVER copied
//     into the prompt (per SKILL.md Hard Rule).
//   - Slots with inner placeholders starting with "[VISUAL:" become visual-direction lines
//     instead of literal-text lines.

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("usage: layout_to_prompt.mjs <layout.html> [--style \"...\"] [--json]");
  process.exit(2);
}
const file = args[0];
const styleIdx = args.indexOf("--style");
const styleBrief = styleIdx >= 0 ? args[styleIdx + 1] : null;
const asJson = args.includes("--json");

const html = fs.readFileSync(file, "utf8");

const slotRe = /<div([^>]*data-slot=[^>]+)>([\s\S]*?)<\/div>/g;
const attrRe = /(\w[\w-]*)\s*=\s*"([^"]*)"/g;
const slots = [];
let m;
while ((m = slotRe.exec(html)) !== null) {
  const attrs = {};
  let a;
  while ((a = attrRe.exec(m[1])) !== null) attrs[a[1]] = a[2];
  const inner = m[2].replace(/<[^>]+>/g, "").trim();
  const style = attrs.style || "";
  const px = (key) => {
    const re = new RegExp(`${key}\\s*:\\s*(-?\\d+)px`);
    const r = style.match(re);
    return r ? Number(r[1]) : null;
  };
  slots.push({
    slot: attrs["data-slot"],
    anchor: attrs["data-anchor"] || null,
    weight: Number(attrs["data-weight"] || 3),
    left: px("left"), top: px("top"), right: px("right"), bottom: px("bottom"),
    width: px("width"), height: px("height"),
    fontSize: px("font-size"),
    text: inner,
  });
}

const slideIdMatch = html.match(/data-slide-id="([^"]+)"/);
const layoutMatch  = html.match(/data-layout="([^"]+)"/);
const layoutName = layoutMatch ? layoutMatch[1] : "custom";

function describePos(s) {
  const W = 1792, H = 1024;
  const x = s.left ?? (s.right != null ? W - s.right - (s.width || 0) : null);
  const y = s.top  ?? (s.bottom != null ? H - s.bottom - (s.height || 0) : null);
  if (x == null || y == null) return s.anchor || "unspecified position";
  const col = x < W * 0.33 ? "left" : x < W * 0.66 ? "center" : "right";
  const row = y < H * 0.33 ? "upper" : y < H * 0.66 ? "middle" : "lower";
  return `${row}-${col} (≈${Math.round(x)},${Math.round(y)} px, ${s.width || "?"}×${s.height || "?"})`;
}

const visuals = slots.filter(s => s.text.startsWith("[VISUAL:"));
const texts   = slots.filter(s => !s.text.startsWith("[VISUAL:") && s.text.length > 0);

const lines = [];
lines.push(`16:9 슬라이드 (1792x1024), 흰 배경, 레이아웃: ${layoutName}.`);
if (styleBrief) lines.push(`스타일: ${styleBrief}.`);
lines.push("");
lines.push("아래 텍스트를 정확히, 오타 없이, 명시된 위치에 렌더링:");
for (const s of texts.sort((a,b)=>b.weight - a.weight)) {
  const sizeHint = s.fontSize ? `, ${s.fontSize}px급 크기` : "";
  lines.push(`- [${s.slot}] "${s.text}" — ${describePos(s)}${sizeHint}, 가중치 ${s.weight}/5`);
}
if (visuals.length) {
  lines.push("");
  lines.push("시각 요소:");
  for (const v of visuals) {
    const desc = v.text.replace(/^\[VISUAL:\s*/, "").replace(/\]$/, "").trim();
    lines.push(`- ${desc} — ${describePos(v)}`);
  }
}
lines.push("");
lines.push("여백/안전영역: 사방 64px 이상 유지. 텍스트는 반드시 한국어로, 위 따옴표 안 문자열을 그대로 사용.");

const prompt = lines.join("\n");

if (asJson) {
  console.log(JSON.stringify({ slideId: slideIdMatch?.[1] || null, layout: layoutName, slots, prompt }, null, 2));
} else {
  console.log(prompt);
}
