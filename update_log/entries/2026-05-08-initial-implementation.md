# 초기 플러그인 구현 (Auto Mention)

**날짜:** 2026-05-08  
**관련:** `project-plan.md`, 플러그인 스펙 초안

## 배경 / 목적

노트 A가 본문에서 `[[B]]` 또는 `![[B]]`로 B를 언급하면, B의 프론트매터 `mention links`에 A를 역참조로 남기고, 멘션이 사라지거나 목록에서 항목을 지우면 그에 맞춰 본문·목록을 정리하는 동기화 플러그인을 만든다.

## 변경 요약

- 본문(프론트매터 제외)에서 위키링크·임베드 파싱 → 대상 파일 `mention links` 배열에 `[[멘션한 노트]]` 형태로 추가/삭제.
- 설정: 동기화 on/off, 역방향(목록에서 줄 삭제 시 소스 본문 링크를 일반 텍스트로 치환), 디바운스(ms), 볼트 리스캔.
- React 설정 UI(`SettingsApp.tsx`), 명령 `Auto Mention: rescan vault`.
- 노트 삭제 시 캐시 기반으로 관련 대상의 `mention links`에서 해당 소스 제거.
- 코드 펜스(```) 안 링크는 무시. 플러그인이 프론트매터/본문을 쓴 직후 짧은 grace 동안 역방향 비교를 건너뛰어 루프 완화.
- 리스캔 시 역방향 스트립 없이 스냅샷·정방향을 두 패스 처리.

## 구현 메모

- 프론트매터 키: `mention links` (공백 포함).
- 링크 텍스트 생성: `MetadataCache.fileToLinktext(소스, 대상.path, true)` 후 `[[…]]`로 저장.
- 주요 모듈: `src/mention/parser.ts`, `frontmatter.ts`, `sync-engine.ts`, `src/ui/SettingsApp.tsx`, `src/main.ts`, `src/settings.ts`.

## 변경된 경로 (참고)

- `src/main.ts`, `src/settings.ts`, `src/ui/SettingsApp.tsx`
- `src/mention/constants.ts`, `parser.ts`, `paths.ts`, `frontmatter.ts`, `sync-engine.ts`
- `manifest.json`, `package.json`, `tsconfig.json`, `esbuild.config.mjs`(번들 엔트리는 기존 `src/main.ts`)
- `update_log/`, `.githooks/`, `scripts/check-update-log.mjs`, `scripts/install-git-hooks.mjs`

## 확인 / 테스트

- [x] `bun run build`
- [ ] Obsidian: A에 `[[B]]`/`![[B]]` 추가 후 B의 `mention links` 확인
- [ ] A에서 링크 제거 후 B 목록에서 A 제거 확인
- [ ] B에서 `- [[A]]` 삭제(역방향 켜짐) 후 A 본문 치환 확인

## 후속 작업 (있다면)

- 대형 볼트에서 디바운스·리스캔 성능 튜닝
- 메타데이터 캐시와의 정합성(저장 타이밍) 추가 검증
