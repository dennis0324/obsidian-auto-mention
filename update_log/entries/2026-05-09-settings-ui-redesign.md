# Settings UI redesign

**날짜:** 2026-05-09  
**관련:** -

## 배경 / 목적

기존 설정 화면(`SettingsApp.tsx`)은 단일 컬럼에 인라인 스타일로 구성되어 있어, 항목이 늘어나면 가독성과 확장성이 떨어졌습니다.  
`obsidian-reamen-client`의 설정 레이아웃(좌측 내비게이션 + 우측 컨텐츠 + 섹션 그룹 카드)을 참고해 동일한 정보 구조로 정리했습니다.

## 변경 요약

- 좌측 탭 내비게이션(`Sync`, `Maintenance`) + 우측 컨텐츠 구조로 변경
- 설정 항목을 Obsidian 기본 `setting-item` 행 구성으로 통일
- 섹션별 그룹 카드(헤더 포함) 레이아웃 추가

## 구현 메모

- 네비 아이콘은 Obsidian의 `setIcon`을 사용해 렌더링합니다.
- 토글은 Obsidian 스타일의 `checkbox-container` 패턴을 사용해 클릭 영역을 넓혔습니다.
- `Rescan vault`는 `Maintenance` 섹션으로 이동했고, **동기화가 꺼져 있으면 비활성화**됩니다(기존 동작 유지).

## 변경된 경로 (참고)

- `src/ui/SettingsApp.tsx`
- `styles.css`

## 확인 / 테스트

- [ ] `npm run build`
- [ ] Obsidian에서 **Settings → Community plugins → Auto Mention** 설정 탭 열기
- [ ] `Enable sync`/`Reverse sync`/`Remove key when empty`/`Debounce` 변경 후 재시작해도 값 유지 확인
- [ ] `Rescan vault` 동작 확인 (동기화 ON일 때만)

## 후속 작업 (있다면)

- 설정 항목이 추가되면 `Sync`/`Maintenance` 하위에 그룹을 확장하는 방식으로 유지보수

