# 플러그인 ID 변경: `obsidian-auto-mention` → `auto-mention`

**날짜:** 2026-05-08  
**변경 유형:** 설정/메타데이터 (플러그인 식별자)

## 배경 / 목적

플러그인 ID를 더 짧고 일반적인 형태로 정리한다. Obsidian에서는 플러그인 폴더명과 `manifest.json`의 `id`가 일치해야 정상 로드되므로, 로컬 설치/배포 시 혼선을 줄이기 위함이다.

## 변경 내용

- `manifest.json`의 `id`를 `auto-mention`으로 변경
- `package.json`의 패키지 이름(`name`)을 `auto-mention`으로 변경
- 문서/스크립트의 문자열 참조를 새 ID로 갱신
  - `project-plan.md`
  - `scripts/check-update-log.mjs` (오류 메시지 prefix)

## 변경된 경로 (참고)

- `manifest.json`
- `package.json`
- `project-plan.md`
- `scripts/check-update-log.mjs`

## 확인 / 테스트

- [ ] Obsidian: 플러그인 폴더명을 `auto-mention`으로 맞춘 뒤, **Settings → Community plugins**에서 로드/활성화 확인
