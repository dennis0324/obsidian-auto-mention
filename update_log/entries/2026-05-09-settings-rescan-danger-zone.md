# Rescan vault → Danger zone

**날짜:** 2026-05-09  
**관련:** -

## 배경 / 목적

볼트 전체 리스캔은 많은 노트의 프론트매터를 건드리는 작업이라, 일반 설정과 분리해 **Danger zone**에 두는 편이 안전하고 UX상 의도도 분명해집니다.

## 변경 요약

- Maintenance 탭에서 **Vault** 그룹 제거
- **Danger zone** 그룹(시각적 강조) 아래에 **Rescan vault** 배치
- 버튼 스타일을 `mod-warning`으로 변경

## 변경된 경로 (참고)

- `src/ui/SettingsApp.tsx`
- `styles.css`

## 확인 / 테스트

- [ ] `npm run build`
- [ ] Settings → Maintenance → Danger zone에서 Rescan 동작·비활성 조건(sync off) 확인
