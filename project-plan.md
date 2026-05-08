# Obsidian Auto Mention — 프로젝트 계획 (구현 반영)

## 구현 상태

- 플러그인 ID: `auto-mention` ([manifest.json](manifest.json))
- 본문의 **위키링크** `[[…]]`와 **임베드** `![[…]]`를 대상 노트의 프론트매터 `mention links`와 동기화함.
- 설정 UI는 **React** (`src/ui/SettingsApp.tsx`, `createRoot`).
- 패키지 관리·빌드: **Bun** (`bun install`, `bun run build` / `bun run dev`), 번들은 esbuild.

## 프로젝트 제작 시 유의사항

- UI 제작 시 **React** 사용 (설정 탭).

---

## 1. 플러그인 동작 방식

### 1.1 추가 시 (정방향)

A 파일 **본문**에서 B 파일을 `[[B]]` 또는 `![[B]]`로 언급하면, **B 파일** 프론트매터의 `mention links` 배열에 **A를 가리키는 링크**가 추가됨 (중복 없음). 링크 문자열은 Obsidian `fileToLinktext` 규칙에 맞게 `[[…]]` 형태로 저장.

- 본문만 파싱함 (프론트매터 구간 제외).
- 펜스 코드 블록(``` … ```) 안의 `[[…]]` / `![[…]]`는 무시.

예시:

```
A 파일

...
[[B 파일]]
...
```

```
B 파일
---
modified: 2026-05-08T10:24:29+09:00
custom-width: 70
...
mention links:
  - [[A 파일]]
...
---
```

### 1.2 삭제·역방향

1. **A에서 B로의 멘션이 모두 사라짐** (본문에서 해당 링크 제거)  
   → B의 `mention links`에서 A 항목 제거.

2. **B의 `mention links`에서 A 항목을 제거** (프론트매터 편집)  
   → **역방향 동기화**가 설정에서 켜져 있으면, A 본문에서 B를 가리키는 위키/임베드를 **일반 텍스트로 치환** (예: `[[B 파일]]` → `B 파일`, 별칭이 있으면 별칭 우선).  
   - 문서상 “폴더를 지우면”은 **목록 항목 삭제** 의미로 정리함.

3. **노트 A가 볼트에서 삭제됨**  
   → A가 링크하던 대상 노트들의 `mention links`에서 A를 제거.

### 1.3 설정·명령

- **Enable sync**: 동기화 총 스위치.
- **Reverse sync**: 위 1.2-2번(프론트매터에서 줄 삭제 → 본문 링크 제거) 동작 여부.
- **Remove entire `mention links` key when empty** (기본값: 켜짐): 마지막 항목까지 제거되면 프론트매터에서 **키 전체 삭제**. 끄면 **`mention links: []`** 로 키만 남김.
- **Debounce (ms)**: `vault.modify` 처리 간격.
- **Rescan vault** (설정 버튼) / 명령 **「Auto Mention: rescan vault」**: 스냅샷 재구성 후 정방향 동기화(리스캔 시 역방향 스트립은 하지 않음).

### 1.4 기술 메모

- 프론트매터 키 이름: `mention links` (공백 포함, [constants.ts](src/mention/constants.ts)).
- 플러그인이 `processFrontMatter` / `vault.modify`로 쓴 직후 짧은 시간(약 80ms) 동안 해당 경로에 대해 역방향 비교를 건너뛰어 루프를 완화함.
