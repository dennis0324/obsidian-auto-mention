# update_log

플러그인 **기능 추가·수정·삭제**가 있을 때마다 **요약 + 상세** 두 겹으로 남깁니다.

## 1. 요약 — `CHANGELOG.md`

- 날짜 섹션 아래 **추가됨 / 수정됨 / 기타**에 한 줄~몇 줄로 요약합니다.
- 상세 파일이 있으면 같은 항목에 `(상세: entries/…​.md)` 링크를 붙입니다.

## 2. 상세 — `entries/YYYY-MM-DD-slug.md`

- **새 마크다운 파일**을 추가합니다 (같은 날 여러 건이면 슬러그로 구분).
- 내용은 [`entries/_template.md`](entries/_template.md)를 복사해 채웁니다. (배경, 변경 요약, 구현 메모, 경로, 테스트 등)
- 규칙·이름 규칙은 [`entries/README.md`](entries/README.md) 참고.

## 커밋 검사 (pre-commit)

`src/`·`manifest.json`·`package.json` 등 **제품 코드/설정**이 스테이징되면 다음 **둘 다** 스테이징되어야 합니다.

1. `update_log/CHANGELOG.md`
2. `update_log/entries/` 아래의 **실제 엔트리** `.md` 하나 이상  
   (`entries/README.md`, `entries/_template.md` 만으로는 인정되지 않음)

**긴급 예외:** `SKIP_CHANGELOG_CHECK=1 git commit ...` (가능하면 쓰지 마세요.)

## 설치 / 수동 검사

1. `bun install` / `npm install` → `prepare`가 `core.hooksPath=.githooks` 설정 (`.git` 있을 때)
2. 수동으로 동일 규칙 확인:

```bash
bun run changelog:check
```

## Cursor / 에이전트

`.cursor/rules/update-log.mdc` — 코드 변경 시 위 절차를 따르도록 안내합니다.
