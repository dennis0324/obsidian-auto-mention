# 생성되는 meta property key 설정 가능

**날짜:** 2026-05-08  
**관련:** 사용자 요청

## 배경 / 목적

기존에는 플러그인이 멘션 목록을 항상 `mention links`라는 프론트매터 키에만 기록했습니다. Obsidian Properties(메타 프로퍼티) 키 이름은 사용자의 노트 템플릿/워크플로에 따라 달라질 수 있어, 키 이름을 설정에서 바꿀 수 있게 했습니다.

## 변경 요약

- 설정에 `Frontmatter key (meta property)` 항목 추가
- 동기화/정리 로직이 하드코딩된 `"mention links"` 대신 설정값을 사용
- 설정값이 비어있으면 기본값 `mention links`로 폴백

## 구현 메모

- 키 이름을 바꾼다고 해서 **기존 키의 데이터가 자동으로 마이그레이션되지는 않습니다.**
- 리스캔 시에는 설정된 키에서만 읽고/쓰도록 동작합니다.

## 변경된 경로 (참고)

- `src/settings.ts`
- `src/ui/SettingsApp.tsx`
- `src/mention/frontmatter.ts`
- `src/mention/sync-engine.ts`
- `src/mention/constants.ts`

## 확인 / 테스트

- [ ] `bun run build`
- [ ] Obsidian에서 설정 → **Frontmatter key** 변경 후 본문 링크 수정 → 대상 노트 프론트매터에 새 키로 기록되는지 확인

## 후속 작업 (있다면)

- (선택) 키 변경 시 기존 키에서 새 키로 마이그레이션하는 옵션/도우미 제공

