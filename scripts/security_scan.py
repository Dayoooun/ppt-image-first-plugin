from __future__ import annotations

import argparse
import re
from pathlib import Path


SECRET_PATTERNS = [
    re.compile(r"(?i)(api[_-]?key|secret|password|passwd|bearer|authorization)\s*[:=]\s*['\"]?[^'\"\s]{12,}"),
    re.compile(r"sk-[A-Za-z0-9_-]{20,}"),
    re.compile(r"AIza[0-9A-Za-z_-]{20,}"),
    re.compile(r"ghp_[0-9A-Za-z]{20,}"),
    re.compile(r"github_pat_[0-9A-Za-z_]{20,}"),
    re.compile(r"xox[baprs]-[0-9A-Za-z-]{20,}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"-----BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY-----"),
]

PRIVATE_PATH_PATTERNS = [
    re.compile(r"C:\\Users\\[^\\\s]+", re.IGNORECASE),
    re.compile(r"D:\\[^`\n\r]*", re.IGNORECASE),  # scan-ok: detector pattern
    re.compile(r"AppData\\", re.IGNORECASE),  # scan-ok: detector pattern
]

SKIP_DIRS = {".git", "__pycache__", "node_modules", ".next", "dist", "build"}
SKIP_SUFFIXES = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".pptx",
    ".pdf",
    ".zip",
    ".pack",
    ".idx",
    ".rev",
    ".pyc",
}


def iter_files(root: Path):
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.suffix.lower() in SKIP_SUFFIXES:
            continue
        yield path


def scan_file(path: Path, root: Path):
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        try:
            text = path.read_text(encoding="utf-8-sig")
        except UnicodeDecodeError:
            return []

    findings = []
    for lineno, line in enumerate(text.splitlines(), 1):
        if "scan-ok:" in line:
            continue
        for pattern in SECRET_PATTERNS:
            if pattern.search(line):
                findings.append((path.relative_to(root), lineno, "secret-candidate", line.strip()))
                break
        for pattern in PRIVATE_PATH_PATTERNS:
            if pattern.search(line):
                findings.append((path.relative_to(root), lineno, "private-path", line.strip()))
                break
    return findings


def main() -> int:
    parser = argparse.ArgumentParser(description="Scan plugin files for secret and private-path candidates.")
    parser.add_argument("root", nargs="?", default=".", help="Repository or plugin root to scan")
    parser.add_argument("--allow-private-paths", action="store_true", help="Do not fail on private path candidates")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    findings = []
    for path in iter_files(root):
        findings.extend(scan_file(path, root))

    filtered = []
    for finding in findings:
        if args.allow_private_paths and finding[2] == "private-path":
            continue
        filtered.append(finding)

    for rel, lineno, kind, line in filtered:
        print(f"{rel}:{lineno}: {kind}: {line}")

    if filtered:
        print(f"\nFAILED: {len(filtered)} security finding(s)")
        return 1

    print("Security scan passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
