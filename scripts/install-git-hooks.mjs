#!/usr/bin/env node
/**
 * Points this repo at .githooks/ via `git config core.hooksPath .githooks`
 * so pre-commit runs scripts/check-update-log.mjs (no writes under .git/hooks).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const gitDir = path.join(root, ".git");

if (!fs.existsSync(gitDir)) {
	console.warn("[install-git-hooks] No .git directory; skipping hooksPath config.");
	process.exit(0);
}

let current = "";
try {
	current = execSync("git config core.hooksPath", {
		cwd: root,
		encoding: "utf8",
		stdio: ["ignore", "pipe", "ignore"],
	}).trim();
} catch {
	current = "";
}

if (current !== "" && current !== ".githooks") {
	console.warn(
		`[install-git-hooks] core.hooksPath is already "${current}"; not changing. ` +
			`Add update_log checks to your hook chain manually if needed.`,
	);
	process.exit(0);
}

execSync("git config core.hooksPath .githooks", {
	cwd: root,
	stdio: "inherit",
});
console.log("[install-git-hooks] Set core.hooksPath=.githooks (pre-commit → changelog check)");
