# update_log 상세 기록 워크플로우 도입

**날짜:** 2026-05-08

## 배경 / 목적

변경 요약만 `CHANGELOG.md`에 두면 맥락이 부족해져, **동일 커밋에 상세 마크다운**을 `update_log/entries/`에 두고 훅으로 함께 스테이징하도록 정리한다.

## 변경 요약

- `update_log/entries/` 디렉터리, `_template.md`, `entries/README.md` 추가.
- pre-commit: `src/` 등 변경 시 `update_log/CHANGELOG.md`와 `update_log/entries/*.md`(README·`_template` 제외) **둘 다** 스테이징 요구.
- `.cursor/rules/update-log.mdc`, 루트 `update_log/README.md`, `AGENTS.md`에 상세 기록 절차 반영.

## 구현 메모

- 예외: `SKIP_CHANGELOG_CHECK=1` (비권장).
- `core.hooksPath`가 이미 다른 값이면 `install-git-hooks`는 덮어쓰지 않음.

## 확인 / 테스트

- [x] `bun run changelog:check` (스테이징된 파일 기준)
- [ ] 의도적으로 `entries` 없이 커밋 시도 → 거절 확인
