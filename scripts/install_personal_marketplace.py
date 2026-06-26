from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path


PLUGIN_NAME = "ppt-image-first"


def marketplace_path() -> Path:
    return Path.home() / ".agents" / "plugins" / "marketplace.json"


def plugin_target() -> Path:
    return Path.home() / "plugins" / PLUGIN_NAME


def repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def load_json(path: Path) -> dict:
    if not path.exists():
        return {
            "name": "personal",
            "interface": {"displayName": "Personal"},
            "plugins": [],
        }
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def ensure_plugin_link(source: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        if target.resolve() == source.resolve():
            return
        raise SystemExit(
            f"Target already exists and points elsewhere: {target}\n"
            "Move it aside or install manually."
        )

    if sys.platform.startswith("win"):
        subprocess.run(
            ["cmd", "/c", "mklink", "/J", str(target), str(source)],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
    else:
        target.symlink_to(source, target_is_directory=True)


def update_marketplace(path: Path) -> None:
    data = load_json(path)
    data.setdefault("name", "personal")
    data.setdefault("interface", {"displayName": "Personal"})
    data.setdefault("plugins", [])

    entry = {
        "name": PLUGIN_NAME,
        "source": {
            "source": "local",
            "path": f"./plugins/{PLUGIN_NAME}",
        },
        "policy": {
            "installation": "AVAILABLE",
            "authentication": "ON_INSTALL",
        },
        "category": "Productivity",
    }

    plugins = data["plugins"]
    for idx, existing in enumerate(plugins):
        if existing.get("name") == PLUGIN_NAME:
            plugins[idx] = entry
            break
    else:
        plugins.append(entry)

    save_json(path, data)


def main() -> int:
    source = repo_root()
    target = plugin_target()
    market = marketplace_path()

    ensure_plugin_link(source, target)
    update_marketplace(market)

    print(f"Plugin source: {source}")
    print(f"Plugin install path: {target}")
    print(f"Marketplace: {market}")
    print("")
    print("Next command:")
    print(f"codex plugin add {PLUGIN_NAME}@personal")

    codex_bin = shutil.which("codex")
    if codex_bin:
        print("")
        print("Running Codex install...")
        subprocess.run([codex_bin, "plugin", "add", f"{PLUGIN_NAME}@personal"], check=True)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
