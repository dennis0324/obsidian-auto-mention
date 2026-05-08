# 변경 기록 (Update log)

- **요약:** 이 파일(`CHANGELOG.md`)에 날짜·항목별로 짧게 적습니다.
- **상세:** 같은 작업에 대해 [`entries/`](entries/) 아래에 `YYYY-MM-DD-slug.md`를 추가하고, 여기 요약 줄에 `(상세: entries/…​.md)`로 연결합니다.

커밋 시 **`CHANGELOG.md`와 `entries/`의 실제 엔트리 `.md`를 함께** 스테이징해야 합니다. (`prepare` → `.githooks/pre-commit`)

---

## 2026-05-08

### 추가됨

- `obsidian-auto-mention` 플러그인 초기 구현: 본문 `[[…]]` / `![[…]]` → 대상 노트 `mention links` 프론트매터 동기화  
  _(상세: [entries/2026-05-08-initial-implementation.md](entries/2026-05-08-initial-implementation.md))_
- 역방향 동기화 옵션: `mention links`에서 항목 삭제 시 소스 노트 본문 링크를 일반 텍스트로 치환
- 노트 삭제 시 관련 `mention links` 정리
- React 기반 설정 UI (동기화 on/off, 역방향, 디바운스, 볼트 리스캔)
- 명령: `Auto Mention: rescan vault`
- 코드 펜스(```) 내부 링크 무시, 플러그인 쓰기 직후 역방향 루프 완화(짧은 grace)
- `update_log/` 변경 기록 및 커밋 시 자동 검사용 Git pre-commit 훅 (`.githooks/`, `prepare`로 `core.hooksPath` 설정)
- `bun run changelog:check` 로 동일 규칙 수동 실행
- Cursor 에이전트용 `.cursor/rules/update-log.mdc` (코드 변경 시 CHANGELOG 갱신 안내)
- **상세 기록 전용** [`update_log/entries/`](entries/) 디렉터리·템플릿; pre-commit이 `CHANGELOG.md` + `entries/*.md` 동시 스테이징 요구  
  _(상세: [entries/2026-05-08-update-log-entries-workflow.md](entries/2026-05-08-update-log-entries-workflow.md))_

### 수정됨

- 플러그인 ID를 `obsidian-auto-mention` → `auto-mention`으로 변경 (`manifest.json`, `package.json`, 관련 문서/스크립트 갱신)  
  _(상세: [entries/2026-05-08-change-plugin-id.md](entries/2026-05-08-change-plugin-id.md))_
- CI/릴리즈: Bun 기반으로 워크플로우 통일, 태그 푸시로 GitHub Release 자동 생성, eslint 규칙에 맞게 UI 문구/스크립트 정리  
  _(상세: [entries/2026-05-08-ci-release-workflow.md](entries/2026-05-08-ci-release-workflow.md))_
- eslint 규칙에 맞게 명령 ID에서 플러그인 ID 접두어 제거  
  _(상세: [entries/2026-05-08-fix-command-id-lint.md](entries/2026-05-08-fix-command-id-lint.md))_
- `mention links`에 엔트리 추가 시, 링크가 헤더 섹션 안에서 발생하면 `[[Source#Heading]]` 형태로 헤더까지 포함  
  _(상세: [entries/2026-05-08-include-heading-in-mention-links.md](entries/2026-05-08-include-heading-in-mention-links.md))_

### 기타

- 빌드: Bun + esbuild + TypeScript
