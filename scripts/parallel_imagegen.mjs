#!/usr/bin/env node
// parallel_imagegen.mjs
// Launches N `codex exec` processes in parallel, each calling $imagegen for one slide.
// Captures Codex's generated_images cache path from stdout, copies the PNG to
// <out_dir>/<slide_id>.png so it lands on the user-controlled disk.
//
// Usage:
//   node parallel_imagegen.mjs --manifest manifest.json --out <work_dir>/previews [--concurrency 4] [--size 1792x1024]
//
// manifest.json shape:
//   [
//     { "id": "01-cover", "prompt": "<full $imagegen prompt body>" },
//     { "id": "02-toc",   "prompt": "..." },
//     ...
//   ]
//
// Notes:
//   - Codex (read-only sandbox) saves PNGs only to ~/.codex/generated_images/<thread>/ig_*.png.
//     We parse those paths from Codex stdout and copy them out to --out.
//   - Concurrency default = 4 (tune for your CPU / Codex rate limit).

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";

const argv = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith("--")) acc.push([a.slice(2), arr[i + 1]]);
    return acc;
  }, [])
);

const manifestPath = argv.manifest;
const outDir = argv.out;
const concurrency = Number(argv.concurrency || 4);
const size = argv.size || "1792x1024";

if (!manifestPath || !outDir) {
  console.error("usage: parallel_imagegen.mjs --manifest <file.json> --out <dir> [--concurrency 4] [--size 1792x1024]");
  process.exit(2);
}
fs.mkdirSync(outDir, { recursive: true });
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const PNG_RE = /([A-Za-z]:\\[^"'\s]+ig_[^"'\s]+\.png|\/[^"'\s]+ig_[^"'\s]+\.png)/g;

function runOne(entry) {
  return new Promise((resolve) => {
    const body = [
      "$imagegen",
      `프롬프트: ${entry.prompt}`,
      `사이즈: ${size}`,
      "생성 후 PNG 절대 경로를 출력해줘.",
    ].join("\n");

    const t0 = Date.now();
    const child = spawn("codex", ["exec", body], { shell: process.platform === "win32" });
    let out = "", err = "";
    child.stdout.on("data", (d) => { out += d.toString(); });
    child.stderr.on("data", (d) => { err += d.toString(); });
    child.on("close", (code) => {
      const t1 = Date.now();
      const matches = [...out.matchAll(PNG_RE)].map(m => m[1]);
      const src = matches[matches.length - 1] || null;
      let dst = null;
      if (src && fs.existsSync(src)) {
        dst = path.join(outDir, `${entry.id}.png`);
        fs.copyFileSync(src, dst);
      }
      resolve({
        id: entry.id, code, ms: t1 - t0,
        src, dst,
        ok: code === 0 && !!dst,
        stderr_tail: err.slice(-400),
      });
    });
  });
}

async function pool(items, limit, worker) {
  const results = [];
  const queue = [...items.entries()];
  const active = new Set();
  async function spawnNext() {
    const next = queue.shift();
    if (!next) return;
    const [idx, item] = next;
    const p = worker(item).then(r => {
      results[idx] = r;
      active.delete(p);
      console.log(`[${r.ok ? "OK" : "FAIL"}] ${r.id}  ${r.ms}ms  -> ${r.dst || "(no png)"}`);
    });
    active.add(p);
    if (active.size < limit) await spawnNext();
    await p;
    await spawnNext();
  }
  const starters = Array.from({ length: Math.min(limit, items.length) }, () => spawnNext());
  await Promise.all(starters);
  return results;
}

console.log(`launching ${manifest.length} slides, concurrency=${concurrency}, size=${size}`);
const results = await pool(manifest, concurrency, runOne);
const summary = {
  total: results.length,
  ok: results.filter(r => r.ok).length,
  failed: results.filter(r => !r.ok).map(r => ({ id: r.id, stderr_tail: r.stderr_tail })),
  results,
};
const reportPath = path.join(outDir, "_imagegen_report.json");
fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
console.log(`\nreport: ${reportPath}`);
console.log(`done: ${summary.ok}/${summary.total} ok`);
if (summary.failed.length) process.exit(1);
