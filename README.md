# PPT Image First

Reference-driven, image-first PPT creation harness for Codex.

`ppt-image-first`는 사용자의 자료, 레퍼런스 이미지, 브랜드/제품 이미지, 증거 스크린샷을 체계적으로 정리한 뒤 고품질 이미지형 PPTX를 만드는 Codex plugin입니다.

핵심 목표는 하나입니다.

> 누가 사용해도 같은 절차로 일관된 품질의 PPT를 만들 수 있게 한다.

## Generation Engine

기본 생성 엔진은 **Codex `$imagegen` + GPT-Image 2.0**입니다.

중요한 원칙:

> 내용과 레퍼런스 이미지를 따로 처리하지 않고, 한 슬라이드의 콘텐츠/레퍼런스/목적/금지요소를 한 번에 묶어서 생성합니다.

즉, 각 슬라이드 생성 프롬프트에는 아래가 동시에 들어갑니다.

- 발표 목적과 청중
- 정확히 들어가야 하는 텍스트
- 스타일 레퍼런스 이미지
- 제품/공간/브랜드 레퍼런스 이미지
- 증거 이미지 또는 문서
- 이미지 충실도 규칙
- 금지 요소
- 구도 목표

로고, 증명서, 스크린샷, 작은 글자가 많은 표/차트처럼 픽셀 정확도가 중요한 요소는 GPT-Image 2.0에 다시 그리게 하지 않고, 생성 후 코드/PPT 조립으로 보존합니다.

## What It Does

- 막연한 PPT 요청을 `deck_brief.md`로 정리
- 자료와 주장을 `content_report.md`로 구조화
- 레퍼런스 이미지를 `style_card.md`로 변환
- 모든 이미지/문서를 `asset_manifest.json`으로 역할 매핑
- 슬라이드별 목적과 내용을 `slide_blueprint.md`로 고정
- 이미지 생성 프롬프트를 `prompt_pack.json`으로 표준화
- 검수 결과를 `review_report.md`에 남김
- 최종 이미지형 PPTX와 PNG export를 생성하도록 안내

## Why Image-First?

일반 editable PPTX는 폰트, 줄바꿈, 렌더링 엔진 차이로 레이아웃이 쉽게 깨집니다.  
`ppt-image-first`는 최종 발표 품질을 우선해서 한 장의 완성된 이미지를 한 슬라이드로 넣는 방식을 기본으로 합니다.

필요하면 일부 표/차트/텍스트만 editable로 만들 수 있지만, 기본값은 **시각 품질이 안정적인 이미지형 PPTX**입니다.

## Install

### Windows PowerShell

```powershell
git clone https://github.com/Dayoooun/ppt-image-first-plugin.git "$env:USERPROFILE\plugins\ppt-image-first"
cd "$env:USERPROFILE\plugins\ppt-image-first"
.\scripts\install.ps1
```

### macOS / Linux

```bash
git clone https://github.com/Dayoooun/ppt-image-first-plugin.git "$HOME/plugins/ppt-image-first"
cd "$HOME/plugins/ppt-image-first"
bash scripts/install.sh
```

The installer:

1. Creates or updates `~/.agents/plugins/marketplace.json`
2. Registers `ppt-image-first` in the personal marketplace
3. Runs `codex plugin add ppt-image-first@personal` when the Codex CLI is available

After installing, start a new Codex thread so the plugin skill list is refreshed.

## Manual Install

If you prefer to do it manually, make sure this repo exists at:

```text
~/plugins/ppt-image-first
```

Then add this plugin entry to `~/.agents/plugins/marketplace.json`:

```json
{
  "name": "ppt-image-first",
  "source": {
    "source": "local",
    "path": "./plugins/ppt-image-first"
  },
  "policy": {
    "installation": "AVAILABLE",
    "authentication": "ON_INSTALL"
  },
  "category": "Productivity"
}
```

Then run:

```bash
codex plugin add ppt-image-first@personal
```

## Usage

In a new Codex thread, ask for a PPT normally:

```text
PPT 만들어줘. 주제는 지역 향기 브랜드 제안서이고, 심사위원 발표용이야.
```

Or explicitly call the skill:

```text
$ppt-image-first 이 자료와 레퍼런스 이미지로 12장 제안서 PPT 만들어줘.
```

The skill should guide Codex to create the harness artifacts before generating slides.

## Standard Artifacts

For any non-trivial deck, the workflow should produce:

```text
deck_brief.md
content_report.md
style_card.md
asset_manifest.json
slide_blueprint.md
prompt_pack.json
review_report.md
```

### `deck_brief.md`

Captures:

- deck goal
- audience
- delivery context
- slide count
- output format
- must-include content
- assumptions and open questions

### `content_report.md`

Turns raw materials into a usable narrative. Every claim should be marked:

- `user_provided`
- `source_supported`
- `inferred`
- `needs_confirmation`

### `style_card.md`

Converts reference images into reusable rules:

- palette
- typography
- layout rhythm
- visual texture
- allowed and forbidden elements

### `asset_manifest.json`

Maps every source file:

- style references
- product photos
- logos
- screenshots
- certificates
- charts
- documents

Each asset gets a role and fidelity level.

### `slide_blueprint.md`

Defines each slide:

- role
- title
- core message
- must-include text
- visual strategy
- asset bindings
- review focus

### `prompt_pack.json`

Stores final image prompts in a consistent structure.

Each slide prompt is a single integrated prompt for Codex `$imagegen` / GPT-Image 2.0. The content
and all relevant reference image paths must be included together.

Every prompt should include:

```text
ROLE
DECK PURPOSE
AUDIENCE
STYLE SYSTEM
CONTENT LOCK
REFERENCE INPUTS
IMAGE FIDELITY RULES
COMPOSITION TASK
FORBIDDEN
OUTPUT
```

### `review_report.md`

Tracks:

- missing text
- broken Korean
- cropped images
- overlapping layout
- hallucinated claims
- asset mismatch
- chart/table issues

## Reference Image Rules

References are separated into three roles:

| Role | Controls |
|---|---|
| `style_reference` | Layout, typography, color, mood |
| `product_reference` | Actual object, product, space, packaging, person |
| `evidence_reference` | Screenshots, certificates, charts, tables, documents |

Important rule:

> Do not AI-redraw exact evidence when readability matters.

Use deterministic composition for:

- logos
- certificates
- screenshots
- small text evidence
- tables
- official documents

## Security

This repo is designed so users can publish it safely, but generated deck projects may contain private material. Do not commit generated client workspaces.

Never commit:

- `.env`, `.env.local`, `.env.*`
- API keys
- OAuth tokens
- cookies
- private keys
- generated auth caches
- client documents
- private screenshots
- private brand assets
- generated deck output containing confidential data

Run before publishing:

```bash
python scripts/security_scan.py .
python scripts/validate_release.py .
```

If a secret was committed, deleting it from the latest file is not enough. Rotate the secret and clean Git history before publishing.

## Validate

```bash
python scripts/security_scan.py .
python scripts/validate_release.py .
```

If you also have Codex's local plugin validator installed:

```powershell
python "$env:USERPROFILE\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py" .
python "$env:USERPROFILE\.codex\skills\.system\skill-creator\scripts\quick_validate.py" .
```

## Update

```bash
cd ~/plugins/ppt-image-first
git pull
codex plugin add ppt-image-first@personal
```

Start a new Codex thread after updating.

## Repository Structure

```text
.codex-plugin/plugin.json       Codex plugin manifest
skills/ppt-image-first/SKILL.md Installable skill entrypoint
SKILL.md                        Canonical detailed harness guide
references/                     Workflow and design rules
templates/                      Artifact templates
scripts/                        Install, validation, security tools
assets/                         Review/preview helper shells
examples/                       Marketplace entry examples
```

## Open Source Release Checklist

Before making the repository public:

```bash
python scripts/security_scan.py .
python scripts/validate_release.py .
git status --short
```

Then:

```bash
git add .
git commit -m "feat: initial open source release"
git tag v0.1.0
git push origin main --tags
```

## License

Apache-2.0
