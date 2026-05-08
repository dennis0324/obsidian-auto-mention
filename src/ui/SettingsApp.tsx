import React, { useCallback, useEffect, useRef, useState } from "react";
import { setIcon } from "obsidian";
import type AutoMentionPlugin from "../main";

export function SettingsApp({ plugin }: { plugin: AutoMentionPlugin }) {
	type Section = "sync" | "maintenance";

	const [active, setActive] = useState<Section>("sync");
	const [settings, setSettings] = useState(() => ({ ...plugin.settings }));
	const [busy, setBusy] = useState(false);
	const keyForUi =
		(settings.mentionLinksKey || "mention links").trim() || "mention links";

	const save = useCallback(
		async (patch: Partial<typeof plugin.settings>) => {
			Object.assign(plugin.settings, patch);
			await plugin.saveSettings();
			setSettings({ ...plugin.settings });
		},
		[plugin],
	);

	function NavIcon({ id }: { id: string }) {
		const ref = useRef<HTMLSpanElement>(null);
		useEffect(() => {
			if (ref.current) setIcon(ref.current, id);
		}, [id]);
		return <span ref={ref} className="auto-mention-nav-icon" />;
	}

	function SettingGroup({
		title,
		children,
		variant = "default",
	}: {
		title: string;
		children: React.ReactNode;
		variant?: "default" | "danger";
	}) {
		return (
			<div
				className={`auto-mention-setting-group${variant === "danger" ? " auto-mention-setting-group--danger" : ""}`}
			>
				<div className="auto-mention-setting-group-header">{title}</div>
				{children}
			</div>
		);
	}

	function SettingRow({
		name,
		description,
		control,
	}: {
		name: string;
		description?: React.ReactNode;
		control: React.ReactNode;
	}) {
		return (
			<div className="setting-item">
				<div className="setting-item-info">
					<div className="setting-item-name">{name}</div>
					{description ? (
						<div className="setting-item-description">{description}</div>
					) : null}
				</div>
				<div className="setting-item-control">{control}</div>
			</div>
		);
	}

	const rescan = useCallback(async () => {
		setBusy(true);
		try {
			await plugin.runRescan();
		} finally {
			setBusy(false);
		}
	}, [plugin]);

	return (
		<div className="auto-mention-settings-container">
			<nav className="auto-mention-settings-nav" aria-label="Auto Mention settings">
				<button
					type="button"
					className={`auto-mention-settings-nav-btn${active === "sync" ? " active" : ""}`}
					onClick={() => setActive("sync")}
				>
					<NavIcon id="link" />
					<span>Sync</span>
				</button>
				<button
					type="button"
					className={`auto-mention-settings-nav-btn${active === "maintenance" ? " active" : ""}`}
					onClick={() => setActive("maintenance")}
				>
					<NavIcon id="settings-2" />
					<span>Maintenance</span>
				</button>
			</nav>

			<div className="auto-mention-settings-content">
				{active === "sync" ? (
					<>
						<h2 style={{ marginTop: 0 }}>Auto Mention</h2>
						<p className="setting-item-description" style={{ marginTop: 0 }}>
							Body wikilinks <code>[[…]]</code> and embeds <code>![[…]]</code> update
							the target note&apos;s <code>{keyForUi}</code> frontmatter. Optional
							reverse sync strips links in the source when you remove it from that
							list.
						</p>

						<SettingGroup title="Sync">
							<SettingRow
								name="Enable sync"
								description="Turn mention-link syncing on or off."
								control={
									<div
										className={`checkbox-container${settings.enabled ? " is-enabled" : ""}`}
										onClick={() => void save({ enabled: !settings.enabled })}
									>
										<input
											type="checkbox"
											readOnly
											checked={settings.enabled}
										/>
									</div>
								}
							/>

							<SettingRow
								name="Reverse sync"
								description="When an entry is removed from frontmatter, strip the corresponding body link from the source note."
								control={
									<div
										className={`checkbox-container${settings.reverseSync ? " is-enabled" : ""}`}
										onClick={() =>
											void save({ reverseSync: !settings.reverseSync })
										}
									>
										<input
											type="checkbox"
											readOnly
											checked={settings.reverseSync}
										/>
									</div>
								}
							/>

							<SettingRow
								name="Frontmatter key"
								description={
									<>
										Property name for mention lists (default:{" "}
										<code>mention links</code>).
									</>
								}
								control={
									<input
										type="text"
										value={settings.mentionLinksKey}
										placeholder="mention links"
										onChange={(e) =>
											void save({ mentionLinksKey: e.target.value })
										}
										style={{ width: 240 }}
									/>
								}
							/>

							<SettingRow
								name="Remove key when empty"
								description={
									<>
										Remove the entire <code>{keyForUi}</code> key when the list
										becomes empty (otherwise keep <code>{keyForUi}: []</code>).
									</>
								}
								control={
									<div
										className={`checkbox-container${settings.removeMentionLinksKeyWhenEmpty ? " is-enabled" : ""}`}
										onClick={() =>
											void save({
												removeMentionLinksKeyWhenEmpty:
													!settings.removeMentionLinksKeyWhenEmpty,
											})
										}
									>
										<input
											type="checkbox"
											readOnly
											checked={settings.removeMentionLinksKeyWhenEmpty}
										/>
									</div>
								}
							/>
						</SettingGroup>

						<SettingGroup title="Performance">
							<SettingRow
								name="Debounce"
								description="Delay sync runs after edits (milliseconds)."
								control={
									<input
										type="number"
										min={0}
										max={5000}
										step={50}
										value={settings.debounceMs}
										onChange={(e) => {
											const n = Number(e.target.value);
											if (!Number.isFinite(n) || n < 0) return;
											void save({ debounceMs: n });
										}}
										style={{ width: 96 }}
									/>
								}
							/>
						</SettingGroup>
					</>
				) : (
					<>
						<h2 style={{ marginTop: 0 }}>Maintenance</h2>
						<p className="setting-item-description" style={{ marginTop: 0 }}>
							Heavy operations that rewrite frontmatter across many notes.
						</p>

						<SettingGroup title="Danger zone" variant="danger">
							<div className="auto-mention-setting-group-footer auto-mention-setting-group-footer--danger">
								<div className="auto-mention-danger-zone-copy">
									<div className="setting-item-name">Rescan vault</div>
									<div className="setting-item-description">
										Rebuild <code>{keyForUi}</code> for every note. This can take a
										while and touches many files—use only when you need a full
										reconcile.
									</div>
								</div>
								<button
									type="button"
									className="mod-warning"
									disabled={busy || !settings.enabled}
									onClick={() => void rescan()}
								>
									{busy ? "Rescanning…" : "Rescan vault"}
								</button>
							</div>
						</SettingGroup>
					</>
				)}
			</div>
		</div>
	);
}
