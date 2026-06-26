from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


REQUIRED_FILES = [
    ".codex-plugin/plugin.json",
    "skills/ppt-image-first/SKILL.md",
    "SKILL.md",
    "README.md",
    "LICENSE",
    "scripts/security_scan.py",
    "scripts/install_personal_marketplace.py",
]


def fail(message: str) -> int:
    print(f"FAILED: {message}")
    return 1


def has_frontmatter(text: str) -> bool:
    return bool(re.match(r"^---\n[\s\S]+?\n---\n", text))


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate ppt-image-first release structure.")
    parser.add_argument("root", nargs="?", default=".")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    missing = [path for path in REQUIRED_FILES if not (root / path).exists()]
    if missing:
        return fail("Missing required files: " + ", ".join(missing))

    plugin_path = root / ".codex-plugin" / "plugin.json"
    try:
        plugin = json.loads(plugin_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        return fail(f"Invalid plugin.json: {exc}")

    if plugin.get("name") != "ppt-image-first":
        return fail("plugin.json name must be ppt-image-first")
    if not re.match(r"^\d+\.\d+\.\d+([+-][0-9A-Za-z.-]+)?$", plugin.get("version", "")):
        return fail("plugin.json version must be semver")
    if plugin.get("skills") != "./skills/":
        return fail('plugin.json skills must be "./skills/"')
    if "interface" not in plugin:
        return fail("plugin.json must include interface metadata")

    for skill_file in [root / "SKILL.md", root / "skills" / "ppt-image-first" / "SKILL.md"]:
        text = skill_file.read_text(encoding="utf-8")
        if not has_frontmatter(text):
            return fail(f"{skill_file.relative_to(root)} is missing YAML frontmatter")
        if "[TODO:" in text:
            return fail(f"{skill_file.relative_to(root)} contains TODO placeholder")

    print("Release validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
