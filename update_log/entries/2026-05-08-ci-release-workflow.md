# CI/릴리즈 워크플로우 추가 및 lint 정리

**날짜:** 2026-05-08  
**관련:** GitHub Actions로 릴리즈 자동화, eslint 규칙 준수

## 배경 / 목적

태그 푸시만으로 GitHub Release를 만들고(`manifest.json`/`main.js`/`styles.css` 첨부), CI도 로컬과 동일한 Bun 기반으로 통일해 재현성을 높인다. 또한 커뮤니티 플러그인 eslint 규칙에 맞게 사용자 노출 문구/스크립트를 정리해 CI `bun run lint` 실패를 제거한다.

## 변경 요약

- GitHub Actions 릴리즈 워크플로우 추가: `*.*.*` 태그 푸시 시 빌드 후 Release 생성 및 에셋 업로드.
- CI(lint) 워크플로우를 npm → Bun으로 통일.
- eslint 오류 해결:
  - Node 스크립트에서 `process` 명시 import
  - Obsidian eslint 규칙에 맞게 커맨드/Notice 문구를 sentence case로 정리
  - `parseYaml` 결과를 `unknown`으로 처리해 타입 안전성 확보

## 구현 메모

- 릴리즈 워크플로우는 **태그 이름이 `manifest.json`의 `version`과 동일**해야 통과하도록 검증 단계를 둔다.
- 릴리즈 에셋은 Obsidian 배포 요구사항에 맞춰 `manifest.json`, `main.js`, `styles.css` 3개를 업로드한다.

## 변경된 경로 (참고)

- `.github/workflows/release.yml`
- `.github/workflows/lint.yml`
- `scripts/check-update-log.mjs`
- `scripts/install-git-hooks.mjs`
- `src/main.ts`
- `src/settings.ts`
- `src/mention/frontmatter.ts`

## 확인 / 테스트

- [x] `bun run lint`
- [ ] (태그 푸시 후) GitHub Actions에서 Release 생성 및 에셋 업로드 확인
