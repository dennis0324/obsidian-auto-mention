import { App, Notice, PluginSettingTab } from "obsidian";
import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type AutoMentionPlugin from "./main";
import { SettingsApp } from "./ui/SettingsApp";

export interface AutoMentionSettings {
	enabled: boolean;
	reverseSync: boolean;
	/** When true (default), delete the `mention links` property if the list becomes empty. When false, keep the key with an empty YAML array. */
	removeMentionLinksKeyWhenEmpty: boolean;
	debounceMs: number;
}

export const DEFAULT_SETTINGS: AutoMentionSettings = {
	enabled: true,
	reverseSync: true,
	removeMentionLinksKeyWhenEmpty: true,
	debounceMs: 300,
};

export class AutoMentionSettingTab extends PluginSettingTab {
	plugin: AutoMentionPlugin;
	private root: Root | null = null;

	constructor(app: App, plugin: AutoMentionPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		const wrap = containerEl.createDiv();
		this.root = createRoot(wrap);
		this.root.render(createElement(SettingsApp, { plugin: this.plugin }));
	}

	hide(): void {
		this.root?.unmount();
		this.root = null;
		super.hide();
	}
}

export function notifyRescanDone(): void {
	new Notice("Auto Mention: vault rescan finished.");
}
