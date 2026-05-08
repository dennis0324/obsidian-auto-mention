# eslint 명령 ID 규칙 위반 수정

**날짜:** 2026-05-08  
**관련:** CI lint (`obsidianmd/commands/no-plugin-id-in-command-id`)

## 배경 / 목적

Obsidian 커맨드 ID는 플러그인 ID를 접두어로 포함하지 않아야 한다. (Obsidian이 플러그인 단위로 커맨드 충돌을 방지)

## 변경 요약

- 커맨드 ID `auto-mention-rescan-vault` → `rescan-vault`로 변경해 eslint 규칙 위반을 해소했다.

## 구현 메모

- 사용자에게 보이는 커맨드 이름(`Rescan vault`)은 그대로 유지된다.
- 커맨드 ID는 내부 식별자이므로 이후 릴리즈부터는 가능한 한 변경을 피하는 것이 좋다.

## 변경된 경로 (참고)

- `src/main.ts`
- `update_log/CHANGELOG.md`
- `update_log/entries/2026-05-08-fix-command-id-lint.md`

## 확인 / 테스트

- [x] `npm run lint`
- [x] `npm run build`
