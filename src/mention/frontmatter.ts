import type { App, TFile } from "obsidian";
import { parseYaml } from "obsidian";
import { MENTION_LINKS_KEY } from "./constants";
import { normalizeLinkPath } from "./paths";

export type FrontmatterSplit =
	| { hasYaml: false; body: string; full: string }
	| { hasYaml: true; yamlRaw: string; body: string; full: string };

const FM_OPEN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function splitFrontmatter(content: string): FrontmatterSplit {
	const m = content.match(FM_OPEN);
	if (!m || m.index !== 0) {
		return { hasYaml: false, body: content, full: content };
	}
	const yamlRaw = m[1] ?? "";
	const rest = content.slice(m[0].length);
	return { hasYaml: true, yamlRaw, body: rest, full: content };
}

export function joinFrontmatter(yamlRaw: string, body: string): string {
	return `---\n${yamlRaw}\n---\n${body}`;
}

/** Rebuild file content after body-only edit. */
export function replaceBodyPreservingFrontmatter(
	full: string,
	newBody: string,
): string {
	const split = splitFrontmatter(full);
	if (!split.hasYaml) return newBody;
	return joinFrontmatter(split.yamlRaw, newBody);
}

function entryToInner(entry: string): string {
	const t = entry.trim();
	const unwrapped = t.startsWith("[[") && t.endsWith("]]")
		? t.slice(2, -2)
		: t;
	return unwrapped.trim();
}

export function resolveMentionEntryToPath(
	entry: string,
	contextPath: string,
	app: App,
): string | null {
	const inner = entryToInner(entry);
	const pathPart = normalizeLinkPath(inner);
	if (!pathPart) return null;
	const dest = app.metadataCache.getFirstLinkpathDest(pathPart, contextPath);
	return dest?.path ?? null;
}

/** Resolved vault paths of notes listed under `mention links` for the given YAML object. */
export function mentionSourcePathsFromYaml(
	data: unknown,
	contextPath: string,
	app: App,
): Set<string> {
	const out = new Set<string>();
	if (!data || typeof data !== "object") return out;
	const raw = (data as Record<string, unknown>)[MENTION_LINKS_KEY];
	if (!Array.isArray(raw)) return out;
	for (const item of raw) {
		if (typeof item !== "string") continue;
		const p = resolveMentionEntryToPath(item, contextPath, app);
		if (p) out.add(p);
	}
	return out;
}

export function readMentionSourcePathsFromContent(
	content: string,
	contextPath: string,
	app: App,
): Set<string> {
	const split = splitFrontmatter(content);
	if (!split.hasYaml) return new Set();
	try {
		const data = parseYaml(split.yamlRaw);
		return mentionSourcePathsFromYaml(data, contextPath, app);
	} catch {
		return new Set();
	}
}

export function wikilinkLineForSourceInTarget(
	source: TFile,
	target: TFile,
	app: App,
): string {
	const inner = app.metadataCache.fileToLinktext(source, target.path, true);
	return `[[${inner}]]`;
}
