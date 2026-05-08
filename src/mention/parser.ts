import { type App, TFile } from "obsidian";
import { normalizeLinkPath } from "./paths";

const LINK_RE = /(!?)\[\[([^\]]+)\]\]/g;

/** Whether index `pos` in `body` lies inside an odd-numbered fenced ``` block. */
export function isInsideFencedCodeBlock(body: string, pos: number): boolean {
	const before = body.slice(0, pos);
	const fences = before.match(/```/g);
	return fences !== null && fences.length % 2 === 1;
}

/**
 * Resolve wikilink/embed inner text to a vault file.
 * `inner` is the raw content inside `[[...]]` (may include | # ^).
 */
export function resolveInnerToFile(
	inner: string,
	sourcePath: string,
	app: App,
): TFile | null {
	const pathPart = normalizeLinkPath(inner);
	if (!pathPart) return null;
	const dest = app.metadataCache.getFirstLinkpathDest(pathPart, sourcePath);
	return dest instanceof TFile ? dest : null;
}

/**
 * Plain-text replacement for stripping a link: alias if present, else path basename without .md.
 * Embeds use the same rule: `![[B]]` -> `B` (title only).
 */
export function linkDisplayText(inner: string): string {
	const trimmed = inner.trim();
	const pipe = trimmed.indexOf("|");
	if (pipe >= 0) {
		const alias = trimmed
			.slice(pipe + 1)
			.split("#")[0]
			?.split("^")[0]
			?.trim();
		if (alias) return alias;
	}
	const pathSide = trimmed.split("|")[0]?.split("#")[0]?.split("^")[0]?.trim() ?? "";
	const base = pathSide.split("/").pop() ?? pathSide;
	return base.replace(/\.md$/i, "");
}

/** Collect resolved target paths for all wikilinks and embeds in markdown body (excludes code fences). */
export function resolveOutgoingLinks(
	body: string,
	sourcePath: string,
	app: App,
): Set<string> {
	const out = new Set<string>();
	let m: RegExpExecArray | null;
	const re = new RegExp(LINK_RE);
	while ((m = re.exec(body)) !== null) {
		const inner = m[2];
		if (!inner || isInsideFencedCodeBlock(body, m.index)) continue;
		const file = resolveInnerToFile(inner, sourcePath, app);
		if (file) out.add(file.path);
	}
	return out;
}

/**
 * Replace wikilinks/embeds in `body` that resolve to `target` with plain `linkDisplayText(inner)`.
 */
export function replaceLinksToTargetInBody(
	body: string,
	sourcePath: string,
	target: TFile,
	app: App,
): string {
	const targetPath = target.path;
	const spans: { start: number; end: number; text: string }[] = [];
	let m: RegExpExecArray | null;
	const re = new RegExp(LINK_RE);
	while ((m = re.exec(body)) !== null) {
		const inner = m[2];
		if (!inner || isInsideFencedCodeBlock(body, m.index)) continue;
		const file = resolveInnerToFile(inner, sourcePath, app);
		if (!file || file.path !== targetPath) continue;
		// Embeds: same display rule as wikilinks (plain title / alias).
		spans.push({
			start: m.index,
			end: m.index + m[0].length,
			text: linkDisplayText(inner),
		});
	}
	spans.sort((a, b) => b.start - a.start);
	let result = body;
	for (const s of spans) {
		result = result.slice(0, s.start) + s.text + result.slice(s.end);
	}
	return result;
}
