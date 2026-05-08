import { Notice, Plugin } from "obsidian";
import { SyncEngine } from "./mention/sync-engine";
import {
	AutoMentionSettingTab,
	DEFAULT_SETTINGS,
	type AutoMentionSettings,
	notifyRescanDone,
} from "./settings";

export default class AutoMentionPlugin extends Plugin {
	settings: AutoMentionSettings = DEFAULT_SETTINGS;
	private sync: SyncEngine | null = null;

	async onload(): Promise<void> {
		await this.loadSettings();
		this.sync = new SyncEngine(this);
		this.sync.attach((ref) => this.registerEvent(ref));

		this.addSettingTab(new AutoMentionSettingTab(this.app, this));

		this.addCommand({
			id: "rescan-vault",
			name: "Rescan vault",
			callback: () => {
				void this.runRescan();
			},
		});
	}

	onunload(): void {
		this.sync = null;
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<AutoMentionSettings>,
		);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	async runRescan(): Promise<void> {
		if (!this.sync) return;
		if (!this.settings.enabled) {
			new Notice("Enable sync in settings first.");
			return;
		}
		await this.sync.rescanVault();
		notifyRescanDone();
	}
}
