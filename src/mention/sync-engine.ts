import { type App, type EventRef, type TAbstractFile, TFile } from "obsidian";
import type { AutoMentionSettings } from "../settings";
import { MENTION_LINKS_KEY } from "./constants";
import {
	readMentionSourcePathsFromContent,
	replaceBodyPreservingFrontmatter,
	splitFrontmatter,
	wikilinkLineForSourceInTarget,
	resolveMentionEntryToPath,
} from "./frontmatter";
import {
	replaceLinksToTargetInBody,
	resolveOutgoingLinks,
} from "./parser";

export interface AutoMentionPluginHost {
	app: App;
	settings: AutoMentionSettings;
}

export class SyncEngine {
	private readonly outgoingCache = new Map<string, Set<string>>();
	private readonly mentionSnapshot = new Map<string, Set<string>>();
	private readonly debounceTimers = new Map<string, number>();
	private readonly pluginMutated = new Set<string>();
	private rescanning = false;

	constructor(private readonly host: AutoMentionPluginHost) {}

	attach(register: (ref: EventRef) => void): void {
		register(
			this.host.app.vault.on("modify", (f) => {
				this.onVaultModify(f);
			}),
		);
		register(
			this.host.app.vault.on("delete", (f) => {
				void this.onVaultDelete(f);
			}),
		);
	}

	private onVaultModify(file: TAbstractFile): void {
		if (!(file instanceof TFile) || file.extension !== "md") return;
		if (!this.host.settings.enabled) return;
		const ms = this.host.settings.debounceMs;
		const prev = this.debounceTimers.get(file.path);
		if (prev !== undefined) window.clearTimeout(prev);
		const id = window.setTimeout(() => {
			this.debounceTimers.delete(file.path);
			void this.processFileChange(file);
		}, ms);
		this.debounceTimers.set(file.path, id);
	}

	private async onVaultDelete(file: TAbstractFile): Promise<void> {
		if (!(file instanceof TFile) || file.extension !== "md") return;
		const outs = this.outgoingCache.get(file.path);
		if (outs) {
			for (const targetPath of outs) {
				await this.removeSourcePathFromTargetFrontmatter(
					file.path,
					targetPath,
				);
			}
		}
		this.outgoingCache.delete(file.path);
		this.mentionSnapshot.delete(file.path);
	}

	/** Full rebuild: snapshots from disk, then forward sync (no reverse strip). */
	async rescanVault(): Promise<void> {
		if (!this.host.settings.enabled) return;
		this.rescanning = true;
		try {
			const files = this.host.app.vault.getMarkdownFiles();
			for (const f of files) {
				const content = await this.host.app.vault.read(f);
				const cur = readMentionSourcePathsFromContent(
					content,
					f.path,
					this.host.app,
				);
				this.mentionSnapshot.set(f.path, cur);
			}
			this.outgoingCache.clear();
			for (const f of files) {
				await this.processFileChange(f);
			}
			for (const f of files) {
				await this.processFileChange(f);
			}
		} finally {
			this.rescanning = false;
		}
	}

	async processFileChange(file: TFile): Promise<void> {
		if (!this.host.settings.enabled) return;

		const content = await this.host.app.vault.read(file);
		let curFmSources = readMentionSourcePathsFromContent(
			content,
			file.path,
			this.host.app,
		);

		const skipReverse =
			!this.host.settings.reverseSync ||
			this.pluginMutated.has(file.path) ||
			this.rescanning;

		if (!skipReverse) {
			const prev = this.mentionSnapshot.get(file.path);
			if (prev !== undefined) {
				for (const srcPath of prev) {
					if (!curFmSources.has(srcPath)) {
						const srcFile = this.host.app.vault.getAbstractFileByPath(
							srcPath,
						);
						if (srcFile instanceof TFile) {
							await this.stripLinksToTarget(srcFile, file);
						}
					}
				}
			}
		}

		this.mentionSnapshot.set(file.path, new Set(curFmSources));

		const latest = await this.host.app.vault.read(file);
		const split = splitFrontmatter(latest);
		const body = split.body;
		const newOutgoing = resolveOutgoingLinks(
			body,
			file.path,
			this.host.app,
		);
		const oldOutgoing = this.outgoingCache.get(file.path) ?? new Set<string>();

		for (const bPath of newOutgoing) {
			if (!oldOutgoing.has(bPath)) {
				await this.forwardAdd(file, bPath);
			}
		}
		for (const bPath of oldOutgoing) {
			if (!newOutgoing.has(bPath)) {
				await this.forwardRemove(file, bPath);
			}
		}
		this.outgoingCache.set(file.path, new Set(newOutgoing));
	}

	private markPluginMutation(path: string): void {
		this.pluginMutated.add(path);
		window.setTimeout(() => {
			this.pluginMutated.delete(path);
		}, 80);
	}

	private async stripLinksToTarget(
		source: TFile,
		target: TFile,
	): Promise<void> {
		this.markPluginMutation(source.path);
		const full = await this.host.app.vault.read(source);
		const split = splitFrontmatter(full);
		const newBody = replaceLinksToTargetInBody(
			split.body,
			source.path,
			target,
			this.host.app,
		);
		if (newBody === split.body) return;
		const next = replaceBodyPreservingFrontmatter(full, newBody);
		await this.host.app.vault.modify(source, next);
	}

	private async forwardAdd(source: TFile, targetPath: string): Promise<void> {
		const target = this.host.app.vault.getAbstractFileByPath(targetPath);
		if (!(target instanceof TFile)) return;
		const line = wikilinkLineForSourceInTarget(source, target, this.host.app);
		this.markPluginMutation(target.path);
		await this.host.app.fileManager.processFrontMatter(
			target,
			(fm: Record<string, unknown>) => {
				const listRaw = fm[MENTION_LINKS_KEY];
				const list: string[] = Array.isArray(listRaw)
					? listRaw.filter((x): x is string => typeof x === "string")
					: [];
				const has = list.some(
					(entry) =>
						resolveMentionEntryToPath(entry, target.path, this.host.app) ===
						source.path,
				);
				if (!has) list.push(line);
				fm[MENTION_LINKS_KEY] = list;
			},
		);
		const after = await this.host.app.vault.read(target);
		this.mentionSnapshot.set(
			target.path,
			readMentionSourcePathsFromContent(after, target.path, this.host.app),
		);
	}

	private async forwardRemove(
		source: TFile,
		targetPath: string,
	): Promise<void> {
		await this.removeSourcePathFromTargetFrontmatter(source.path, targetPath);
	}

	private async removeSourcePathFromTargetFrontmatter(
		sourcePath: string,
		targetPath: string,
	): Promise<void> {
		const target = this.host.app.vault.getAbstractFileByPath(targetPath);
		if (!(target instanceof TFile)) return;
		this.markPluginMutation(target.path);
		await this.host.app.fileManager.processFrontMatter(
			target,
			(fm: Record<string, unknown>) => {
				const listRaw = fm[MENTION_LINKS_KEY];
				if (!Array.isArray(listRaw)) return;
				const next = listRaw.filter((item) => {
					if (typeof item !== "string") return true;
					const p = resolveMentionEntryToPath(
						item,
						target.path,
						this.host.app,
					);
					return p !== sourcePath;
				});
				if (next.length === 0) {
					if (this.host.settings.removeMentionLinksKeyWhenEmpty) {
						delete fm[MENTION_LINKS_KEY];
					} else {
						fm[MENTION_LINKS_KEY] = [];
					}
				} else {
					fm[MENTION_LINKS_KEY] = next;
				}
			},
		);
		const after = await this.host.app.vault.read(target);
		this.mentionSnapshot.set(
			target.path,
			readMentionSourcePathsFromContent(after, target.path, this.host.app),
		);
	}
}
