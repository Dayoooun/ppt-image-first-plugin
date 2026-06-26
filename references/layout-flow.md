# Layout Flow — HTML Blueprint Before Image Generation

이 단계는 `spec_lock.md` 확정 후, 본격적인 이미지 생성 직전에 실행한다. 목적: 각 슬라이드의 **요소 배치·계층·텍스트 정확 위치**를 HTML로 가볍게 잡아두고, 그것을 Codex `$imagegen` 프롬프트의 spatial 청사진으로 사용한다. 이미지가 곧 최종 산출물이고, HTML은 청사진/검증 도구다.

## 산출물

```
<work_dir>/
  layouts/
    01-cover.html        # assets/layout_shell/template.html 복사 → blueprint 필드로 채움
    02-toc.html
    03-p1.html
    ...
    index.html           # 검증용 갤러리 (assets/layout_shell/index.html 복사 + SLIDES 갱신)
  prompts/
    manifest.json        # [{ id, prompt }, ...]
  previews/              # parallel_imagegen.mjs 출력
```

## 단계

### 1. 슬라이드별 HTML 작성

각 슬라이드마다 `assets/layout_shell/template.html` 복사 → `slide_blueprint.md`의 해당 항목을 보고 슬롯을 채운다.

- 슬롯 종류: `kicker / title / subtitle / body / visual / caption / footer`
- 위치는 픽셀로 (1792×1024 기준).
- `data-anchor`, `data-weight`로 시각 우선순위 표시.
- **내부 텍스트는 청중이 실제로 볼 한국어 문장만**. 슬라이드 ID / 배치 라벨은 `data-slide-id` 등 속성에만.
- 시각 요소(차트·일러스트·사진)는 `<div data-slot="visual">[VISUAL: 설명]</div>` 형태로.

작성은 Claude가 직접 한다(blueprint→HTML 매핑은 결정적, 검증도 쉽다). Codex/Gemini에 위임하지 않는다.

### 2. 갤러리 검증

`assets/layout_shell/index.html`을 `layouts/index.html`로 복사하고 `SLIDES` 배열을 채운 뒤 사용자에게 연다. 각 슬라이드의 배치·텍스트·강조를 0.5× 축소 iframe으로 한눈에 본다.

게이트: **레이아웃 확인** (스타일 확인과 별개 게이트). 사용자가 OK 할 때까지 HTML만 수정한다. 이 단계에서 이미지를 생성하지 말 것.

### 3. 프롬프트 추출

```bash
node scripts/layout_to_prompt.mjs <work_dir>/layouts/01-cover.html \
  --style "<design_spec.md의 1줄 스타일 요약>"
```

N개 슬라이드 전체에 대해 실행해 `manifest.json` 생성:

```js
[
  { "id": "01-cover", "prompt": "<layout_to_prompt 출력>" },
  { "id": "02-toc",   "prompt": "..." },
  ...
]
```

스타일 요약은 모든 슬라이드에 동일하게 주입한다(일관성 확보). 슬라이드별로 변형할 항목은 HTML 본문에만 둔다.

### 4. 병렬 이미지 생성

```bash
node scripts/parallel_imagegen.mjs \
  --manifest <work_dir>/prompts/manifest.json \
  --out      <work_dir>/previews \
  --concurrency 4
```

- 기본 `--concurrency 4` (CPU와 Codex 레이트리밋 고려). 적당히 조절.
- 스크립트가 `codex exec` 다중 프로세스를 띄우고, 각 응답에서 `~/.codex/generated_images/.../ig_*.png` 경로를 파싱해 `--out`으로 복사.
- 끝나면 `<out>/_imagegen_report.json`에 성공/실패 요약.

**일관성 트레이드오프**: 다중 프로세스는 빨라지지만 세션 컨텍스트가 분리되어 스타일이 미세하게 다를 수 있다. 보완책:
- 프롬프트 첫 줄에 동일 `--style` 문구 고정.
- 색상·폰트 패밀리·여백 규칙을 명시적 텍스트로.
- 표지·목차처럼 스타일 시드 역할 슬라이드는 `--concurrency 1`로 먼저 생성해 톤을 굳히고, 나머지를 병렬.

### 5. 리뷰

`previews/`가 채워지면 기존 `assets/review_shell/index.html` 흐름으로 진입. 이 단계 이후는 변경 없음.

## 게이트 요약

| 게이트 | 위치 | 조건 |
|---|---|---|
| 레이아웃 확인 | layouts/index.html 갤러리 | 모든 슬라이드 배치 OK |
| (기존) 생성 전 확인 | 프롬프트 manifest 점검 | 스타일 문구 + 슬롯 매핑 검증 |
| (기존) 리뷰 승인 | previews + review_shell | 재생성/리터치 후 최종 OK |

## 실패 시 처리

- `_imagegen_report.json`에 `failed[]` 있으면 해당 ID만 다시 `parallel_imagegen.mjs`로 재실행(manifest 서브셋으로).
- 텍스트가 잘못 렌더링된 슬라이드: HTML의 텍스트 슬롯을 더 짧게 끊고 프롬프트 재추출.
- 배치가 의도와 다른 슬라이드: 픽셀 좌표를 더 명시적인 영역으로 재배치(예: title을 visual과 명확히 겹치지 않게).
