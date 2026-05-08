# 상세 변경 기록 (entries)

코드·동작에 영향을 주는 작업마다 **이 폴더에 새 마크다운 파일**을 추가합니다.  
[`../CHANGELOG.md`](../CHANGELOG.md)에는 요약만 적고, 여기에는 **배경·구현·파일·테스트**를 적습니다.

## 파일 이름

`YYYY-MM-DD-짧은-영문-슬러그.md`  
예: `2026-05-08-initial-implementation.md`, `2026-05-10-fix-embed-strip.md`

같은 날 여러 건이면 슬러그로 구분합니다.

## 템플릿

새 파일 작성 시 [`_template.md`](_template.md)를 복사해 채웁니다.

## CHANGELOG와의 관계

1. `entries/새파일.md` 작성 (상세)
2. `CHANGELOG.md`에 같은 날짜 섹션으로 **한 줄 요약** + `(상세: entries/…​.md)` 링크

커밋 시 둘 다 스테이징해야 pre-commit을 통과합니다.
