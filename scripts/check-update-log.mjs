#!/usr/bin/env node
/**
 * Git pre-commit: if plugin code/config is staged, require:
 *   - update_log/CHANGELOG.md
 *   - at least one update_log/entries/*.md (excluding README.md, _template.md)
 * Skip: SKIP_CHANGELOG_CHECK=1
 */
import { execSync } from "node:child_process";
import process from "node:process";

if (process.env.SKIP_CHANGELOG_CHECK === "1") {
	process.exit(0);
}

let staged;
try {
	staged = execSync("git diff --cached --name-only --diff-filter=ACMRT", {
		encoding: "utf8",
		maxBuffer: 2 * 1024 * 1024,
	})
		.trim()
		.split("\n")
		.filter(Boolean);
} catch {
	process.exit(0);
}

if (staged.length === 0) {
	process.exit(0);
}

/** Paths that mean "product change" → must pair with update_log */
const codePattern =
	/^(src\/|scripts\/|manifest\.json|package\.json|esbuild\.config\.mjs|tsconfig\.json|styles\.css)/;

const codeTouched = staged.some((f) => codePattern.test(f));

function isCountableEntryFile(stagedPath) {
	if (!stagedPath.startsWith("update_log/entries/")) return false;
	if (!stagedPath.endsWith(".md")) return false;
	if (stagedPath === "update_log/entries/README.md") return false;
	if (stagedPath.endsWith("/_template.md")) return false;
	return true;
}

const changelogStaged = staged.includes("update_log/CHANGELOG.md");
const entryStaged = staged.some(isCountableEntryFile);

if (codeTouched && (!changelogStaged || !entryStaged)) {
	console.error(`
[obsidian-auto-mention] Plugin code/config is staged but update_log is incomplete.

  Required (both):
    1) update_log/CHANGELOG.md  — short summary (추가됨/수정됨/기타)
    2) update_log/entries/*.md  — detailed note (new or updated; not README/_template only)

  See update_log/README.md and update_log/entries/_template.md

  Bypass (not recommended): SKIP_CHANGELOG_CHECK=1 git commit ...
`);
	process.exit(1);
}

process.exit(0);
